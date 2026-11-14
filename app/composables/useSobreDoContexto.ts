/**
 * De quem é o pedaço da página (02/11/2026, "coloque mais elementos nesse
 * hover"). Os cartões genéricos do design system (NuStatList, NuDividendBars e os do /asset,
 * AtivoIndicadores e AtivoProventos) não sabem de qual ativo, tese ou título falam;
 * a página diz uma vez (`proverSobreDoContexto('PETR4')`) e o rótulo do chip
 * sai específico: "P/L PETR4", não só "P/L".
 */
import type { InjectionKey, MaybeRefOrGetter, Ref } from 'vue'

const CHAVE: InjectionKey<Readonly<Ref<string>>> = Symbol('nu:contexto-sobre')

export function proverSobreDoContexto(sobre: MaybeRefOrGetter<string | null | undefined>) {
  provide(CHAVE, computed(() => (toValue(sobre) ?? '').trim()))
}

export function useSobreDoContexto(): Readonly<Ref<string>> {
  return inject(CHAVE, computed(() => ''))
}
