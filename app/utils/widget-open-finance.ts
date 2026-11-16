/**
 * O widget de Open Finance do agregador da conexão (16/11/2026): a Malvo
 * (as conexões novas, script hospedado `malvo.io/widget.js`) ou a Pluggy (as
 * antigas, SDK npm). O backend diz qual no connect-token (`provider`).
 */
export type Agregador = 'pluggy' | 'malvo'

export interface ItemDoWidget { id: string; status?: string }

export interface AbrirWidget {
  connectToken: string
  provider?: string | null
  /** só Pluggy: reconexão de um item */
  updateItem?: string
  /** só Pluggy: restringe a instituições */
  connectorIds?: number[]
  onSuccess: (item: ItemDoWidget) => void | Promise<void>
  onError?: (error: unknown) => void
  onClose?: () => void
}

export function agregadorDe(p: unknown): Agregador {
  return p === 'malvo' ? 'malvo' : 'pluggy'
}

export const SCRIPT_DA_MALVO = 'https://malvo.io/widget.js'

let scriptDaMalvo: Promise<void> | null = null

function carregarMalvo(): Promise<void> {
  if (typeof window === 'undefined') return Promise.reject(new Error('ssr'))
  if ((window as any).MalvoConnect) return Promise.resolve()
  scriptDaMalvo ??= new Promise<void>((ok, falha) => {
    const s = document.createElement('script')
    s.src = SCRIPT_DA_MALVO
    s.async = true
    s.onload = () => ok()
    s.onerror = () => { scriptDaMalvo = null; falha(new Error('malvo_script')) }
    document.head.appendChild(s)
  })
  return scriptDaMalvo
}

export async function abrirWidgetOpenFinance(o: AbrirWidget): Promise<void> {
  const sucesso = ({ item }: { item: ItemDoWidget }) => o.onSuccess(item)
  if (agregadorDe(o.provider) === 'malvo') {
    await carregarMalvo()
    ;(window as any).MalvoConnect.init({
      connectToken: o.connectToken,
      onSuccess: sucesso,
      onError: (e: unknown) => o.onError?.(e),
      onClose: () => o.onClose?.(),
    })
    return
  }
  const mod = await import('pluggy-connect-sdk') as Record<string, any>
  const PluggyConnect = mod.PluggyConnect ?? mod.default?.PluggyConnect ?? mod.default
  if (!PluggyConnect) throw new Error('sdk_export')
  new PluggyConnect({
    connectToken: o.connectToken,
    includeSandbox: false,
    ...(o.updateItem ? { updateItem: o.updateItem } : {}),
    ...(o.connectorIds?.length ? { connectorIds: o.connectorIds } : {}),
    onSuccess: sucesso,
    onError: (e: unknown) => o.onError?.(e),
    onClose: () => o.onClose?.(),
  }).init()
}
