<!--
  V4 — Configurações Mercury Bank (port direto do Figma JSX).

  Estratégia: 2 shells separados (mobile + desktop), namespace .m-* mobile / .d-* desktop.
-->
<template>
  <div class="v4">

    <!-- ============ MOBILE SHELL (.phone.mercury) ============ -->
    <div class="phone mercury">
      <div class="m-appbar" style="padding-bottom:18px;">
        <div style="display:flex; align-items:center; gap:10px;">
          <div class="m-backbtn">
            <UIcon name="i-lucide-chevron-left" class="size-4" />
          </div>
          <span style="font-size:18px; font-weight:600; letter-spacing:-.015em;">Configurações</span>
        </div>
      </div>

      <div class="m-scroll">
        <!-- Profile card -->
        <div class="m-card m-card-lg" style="display:flex; align-items:center; gap:14px;">
          <div class="m-avatar-big">A</div>
          <div style="flex:1; min-width:0;">
            <div style="font-size:17px; font-weight:600; letter-spacing:-.015em;">André Silva</div>
            <div style="font-size:13px; color:rgba(15,15,14,.55); margin-top:2px;">andre.silva@email.com</div>
            <div class="m-gold-badge">
              <UIcon name="i-lucide-star" class="size-3" style="color:#B7873A;" />
              <span style="font-size:11px; font-weight:600;">Premium · 2 anos</span>
            </div>
          </div>
          <UIcon name="i-lucide-chevron-right" class="size-3.5" style="color:rgba(15,15,14,.4);" />
        </div>

        <!-- Conta -->
        <div class="m-section"><span class="title">Conta</span></div>
        <div class="m-card m-card-tight">
          <div v-for="(r, i) in accountRows" :key="r.label" class="m-set-row" :class="{ last: i === accountRows.length - 1 }">
            <span class="m-set-ic"><UIcon :name="r.icon" class="size-4" /></span>
            <div style="flex:1; min-width:0;">
              <div class="m-set-label">{{ r.label }}</div>
              <div v-if="r.sub" class="m-set-sub">{{ r.sub }}</div>
            </div>
            <span v-if="r.badge" class="m-set-badge" :class="{ gold: r.badgeGold }">{{ r.badge }}</span>
            <UIcon name="i-lucide-chevron-right" class="size-3" style="color:rgba(15,15,14,.35);" />
          </div>
        </div>

        <!-- Preferências (toggles) -->
        <div class="m-section"><span class="title">Preferências</span></div>
        <div class="m-card m-card-tight">
          <div v-for="(t, i) in toggles" :key="t.key" class="m-set-row" :class="{ last: i === toggles.length - 1 }">
            <span class="m-set-ic"><UIcon :name="t.icon" class="size-4" /></span>
            <div style="flex:1; min-width:0;">
              <div class="m-set-label">{{ t.label }}</div>
              <div v-if="t.sub" class="m-set-sub">{{ t.sub }}</div>
            </div>
            <div class="m-toggle" :class="{ on: t.value }" @click="t.value = !t.value">
              <div class="m-toggle-knob" />
            </div>
          </div>
        </div>

        <!-- Aparência -->
        <div class="m-section"><span class="title">Aparência</span></div>
        <div class="m-card m-card-tight">
          <div v-for="(s, i) in appearance" :key="s.label" class="m-set-row" :class="{ last: i === appearance.length - 1 }">
            <span class="m-set-ic"><UIcon :name="s.icon" class="size-4" /></span>
            <div style="flex:1; font-size:14px; font-weight:500; letter-spacing:-.005em;">{{ s.label }}</div>
            <span class="m-set-value">{{ s.value }}</span>
            <UIcon name="i-lucide-chevron-right" class="size-3" style="color:rgba(15,15,14,.35);" />
          </div>
        </div>

        <!-- IA & Análise -->
        <div class="m-section"><span class="title">IA & Análise</span></div>
        <div class="m-card m-card-tight">
          <div v-for="(s, i) in iaRows" :key="s.label" class="m-set-row" :class="{ last: i === iaRows.length - 1 }">
            <span class="m-set-ic"><UIcon :name="s.icon" class="size-4" /></span>
            <div style="flex:1; min-width:0;">
              <div class="m-set-label">{{ s.label }}</div>
              <div v-if="s.sub" class="m-set-sub">{{ s.sub }}</div>
            </div>
            <span v-if="s.value" class="m-set-value">{{ s.value }}</span>
            <UIcon name="i-lucide-chevron-right" class="size-3" style="color:rgba(15,15,14,.35);" />
          </div>
        </div>

        <!-- Suporte & privacidade -->
        <div class="m-section"><span class="title">Suporte & privacidade</span></div>
        <div class="m-card m-card-tight">
          <div v-for="(r, i) in supportRows" :key="r.label" class="m-set-row" :class="{ last: i === supportRows.length - 1 }">
            <span class="m-set-ic"><UIcon :name="r.icon" class="size-4" /></span>
            <div style="flex:1; font-size:14px; font-weight:500; letter-spacing:-.005em;">{{ r.label }}</div>
            <UIcon name="i-lucide-chevron-right" class="size-3" style="color:rgba(15,15,14,.35);" />
          </div>
        </div>

        <!-- Sign out -->
        <div style="padding:14px 16px 0;">
          <div class="m-signout">
            <UIcon name="i-lucide-log-out" class="size-4" />
            Sair da conta
          </div>
        </div>

        <!-- Version -->
        <div style="text-align:center; padding:24px 16px 32px;">
          <div style="display:flex; align-items:center; justify-content:center; gap:6px;">
            <span class="m-logo-mini">R</span>
            <span style="font-family:'IBM Plex Mono', monospace; font-size:10px; letter-spacing:.14em; color:rgba(15,15,14,.4); font-weight:600;">
              REDENTIA · V 2.4.0
            </span>
          </div>
          <div style="font-size:11px; color:rgba(15,15,14,.35); margin-top:6px;">Feito em São Paulo</div>
        </div>
      </div>

      <!-- TABBAR -->
      <div class="m-tabbar">
        <NuxtLink v-for="t in mobileTabs" :key="t.label" :to="t.to" class="m-tab">
          <UIcon :name="t.icon" />
          <span class="lbl">{{ t.label }}</span>
        </NuxtLink>
      </div>
    </div>


    <!-- ============ DESKTOP SHELL (.dt.mercury-dt) ============ -->
    <div class="dt mercury-dt">
      <div class="d-side">
        <div class="d-brand">
          <span class="d-brand-mark"><img src="/brand/logo-icon.svg" alt="Redentia" /></span>
          <span class="nm">Redentia</span>
        </div>
        <div class="d-nav">
          <div v-for="n in navMain" :key="n.label" class="item">
            <UIcon :name="n.icon" class="ic" />
            <span>{{ n.label }}</span>
            <span v-if="n.badge" class="badge">{{ n.badge }}</span>
          </div>
          <div class="grp">Ferramentas</div>
          <div v-for="t in navTools" :key="t.label" class="item">
            <UIcon :name="t.icon" class="ic" />
            <span>{{ t.label }}</span>
            <span v-if="t.badge" class="badge">{{ t.badge }}</span>
          </div>
        </div>
        <div class="d-side-footer">
          <div class="av">A</div>
          <div style="flex:1; min-width:0;">
            <div style="font-weight:500;">André Silva</div>
            <div class="d-mut" style="font-size:11px; margin-top:1px;">Premium · 2 anos</div>
          </div>
        </div>
      </div>

      <div class="d-main">
        <div class="d-topbar">
          <div class="d-search">
            <UIcon name="i-lucide-search" class="size-4" />
            <span>Buscar configurações…</span>
            <span class="kbd">⌘ K</span>
          </div>
          <div class="right">
            <div class="d-iconbtn"><UIcon name="i-lucide-bell" class="size-4" /></div>
            <div class="d-iconbtn"><UIcon name="i-lucide-settings" class="size-4" /></div>
          </div>
        </div>

        <div class="d-content">
          <div class="d-greet">
            <div>
              <div class="d-mut" style="font-size:12px; font-weight:500; margin-bottom:6px;">Conta & preferências</div>
              <div class="h">Configurações</div>
            </div>
          </div>

          <!-- Profile card -->
          <div class="d-card d-profile-card">
            <div class="d-avatar-big">A</div>
            <div style="flex:1;">
              <div style="font-size:18px; font-weight:600; letter-spacing:-.015em;">André Silva</div>
              <div style="font-size:13px; color:rgba(15,15,14,.55); margin-top:3px;">andre.silva@email.com · CPF ***.456.789-**</div>
              <div style="display:flex; gap:8px; margin-top:8px;">
                <span class="d-gold-badge">
                  <UIcon name="i-lucide-star" class="size-3" />
                  <span style="font-size:11px; font-weight:600;">Premium · 2 anos</span>
                </span>
                <span class="d-green-pill">2FA ativado</span>
              </div>
            </div>
            <div class="d-btn d-btn-ghost">Editar perfil</div>
          </div>

          <!-- 2-col: nav + section -->
          <div class="d-set-grid">
            <!-- Nav -->
            <div class="d-card d-set-nav">
              <div class="set-grp-h">Conta</div>
              <div class="set-nav-list">
                <div v-for="n in dtNavAccount" :key="n.id"
                     :class="['set-nav-item', { active: section === n.id }]"
                     @click="section = n.id">
                  <UIcon :name="n.icon" />
                  <span style="flex:1;">{{ n.label }}</span>
                  <span v-if="n.badge" class="set-nav-badge" :class="{ gold: n.badgeGold }">{{ n.badge }}</span>
                </div>
              </div>
              <div class="set-grp-h">Preferências</div>
              <div class="set-nav-list">
                <div v-for="n in dtNavPrefs" :key="n.id"
                     :class="['set-nav-item', { active: section === n.id }]"
                     @click="section = n.id">
                  <UIcon :name="n.icon" />
                  <span style="flex:1;">{{ n.label }}</span>
                </div>
              </div>
              <div class="set-grp-h">Suporte</div>
              <div class="set-nav-list">
                <div v-for="n in dtNavSupport" :key="n.id"
                     :class="['set-nav-item', { active: section === n.id }]"
                     @click="section = n.id">
                  <UIcon :name="n.icon" />
                  <span style="flex:1;">{{ n.label }}</span>
                </div>
              </div>
            </div>

            <!-- Section content -->
            <div class="d-card d-set-section">
              <!-- Account section -->
              <template v-if="section === 'account'">
                <div class="d-section-h"><span class="title">Perfil & dados pessoais</span></div>
                <div class="d-label" style="font-size:11px; margin-top:4px;">Atualizado pela última vez 12 mai · 2026</div>
                <div class="d-set-fields">
                  <div v-for="f in accountFields" :key="f.label" class="d-set-field">
                    <div class="d-set-field-label">{{ f.label }}</div>
                    <div class="d-set-field-row">
                      <span class="d-set-field-value">{{ f.value }}</span>
                      <span v-if="f.verified" class="d-verified-pill">verificado</span>
                    </div>
                  </div>
                </div>
              </template>

              <!-- Notifs section -->
              <template v-if="section === 'notifs'">
                <div class="d-section-h"><span class="title">Notificações</span></div>
                <div class="d-label" style="font-size:11px; margin-top:4px;">Escolha o que receber por push e e-mail</div>
                <div style="margin-top:18px;">
                  <div v-for="(t, i) in dtNotifToggles" :key="t.label"
                       class="d-toggle-row"
                       :class="{ last: i === dtNotifToggles.length - 1 }">
                    <div style="flex:1;">
                      <div style="font-size:14px; font-weight:500;">{{ t.label }}</div>
                      <div v-if="t.sub" style="font-size:11px; color:rgba(15,15,14,.5); margin-top:2px;">{{ t.sub }}</div>
                    </div>
                    <div class="m-toggle" :class="{ on: t.value }" @click="t.value = !t.value">
                      <div class="m-toggle-knob" />
                    </div>
                  </div>
                </div>
              </template>

              <!-- Banks section -->
              <template v-if="section === 'banks'">
                <div class="d-section-h">
                  <span class="title">Contas conectadas</span>
                  <span class="d-btn" style="font-size:12px; padding:7px 12px;">+ Conectar nova</span>
                </div>
                <div class="d-label" style="font-size:11px; margin-top:4px;">Conexões via Open Finance · sincronizadas a cada 3 min</div>
                <div style="margin-top:20px;">
                  <div v-for="(b, i) in banks" :key="b.name" class="d-bank-row" :class="{ last: i === banks.length - 1 }">
                    <div class="d-bank-logo" :style="{ background: b.color, color: b.initialsColor }">{{ b.initials }}</div>
                    <div style="flex:1; min-width:0;">
                      <div style="font-size:15px; font-weight:600;">{{ b.name }}</div>
                      <div style="font-size:11px; color:rgba(15,15,14,.5); margin-top:2px;">{{ b.sub }}</div>
                    </div>
                    <div style="text-align:right; min-width:120px;">
                      <div style="font-size:14px; font-weight:600; font-variant-numeric:tabular-nums;">{{ b.value }}</div>
                      <div style="display:flex; align-items:center; justify-content:flex-end; gap:5px; margin-top:3px;">
                        <span style="width:6px; height:6px; border-radius:50%; background:#0F8C4D;" />
                        <span style="font-size:10px; color:rgba(15,15,14,.55); font-weight:500;">3 min</span>
                      </div>
                    </div>
                    <div class="d-btn d-btn-ghost" style="font-size:12px; padding:7px 12px;">Gerenciar</div>
                  </div>
                </div>
              </template>

              <!-- Appearance section -->
              <template v-if="section === 'appearance'">
                <div class="d-section-h"><span class="title">Aparência</span></div>
                <div class="d-themes">
                  <div v-for="t in themes" :key="t.name"
                       class="d-theme-opt"
                       :class="{ active: t.active }">
                    <div class="d-theme-preview" :style="{ background: t.bg }">
                      <div class="d-theme-line" :style="{ background: t.name === 'Escuro' ? 'rgba(255,255,255,.2)' : 'rgba(15,15,14,.1)' }" />
                      <div class="d-theme-block" :style="{ background: t.name === 'Escuro' ? 'rgba(255,255,255,.06)' : 'rgba(15,15,14,.05)' }" />
                    </div>
                    <div class="d-theme-bottom">
                      <span style="font-size:13px; font-weight:600;">{{ t.name }}</span>
                      <span v-if="t.active" class="d-theme-check">
                        <UIcon name="i-lucide-check" class="size-2.5" />
                      </span>
                    </div>
                  </div>
                </div>
                <div class="d-set-fields" style="margin-top:24px; grid-template-columns:1fr 1fr;">
                  <div class="d-set-field">
                    <div class="d-set-field-label">Idioma</div>
                    <div class="d-set-field-row">
                      <span class="d-set-field-value">Português (Brasil)</span>
                      <UIcon name="i-lucide-chevron-right" class="size-3" style="color:rgba(15,15,14,.4);" />
                    </div>
                  </div>
                  <div class="d-set-field">
                    <div class="d-set-field-label">Moeda</div>
                    <div class="d-set-field-row">
                      <span class="d-set-field-value">Real Brasileiro (R$)</span>
                      <UIcon name="i-lucide-chevron-right" class="size-3" style="color:rgba(15,15,14,.4);" />
                    </div>
                  </div>
                </div>
              </template>

              <!-- IA section -->
              <template v-if="section === 'ia'">
                <div class="d-section-h"><span class="title">IA & análise</span></div>
                <div class="d-label" style="font-size:11px; margin-top:4px;">Como a Redent.IA conversa com você</div>
                <div class="d-set-fields">
                  <div v-for="f in iaFields" :key="f.label" class="d-set-field">
                    <div class="d-set-field-label">{{ f.label }}</div>
                    <div class="d-set-field-row">
                      <span class="d-set-field-value">{{ f.value }}</span>
                      <UIcon name="i-lucide-chevron-right" class="size-3" style="color:rgba(15,15,14,.4);" />
                    </div>
                  </div>
                </div>
                <div style="margin-top:22px;">
                  <div v-for="(t, i) in iaToggles" :key="t.label" class="d-toggle-row" :class="{ last: i === iaToggles.length - 1 }">
                    <div style="flex:1;">
                      <div style="font-size:14px; font-weight:500;">{{ t.label }}</div>
                      <div v-if="t.sub" style="font-size:11px; color:rgba(15,15,14,.5); margin-top:2px;">{{ t.sub }}</div>
                    </div>
                    <div class="m-toggle" :class="{ on: t.value }" @click="t.value = !t.value">
                      <div class="m-toggle-knob" />
                    </div>
                  </div>
                </div>
              </template>

              <!-- Fallback -->
              <template v-if="!['account','notifs','banks','appearance','ia'].includes(section)">
                <div style="padding:40px 0; text-align:center; color:rgba(15,15,14,.5);">
                  Selecione uma seção à esquerda
                </div>
              </template>
            </div>
          </div>

          <!-- Footer with sign out -->
          <div class="d-set-footer">
            <div style="display:flex; align-items:center; gap:6px;">
              <span class="d-logo-mini">R</span>
              <span style="font-family:'IBM Plex Mono', monospace; font-size:10px; letter-spacing:.14em; color:rgba(15,15,14,.4); font-weight:600;">
                REDENTIA · V 2.4.0
              </span>
            </div>
            <div class="d-signout">
              <UIcon name="i-lucide-log-out" class="size-3.5" />
              Sair da conta
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

