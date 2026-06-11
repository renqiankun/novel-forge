<template>
  <div class="not-found">
    <h1>页面不存在</h1>
    <el-button type="primary" @click="back">返回</el-button>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const back = () => {
  router.go(-1)
}
</script>

<style lang="scss" scoped>
.not-found {
  display: grid;
  min-height: 100%;
  place-content: center;
  gap: 16px;
}
</style>
