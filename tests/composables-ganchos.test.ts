/**
 * Ganchos de ciclo de vida em composable assíncrono (04/11/2026). Dentro de um
 * `export async function useX()`, depois do primeiro `await` do corpo não há
 * mais instância ativa: o `withAsyncContext` só restaura a instância no
 * `<script setup>`. Um `onMounted` registrado ali some com um aviso que só o
 * dev mostra. Foi assim que a /teses perdeu o "Seguindo" e a nova tentativa
 * quando o SSR falha, e a /asset perdeu a pill de posição de quem está logado.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'

const GANCHO = /^ {2}(onMounted|onBeforeMount|onBeforeUnmount|onUnmounted|onActivated|onDeactivated)\(/
const AWAIT_NO_CORPO = /^ {2}(?!\/\/|\*)\S.*(?:^|[^\w.])await\s/

/** `arquivo:linha` de cada gancho registrado depois de um await no corpo da função. */
function ganchosDepoisDoAwait(fonte: string, arquivo = ''): string[] {
  const achados: string[] = []
  let dentro = false
  let aguardou = 0
  fonte.split('\n').forEach((linha, i) => {
    if (/^export async function use\w*\(/.test(linha)) { dentro = true; aguardou = 0; return }
    if (!dentro) return
    if (/^\}/.test(linha)) { dentro = false; return }
    if (!aguardou && AWAIT_NO_CORPO.test(linha)) aguardou = i + 1
    if (aguardou && GANCHO.test(linha)) achados.push(`${arquivo}:${i + 1} (await na linha ${aguardou})`)
  })
  return achados
}

test('o detector pega o gancho depois do await e deixa passar o de antes', () => {
  const ruim = [
    'export async function useX() {',
    '  const { data } = await useAsyncData(\'x\', () => buscar())',
    '  onMounted(() => {})',
    '}',
  ].join('\n')
  const bom = [
    'export async function useX() {',
    '  onMounted(() => {})',
    '  async function carregar() {',
    '    await buscar()',
    '  }',
    '  const { data } = await useAsyncData(\'x\', () => buscar())',
    '}',
  ].join('\n')
  assert.deepEqual(ganchosDepoisDoAwait(ruim, 'ruim.ts'), ['ruim.ts:3 (await na linha 2)'])
  assert.deepEqual(ganchosDepoisDoAwait(bom, 'bom.ts'), [])
})

test('nenhum composable assíncrono registra gancho depois do primeiro await', () => {
  const dir = new URL('../app/composables/', import.meta.url)
  const achados = readdirSync(dir)
    .filter((f) => f.endsWith('.ts'))
    .flatMap((f) => ganchosDepoisDoAwait(readFileSync(new URL(f, dir), 'utf8'), f))
  assert.deepEqual(achados, [])
})
