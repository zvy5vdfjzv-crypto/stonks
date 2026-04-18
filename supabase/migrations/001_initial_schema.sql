-- ================================================================
-- STONKS — FASE 1: Fundacao Anti-Fraude
-- Rodar no Supabase SQL Editor (aba Privado → Nova query → paste → Run)
-- ================================================================

-- 1. EXTEND PROFILES (colunas faltantes)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS hype_coins_balance NUMERIC(14,2) NOT NULL DEFAULT 1000;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;

-- 2. MEMES — source of truth para precos (nunca editavel via client)
CREATE TABLE IF NOT EXISTS memes (
  id TEXT PRIMARY KEY,
  creator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  ticker TEXT NOT NULL,
  description TEXT DEFAULT '',
  category TEXT DEFAULT 'memes',
  emoji TEXT DEFAULT '🎮',
  image_url TEXT,
  youtube_id TEXT,
  current_price NUMERIC(12,2) NOT NULL DEFAULT 10.00,
  total_invested NUMERIC(14,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_memes_category ON memes(category);
CREATE INDEX IF NOT EXISTS idx_memes_price ON memes(current_price DESC);

-- 3. TRANSACTIONS — log imutavel de toda compra/venda
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  meme_id TEXT NOT NULL REFERENCES memes(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('buy', 'sell')),
  amount NUMERIC(14,2) NOT NULL CHECK (amount > 0),
  price_at_transaction NUMERIC(12,2) NOT NULL,
  total_cost NUMERIC(14,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_user_meme ON transactions(user_id, meme_id);

-- 4. ROW LEVEL SECURITY

ALTER TABLE memes ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- MEMES: leitura publica, escrita SO via RPC (via SECURITY DEFINER)
DROP POLICY IF EXISTS "memes_public_read" ON memes;
CREATE POLICY "memes_public_read" ON memes FOR SELECT USING (true);
-- Nao ha policy de INSERT/UPDATE/DELETE → client nao consegue modificar direto.

-- TRANSACTIONS: cada user le suas proprias
DROP POLICY IF EXISTS "transactions_own_read" ON transactions;
CREATE POLICY "transactions_own_read" ON transactions FOR SELECT USING (auth.uid() = user_id);
-- Nao ha policy de INSERT → client nao insere direto (so via RPC).

-- PROFILES: protege hype_coins_balance de UPDATE direto via API
-- (user pode dar UPDATE em profile mas nao na coluna de saldo)
REVOKE UPDATE (hype_coins_balance) ON profiles FROM authenticated;
REVOKE UPDATE (hype_coins_balance) ON profiles FROM anon;

-- 5. STORED PROCEDURE — MOTOR ECONOMICO CENTRAL
-- Toda compra/venda passa por aqui. Unico ponto que pode alterar saldos e precos.
-- SECURITY DEFINER = roda com privilegios do owner, bypassa RLS.
CREATE OR REPLACE FUNCTION public.trade_meme(
  p_user_id UUID,
  p_meme_id TEXT,
  p_action TEXT,
  p_amount NUMERIC
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_price NUMERIC;
  v_balance NUMERIC;
  v_total_cost NUMERIC;
  v_new_price NUMERIC;
  v_user_position NUMERIC;
BEGIN
  -- 🛡️ Verifica que o user autenticado e o proprio dono da transacao
  IF auth.uid() IS NULL OR auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Unauthorized: caller % != user %', auth.uid(), p_user_id;
  END IF;

  IF p_amount IS NULL OR p_amount <= 0 THEN
    RAISE EXCEPTION 'Amount deve ser positivo';
  END IF;

  IF p_action NOT IN ('buy', 'sell') THEN
    RAISE EXCEPTION 'Invalid action: %', p_action;
  END IF;

  -- 🔒 Lock do meme row pra evitar race conditions
  SELECT current_price INTO v_price FROM memes WHERE id = p_meme_id FOR UPDATE;
  IF v_price IS NULL THEN
    RAISE EXCEPTION 'Meme % nao encontrado', p_meme_id;
  END IF;

  -- 🔒 Lock do profile
  SELECT hype_coins_balance INTO v_balance FROM profiles WHERE id = p_user_id FOR UPDATE;
  IF v_balance IS NULL THEN
    RAISE EXCEPTION 'Profile % nao encontrado', p_user_id;
  END IF;

  -- =============== BUY ===============
  IF p_action = 'buy' THEN
    v_total_cost := v_price * p_amount;
    IF v_balance < v_total_cost THEN
      RAISE EXCEPTION 'Saldo insuficiente (tem %, precisa %)', v_balance, v_total_cost;
    END IF;

    -- Subtrai saldo
    UPDATE profiles
      SET hype_coins_balance = hype_coins_balance - v_total_cost
      WHERE id = p_user_id;

    -- Log transacao
    INSERT INTO transactions (user_id, meme_id, transaction_type, amount, price_at_transaction, total_cost)
    VALUES (p_user_id, p_meme_id, 'buy', p_amount, v_price, v_total_cost);

    -- 📈 Bonding curve: +1% por unidade comprada
    v_new_price := ROUND(v_price * POWER(1.01, p_amount)::NUMERIC, 2);
    UPDATE memes
      SET current_price = v_new_price,
          total_invested = total_invested + v_total_cost
      WHERE id = p_meme_id;

  -- =============== SELL ===============
  ELSE
    -- Calcular posicao (net holdings) do user nesse meme
    SELECT COALESCE(SUM(CASE WHEN transaction_type = 'buy' THEN amount ELSE -amount END), 0)
    INTO v_user_position
    FROM transactions
    WHERE user_id = p_user_id AND meme_id = p_meme_id;

    IF v_user_position < p_amount THEN
      RAISE EXCEPTION 'Posicao insuficiente (tem %, precisa %)', v_user_position, p_amount;
    END IF;

    v_total_cost := v_price * p_amount;

    -- Credita saldo
    UPDATE profiles
      SET hype_coins_balance = hype_coins_balance + v_total_cost
      WHERE id = p_user_id;

    -- Log transacao
    INSERT INTO transactions (user_id, meme_id, transaction_type, amount, price_at_transaction, total_cost)
    VALUES (p_user_id, p_meme_id, 'sell', p_amount, v_price, v_total_cost);

    -- 📉 Bonding curve reversa: -1% por unidade vendida
    v_new_price := ROUND(GREATEST(v_price * POWER(0.99, p_amount)::NUMERIC, 0.01), 2);
    UPDATE memes
      SET current_price = v_new_price,
          total_invested = GREATEST(0, total_invested - v_total_cost)
      WHERE id = p_meme_id;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'action', p_action,
    'amount', p_amount,
    'price', v_price,
    'new_price', v_new_price,
    'total_cost', v_total_cost
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.trade_meme(UUID, TEXT, TEXT, NUMERIC) TO authenticated;

-- 6. REALTIME — habilita broadcast de UPDATE em memes e transactions
-- Se ja habilitado, DROP primeiro (idempotent):
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE memes;
  EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE transactions;
  EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;

-- 7. SEED — 20 memes iniciais em $10 (bonding curve so sobe dai)
INSERT INTO memes (id, title, ticker, description, category, emoji, image_url, youtube_id, current_price) VALUES
('pedro-pedro', 'Pedro Pedro Pedro', '$PEDRO', 'O raccoon dancante que dominou o TikTok.', 'memes', '🦝', 'https://images.unsplash.com/photo-1497752531616-c3afd9760a11?w=600&h=400&fit=crop', 'dRpzxKsSEZg', 10.00),
('skibidi-toilet', 'Skibidi Toilet', '$SKBDI', 'A serie animada mais bizarra do YouTube.', 'memes', '🚽', 'https://images.unsplash.com/photo-1585128903994-9788298932a4?w=600&h=400&fit=crop', NULL, 10.00),
('mewing-looksmax', 'Mewing / Looksmaxxing', '$MEWW', 'A obsessao masculina com jawline e mewing.', 'memes', '🗿', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop', NULL, 10.00),
('wsb-diamond-hands', 'Diamond Hands WSB', '$DMNDS', 'O espirito do WallStreetBets. HODL ate a morte.', 'finance', '💎', 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&h=400&fit=crop', NULL, 10.00),
('crypto-to-the-moon', 'Crypto To The Moon', '$MOON', 'Shitcoins, rugs, e moonshots. WAGMI ou NGMI.', 'finance', '🌙', 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=600&h=400&fit=crop', NULL, 10.00),
('speed-rage', 'IShowSpeed Moments', '$SPEED', 'Os rage moments mais insanos do IShowSpeed.', 'viral', '⚡', 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&h=400&fit=crop', NULL, 10.00),
('mr-beast-challenge', 'MrBeast Challenge', '$BEAST', 'O rei do YouTube. Cada video e um evento global.', 'viral', '🏆', 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=600&h=400&fit=crop', NULL, 10.00),
('tech-bro-culture', 'Tech Bro LinkedIn', '$GRIND', 'Posts motivacionais absurdos do LinkedIn.', 'tech', '👔', 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&h=400&fit=crop', NULL, 10.00),
('apple-vision-memes', 'Apple Vision Pro Memes', '$APPLE', 'Pessoas andando na rua com o Vision Pro.', 'tech', '🥽', 'https://images.unsplash.com/photo-1680868543815-b8666dba60f7?w=600&h=400&fit=crop', NULL, 10.00),
('chatgpt-memes', 'ChatGPT Memes', '$GPT', 'IA gerando arte cursed, respostas absurdas.', 'ai', '🤖', 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=400&fit=crop', NULL, 10.00),
('ai-art-cursed', 'AI Art Cursed', '$CURS', 'Imagens geradas por IA que sao puro horror.', 'ai', '🎨', 'https://images.unsplash.com/photo-1686191128892-3b37add4a028?w=600&h=400&fit=crop', NULL, 10.00),
('khaby-lame', 'Khaby Lame Style', '$KHBY', 'O cara que refuta life hacks sem falar nada.', 'influencer', '🤷', 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=600&h=400&fit=crop', NULL, 10.00),
('kai-cenat-streams', 'Kai Cenat Streams', '$KAI', 'O rei do Twitch. Maratonas insanas, caos total.', 'influencer', '🎬', 'https://images.unsplash.com/photo-1603739903239-8b6e64c3b185?w=600&h=400&fit=crop', NULL, 10.00),
('tiktok-song-viral', 'TikTok Sound Viral', '$SOND', 'A musica random que viraliza no TikTok.', 'music', '🎵', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=400&fit=crop', NULL, 10.00),
('cybertruck-memes', 'Cybertruck Memes', '$CYBR', 'O design poligonal. Os vidros quebrando.', 'cars', '🚗', 'https://images.unsplash.com/photo-1562911791-c7a97b729ec5?w=600&h=400&fit=crop', NULL, 10.00),
('car-meets-gone-wrong', 'Car Meets Gone Wrong', '$SKID', 'Encontros de carros que terminam em desastre.', 'cars', '🏎️', 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=600&h=400&fit=crop', NULL, 10.00),
('football-edits', 'Football Sigma Edits', '$GOAT', 'Edits cinematicos de Ronaldo e Messi com phonk.', 'sports', '⚽', 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&h=400&fit=crop', NULL, 10.00),
('fortnite-og-nostalgia', 'Fortnite OG Nostalgia', '$OG', 'A volta do mapa OG quebrou a internet.', 'gaming', '🎮', 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&h=400&fit=crop', NULL, 10.00),
('gta6-hype', 'GTA 6 Hype Train', '$GTA6', 'O trailer mais visto da historia.', 'gaming', '🌴', 'https://images.unsplash.com/photo-1533310266094-8898a03807dd?w=600&h=400&fit=crop', NULL, 10.00)
ON CONFLICT (id) DO NOTHING;

-- 8. RESET existing users pra 1000 HypeCoins (so na primeira vez)
-- Descomente a linha abaixo se quiser resetar saldos ao rodar a migration:
-- UPDATE profiles SET hype_coins_balance = 1000;

-- ================================================================
-- FIM. Apos rodar:
-- - App consegue ler memes table (SELECT publico)
-- - Trade passa exclusivamente por trade_meme RPC
-- - Realtime broadcasta UPDATEs em memes pros clients
-- ================================================================
