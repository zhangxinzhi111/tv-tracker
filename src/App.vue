<template>
  <router-view />
  <van-tabbar v-if="showTabbar" v-model="active" fixed route>
    <van-tabbar-item to="/" icon="home-o">首页</van-tabbar-item>
    <van-tabbar-item to="/search" icon="search">搜索</van-tabbar-item>
    <van-tabbar-item to="/profile" icon="user-o">我的</van-tabbar-item>
  </van-tabbar>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const active = ref(0)
const showTabbar = ref(true)

const hideTabRoutes = ['Player']

watch(() => route.name, (name) => {
  showTabbar.value = !hideTabRoutes.includes(name)
  const indexMap = { Home: 0, Search: 1, Profile: 2 }
  active.value = indexMap[name] ?? 0
}, { immediate: true })
</script>

<style>
.van-tabbar {
  max-width: 480px;
  left: 50% !important;
  transform: translateX(-50%) !important;
}
</style>
