import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Check, ArrowLeft, CreditCard, Star, Mail, Clock, Building, User } from 'lucide-react'
import { useUser, VERIFICATION_TYPES, VERIFICATION_PLANS } from '../context/UserContext'
import VerifiedBadge from '../components/ui/VerifiedBadge'

const BILLING_OPTIONS = [
  { id: 'monthly', label: 'Mensal', discount: 0, suffix: '/mes' },
  { id: 'semiannual', label: 'Semestral', discount: 15, suffix: '/6 meses' },
  { id: 'annual', label: 'Anual', discount: 25, suffix: '/ano' },
]

function getPrice(plan, billing) {
  if (billing === 'semiannual') return plan.priceSemiannual
  if (billing === 'annual') return plan.priceAnnual
  return plan.priceMonthly
}

export default function VerificationPage() {
  const { user, setVerified } = useUser()
  const [step, setStep] = useState(user?.verified ? 'done' : 'type')
  const [selectedType, setSelectedType] = useState('blue')
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [billing, setBilling] = useState('monthly')
  const [cardNumber, setCardNumber] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const [requestSent, setRequestSent] = useState(false)
  // Business/Political extra fields
  const [companyName, setCompanyName] = useState('')
  const [cnpjCpf, setCnpjCpf] = useState('')
  const [reason, setReason] = useState('')

  if (!user) return null

  const needsApproval = selectedType === 'yellow' || selectedType === 'black'
  const SUPPORT_EMAIL = 'verificacao@stonks.app' // placeholder - corporativo vem depois

  const handleConfirm = () => {
    if (needsApproval) {
      // Request sent - awaiting approval
      setRequestSent(true)
      setStep('requested')
    } else {
      // Blue seal - instant activation
      setVerified(selectedType, {
        tier: selectedPlan.id,
        billing,
        price: getPrice(selectedPlan, billing),
        startedAt: Date.now(),
      })
      setConfirmed(true)
      setTimeout(() => setStep('done'), 2000)
    }
  }

  return (
    <div className="px-4 py-5 max-w-lg mx-auto w-full pb-24">
      <AnimatePresence mode="wait">

        {/* Already verified */}
        {step === 'done' && (
          <motion.div key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-10">
            <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4">
              <Shield size={36} className="text-accent" />
            </div>
            {user.verified ? (
              <>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <h2 className="text-text-primary font-bold text-xl">{user.displayName}</h2>
                  <VerifiedBadge type={user.verified} size={22} />
                </div>
                <p className="text-text-secondary text-sm">
                  Conta verificada como <span className="font-semibold text-text-primary">{VERIFICATION_TYPES[user.verified]?.label}</span>
                </p>
                {user.verifiedPlan && (
                  <div className="mt-4 bg-surface border border-border rounded-xl p-4">
                    <p className="text-text-muted text-xs">Plano: <span className="text-text-primary font-medium">{VERIFICATION_PLANS.find(p => p.id === user.verifiedPlan.tier)?.name}</span></p>
                    <p className="text-text-muted text-xs mt-1">R$ {user.verifiedPlan.price}/{user.verifiedPlan.billing === 'monthly' ? 'mes' : user.verifiedPlan.billing === 'semiannual' ? 'semestre' : 'ano'}</p>
                  </div>
                )}
              </>
            ) : confirmed ? (
              <>
                <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 0.5 }} className="text-5xl mb-3">🎉</motion.div>
                <h2 className="text-green font-bold text-xl">Verificado!</h2>
                <p className="text-text-secondary text-sm mt-1">Seu selo foi ativado com sucesso.</p>
              </>
            ) : null}
          </motion.div>
        )}

        {/* Step 1: Choose type */}
        {step === 'type' && (
          <motion.div key="type" initial={{ opacity: 0, x: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -100 }}>
            <h1 className="text-text-primary font-bold text-lg mb-1 flex items-center gap-2">
              <Shield size={20} className="text-accent" /> Verificacao
            </h1>
            <p className="text-text-secondary text-sm mb-5">Escolha o tipo de conta</p>

            <div className="space-y-2.5">
              {Object.entries(VERIFICATION_TYPES).filter(([k]) => k !== 'stonks').map(([key, info]) => (
                <button key={key} onClick={() => setSelectedType(key)}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all text-left
                    ${selectedType === key ? 'bg-accent/10 border-2 border-accent/40' : 'bg-surface border border-border hover:border-accent/20'}`}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
                    style={{ backgroundColor: info.color }}>
                    {info.emoji}
                  </div>
                  <div className="flex-1">
                    <p className={`font-semibold text-sm ${selectedType === key ? 'text-accent' : 'text-text-primary'}`}>
                      {info.label}
                    </p>
                    <p className="text-text-muted text-xs">{info.desc}</p>
                  </div>
                  {selectedType === key && <Check size={18} className="text-accent" />}
                </button>
              ))}
            </div>

            <button onClick={() => setStep(needsApproval ? 'details' : 'plan')}
              className="w-full mt-5 bg-accent hover:bg-accent-light text-white py-3 rounded-xl font-semibold text-sm cursor-pointer transition-all">
              Continuar
            </button>

            {needsApproval && (
              <p className="text-text-muted text-[10px] text-center mt-2 flex items-center justify-center gap-1">
                <Mail size={10} /> Contas {selectedType === 'yellow' ? 'empresariais' : 'politicas'} passam por aprovacao
              </p>
            )}
          </motion.div>
        )}

        {/* Step 1.5: Extra details for business/political */}
        {step === 'details' && (
          <motion.div key="details" initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -100 }}>
            <button onClick={() => setStep('type')} className="flex items-center gap-1 text-accent text-sm font-medium cursor-pointer mb-4">
              <ArrowLeft size={16} /> Voltar
            </button>
            <h2 className="text-text-primary font-bold text-lg mb-1 flex items-center gap-2">
              {selectedType === 'yellow' ? <Building size={18} className="text-yellow" /> : <User size={18} className="text-text-primary" />}
              {selectedType === 'yellow' ? 'Dados da Empresa' : 'Dados do Representante'}
            </h2>
            <p className="text-text-secondary text-sm mb-5">
              Essas informacoes serao analisadas pela nossa equipe.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-text-secondary text-xs font-medium block mb-1">
                  {selectedType === 'yellow' ? 'Nome da empresa / marca' : 'Nome completo'}
                </label>
                <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)}
                  placeholder={selectedType === 'yellow' ? 'Ex: Nike Brasil' : 'Nome completo do representante'}
                  className="w-full bg-surface-hover border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50" />
              </div>
              <div>
                <label className="text-text-secondary text-xs font-medium block mb-1">
                  {selectedType === 'yellow' ? 'CNPJ' : 'CPF'}
                </label>
                <input type="text" value={cnpjCpf} onChange={(e) => setCnpjCpf(e.target.value)}
                  placeholder={selectedType === 'yellow' ? '00.000.000/0000-00' : '000.000.000-00'}
                  className="w-full bg-surface-hover border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50" />
              </div>
              <div>
                <label className="text-text-secondary text-xs font-medium block mb-1">Motivo da solicitacao</label>
                <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3}
                  placeholder="Explique por que voce precisa do selo verificado..."
                  className="w-full bg-surface-hover border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50 resize-none" />
              </div>
            </div>

            <button onClick={() => setStep('plan')} disabled={!companyName.trim() || !cnpjCpf.trim() || !reason.trim()}
              className="w-full mt-5 bg-accent hover:bg-accent-light disabled:opacity-30 text-white py-3 rounded-xl
                font-semibold text-sm cursor-pointer transition-all disabled:cursor-not-allowed">
              Continuar para planos
            </button>
          </motion.div>
        )}

        {/* Step 2: Choose plan */}
        {step === 'plan' && (
          <motion.div key="plan" initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -100 }}>
            <button onClick={() => setStep('type')} className="flex items-center gap-1 text-accent text-sm font-medium cursor-pointer mb-4">
              <ArrowLeft size={16} /> Voltar
            </button>
            <h2 className="text-text-primary font-bold text-lg mb-1">Escolha seu plano</h2>
            <p className="text-text-secondary text-sm mb-4">Selo {VERIFICATION_TYPES[selectedType]?.label}</p>

            {/* Billing toggle */}
            <div className="flex bg-surface-hover rounded-xl p-1 mb-4">
              {BILLING_OPTIONS.map(opt => (
                <button key={opt.id} onClick={() => setBilling(opt.id)}
                  className={`flex-1 py-1.5 rounded-lg text-[11px] font-semibold cursor-pointer transition-all relative
                    ${billing === opt.id ? 'bg-accent text-white' : 'text-text-muted'}`}>
                  {opt.label}
                  {opt.discount > 0 && (
                    <span className="absolute -top-2 right-1 bg-green text-white text-[8px] px-1 rounded-full font-bold">
                      -{opt.discount}%
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="space-y-2.5">
              {VERIFICATION_PLANS.map(plan => {
                const price = getPrice(plan, billing)
                return (
                  <button key={plan.id} onClick={() => setSelectedPlan(plan)}
                    className={`w-full p-4 rounded-xl cursor-pointer transition-all text-left
                      ${selectedPlan?.id === plan.id ? 'bg-accent/10 border-2 border-accent/40' : 'bg-surface border border-border hover:border-accent/20'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {plan.id === 'elite' && <Star size={14} className="text-yellow" />}
                        <span className={`font-semibold text-sm ${selectedPlan?.id === plan.id ? 'text-accent' : 'text-text-primary'}`}>
                          {plan.name}
                        </span>
                      </div>
                      <span className="text-text-primary font-bold">R$ {price}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {plan.features.map((f, i) => (
                        <span key={i} className="text-[10px] text-text-muted bg-surface-hover px-2 py-0.5 rounded-full">
                          {f}
                        </span>
                      ))}
                    </div>
                  </button>
                )
              })}
            </div>

            <button onClick={() => selectedPlan && setStep('payment')} disabled={!selectedPlan}
              className="w-full mt-5 bg-accent hover:bg-accent-light disabled:opacity-30 text-white py-3 rounded-xl
                font-semibold text-sm cursor-pointer transition-all disabled:cursor-not-allowed">
              Continuar para pagamento
            </button>
          </motion.div>
        )}

        {/* Step 3: Payment */}
        {step === 'payment' && (
          <motion.div key="payment" initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -100 }}>
            <button onClick={() => setStep('plan')} className="flex items-center gap-1 text-accent text-sm font-medium cursor-pointer mb-4">
              <ArrowLeft size={16} /> Voltar
            </button>
            <h2 className="text-text-primary font-bold text-lg mb-1">Pagamento</h2>
            <p className="text-text-secondary text-sm mb-5">
              {selectedPlan?.name} · R$ {getPrice(selectedPlan, billing)}{BILLING_OPTIONS.find(b => b.id === billing)?.suffix}
            </p>

            {/* Summary */}
            <div className="bg-surface border border-border rounded-xl p-4 mb-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
                  style={{ backgroundColor: VERIFICATION_TYPES[selectedType]?.color }}>
                  {VERIFICATION_TYPES[selectedType]?.emoji}
                </div>
                <div>
                  <p className="text-text-primary text-sm font-semibold">Selo {VERIFICATION_TYPES[selectedType]?.label}</p>
                  <p className="text-text-muted text-xs">Plano {selectedPlan?.name}</p>
                </div>
              </div>
              <div className="border-t border-border pt-2 flex justify-between">
                <span className="text-text-muted text-xs">Total</span>
                <span className="text-text-primary font-bold">R$ {getPrice(selectedPlan, billing)}</span>
              </div>
            </div>

            {/* Card mock */}
            <div className="space-y-3 mb-5">
              <div>
                <label className="text-text-secondary text-xs font-medium block mb-1">Numero do cartao</label>
                <div className="relative">
                  <CreditCard size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input type="text" value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').replace(/(\d{4})/g, '$1 ').trim().slice(0, 19))}
                    placeholder="0000 0000 0000 0000"
                    className="w-full bg-surface-hover border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm
                      text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50" />
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-text-secondary text-xs font-medium block mb-1">Validade</label>
                  <input type="text" placeholder="MM/AA"
                    className="w-full bg-surface-hover border border-border rounded-xl px-3 py-2.5 text-sm
                      text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50" />
                </div>
                <div className="flex-1">
                  <label className="text-text-secondary text-xs font-medium block mb-1">CVV</label>
                  <input type="text" placeholder="123" maxLength={3}
                    className="w-full bg-surface-hover border border-border rounded-xl px-3 py-2.5 text-sm
                      text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50" />
                </div>
              </div>
            </div>

            <button onClick={handleConfirm}
              className="w-full bg-green hover:bg-green/80 text-white py-3.5 rounded-xl font-bold text-sm cursor-pointer transition-all">
              {needsApproval ? 'Enviar Solicitacao' : 'Confirmar e Ativar Selo'}
            </button>
            <p className="text-text-muted text-[10px] text-center mt-2">
              {needsApproval
                ? 'Seus dados serao analisados. Voce recebera um email com a resposta.'
                : 'Ambiente de teste. Nenhum pagamento real sera processado.'}
            </p>
          </motion.div>
        )}

        {/* Request sent - awaiting approval */}
        {step === 'requested' && (
          <motion.div key="requested" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="text-center py-10">
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                className="w-20 h-20 rounded-full bg-yellow/10 flex items-center justify-center mx-auto mb-4"
              >
                <Clock size={36} className="text-yellow" />
              </motion.div>
              <h2 className="text-text-primary font-bold text-xl mb-2">Solicitacao Enviada!</h2>
              <p className="text-text-secondary text-sm mb-4">
                Sua solicitacao de selo <span className="font-semibold">{VERIFICATION_TYPES[selectedType]?.label}</span> esta em analise.
              </p>

              <div className="bg-surface border border-border rounded-xl p-4 text-left mb-4 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-text-muted">Tipo</span>
                  <span className="text-text-primary font-medium flex items-center gap-1">
                    {VERIFICATION_TYPES[selectedType]?.label} <VerifiedBadge type={selectedType} size={14} />
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-text-muted">Plano</span>
                  <span className="text-text-primary font-medium">{selectedPlan?.name} · R$ {getPrice(selectedPlan, billing)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-text-muted">{selectedType === 'yellow' ? 'Empresa' : 'Representante'}</span>
                  <span className="text-text-primary font-medium">{companyName}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-text-muted">Status</span>
                  <span className="text-yellow font-semibold flex items-center gap-1">
                    <Clock size={10} /> Em analise
                  </span>
                </div>
              </div>

              <div className="bg-accent/5 border border-accent/20 rounded-xl p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Mail size={14} className="text-accent" />
                  <span className="text-accent text-xs font-semibold">Contato da equipe</span>
                </div>
                <p className="text-text-secondary text-xs">
                  Voce recebera uma resposta em ate 48h. Em caso de duvidas:
                </p>
                <p className="text-accent text-sm font-medium mt-1">{SUPPORT_EMAIL}</p>
              </div>

              <button onClick={() => { setStep('done'); window.history.back() }}
                className="w-full bg-surface-hover border border-border text-text-primary py-3 rounded-xl
                  font-medium text-sm cursor-pointer hover:bg-surface transition-colors">
                Voltar ao app
              </button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  )
}
