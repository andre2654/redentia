/**
 * As duas perguntas do onboarding obrigatório (decisão do dono, 24/08): o
 * objetivo e a experiência, gravados em PUT /auth/profile. Vivem aqui para o
 * NuOnboardingModal e a folha de cadastro (CadastroFolha, 21/10/2026), que faz
 * as mesmas perguntas no fim do cadastro em vez de abrir um segundo modal.
 */
export interface OnboardingOpcao { value: string; label: string; desc: string }

export const ONBOARDING_OBJETIVOS: OnboardingOpcao[] = [
  { value: 'acompanhar-carteira', label: 'Acompanhar minha carteira', desc: 'Seu patrimônio, o dia e o porquê de cada movimento.' },
  { value: 'decidir-aportes', label: 'Decidir meus próximos aportes', desc: 'Teses, rankings e comparativos com dados.' },
  { value: 'aprender', label: 'Aprender a investir', desc: 'Guias passo a passo e o glossário em português claro.' },
  { value: 'ferramentas', label: 'Usar as ferramentas', desc: 'Calculadoras, raio-x de ETF e o MCP pra usar com IA.' },
]

export const ONBOARDING_EXPERIENCIAS: OnboardingOpcao[] = [
  { value: 'iniciante', label: 'Estou começando', desc: 'Explica tudo, sem pressa.' },
  { value: 'intermediario', label: 'Já invisto', desc: 'Direto ao ponto, com contexto.' },
  { value: 'avancado', label: 'Invisto há anos', desc: 'Só o dado e a leitura.' },
]
