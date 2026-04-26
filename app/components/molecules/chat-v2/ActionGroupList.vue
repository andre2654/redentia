<!--
  ActionGroupList — orchestrates ActionGroup cards inside a single
  assistant turn. Replaces the previous monolithic ResearchPanel.

  Behaviour:
  - Walks the message's `toolCalls` in order.
  - Skips tools whose family is `inline: false` (DecisionCard,
    ScenarioCard, GoalBadge, InlineForm, ArtifactCard, PreExecuteCard
    own their own visual surface — the agent loop emits a SEPARATE
    structured event for those, so we'd double-render if they showed
    up here too).
  - Bundles consecutive tool calls of the same family into one
    ActionGroup. Order-preserving — if the agent goes
    [news, dividend, news, news] we get THREE cards (news, dividend,
    news), not two.
  - Each card knows when it's "done" and self-collapses; the list
    just renders them in sequence.

  Why order matters:
  - The agent often runs phases ("research news → fetch dividends →
    re-research news after a finding"). Collapsing those into a
    single "news" card would lose the temporal signal. Keeping them
    separate gives the user a readable timeline of what happened.
-->
<template>
  <div
    v-if="groups.length > 0"
    class="action-group-list flex flex-col gap-1"
    aria-label="Ações da IA"
  >
    <ChatV2ActionGroup
      v-for="(g, idx) in groups"
      :key="`${g.family.id}-${idx}`"
      :family="g.family"
      :calls="g.calls"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ChatToolCall } from '~/composables/useChatStream'
import type { ToolFamily } from '~/composables/useToolFamilies'

const props = defineProps<{
  toolCalls: ChatToolCall[]
}>()

const { familyForTool } = useToolFamilies()

interface Group {
  family: ToolFamily
  calls: ChatToolCall[]
}

const groups = computed<Group[]>(() => {
  const out: Group[] = []
  for (const call of props.toolCalls) {
    const family = familyForTool(call.name)
    if (!family.inline) continue // dedicated surface elsewhere
    const last = out[out.length - 1]
    if (last && last.family.id === family.id) {
      last.calls.push(call)
    } else {
      out.push({ family, calls: [call] })
    }
  }
  return out
})
</script>
