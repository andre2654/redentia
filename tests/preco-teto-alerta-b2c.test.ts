/**
 * Item 1 de conversão B2C na preço teto:
 *  - o bloco "Criar alerta" do hub também fica em /calculadora/preco-teto/{T},
 *    com o alvo já calculado, entre o resultado e o FAQ / "Veja também";
 *  - o banner final do hub abre o mesmo quiz do topo (/assinar?quiz=1&de=...).
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

function ler(caminho: string) {
  return readFileSync(new URL(caminho, import.meta.url), 'utf8')
}

const VEDADO = /\b(compre|comprar|compra|vender|venda|oportunidade|recomend\w*|barato|upside|imperd[ií]vel|garantid\w*|lucro)\b/i

test('a página do ticker mostra o alerta do hub depois do resultado e antes do FAQ', () => {
  const pagina = ler('../app/components/calc/CalcPrecoTetoTicker.vue')
  const nums = pagina.indexOf('class="ptt__nums"')
  const aviso = pagina.indexOf('class="ptt__aviso"', nums)
  const alerta = pagina.indexOf('<CalcCapturaTeto', aviso)
  const convite = pagina.indexOf('<CalcConvitePrecoTeto', alerta)
  const fecha = pagina.indexOf('</section>', convite)
  const faq = pagina.indexOf('class="ptt__faq"', fecha)
  const veja = pagina.indexOf('<NuVejaTambem', faq)
  assert.ok(nums !== -1 && aviso !== -1 && alerta !== -1 && convite !== -1 && fecha !== -1 && faq !== -1 && veja !== -1)
  assert.ok(nums < aviso && aviso < alerta && alerta < convite && convite < fecha && fecha < faq && faq < veja)
  assert.equal(pagina.match(/<CalcCapturaTeto/g)?.length, 1)
  assert.match(pagina, /<CalcCapturaTeto :ticker="view\.ticker" :alvo="view\.consenso > 0 \? view\.consenso : null" \/>/)
  assert.doesNotMatch(pagina, /position:\s*(?:sticky|fixed)/)
  assert.doesNotMatch(ler('../app/components/calc/CalcPrecoTetoMetodo.vue'), /CalcCapturaTeto/)
})

test('o bloco reaproveita o texto e o fluxo do hub, sem promessa', () => {
  const bloco = ler('../app/components/calc/CalcCapturaTeto.vue')
  assert.match(bloco, /Avise quando \{\{ papel \}\} cruzar \{\{ alvoFmt \}\}/)
  assert.match(bloco, /Um e-mail no fim do pregão em que a cotação cruzar o preço teto que você calculou\. Grátis, com a sua conta\./)
  assert.match(bloco, /Criar alerta/)
  assert.match(bloco, /class="cct__bloco"/)
  assert.match(bloco, /background: var\(--nu-cream\)/)
  assert.match(bloco, /useAlertaPrecoTeto\(papel, \(\) => props\.alvo\)/)
  assert.match(bloco, /flex-wrap:\s*wrap/)
  assert.match(bloco, /min-width:\s*0/)
  assert.match(bloco, /@media \(max-width: 759px\)/)
  assert.match(bloco, /flex-direction:\s*column/)
  assert.doesNotMatch(bloco, /position:\s*(?:sticky|fixed)/)
  const visivel = bloco.slice(bloco.indexOf('<template>'), bloco.indexOf('</template>'))
  assert.doesNotMatch(visivel, VEDADO)

  const fluxo = ler('../app/composables/useWatchlist.ts')
  const inicio = fluxo.indexOf('export function useAlertaPrecoTeto')
  const proximo = fluxo.indexOf('\nexport function', inicio + 10)
  const fn = fluxo.slice(inicio, proximo === -1 ? undefined : proximo)
  assert.match(fn, /\/login\?redirect=\$\{encodeURIComponent\(`\$\{route\.path\}\?\$\{q\}`\)\}/)
  assert.match(fn, /alerta: valor\.toFixed\(2\)/)
  assert.match(fn, /if \(!isAuthenticated\.value\)/)
})

test('o banner final do hub abre o quiz, no mesmo padrão do topo', () => {
  const hub = ler('../app/pages/calculadora/preco-teto/index.vue')
  const inicio = hub.indexOf('class="pt__cta"')
  const fim = hub.indexOf('</CalcBand>', inicio)
  const banner = hub.slice(inicio, fim)
  assert.match(banner, /Analise Ações na Aportou/)
  assert.match(banner, /to="\/assinar\?quiz=1&de=preco-teto" class="pt__pill pt__pill--light">Criar conta grátis<\/NuxtLink>/)
  assert.doesNotMatch(banner, /to="\/login"/)
  assert.ok('preco-teto'.length <= 24)
  assert.match(ler('../app/components/nu/NuHeader.vue'), /to="\/assinar\?quiz=1&de=topo"/)
  assert.match(hub, /<CalcCapturaTeto :ticker="activeTicker" :alvo="results\.consensus\.averageFairPrice" \/>/)
})
