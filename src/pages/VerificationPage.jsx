import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Check, ArrowLeft, CreditCard, Mail, Clock, Building, User } from 'lucide-react'
import { useUser, VERIFICATION_TYPES } from '../context/UserContext'
import VerifiedBadge from '../components/ui/VerifiedBadge'

const BILLING = [
  { id: 'monthly', label: 'Mensal', mult: 1, suffix: '/mes' },
  { id: 'semiannual', label: 'Semestral', mult: 5, suffix: '/sem', save: '15%' },
  { id: 'annual', label: 'Anual', mult: 9, suffix: '/ano', save: '25%' },
]

export default function VerificationPage() {
  const { user, setVerified } = useUser()
  const [step, setStep] = useState(user?.verified ? 'done' : 'type')
  const [selectedType, setSelectedType] = useState('blue')
  const [billing, setBilling] = useState('monthly')
  const [companyName, setCompanyName] = useState('')
  const [cnpjCpf, setCnpjCpf] = useState('')
  const [reason, setReason] = useState('')
  const [confirmed, setConfirmed] = useState(false)

  if (!user) return null

  const typeInfo = VERIFICATION_TYPES[selectedType]
  const needsApproval = typeInfo?.needsApproval
  const basePrice = typeInfo?.price || 0
  const billingInfo = BILLING.find(b => b.id === billing)
  const totalPrice = billing === 'monthly' ? basePrice : basePrice * billingInfo.mult
  const SUPPORT_EMAIL = 'verificacao@stonks.app'

  const handleConfirm = () => {
    if (needsApproval) {
      setConfirmed(true)
      setStep('requested')
    } else {
      setVerified(selectedType, { billing, price: totalPrice, startedAt: Date.now() })
      setConfirmed(true)
      setTimeout(() => setStep('done'), 1500)
    }
  }

  return (
    <div className="px-4 py-5 max-w-lg mx-auto w-full pb-24">
      <AnimatePresence mode="wait">

        {step === 'done' && (
          <motion.div key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-10">
            {confirmed ? (
              <>
                <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 0.5 }} className="text-5xl mb-3">🎉</motion.div>
                <h2 className="text-green font-bold text-xl">Verificado!</h2>
                <p className="text-text-secondary text-sm mt-1">Seu selo foi ativado.</p>
              </>
            ) : user.verified ? (
              <>
                <div className="flex items-center justify-center gap-2 mb-3">
                  <h2 className="text-text-primary font-bold text-xl">{user.displayName}</h2>
                  <VerifiedBadge type={user.verified} secondary={user.verifiedSecondary} size={24} />
                </div>
                <p className="text-text-secondary text-sm">
                  Conta verificada como <span className="font-semibold text-text-primary">{VERIFICATION_TYPES[user.verified]?.label}</span>
                </p>
              </>
            ) : null}
          </motion.div>
        )}

        {step === 'type' && (
          <motion.div key="type" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -80 }}>
            <h1 className="text-text-primary font-bold text-lg mb-1 flex items-center gap-2">
              <Shield size={20} className="text-accent" /> Verificacao
            </h1>
            <p className="text-text-secondary text-sm mb-5">Escolha o tipo de selo</p>

            <div className="space-y-3">
              {Object.entries(VERIFICATION_TYPES).filter(([k]) => k !== 'stonks').map(([key, info]) => (
                <button key={key} onClick={() => setSelectedType(key)}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all text-left
                    ${selectedType === key ? 'bg-accent/10 border-2 border-accent/40' : 'bg-surface border border-border hover:border-accent/20'}`}>
                  <VerifiedBadge type={key} size={28} />
                  <div className="flex-1">
                    <p className={`font-semibold text-sm ${selectedType === key ? 'text-accent' : 'text-text-primary'}`}>
                      {info.label}
                    </p>
                    <p className="text-text-muted text-xs">{info.desc}</p>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {info.features.map((f, i) => (
                        <span key={i} className="text-[9px] bg-surface-hover text-text-muted px-1.5 py-0.5 rounded">{f}</span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-text-primary font-bold">R$ {info.price}</p>
                    <p className="text-text-muted text-[10px]">/mes</p>
                  </div>
                </button>
              ))}
            </div>

            <button onClick={() => setStep(needsApproval ? 'details' : 'billing')}
              className="w-full mt-5 bg-accent hover:bg-accent-light text-white py-3 rounded-xl font-semibold text-sm cursor-pointer transition-all">
              Continuar
            </button>
            {needsApproval && (
              <p className="text-text-muted text-[10px] text-center mt-2 flex items-center justify-center gap-1">
                <Mail size={10} /> Requer aprovacao por email
              </p>
            )}
          </motion.div>
        )}

        {step === 'details' && (
          <motion.div key="details" initial={{ opacity: 0, x: 80 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -80 }}>
            <button onClick={() => setStep('type')} className="flex items-center gap-1 text-accent text-sm font-medium cursor-pointer mb-4">
              <ArrowLeft size={16} /> Voltar
            </button>
            <h2 className="text-text-primary font-bold text-lg mb-1 flex items-center gap-2">
              {selectedType === 'yellow' ? <Building size={18} className="text-yellow" /> : <User size={18} />}
              {selectedType === 'yellow' ? 'Dados da Empresa' : 'Dados do Representante'}
            </h2>
            <p className="text-text-secondary text-sm mb-5">Analisado pela equipe STONKS.</p>

            <div className="space-y-3">
              <div>
                <label className="text-text-secondary text-xs font-medium block mb-1">
                  {selectedType === 'yellow' ? 'Nome da empresa' : 'Nome completo'}
                </label>
                <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)}
                  placeholder={selectedType === 'yellow' ? 'Nike Brasil' : 'Nome completo'}
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
                <label className="text-text-secondary text-xs font-medium block mb-1">Motivo</label>
                <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3}
                  placeholder="Por que voce precisa do selo?"
                  className="w-full bg-surface-hover border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50 resize-none" />
              </div>
            </div>

            <button onClick={() => setStep('billing')} disabled={!companyName.trim() || !cnpjCpf.trim()}
              className="w-full mt-5 bg-accent hover:bg-accent-light disabled:opacity-30 text-white py-3 rounded-xl font-semibold text-sm cursor-pointer transition-all disabled:cursor-not-allowed">
              Continuar
            </button>
          </motion.div>
        )}

        {step === 'billing' && (
          <motion.div key="billing" initial={{ opacity: 0, x: 80 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -80 }}>
            <button onClick={() => setStep(needsApproval ? 'details' : 'type')} className="flex items-center gap-1 text-accent text-sm font-medium cursor-pointer mb-4">
              <ArrowLeft size={16} /> Voltar
            </button>
            <h2 className="text-text-primary font-bold text-lg mb-1">Periodo de cobranca</h2>
            <div className="flex items-center gap-2 mb-5">
              <VerifiedBadge type={selectedType} size={20} />
              <span className="text-text-secondary text-sm">{typeInfo?.label} · R$ {basePrice}/mes</span>
            </div>

            <div className="space-y-2.5">
              {BILLING.map(b => (
                <button key={b.id} onClick={() => setBilling(b.id)}
                  className={`w-full flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all
                    ${billing === b.id ? 'bg-accent/10 border-2 border-accent/40' : 'bg-surface border border-border'}`}>
                  <div>
                    <p className={`font-semibold text-sm ${billing === b.id ? 'text-accent' : 'text-text-primary'}`}>{b.label}</p>
                    {b.save && <span className="text-green text-[10px] font-semibold">Economize {b.save}</span>}
                  </div>
                  <p className="text-text-primary font-bold">R$ {b.id === 'monthly' ? basePrice : basePrice * b.mult}</p>
                </button>
              ))}
            </div>

            <button onClick={() => setStep('payment')}
              className="w-full mt-5 bg-accent hover:bg-accent-light text-white py-3 rounded-xl font-semibold text-sm cursor-pointer transition-all">
              Continuar para pagamento
            </button>
          </motion.div>
        )}

        {step === 'payment' && (
          <motion.div key="payment" initial={{ opacity: 0, x: 80 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -80 }}>
            <button onClick={() => setStep('billing')} className="flex items-center gap-1 text-accent text-sm font-medium cursor-pointer mb-4">
              <ArrowLeft size={16} /> Voltar
            </button>
            <h2 className="text-text-primary font-bold text-lg mb-4">Pagamento</h2>

            <div className="bg-surface border border-border rounded-xl p-4 mb-4">
              <div className="flex items-center gap-3 mb-3">
                <VerifiedBadge type={selectedType} size={24} />
                <div>
                  <p className="text-text-primary text-sm font-semibold">Selo {typeInfo?.label}</p>
                  <p className="text-text-muted text-xs">{billingInfo?.label}</p>
                </div>
                <p className="ml-auto text-text-primary font-bold text-lg">R$ {totalPrice}</p>
              </div>
            </div>

            <div className="space-y-3 mb-5">
              <div>
                <label className="text-text-secondary text-xs font-medium block mb-1">Cartao</label>
                <div className="relative">
                  <CreditCard size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input type="text" placeholder="0000 0000 0000 0000"
                    className="w-full bg-surface-hover border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50" />
                </div>
              </div>
              <div className="flex gap-3">
                <input type="text" placeholder="MM/AA" className="flex-1 bg-surface-hover border border-border rounded-xl px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50" />
                <input type="text" placeholder="CVV" maxLength={3} className="flex-1 bg-surface-hover border border-border rounded-xl px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50" />
              </div>
            </div>

            <button onClick={handleConfirm}
              className="w-full bg-green hover:bg-green/80 text-white py-3.5 rounded-xl font-bold text-sm cursor-pointer transition-all">
              {needsApproval ? 'Enviar Solicitacao · R$ ' + totalPrice : 'Ativar Selo · R$ ' + totalPrice}
            </button>
            <p className="text-text-muted text-[10px] text-center mt-2">
              {needsApproval ? 'Dados analisados em ate 48h.' : 'Ambiente de teste.'}
            </p>
          </motion.div>
        )}

        {step === 'requested' && (
          <motion.div key="requested" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="text-center py-10">
              <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 2 }}
                className="w-20 h-20 rounded-full bg-yellow/10 flex items-center justify-center mx-auto mb-4">
                <Clock size={36} className="text-yellow" />
              </motion.div>
              <h2 className="text-text-primary font-bold text-xl mb-2">Solicitacao Enviada!</h2>
              <p className="text-text-secondary text-sm mb-4">
                Selo <span className="font-semibold">{typeInfo?.label}</span> em analise.
              </p>
              <div className="bg-accent/5 border border-accent/20 rounded-xl p-4 mb-4">
                <p className="text-text-secondary text-xs">Resposta em ate 48h:</p>
                <p className="text-accent text-sm font-medium mt-1">{SUPPORT_EMAIL}</p>
              </div>
              <button onClick={() => window.history.back()}
                className="w-full bg-surface-hover border border-border text-text-primary py-3 rounded-xl font-medium text-sm cursor-pointer">
                Voltar ao app
              </button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  )
}
