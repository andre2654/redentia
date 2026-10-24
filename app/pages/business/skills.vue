<script setup lang="ts">
/**
 * /business/skills — o pack de skills saiu em 24/10/2026. O servidor MCP
 * passou a ensinar o assistente na conexão (instructions, descrições e os
 * atalhos do menu "/"), a devolver telas prontas (MCP Apps) e a trazer o
 * roteiro do relatório no get_client_report: não há nada para instalar.
 *
 * A rota fica viva para quem guardou o link e leva ao equivalente: o "Comece
 * por aqui" do painel, com as frases para colar no assistente. É área logada
 * e sem indexação, então o redirecionamento não mexe em busca.
 */
definePageMeta({ redirect: '/business/chaves#comece' })
</script>

<template>
  <div />
</template>
