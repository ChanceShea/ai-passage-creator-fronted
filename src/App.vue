<script setup lang="ts">
import { theme as antdTheme } from 'ant-design-vue'
import { computed, onMounted, onUnmounted, watch } from 'vue'
import { useThemeStore } from '@/stores/theme'
import zhCN from 'ant-design-vue/es/locale/zh_CN'

const themeStore = useThemeStore()

// 计算当前实际应用的主题（考虑 auto 情况）
const currentActualTheme = computed(() => {
  if (themeStore.theme === 'auto') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return themeStore.theme
})

// 应用主题到 HTML 标签
const applyTheme = () => {
  const isDark = currentActualTheme.value === 'dark'
  document.documentElement.setAttribute('data-theme', currentActualTheme.value)
  if (isDark) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

// 监听系统主题变化
const handleSystemThemeChange = () => {
  if (themeStore.theme === 'auto') {
    applyTheme()
  }
}

watch(() => themeStore.theme, applyTheme)

onMounted(() => {
  applyTheme()
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', handleSystemThemeChange)
})

onUnmounted(() => {
  window
    .matchMedia('(prefers-color-scheme: dark)')
    .removeEventListener('change', handleSystemThemeChange)
})

// Ant Design Vue 主题配置
const algorithm = computed(() => {
  return currentActualTheme.value === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm
})
</script>

<template>
  <a-config-provider
    :locale="zhCN"
    :theme="{
      algorithm: algorithm,
      token: {
        colorPrimary: '#6366f1',
        borderRadius: 12,
      },
    }"
  >
    <div id="app">
      <router-view />
    </div>
  </a-config-provider>
</template>

<style lang="scss">
#app {
  min-height: 100vh;
}
</style>
