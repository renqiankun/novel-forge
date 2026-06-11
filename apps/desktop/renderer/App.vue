<template>
  <el-config-provider v-bind="config">
    <router-view />
  </el-config-provider>
</template>

<script setup lang="ts">
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
const config = {
  size: 'default' as const,
  zIndex: 3000,
  locale: zhCn,
}
</script>
