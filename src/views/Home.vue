<template>
  <van-nav-bar title="追剧吧" fixed />
  <div class="page" style="padding-top:46px">

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-wrap">
      <van-loading type="spinner" color="#ff6900">加载中...</van-loading>
    </div>

    <template v-else>
      <!-- 轮播横幅 -->
      <van-swipe class="banner" :autoplay="3000" indicator-color="#ff6900">
        <van-swipe-item v-for="item in bannerList" :key="item.id" @click="goDetail(item)">
          <img :src="item.backdrop || item.poster" class="banner-img" />
          <div class="banner-info">
            <div class="banner-title">{{ item.name }}</div>
            <div class="banner-meta">{{ item.first_air_date?.slice(0,4) }} ⭐ {{ item.vote_average?.toFixed(1) }}</div>
          </div>
        </van-swipe-item>
      </van-swipe>

      <!-- 热门剧集 -->
      <Section title="🔥 热门剧集" :list="popularList" :imgFn="imgFn" @item-click="goDetail" />

      <!-- TOP评分 -->
      <Section title="⭐ TOP评分" :list="topRatedList" :imgFn="imgFn" @item-click="goDetail" />

      <!-- 正在播出 -->
      <Section title="📺 正在播出" :list="onAirList" :imgFn="imgFn" @item-click="goDetail" />
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMockApi } from '@/api/mockData'
import Section from '@/components/Section.vue'

const router = useRouter()
const api = useMockApi()
const imgFn = api.imgURL

const loading = ref(true)
const bannerList = ref([])
const popularList = ref([])
const topRatedList = ref([])
const onAirList = ref([])

onMounted(async () => {
  try {
    const [popular, top, onAir] = await Promise.all([
      api.getPopularTV(),
      api.getTopRatedTV(),
      api.getOnAirTV()
    ])
    bannerList.value = popular.results.slice(0, 5)
    popularList.value = popular.results
    topRatedList.value = top.results
    onAirList.value = onAir.results
  } catch (e) {
    console.error('加载失败:', e)
  } finally {
    loading.value = false
  }
})

const goDetail = (item) => {
  router.push(`/detail/${item.id}`)
}
</script>

<style scoped>
.banner { margin-bottom: 8px; }
.banner-img { width:100%; height:210px; object-fit:cover; }
.banner-info { position:absolute; bottom:0; left:0; right:0; padding:16px; background:linear-gradient(transparent, rgba(0,0,0,.75)); }
.banner-title { color:#fff; font-size:18px; font-weight:bold; text-shadow:0 2px 8px rgba(0,0,0,.7); }
.banner-meta { color:rgba(255,255,255,.8); font-size:12px; margin-top:4px; }
.loading-wrap { display:flex; justify-content:center; align-items:center; height:300px; }
.page { padding-bottom: 60px; }
</style>
