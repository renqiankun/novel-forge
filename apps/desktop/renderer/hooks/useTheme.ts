import { useDark } from '@vueuse/core'
import { computed } from 'vue'

export function useTheme() {
  const isDark = useDark()

  const setTheme = (newIsDark: boolean) => {
    isDark.value = newIsDark
  }

  const toggle = () => {
    setTheme(!isDark.value)
  }

  const themeLabel = computed(() => (isDark.value ? '深色' : '浅色'))

  return {
    isDark,
    themeLabel,
    toggle,
    setTheme,
  }
}
