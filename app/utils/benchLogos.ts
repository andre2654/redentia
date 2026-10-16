/**
 * Logos dos modelos do /benchmark-ia, servidas do próprio site, em
 * public/img/benchmark-ia/logos. Nunca em public/benchmark-ia: a pasta com o
 * nome da rota faz o servidor responder /benchmark-ia/ (com barra) no lugar da
 * página. O OpenRouter não expõe logo na API de modelos.
 *
 * Origem: LobeHub Icons (@lobehub/icons-static-svg 1.95.1, licença MIT),
 * baixadas e conferidas em 16/10/2026: SVG puro, sem script nem link externo.
 * As marcas são dos fabricantes; aqui só identificam o modelo no placar.
 *
 * Uma logo por família de modelo, não por empresa: o Kimi tem marca própria
 * (da Moonshot AI). A do Kimi vem com o "K" branco, para fundo escuro; aqui o
 * "K" foi trocado para preto (o ponto azul fica). Modelo sem logo (os fictícios
 * da prévia) fica com a letra.
 */
const LOGOS: [RegExp, string][] = [
  [/^anthropic\//, 'claude'],
  [/^openai\//, 'openai'],
  [/^google\//, 'gemini'],
  [/^x-ai\//, 'grok'],
  [/^qwen\//, 'qwen'],
  [/^meta\//, 'meta'],
  [/^deepseek\//, 'deepseek'],
  [/^moonshotai\//, 'kimi'],
]

export function benchLogo(modelId: string): string | null {
  const hit = LOGOS.find(([re]) => re.test(modelId))
  return hit ? `/img/benchmark-ia/logos/${hit[1]}.svg` : null
}