definePageMeta({ layout: false })

const section = ref<'account' | 'notifs' | 'banks' | 'plan' | 'appearance' | 'ia' | 'help' | 'privacy' | 'export'>('account')

const accountRows = [
  { icon: 'i-lucide-user',         label: 'Perfil & dados pessoais', sub: 'Nome, CPF, contato' },
  { icon: 'i-lucide-shield',       label: 'Segurança',                sub: 'Senha, biometria, sessões' },
  { icon: 'i-lucide-landmark',     label: 'Contas conectadas',        sub: '2 corretoras via Open Finance', badge: '2' },
  { icon: 'i-lucide-star',         label: 'Plano & cobrança',         sub: 'Premium · próx. 15 jun',      badge: 'Premium', badgeGold: true },
]

const toggles = reactive([
  { key: 'notifs',  icon: 'i-lucide-bell',           label: 'Notificações',                sub: 'Proventos, fatos, alertas',  value: true },
  { key: 'weekly',  icon: 'i-lucide-calendar',       label: 'Resumo semanal por e-mail',   sub: 'Aos domingos · 09h',          value: false },
  { key: 'market',  icon: 'i-lucide-trending-up',    label: 'Alertas de mercado',          sub: 'Quedas acima de 2%',          value: true },
  { key: 'carta',   icon: 'i-lucide-mail',           label: 'Lembrete da Carta',           sub: 'Quando edição nova sai',      value: true },
])

