<template>
  <div class="overflow-hidden py-8">
    <!-- Row 1 - Left to Right -->
    <div class="marquee-container mb-4">
      <div class="marquee-content animate-marquee">
        <span 
          v-for="(tag, index) in [...row1Tags, ...row1Tags]" 
          :key="`row1-${index}`"
          class="mx-2 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
        >
          {{ tag }}
        </span>
      </div>
    </div>

    <!-- Row 2 - Right to Left -->
    <div class="marquee-container mb-4">
      <div class="marquee-content animate-marquee-reverse">
        <span 
          v-for="(tag, index) in [...row2Tags, ...row2Tags]" 
          :key="`row2-${index}`"
          class="mx-2 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
        >
          {{ tag }}
        </span>
      </div>
    </div>

    <!-- Row 3 - Left to Right (slower) -->
    <div class="marquee-container">
      <div class="marquee-content animate-marquee-slow">
        <span 
          v-for="(tag, index) in [...row3Tags, ...row3Tags]" 
          :key="`row3-${index}`"
          class="mx-2 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
        >
          {{ tag }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const row1Tags = [
  'Juros compostos',
  'Preço teto',
  'Dividend Yield',
  'Análise PETR4',
  'Aposentadoria',
  'Renda passiva',
  'Small caps',
  'FIIs',
]

const row2Tags = [
  'Quanto investir',
  'VALE3',
  'Imposto de renda',
  'ETFs',
  'Simulador',
  'Graham e Bazin',
  'Proventos',
  'B3',
]

const row3Tags = [
  'Carteira ideal',
  'BBAS3',
  'Inflação',
  'CDI',
  'Selic',
  'Tesouro Direto',
  'BDRs',
  'Análise fundamentalista',
]
</script>

<style scoped>
.marquee-container {
  display: flex;
  overflow: hidden;
  width: 100%;
}

.marquee-content {
  display: flex;
  flex-shrink: 0;
  min-width: 100%;
}

@keyframes marquee {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}

@keyframes marquee-reverse {
  0% {
    transform: translateX(-50%);
  }
  100% {
    transform: translateX(0);
  }
}

.animate-marquee {
  animation: marquee 30s linear infinite;
}

.animate-marquee-reverse {
  animation: marquee-reverse 35s linear infinite;
}

.animate-marquee-slow {
  animation: marquee 45s linear infinite;
}

.marquee-container:hover .marquee-content {
  animation-play-state: paused;
}
</style>
