import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export type ThemeType = 'light' | 'dark' | 'auto'

export const useThemeStore = defineStore('theme', () => {
  const theme = ref<ThemeType>((localStorage.getItem('theme') as ThemeType) || 'auto')

  const setTheme = (newTheme: ThemeType) => {
    theme.value = newTheme
    localStorage.setItem('theme', newTheme)
  }

  return {
    theme,
    setTheme,
  }
})