const appearance = [
  { icon: 'i-lucide-sun-moon',     label: 'Tema',    value: 'Claro' },
  { icon: 'i-lucide-globe',        label: 'Idioma',  value: 'Português' },
  { icon: 'i-lucide-circle-dollar-sign', label: 'Moeda', value: 'BRL (R$)' },
]

const iaRows = [
  { icon: 'i-lucide-line-chart',   label: 'Perfil de investidor', sub: '',                value: 'Moderado' },
  { icon: 'i-lucide-target',       label: 'Objetivo principal',   sub: '',                value: 'Renda passiva' },
  { icon: 'i-lucide-sparkles',     label: 'Configurar IA',        sub: 'Tom, frequência, preferências' },
]

const supportRows = [
  { icon: 'i-lucide-circle-help',  label: 'Central de ajuda' },
  { icon: 'i-lucide-message-circle', label: 'Falar com a Redent.IA' },
  { icon: 'i-lucide-file-text',    label: 'Termos & política de privacidade' },
  { icon: 'i-lucide-download',     label: 'Exportar meus dados' },
]

const mobileTabs = [
  { label: 'Início',   icon: 'i-lucide-house',  to: '/dev/mobile-layouts/v4' },
  { label: 'Carteira', icon: 'i-lucide-wallet', to: '/dev/mobile-layouts/v4' },
  { label: 'Raio-X',   icon: 'i-lucide-radar',  to: '/dev/mobile-layouts/v4' },
  { label: 'Mercado',  icon: 'i-lucide-globe',  to: '/dev/mobile-layouts/v4/mercado' },
]

