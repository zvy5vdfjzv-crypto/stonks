-- STONKS Profiles Schema
-- Cole isso no SQL Editor do Supabase e clique Run

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL DEFAULT '',
  handle TEXT UNIQUE NOT NULL DEFAULT '',
  avatar TEXT DEFAULT '🎮',
  avatar_type TEXT DEFAULT 'emoji',
  bio TEXT DEFAULT '',
  social_links JSONB DEFAULT '{"instagram":"","x":"","youtube":"","linkedin":""}',
  niches TEXT[] DEFAULT '{}',
  verified TEXT,
  verified_secondary TEXT,
  verified_plan JSONB,
  account_type TEXT DEFAULT 'personal',
  creator_score INTEGER DEFAULT 0,
  followers INTEGER DEFAULT 0,
  following INTEGER DEFAULT 0,
  memes_posted INTEGER DEFAULT 0,
  total_bancadas INTEGER DEFAULT 0,
  total_views INTEGER DEFAULT 0,
  privacy JSONB DEFAULT '{"privateAccount":false,"showActivity":"followers","allowMentions":true}',
  screen_time JSONB DEFAULT '{"totalMinutes":0,"sessions":[]}',
  owned_items TEXT[] DEFAULT '{}',
  equipped_items JSONB DEFAULT '{"hat":null,"glasses":null,"effect":null,"frame":null}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
