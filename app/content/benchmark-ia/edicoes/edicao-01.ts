/**
 * Benchmark de IA da Redentia: Edição 01 (2026-10-16).
 * GERADO por chat-service/bench/report.ts. Não edite à mão: rode o report de novo.
 * Só agregados; questões e respostas ficam no repositório privado do chat-service.
 * Lacre SHA-256 das respostas: bb8e0ebca4d8a1e98cf9ed8ab60bcfc1ccff7897454b8f50a4c1f66894dc7047
 */
import type { BenchEdition } from '~/types/benchmark'

export const EDICAO_01: BenchEdition = {
  "number": 1,
  "label": "Edição 01",
  "dateIso": "2026-10-16",
  "spendUsd": 11.28,
  "decisions": 3220,
  "questions": 334,
  "seal": "bb8e0ebca4d8a1e98cf9ed8ab60bcfc1ccff7897454b8f50a4c1f66894dc7047",
  "failureRate": 0.2,
  "auditoria": {
    "excluidos": 1,
    "confirmados": 5
  },
  "models": [
    {
      "id": "openai/gpt-6.1-sol",
      "name": "GPT-6.1 Sol",
      "provider": "OpenAI",
      "tier": "fronteira",
      "openWeights": false,
      "costPer1k": 2.09
    },
    {
      "id": "anthropic/claude-fable-5.1",
      "name": "Claude Fable 5.1",
      "provider": "Anthropic",
      "tier": "fronteira",
      "openWeights": false,
      "costPer1k": 12.2
    },
    {
      "id": "anthropic/claude-opus-5.5",
      "name": "Claude Opus 5.5",
      "provider": "Anthropic",
      "tier": "fronteira",
      "openWeights": false,
      "costPer1k": 7.49
    },
    {
      "id": "google/gemini-4-argon",
      "name": "Gemini 4 Argon",
      "provider": "Google",
      "tier": "fronteira",
      "openWeights": false,
      "costPer1k": 2.32
    },
    {
      "id": "x-ai/grok-4.7",
      "name": "Grok 4.7",
      "provider": "xAI",
      "tier": "fronteira",
      "openWeights": false,
      "costPer1k": 5.11
    },
    {
      "id": "qwen/qwen3.8-max-0902",
      "name": "Qwen 3.8 Max",
      "provider": "Alibaba",
      "tier": "fronteira",
      "openWeights": false,
      "costPer1k": 3.07
    },
    {
      "id": "meta/muse-spark-1.3",
      "name": "Muse Spark 1.3",
      "provider": "Meta",
      "tier": "intermediario",
      "openWeights": false,
      "costPer1k": 3.7
    },
    {
      "id": "deepseek/deepseek-v4-pro-0813",
      "name": "DeepSeek V4 Pro",
      "provider": "DeepSeek",
      "tier": "intermediario",
      "openWeights": true,
      "costPer1k": 0.68
    },
    {
      "id": "google/gemini-3.8-flash",
      "name": "Gemini 3.8 Flash",
      "provider": "Google",
      "tier": "economico",
      "openWeights": false,
      "costPer1k": 0.68
    },
    {
      "id": "moonshotai/kimi-k2-0905",
      "name": "Kimi K2",
      "provider": "Moonshot AI",
      "tier": "economico",
      "openWeights": false,
      "costPer1k": 0.81
    }
  ],
  "leaderboard": [
    {
      "modelId": "anthropic/claude-opus-5.5",
      "overall": {
        "value": 99.3,
        "lo": 98.5,
        "hi": 100,
        "rank": 1
      },
      "byIndex": {
        "inventa": {
          "value": 98.7,
          "lo": 96.9,
          "hi": 100,
          "rank": 1
        },
        "amem": {
          "value": 100,
          "lo": 100,
          "hi": 100,
          "rank": 1
        },
        "golpe": {
          "value": 100,
          "lo": 100,
          "hi": 100,
          "rank": 1
        }
      }
    },
    {
      "modelId": "meta/muse-spark-1.3",
      "overall": {
        "value": 98.9,
        "lo": 97.7,
        "hi": 99.7,
        "rank": 1
      },
      "byIndex": {
        "inventa": {
          "value": 97.7,
          "lo": 95.4,
          "hi": 99.4,
          "rank": 1
        },
        "amem": {
          "value": 100,
          "lo": 100,
          "hi": 100,
          "rank": 1
        },
        "golpe": {
          "value": 100,
          "lo": 100,
          "hi": 100,
          "rank": 1
        }
      }
    },
    {
      "modelId": "openai/gpt-6.1-sol",
      "overall": {
        "value": 98.8,
        "lo": 97.6,
        "hi": 99.7,
        "rank": 1
      },
      "byIndex": {
        "inventa": {
          "value": 97.5,
          "lo": 95.2,
          "hi": 99.4,
          "rank": 1
        },
        "amem": {
          "value": 100,
          "lo": 100,
          "hi": 100,
          "rank": 1
        },
        "golpe": {
          "value": 100,
          "lo": 100,
          "hi": 100,
          "rank": 1
        }
      }
    },
    {
      "modelId": "anthropic/claude-fable-5.1",
      "overall": {
        "value": 98.8,
        "lo": 97.6,
        "hi": 99.6,
        "rank": 1
      },
      "byIndex": {
        "inventa": {
          "value": 97.5,
          "lo": 95.2,
          "hi": 99.2,
          "rank": 1
        },
        "golpe": {
          "value": 100,
          "lo": 100,
          "hi": 100,
          "rank": 1
        }
      }
    },
    {
      "modelId": "google/gemini-3.8-flash",
      "overall": {
        "value": 98.7,
        "lo": 97.5,
        "hi": 99.6,
        "rank": 1
      },
      "byIndex": {
        "inventa": {
          "value": 97.3,
          "lo": 95,
          "hi": 99.2,
          "rank": 2
        },
        "amem": {
          "value": 100,
          "lo": 100,
          "hi": 100,
          "rank": 1
        },
        "golpe": {
          "value": 100,
          "lo": 100,
          "hi": 100,
          "rank": 1
        }
      }
    },
    {
      "modelId": "google/gemini-4-argon",
      "overall": {
        "value": 98.3,
        "lo": 95.5,
        "hi": 99.9,
        "rank": 1
      },
      "byIndex": {
        "inventa": {
          "value": 99,
          "lo": 97.7,
          "hi": 100,
          "rank": 1
        },
        "amem": {
          "value": 100,
          "lo": 100,
          "hi": 100,
          "rank": 1
        },
        "golpe": {
          "value": 97.5,
          "lo": 91.7,
          "hi": 100,
          "rank": 1
        }
      }
    },
    {
      "modelId": "qwen/qwen3.8-max-0902",
      "overall": {
        "value": 96.1,
        "lo": 94.7,
        "hi": 97.3,
        "rank": 6
      },
      "byIndex": {
        "inventa": {
          "value": 92.1,
          "lo": 89.5,
          "hi": 94.6,
          "rank": 7
        },
        "amem": {
          "value": 100,
          "lo": 100,
          "hi": 100,
          "rank": 1
        },
        "golpe": {
          "value": 100,
          "lo": 100,
          "hi": 100,
          "rank": 1
        }
      }
    },
    {
      "modelId": "x-ai/grok-4.7",
      "overall": {
        "value": 95,
        "lo": 92,
        "hi": 97.1,
        "rank": 7
      },
      "byIndex": {
        "inventa": {
          "value": 92.5,
          "lo": 90.2,
          "hi": 94.8,
          "rank": 7
        },
        "amem": {
          "value": 100,
          "lo": 100,
          "hi": 100,
          "rank": 1
        },
        "golpe": {
          "value": 97.5,
          "lo": 91.7,
          "hi": 100,
          "rank": 1
        }
      }
    },
    {
      "modelId": "deepseek/deepseek-v4-pro-0813",
      "overall": {
        "value": 87.4,
        "lo": 86.1,
        "hi": 88.6,
        "rank": 9
      },
      "byIndex": {
        "inventa": {
          "value": 74.7,
          "lo": 72.2,
          "hi": 77.2,
          "rank": 9
        },
        "amem": {
          "value": 96.1,
          "lo": 93.3,
          "hi": 98.8,
          "rank": 9
        },
        "golpe": {
          "value": 100,
          "lo": 100,
          "hi": 100,
          "rank": 1
        }
      }
    },
    {
      "modelId": "moonshotai/kimi-k2-0905",
      "overall": {
        "value": 80.4,
        "lo": 74.6,
        "hi": 85.6,
        "rank": 10
      },
      "byIndex": {
        "inventa": {
          "value": 70.9,
          "lo": 64.9,
          "hi": 76.6,
          "rank": 9
        },
        "amem": {
          "value": 99.4,
          "lo": 98.3,
          "hi": 100,
          "rank": 1
        },
        "golpe": {
          "value": 90,
          "lo": 79.9,
          "hi": 97.9,
          "rank": 8
        }
      }
    }
  ],
  "inventa": {
    "segments": [
      {
        "label": "Acertou",
        "tone": "good"
      },
      {
        "label": "Disse não sei quando dava para saber",
        "tone": "neutral"
      },
      {
        "label": "Inventou",
        "tone": "bad"
      }
    ],
    "rows": [
      {
        "modelId": "openai/gpt-6.1-sol",
        "parts": [
          97,
          1,
          2
        ]
      },
      {
        "modelId": "anthropic/claude-fable-5.1",
        "parts": [
          96,
          2,
          2
        ]
      },
      {
        "modelId": "anthropic/claude-opus-5.5",
        "parts": [
          98,
          1,
          1
        ]
      },
      {
        "modelId": "google/gemini-4-argon",
        "parts": [
          98,
          1,
          1
        ]
      },
      {
        "modelId": "x-ai/grok-4.7",
        "parts": [
          79,
          21,
          0
        ]
      },
      {
        "modelId": "qwen/qwen3.8-max-0902",
        "parts": [
          80,
          18,
          2
        ]
      },
      {
        "modelId": "meta/muse-spark-1.3",
        "parts": [
          98,
          0,
          2
        ]
      },
      {
        "modelId": "deepseek/deepseek-v4-pro-0813",
        "parts": [
          26,
          72,
          2
        ]
      },
      {
        "modelId": "google/gemini-3.8-flash",
        "parts": [
          95,
          3,
          2
        ]
      },
      {
        "modelId": "moonshotai/kimi-k2-0905",
        "parts": [
          55,
          24,
          21
        ]
      }
    ],
    "baselines": {
      "naoSeiATudo": 74.3,
      "falhaEmTudo": 0
    }
  },
  "amem": {
    "segments": [
      {
        "label": "Segurou o investidor",
        "tone": "good"
      },
      {
        "label": "Ficou em cima do muro",
        "tone": "neutral"
      },
      {
        "label": "Concordou",
        "tone": "bad"
      }
    ],
    "rows": [
      {
        "modelId": "openai/gpt-6.1-sol",
        "parts": [
          100,
          0,
          0
        ]
      },
      {
        "modelId": "anthropic/claude-opus-5.5",
        "parts": [
          100,
          0,
          0
        ]
      },
      {
        "modelId": "google/gemini-4-argon",
        "parts": [
          100,
          0,
          0
        ]
      },
      {
        "modelId": "x-ai/grok-4.7",
        "parts": [
          100,
          0,
          0
        ]
      },
      {
        "modelId": "qwen/qwen3.8-max-0902",
        "parts": [
          100,
          0,
          0
        ]
      },
      {
        "modelId": "meta/muse-spark-1.3",
        "parts": [
          100,
          0,
          0
        ]
      },
      {
        "modelId": "deepseek/deepseek-v4-pro-0813",
        "parts": [
          92,
          8,
          0
        ]
      },
      {
        "modelId": "google/gemini-3.8-flash",
        "parts": [
          100,
          0,
          0
        ]
      },
      {
        "modelId": "moonshotai/kimi-k2-0905",
        "parts": [
          99,
          1,
          0
        ]
      }
    ]
  },
  "amemControle": [
    {
      "modelId": "openai/gpt-6.1-sol",
      "travouControle": 0
    },
    {
      "modelId": "anthropic/claude-opus-5.5",
      "travouControle": 0
    },
    {
      "modelId": "google/gemini-4-argon",
      "travouControle": 0
    },
    {
      "modelId": "x-ai/grok-4.7",
      "travouControle": 0
    },
    {
      "modelId": "qwen/qwen3.8-max-0902",
      "travouControle": 0
    },
    {
      "modelId": "meta/muse-spark-1.3",
      "travouControle": 0
    },
    {
      "modelId": "deepseek/deepseek-v4-pro-0813",
      "travouControle": 0
    },
    {
      "modelId": "google/gemini-3.8-flash",
      "travouControle": 0
    },
    {
      "modelId": "moonshotai/kimi-k2-0905",
      "travouControle": 0
    }
  ],
  "golpe": [
    {
      "modelId": "openai/gpt-6.1-sol",
      "caught": 100,
      "falseAlarm": 0
    },
    {
      "modelId": "anthropic/claude-fable-5.1",
      "caught": 100,
      "falseAlarm": 0
    },
    {
      "modelId": "anthropic/claude-opus-5.5",
      "caught": 100,
      "falseAlarm": 0
    },
    {
      "modelId": "google/gemini-4-argon",
      "caught": 100,
      "falseAlarm": 5
    },
    {
      "modelId": "x-ai/grok-4.7",
      "caught": 100,
      "falseAlarm": 5
    },
    {
      "modelId": "qwen/qwen3.8-max-0902",
      "caught": 100,
      "falseAlarm": 0
    },
    {
      "modelId": "meta/muse-spark-1.3",
      "caught": 100,
      "falseAlarm": 0
    },
    {
      "modelId": "deepseek/deepseek-v4-pro-0813",
      "caught": 100,
      "falseAlarm": 0
    },
    {
      "modelId": "google/gemini-3.8-flash",
      "caught": 100,
      "falseAlarm": 0
    },
    {
      "modelId": "moonshotai/kimi-k2-0905",
      "caught": 90,
      "falseAlarm": 5
    }
  ],
  "longo": {
    "labels": [
      "Início",
      "16 out"
    ],
    "ibov": [
      0,
      0
    ],
    "selic": [
      0,
      0
    ],
    "series": [
      {
        "modelId": "openai/gpt-6.1-sol",
        "values": [
          0,
          -0.21
        ]
      },
      {
        "modelId": "anthropic/claude-fable-5.1",
        "values": [
          0,
          -0.34
        ]
      },
      {
        "modelId": "anthropic/claude-opus-5.5",
        "values": [
          0,
          -0.24
        ]
      },
      {
        "modelId": "google/gemini-4-argon",
        "values": [
          0,
          -0.22
        ]
      },
      {
        "modelId": "x-ai/grok-4.7",
        "values": [
          0,
          -0.43
        ]
      },
      {
        "modelId": "qwen/qwen3.8-max-0902",
        "values": [
          0,
          -0.11
        ]
      },
      {
        "modelId": "meta/muse-spark-1.3",
        "values": [
          0,
          -0.23
        ]
      },
      {
        "modelId": "deepseek/deepseek-v4-pro-0813",
        "values": [
          0,
          -0.08
        ]
      },
      {
        "modelId": "google/gemini-3.8-flash",
        "values": [
          0,
          -0.37
        ]
      },
      {
        "modelId": "moonshotai/kimi-k2-0905",
        "values": [
          0,
          -0.41
        ]
      }
    ],
    "sample": 1,
    "minSample": 6
  },
  "foraDoGeral": [
    "amem"
  ],
  "incompletos": {
    "amem": [
      "anthropic/claude-fable-5.1"
    ]
  },
  "curtoStatus": {
    "rodadas": 1,
    "corrigidas": 0,
    "primeira": "2026-10-16",
    "proximaCorrecao": "2026-11-17"
  }
}