const navMain = [
  { label: 'Início',     icon: 'i-lucide-house' },
  { label: 'Carteira',   icon: 'i-lucide-wallet' },
  { label: 'Raio-X',     icon: 'i-lucide-radar', badge: 'novo' },
  { label: 'Calendário', icon: 'i-lucide-calendar' },
  { label: 'Carta',      icon: 'i-lucide-mail' },
]
const navTools = [
  { label: 'Chat IA',      icon: 'i-lucide-sparkles', badge: '2' },
  { label: 'Calculadoras', icon: 'i-lucide-calculator' },
  { label: 'Rankings',     icon: 'i-lucide-trophy' },
  { label: 'Setores',      icon: 'i-lucide-grid-2x2' },
  { label: 'Guias',        icon: 'i-lucide-book' },
]

const dtNavAccount = [
  { id: 'account',  icon: 'i-lucide-user',       label: 'Perfil & dados' },
  { id: 'security', icon: 'i-lucide-shield',     label: 'Segurança' },
  { id: 'banks',    icon: 'i-lucide-landmark',   label: 'Contas conectadas', badge: '2' },
  { id: 'plan',     icon: 'i-lucide-star',       label: 'Plano & cobrança',  badge: 'Premium', badgeGold: true },
]
const dtNavPrefs = [
  { id: 'notifs',     icon: 'i-lucide-bell',     label: 'Notificações' },
  { id: 'appearance', icon: 'i-lucide-sun-moon', label: 'Aparência' },
  { id: 'ia',         icon: 'i-lucide-sparkles', label: 'IA & análise' },
]
const dtNavSupport = [
  { id: 'help',    icon: 'i-lucide-circle-help', label: 'Central de ajuda' },
  { id: 'privacy', icon: 'i-lucide-file-text',   label: 'Privacidade' },
  { id: 'export',  icon: 'i-lucide-download',    label: 'Exportar dados' },
]

