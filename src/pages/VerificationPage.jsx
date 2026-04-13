import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, ArrowLeft, CreditCard, Mail, Clock, Building, User, ScanFace, MapPin, Check } from 'lucide-react'
import { useUser, VERIFICATION_TYPES } from '../context/UserContext'
import { useNotifications } from '../context/NotificationContext'
import VerifiedBadge from '../components/ui/VerifiedBadge'

const BILLING = [
  { id: 'monthly', label: 'Mensal', mult: 1, suffix: '/mes' },
  { id: 'semiannual', label: 'Semestral', mult: 5, suffix: '/sem', save: '15%' },
  { id: 'annual', label: 'Anual', mult: 9, suffix: '/ano', save: '25%' },
]

export default function VerificationPage() {
  const { user, setVerified } = useUser()
  const { addNotification } = useNotifications()
  const [step, setStep] = useState(user?.verified ? 'done' : 'type')
  const [selectedType, setSelectedType] = useState('blue')
  const [billing, setBilling] = useState('monthly')

  // Identity fields
  const [fullName, setFullName] = useState('')
  const [cpf, setCpf] = useState('')
  const [cep, setCep] = useState('')
  const [faceVerified, setFaceVerified] = useState(false)
  const [scanning, setScanning] = useState(false)

  // Business/Political extra
  const [companyName, setCompanyName] = useState('')
  const [cnpjCpf, setCnpjCpf] = useState('')
  const [reason, setReason] = useState('')

  // Payment
  const [cardNum, setCardNum] = useState('')
  const [cardExp, setCardExp] = useState('')
  const [cardCvv, setCardCvv] = useState('')

  if (!user) return null

  const typeInfo = VERIFICATION_TYPES[selectedType]
  const needsApproval = typeInfo?.needsApproval
  const basePrice = typeInfo?.price || 0
  const billingInfo = BILLING.find(b => b.id === billing)
  const totalPrice = billing === 'monthly' ? basePrice : basePrice * billingInfo.mult
  const SUPPORT_EMAIL = 'verificacao@stonks.app'

  // Validations
  const cpfClean = cpf.replace(/\D/g, '')
  const cepClean = cep.replace(/\D/g, '')
  const hasFullName = fullName.trim().split(' ').filter(w => w.length > 1).length >= 2
  const hasCpf = cpfClean.length === 11
  const hasCep = cepClean.length === 8
  const identityValid = hasFullName && hasCpf && hasCep && faceVerified
  const detailsValid = !needsApproval || (companyName.trim() && cnpjCpf.trim())
  const cardClean = cardNum.replace(/\D/g, '')
  const paymentValid = cardClean.length >= 16 && cardExp.length >= 4 && cardCvv.length === 3

  const formatCpf = (v) => {
    const d = v.replace(/\D/g, '').slice(0, 11)
    return d.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2')
  }
  const formatCep = (v) => {
    const d = v.replace(/\D/g, '').slice(0, 8)
    return d.replace(/(\d{5})(\d)/, '$1-$2')
  }
  const formatCard = (v) => {
    return v.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})/g, '$1 ').trim()
  }
  const formatExp = (v) => {
    const d = v.replace(/\D/g, '').slice(0, 4)
    return d.length > 2 ? d.slice(0, 2) + '/' + d.slice(2) : d
  }

  const startFaceScan = () => {
    setScanning(true)
    setTimeout(() => { setScanning(false); setFaceVerified(true) }, 3000)
  }

  const handleConfirm = () => {
    if (needsApproval) {
      addNotification('news', 'Solicitacao Enviada', `Seu pedido de selo ${typeInfo.label} esta em analise.`)
      setStep('requested')
    } else {
      setVerified(selectedType, { billing, price: totalPrice, startedAt: Date.now() })
      addNotification('bancada', 'Conta Verificada! ✓', `Seu selo ${typeInfo.label} foi ativado com sucesso!`)
      setStep('success')
    }
  }

  return (
    <div className="px-4 py-5 max-w-lg mx-auto w-full pb-24">
      <AnimatePresence mode="wait">

        {/* Already verified */}
        {step === 'done' && (
          <motion.div key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-10">
            <div className="flex items-center justify-center gap-2 mb-3">
              <h2 className="text-text-primary font-bold text-xl">{user.displayName}</h2>
              <VerifiedBadge type={user.verified} secondary={user.verifiedSecondary} size={24} />
            </div>
            <p className="text-text-secondary text-sm">Conta verificada como <span className="font-semibold text-text-primary">{VERIFICATION_TYPES[user.verified]?.label}</span></p>
          </motion.div>
        )}

        {/* Success animation */}
        {step === 'success' && (
          <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-10">
            <motion.div animate={{ scale: [1, 1.3, 1], rotate: [0, 10, -10, 0] }} transition={{ duration: 0.6 }} className="text-6xl mb-4">🎉</motion.div>
            <h2 className="text-green font-bold text-xl mb-2">Conta Verificada!</h2>
            <VerifiedBadge type={selectedType} size={32} />
            <p className="text-text-secondary text-sm mt-3">Seu selo esta ativo em todo o app.</p>
          </motion.div>
        )}

        {/* Step 1: Type */}
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
                    <p className={`font-semibold text-sm ${selectedType === key ? 'text-accent' : 'text-text-primary'}`}>{info.label}</p>
                    <p className="text-text-muted text-xs">{info.desc}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-text-primary font-bold">R$ {info.price}</p>
                    <p className="text-text-muted text-[10px]">/mes</p>
                  </div>
                </button>
              ))}
            </div>
            <button onClick={() => setStep(needsApproval ? 'details' : 'identity')}
              className="w-full mt-5 bg-accent hover:bg-accent-light text-white py-3 rounded-xl font-semibold text-sm cursor-pointer transition-all">
              Continuar
            </button>
            {needsApproval && <p className="text-text-muted text-[10px] text-center mt-2"><Mail size={10} className="inline mr-1" />Requer aprovacao</p>}
          </motion.div>
        )}

        {/* Step 1.5: Business/Political details */}
        {step === 'details' && (
          <motion.div key="details" initial={{ opacity: 0, x: 80 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -80 }}>
            <button onClick={() => setStep('type')} className="flex items-center gap-1 text-accent text-sm font-medium cursor-pointer mb-4"><ArrowLeft size={16} /> Voltar</button>
            <h2 className="text-text-primary font-bold text-lg mb-4 flex items-center gap-2">
              {selectedType === 'yellow' ? <Building size={18} className="text-yellow" /> : <User size={18} />}
              {selectedType === 'yellow' ? 'Dados da Empresa' : 'Dados do Representante'}
            </h2>
            <div className="space-y-3">
              <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)}
                placeholder={selectedType === 'yellow' ? 'Nome da empresa' : 'Nome completo'} className="w-full bg-surface-hover border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50" />
              <input type="text" value={cnpjCpf} onChange={(e) => setCnpjCpf(e.target.value)}
                placeholder={selectedType === 'yellow' ? 'CNPJ' : 'CPF do representante'} className="w-full bg-surface-hover border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50" />
              <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={2} placeholder="Motivo da solicitacao"
                className="w-full bg-surface-hover border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50 resize-none" />
            </div>
            <button onClick={() => setStep('identity')} disabled={!detailsValid}
              className="w-full mt-5 bg-accent hover:bg-accent-light disabled:opacity-30 text-white py-3 rounded-xl font-semibold text-sm cursor-pointer transition-all disabled:cursor-not-allowed">
              Continuar
            </button>
          </motion.div>
        )}

        {/* Step 2: Identity Verification */}
        {step === 'identity' && (
          <motion.div key="identity" initial={{ opacity: 0, x: 80 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -80 }}>
            <button onClick={() => setStep(needsApproval ? 'details' : 'type')} className="flex items-center gap-1 text-accent text-sm font-medium cursor-pointer mb-4"><ArrowLeft size={16} /> Voltar</button>
            <h2 className="text-text-primary font-bold text-lg mb-1 flex items-center gap-2">
              <ScanFace size={18} className="text-accent" /> Verificacao de Identidade
            </h2>
            <p className="text-text-secondary text-sm mb-5">Obrigatorio para ativar o selo.</p>

            <div className="space-y-3">
              <div>
                <label className="text-text-secondary text-xs font-medium block mb-1">Nome completo</label>
                <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Nome e sobrenome"
                  className="w-full bg-surface-hover border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50" />
                {fullName && !hasFullName && <p className="text-red text-[10px] mt-0.5">Informe nome e sobrenome</p>}
              </div>
              <div>
                <label className="text-text-secondary text-xs font-medium block mb-1">CPF</label>
                <input type="text" value={cpf} onChange={(e) => setCpf(formatCpf(e.target.value))} placeholder="000.000.000-00" maxLength={14}
                  className="w-full bg-surface-hover border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50" />
                {cpf && !hasCpf && <p className="text-red text-[10px] mt-0.5">CPF incompleto</p>}
              </div>
              <div>
                <label className="text-text-secondary text-xs font-medium block mb-1">CEP</label>
                <input type="text" value={cep} onChange={(e) => setCep(formatCep(e.target.value))} placeholder="00000-000" maxLength={9}
                  className="w-full bg-surface-hover border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50" />
                {cep && !hasCep && <p className="text-red text-[10px] mt-0.5">CEP incompleto</p>}
              </div>

              {/* Facial recognition */}
              <div>
                <label className="text-text-secondary text-xs font-medium block mb-2">Reconhecimento facial</label>
                {faceVerified ? (
                  <div className="bg-green/10 border border-green/30 rounded-xl p-4 text-center">
                    <Check size={24} className="text-green mx-auto mb-1" />
                    <p className="text-green text-sm font-semibold">Rosto verificado</p>
                  </div>
                ) : scanning ? (
                  <div className="bg-accent/10 border border-accent/30 rounded-xl p-6 text-center">
                    <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                      <ScanFace size={40} className="text-accent mx-auto mb-2" />
                    </motion.div>
                    <p className="text-accent text-sm font-semibold">Escaneando rosto...</p>
                    <p className="text-text-muted text-[10px] mt-1">Mantenha o rosto centralizado</p>
                  </div>
                ) : (
                  <button onClick={startFaceScan}
                    className="w-full bg-surface-hover border-2 border-dashed border-border rounded-xl p-5 text-center cursor-pointer hover:border-accent/40 transition-colors">
                    <ScanFace size={32} className="text-text-muted mx-auto mb-2" />
                    <p className="text-text-primary text-sm font-medium">Iniciar Verificacao Facial</p>
                    <p className="text-text-muted text-[10px] mt-1">Usaremos sua camera para confirmar identidade</p>
                  </button>
                )}
              </div>
            </div>

            <button onClick={() => setStep('billing')} disabled={!identityValid}
              className="w-full mt-5 bg-accent hover:bg-accent-light disabled:opacity-30 text-white py-3 rounded-xl font-semibold text-sm cursor-pointer transition-all disabled:cursor-not-allowed">
              Continuar
            </button>
            {!identityValid && <p className="text-text-muted text-[10px] text-center mt-2">Preencha todos os campos e faca a verificacao facial</p>}
          </motion.div>
        )}

        {/* Step 3: Billing */}
        {step === 'billing' && (
          <motion.div key="billing" initial={{ opacity: 0, x: 80 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -80 }}>
            <button onClick={() => setStep('identity')} className="flex items-center gap-1 text-accent text-sm font-medium cursor-pointer mb-4"><ArrowLeft size={16} /> Voltar</button>
            <h2 className="text-text-primary font-bold text-lg mb-4">Periodo</h2>
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
            <button onClick={() => setStep('payment')} className="w-full mt-5 bg-accent hover:bg-accent-light text-white py-3 rounded-xl font-semibold text-sm cursor-pointer transition-all">
              Continuar
            </button>
          </motion.div>
        )}

        {/* Step 4: Payment */}
        {step === 'payment' && (
          <motion.div key="payment" initial={{ opacity: 0, x: 80 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -80 }}>
            <button onClick={() => setStep('billing')} className="flex items-center gap-1 text-accent text-sm font-medium cursor-pointer mb-4"><ArrowLeft size={16} /> Voltar</button>
            <h2 className="text-text-primary font-bold text-lg mb-4">Pagamento</h2>
            <div className="bg-surface border border-border rounded-xl p-4 mb-4 flex items-center gap-3">
              <VerifiedBadge type={selectedType} size={24} />
              <div className="flex-1">
                <p className="text-text-primary text-sm font-semibold">Selo {typeInfo?.label} · {billingInfo?.label}</p>
              </div>
              <p className="text-text-primary font-bold text-lg">R$ {totalPrice}</p>
            </div>
            <div className="space-y-3 mb-5">
              <div>
                <label className="text-text-secondary text-xs font-medium block mb-1">Numero do cartao</label>
                <div className="relative">
                  <CreditCard size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input type="text" value={cardNum} onChange={(e) => setCardNum(formatCard(e.target.value))} placeholder="0000 0000 0000 0000" maxLength={19}
                    className="w-full bg-surface-hover border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50" />
                </div>
                {cardNum && cardClean.length < 16 && <p className="text-red text-[10px] mt-0.5">Cartao incompleto</p>}
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-text-secondary text-xs font-medium block mb-1">Validade</label>
                  <input type="text" value={cardExp} onChange={(e) => setCardExp(formatExp(e.target.value))} placeholder="MM/AA" maxLength={5}
                    className="w-full bg-surface-hover border border-border rounded-xl px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50" />
                </div>
                <div className="flex-1">
                  <label className="text-text-secondary text-xs font-medium block mb-1">CVV</label>
                  <input type="text" value={cardCvv} onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 3))} placeholder="123" maxLength={3}
                    className="w-full bg-surface-hover border border-border rounded-xl px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50" />
                </div>
              </div>
            </div>
            <button onClick={handleConfirm} disabled={!paymentValid}
              className="w-full bg-green hover:bg-green/80 disabled:opacity-30 text-white py-3.5 rounded-xl font-bold text-sm cursor-pointer transition-all disabled:cursor-not-allowed">
              {needsApproval ? 'Enviar Solicitacao · R$ ' + totalPrice : 'Ativar Selo · R$ ' + totalPrice}
            </button>
            {!paymentValid && <p className="text-text-muted text-[10px] text-center mt-2">Preencha todos os dados do cartao</p>}
          </motion.div>
        )}

        {/* Requested - awaiting approval */}
        {step === 'requested' && (
          <motion.div key="requested" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-10">
            <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 2 }}
              className="w-20 h-20 rounded-full bg-yellow/10 flex items-center justify-center mx-auto mb-4">
              <Clock size={36} className="text-yellow" />
            </motion.div>
            <h2 className="text-text-primary font-bold text-xl mb-2">Solicitacao Enviada!</h2>
            <p className="text-text-secondary text-sm mb-4">Resposta em ate 48h:</p>
            <p className="text-accent font-medium">{SUPPORT_EMAIL}</p>
            <button onClick={() => window.history.back()}
              className="mt-6 bg-surface-hover border border-border text-text-primary px-6 py-2.5 rounded-xl text-sm cursor-pointer">
              Voltar ao app
            </button>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  )
}
