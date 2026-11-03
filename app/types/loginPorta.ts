// O que a página /login entrega à tela (LoginLinha, desde 03/11/2026). A
// lógica de autenticação mora só em pages/login.vue; a tela recebe este objeto
// (reactive, então os refs vêm desembrulhados e os campos `phone`/`email`
// aceitam escrita) e só desenha.
import type { AppleCredencial } from '~/composables/useAppleAuth'

export interface PortaLogin {
  // estado
  mode: 'login' | 'cadastro'
  method: 'phone' | 'email'
  phone: string
  email: string
  step: 'identifier' | 'pin'
  sending: boolean
  verifying: boolean
  identifierError: string | null
  pinError: string | null
  googleError: string | null
  googleSubmitting: boolean
  whatsappDown: boolean
  socialEntrando: 'google' | 'apple'
  resendIn: number
  // derivados (a copy de sempre)
  isCad: boolean
  isPhone: boolean
  ready: boolean
  vemDaAssinatura: boolean
  mainCta: string
  altLabel: string
  altCta: string
  fieldHelp: string
  whatsappNotice: string
  // ações
  submitIdentifier: () => Promise<void>
  verifyPin: (pin: string) => Promise<void>
  resendPin: () => Promise<void>
  backToIdentifier: () => void
  toggleMode: () => void
  toggleMethod: () => void
  onGoogleCredential: (idToken: string) => Promise<void>
  onAppleCredential: (cred: AppleCredencial) => Promise<void>
}