const accountFields = [
  { label: 'Nome completo',     value: 'André Silva de Souza' },
  { label: 'E-mail',            value: 'andre.silva@email.com', verified: true },
  { label: 'CPF',               value: '***.456.789-**' },
  { label: 'Telefone',          value: '+55 11 9 9876-5432', verified: true },
  { label: 'Data de nascimento', value: '14 de fevereiro de 1991' },
  { label: 'Endereço',          value: 'São Paulo · SP' },
]

const dtNotifToggles = reactive([
  { label: 'Proventos creditados',    sub: 'Quando dividendos/JCP caem na sua conta',           value: true },
  { label: 'Resumo semanal',          sub: 'Aos domingos · 09h00',                              value: false },
  { label: 'Alertas de mercado',      sub: 'Quedas acima de 2% ou notícias relevantes',          value: true },
  { label: 'Lembrete da Carta mensal', sub: 'Quando edição nova é publicada',                   value: true },
  { label: 'Notícias dos seus ativos', sub: 'Curadoria diária',                                  value: true },
  { label: 'Sugestões da IA',         sub: 'Rebalanceamentos e oportunidades',                   value: false },
])

const banks = [
  { color: '#EC7000', name: 'Itaú',         sub: '8 ativos · CDB, Ações, FIIs', value: 'R$ 287.420', initials: 'i', initialsColor: '#fff' },
  { color: '#FFEE00', name: 'BTG Pactual',  sub: '4 ativos · Ações, Tesouro',   value: 'R$ 217.786', initials: 'B', initialsColor: '#0F0F0E' },
]

const themes = [
  { name: 'Claro',  bg: '#FAF6EA', active: true  },
  { name: 'Escuro', bg: '#1A1A1A', active: false },
  { name: 'Auto',   bg: 'linear-gradient(90deg, #FAF6EA 50%, #1A1A1A 50%)', active: false },
]

const iaFields = [
  { label: 'Perfil de investidor',  value: 'Moderado' },
  { label: 'Objetivo principal',    value: 'Renda passiva' },
  { label: 'Tom da IA',             value: 'Equilibrado' },
  { label: 'Frequência da Carta',   value: 'Mensal' },
]
const iaToggles = reactive([
  { label: 'Modo MAX disponível',   sub: 'Análise profunda em planos premium', value: true },
  { label: 'Memória de conversas',  sub: 'A IA lembra de perguntas anteriores', value: true },
])
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');

.v4 { min-height: 100vh; background: #F8F6F1; }

/* TOGGLE mobile/desktop */
.phone.mercury { display: block; }
.dt.mercury-dt { display: none; }
@media (min-width: 1024px) {
  .phone.mercury { display: none; }
  .dt.mercury-dt { display: flex; }
}

/* ============ MOBILE SHELL ============ */
.phone.mercury {
  background: #F8F6F1; color: #0F0F0E;
  font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
  min-height: 100vh; position: relative;
  max-width: 480px; margin: 0 auto;
}
.phone.mercury .m-appbar {
  display: flex; justify-content: space-between; align-items: center;
  padding: 24px 22px 16px;
  position: sticky; top: 0; z-index: 30;
  background: rgba(248,246,241,.92);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}
.phone.mercury .m-backbtn {
  width: 30px; height: 30px; border-radius: 50%;
  background: rgba(15,15,14,.04); color: rgba(15,15,14,.7);
  display: grid; place-items: center; cursor: pointer;
}
.phone.mercury .m-scroll { padding: 4px 0 120px; }
.phone.mercury .m-scroll::-webkit-scrollbar { display: none; }

.phone.mercury .m-card {
  margin: 0 16px; padding: 22px 20px;
  background: #FFFFFF; border-radius: 20px;
  box-shadow: 0 1px 0 rgba(15,15,14,.04), 0 8px 24px -12px rgba(15,15,14,.08);
}
.phone.mercury .m-card-lg { padding: 24px 22px; }
.phone.mercury .m-card + .m-card { margin-top: 10px; }
.phone.mercury .m-card-tight { padding: 4px 0; }

.phone.mercury .m-avatar-big {
  width: 64px; height: 64px; border-radius: 50%;
  background: linear-gradient(135deg, #0F0F0E, #2A2A2A); color: #FAF6EA;
  display: grid; place-items: center;
  font-size: 24px; font-weight: 600; letter-spacing: -.02em;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(15,15,14,.18);
}
.phone.mercury .m-gold-badge {
  display: inline-flex; align-items: center; gap: 5px;
  margin-top: 6px; padding: 3px 9px; border-radius: 6px;
  background: rgba(183,135,58,.10); color: #B7873A;
}

.phone.mercury .m-section {
  padding: 24px 22px 12px;
  display: flex; justify-content: space-between; align-items: baseline;
}
.phone.mercury .m-section .title {
  font-size: 15px; font-weight: 600; letter-spacing: -.01em;
}

.phone.mercury .m-set-row {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 22px;
  border-bottom: 1px solid rgba(15,15,14,.05);
  cursor: pointer;
}
.phone.mercury .m-set-row.last { border-bottom: 0; }
.phone.mercury .m-set-ic {
  width: 34px; height: 34px; border-radius: 10px;
  background: rgba(15,15,14,.04); color: rgba(15,15,14,.7);
  display: grid; place-items: center; flex-shrink: 0;
}
.phone.mercury .m-set-label { font-size: 14px; font-weight: 500; letter-spacing: -.005em; }
.phone.mercury .m-set-sub { font-size: 11px; color: rgba(15,15,14,.5); margin-top: 2px; }
.phone.mercury .m-set-value { font-size: 13px; color: rgba(15,15,14,.55); font-weight: 500; }
.phone.mercury .m-set-badge {
  padding: 3px 8px; border-radius: 5px;
  background: rgba(15,15,14,.06); color: rgba(15,15,14,.65);
  font-size: 11px; font-weight: 600;
}
.phone.mercury .m-set-badge.gold {
  background: rgba(183,135,58,.12); color: #B7873A;
}

/* Toggle switch */
.phone.mercury .m-toggle, .dt .m-toggle {
  width: 38px; height: 22px; border-radius: 11px; padding: 2px;
  background: rgba(15,15,14,.18);
  transition: background .2s;
  cursor: pointer;
  display: flex; align-items: center; justify-content: flex-start;
  flex-shrink: 0;
}
.phone.mercury .m-toggle.on, .dt .m-toggle.on {
  background: #0F8C4D;
  justify-content: flex-end;
}
.phone.mercury .m-toggle-knob, .dt .m-toggle-knob {
  width: 18px; height: 18px; border-radius: 50%;
  background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,.2);
  transition: all .2s;
}

.phone.mercury .m-signout {
  background: #FFFFFF;
  border: 1px solid rgba(15,15,14,.05);
  border-radius: 14px;
  padding: 14px 18px;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  color: #C4413A;
  font-size: 14px; font-weight: 500;
  cursor: pointer;
}
.phone.mercury .m-logo-mini {
  width: 16px; height: 16px; border-radius: 5px;
  background: #0F0F0E; color: #fff;
  display: inline-grid; place-items: center;
  font-size: 9px; font-weight: 700;
}

/* tabbar */
.phone.mercury .m-tabbar {
  position: fixed; left: 0; right: 0; bottom: 0;
  max-width: 480px; margin: 0 auto;
  height: 78px;
  background: rgba(248,246,241,.94); backdrop-filter: blur(20px);
  border-top: 1px solid rgba(15,15,14,.06);
  display: flex; justify-content: space-around; align-items: flex-start;
  padding: 12px 24px 24px;
  z-index: 20;
}
.phone.mercury .m-tab {
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  background: transparent; border: 0;
  color: rgba(15,15,14,.35); cursor: pointer;
  padding: 4px 8px;
  font-family: inherit;
  text-decoration: none;
}
.phone.mercury .m-tab.active, .phone.mercury .m-tab.router-link-active { color: #0F0F0E; }
.phone.mercury .m-tab svg { width: 22px; height: 22px; }
.phone.mercury .m-tab .lbl { font-size: 10px; font-weight: 500; }


/* ============ DESKTOP SHELL ============ */
.dt.mercury-dt {
  background: #F8F6F1; color: #0F0F0E;
  font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
  min-height: 100vh; position: relative;
}
.dt .d-mut { color: rgba(15,15,14,.55); }

/* sidebar */
.dt .d-side {
  width: 240px; flex-shrink: 0;
  padding: 24px 20px;
  display: flex; flex-direction: column; gap: 24px;
  border-right: 1px solid rgba(15,15,14,.06);
  position: sticky; top: 0;
  height: 100vh;
}
.dt .d-brand { display: flex; align-items: center; gap: 10px; padding: 0 4px; }
.dt .d-brand-mark {
  width: 26px; height: 26px; border-radius: 8px;
  background: #0F0F0E; color: #fff;
  display: inline-flex; align-items: center; justify-content: center;
  font-size: 13px; font-weight: 700;
}
.dt .d-brand-mark img { width: 20px; height: 20px; display: block; }
.dt .d-brand .nm { font-size: 16px; font-weight: 600; letter-spacing: -.01em; }
.dt .d-nav { display: flex; flex-direction: column; gap: 2px; }
.dt .d-nav .grp {
  font-size: 10px; font-weight: 600;
  letter-spacing: .12em; text-transform: uppercase;
  color: rgba(15,15,14,.4);
  padding: 14px 8px 6px;
}
.dt .d-nav .item {
  display: flex; align-items: center; gap: 10px;
  padding: 9px 10px; border-radius: 8px;
  font-size: 13.5px; font-weight: 500; color: rgba(15,15,14,.65);
  cursor: pointer; transition: all .15s;
}
.dt .d-nav .item:hover { background: rgba(15,15,14,.04); color: #0F0F0E; }
.dt .d-nav .item .ic { width: 18px; height: 18px; flex-shrink: 0; opacity: .85; }
.dt .d-nav .item .badge {
  margin-left: auto;
  padding: 1px 6px; border-radius: 5px;
  background: rgba(15,15,14,.08); color: rgba(15,15,14,.7);
  font-size: 10px; font-weight: 600;
}
.dt .d-side-footer {
  margin-top: auto;
  padding: 14px 10px;
  border-top: 1px solid rgba(15,15,14,.06);
  display: flex; align-items: center; gap: 10px;
  font-size: 13px;
}
.dt .d-side-footer .av {
  width: 32px; height: 32px; border-radius: 50%;
  background: #0F0F0E; color: #fff;
  display: grid; place-items: center;
  font-weight: 600; font-size: 13px;
  flex-shrink: 0;
}

/* main */
.dt .d-main { flex: 1; min-width: 0; overflow-y: auto; overflow-x: hidden; }
.dt .d-main::-webkit-scrollbar { width: 0; }
.dt .d-topbar {
  padding: 20px 32px;
  display: flex; align-items: center; gap: 16px;
  border-bottom: 1px solid rgba(15,15,14,.06);
}
.dt .d-search {
  flex: 1; display: flex; align-items: center; gap: 10px;
  padding: 9px 14px; border-radius: 10px;
  background: rgba(15,15,14,.03);
  font-size: 13px; color: rgba(15,15,14,.45);
  max-width: 480px;
}
.dt .d-search .kbd {
  margin-left: auto;
  padding: 2px 6px; border-radius: 5px;
  font-family: 'IBM Plex Mono', monospace; font-size: 10px;
  background: rgba(15,15,14,.06); color: rgba(15,15,14,.6);
}
.dt .d-topbar .right {
  margin-left: auto;
  display: flex; align-items: center; gap: 10px;
}
.dt .d-iconbtn {
  width: 36px; height: 36px; border-radius: 50%;
  background: rgba(15,15,14,.04);
  display: grid; place-items: center; color: rgba(15,15,14,.65);
  cursor: pointer; transition: all .15s;
}

.dt .d-content {
  padding: 24px 32px 60px;
  display: flex; flex-direction: column; gap: 16px;
}
.dt .d-greet { display: flex; justify-content: space-between; align-items: flex-end; padding-bottom: 4px; }
.dt .d-greet .h { margin-top: 4px; font-size: 26px; font-weight: 600; letter-spacing: -.022em; }
.dt .d-btn {
  padding: 9px 16px; border-radius: 9px;
  background: #0F0F0E; color: #fff;
  font-size: 13px; font-weight: 500; cursor: pointer;
  display: inline-flex; align-items: center; gap: 6px;
}
.dt .d-btn-ghost { background: rgba(15,15,14,.04); color: #0F0F0E; }
.dt .d-btn-ghost:hover { background: rgba(15,15,14,.08); }

.dt .d-card {
  background: #FFFFFF;
  border: 1px solid rgba(15,15,14,.05);
  border-radius: 18px;
  padding: 22px;
  box-shadow: 0 1px 0 rgba(15,15,14,.02), 0 8px 24px -16px rgba(15,15,14,.08);
}
.dt .d-section-h {
  display: flex; justify-content: space-between; align-items: baseline;
  margin-bottom: 12px;
}
.dt .d-section-h .title { font-size: 15px; font-weight: 600; letter-spacing: -.01em; }
.dt .d-section-h .link { font-size: 13px; color: #0F0F0E; font-weight: 500; cursor: pointer; }
.dt .d-label { font-size: 11px; font-weight: 500; color: rgba(15,15,14,.5); }

/* profile card */
.dt .d-profile-card {
  margin-bottom: 0; padding: 22px 24px;
  display: flex; align-items: center; gap: 18px;
}
.dt .d-avatar-big {
  width: 64px; height: 64px; border-radius: 50%;
  background: linear-gradient(135deg, #0F0F0E, #2A2A2A); color: #FAF6EA;
  display: grid; place-items: center;
  font-size: 26px; font-weight: 600; letter-spacing: -.02em;
  flex-shrink: 0; box-shadow: 0 4px 12px rgba(15,15,14,.18);
}
.dt .d-gold-badge {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 3px 9px; border-radius: 6px;
  background: rgba(183,135,58,.10); color: #B7873A;
}
.dt .d-green-pill {
  padding: 3px 9px; border-radius: 6px;
  background: rgba(15,140,77,.10); color: #0F8C4D;
  font-size: 11px; font-weight: 600;
}

/* settings 2-col layout */
.dt .d-set-grid {
  display: grid; grid-template-columns: 240px 1fr; gap: 14px;
}
.dt .d-set-nav {
  padding: 8px 8px; align-self: flex-start;
}
.dt .set-nav-list { display: flex; flex-direction: column; gap: 2px; padding: 0; }
.dt .set-grp-h {
  font-size: 10px; font-weight: 600; letter-spacing: .12em;
  text-transform: uppercase; color: rgba(15,15,14,.4);
  padding: 14px 12px 6px;
}
.dt .set-nav-item {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 12px; border-radius: 8px;
  font-size: 13px; font-weight: 500; color: rgba(15,15,14,.65);
  cursor: pointer; transition: all .15s;
}
.dt .set-nav-item:hover { background: rgba(15,15,14,.04); color: #0F0F0E; }
.dt .set-nav-item.active { background: rgba(15,15,14,.06); color: #0F0F0E; font-weight: 600; }
.dt .set-nav-item :deep(svg) { width: 16px; height: 16px; flex-shrink: 0; opacity: .7; }
.dt .set-nav-item.active :deep(svg) { opacity: 1; }
.dt .set-nav-badge {
  padding: 1px 6px; border-radius: 4px;
  background: rgba(15,15,14,.06); color: rgba(15,15,14,.65);
  font-size: 10px; font-weight: 600;
}
.dt .set-nav-badge.gold {
  background: rgba(183,135,58,.12); color: #B7873A;
}

.dt .d-set-section { padding: 24px 28px; }
.dt .d-set-fields {
  display: grid; grid-template-columns: 1fr 1fr; gap: 16px;
  margin-top: 20px;
}
.dt .d-set-field {
  padding: 10px 0; border-bottom: 1px solid rgba(15,15,14,.05);
}
.dt .d-set-field-label {
  font-size: 11px; color: rgba(15,15,14,.5);
  font-weight: 500; margin-bottom: 5px;
}
.dt .d-set-field-row {
  display: flex; align-items: center; gap: 8px;
}
.dt .d-set-field-value { font-size: 14px; font-weight: 500; flex: 1; }
.dt .d-verified-pill {
  font-size: 10px; font-weight: 600; color: #0F8C4D;
  padding: 2px 6px; border-radius: 4px; background: rgba(15,140,77,.10);
}

/* toggle row for desktop */
.dt .d-toggle-row {
  display: flex; align-items: center; gap: 14px;
  padding: 14px 0;
  border-bottom: 1px solid rgba(15,15,14,.05);
}
.dt .d-toggle-row.last { border-bottom: 0; }

/* bank row */
.dt .d-bank-row {
  display: flex; align-items: center; gap: 14px;
  padding: 14px 0;
  border-bottom: 1px solid rgba(15,15,14,.05);
}
.dt .d-bank-row.last { border-bottom: 0; }
.dt .d-bank-logo {
  width: 40px; height: 40px; border-radius: 10px;
  display: grid; place-items: center;
  font-weight: 700; font-size: 16px; letter-spacing: -.02em;
  flex-shrink: 0;
}

/* themes */
.dt .d-themes {
  margin-top: 18px;
  display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;
}
.dt .d-theme-opt {
  padding: 14px; border-radius: 12px;
  border: 1px solid rgba(15,15,14,.08);
  cursor: pointer;
}
.dt .d-theme-opt.active { border: 2px solid #0F0F0E; }
.dt .d-theme-preview {
  height: 80px; border-radius: 8px;
  border: 1px solid rgba(15,15,14,.06);
  position: relative; overflow: hidden;
}
.dt .d-theme-line {
  position: absolute; top: 10px; left: 10px; right: 30px;
  height: 4px; border-radius: 2px;
}
.dt .d-theme-block {
  position: absolute; top: 22px; left: 10px; right: 50px;
  height: 30px; border-radius: 6px;
}
.dt .d-theme-bottom {
  display: flex; align-items: center; justify-content: space-between;
  margin-top: 10px;
}
.dt .d-theme-check {
  width: 18px; height: 18px; border-radius: 50%;
  background: #0F0F0E; color: #fff;
  display: grid; place-items: center;
}

/* footer */
.dt .d-set-footer {
  margin-top: 14px;
  display: flex; justify-content: space-between; align-items: center;
  padding: 14px 4px;
}
.dt .d-logo-mini {
  width: 14px; height: 14px; border-radius: 4px;
  background: #0F0F0E; color: #fff;
  display: inline-grid; place-items: center;
  font-size: 8px; font-weight: 700;
}
.dt .d-signout {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 14px; border-radius: 8px;
  color: #C4413A; font-size: 13px; font-weight: 500;
  cursor: pointer;
}
</style>
