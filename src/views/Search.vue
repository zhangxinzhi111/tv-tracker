<template>
  <van-nav-bar title="搜索" fixed />
  <div class="page" style="padding-top:46px; padding-bottom:60px">
    <div class="search-bar">
      <van-search
        v-model="keyword"
        placeholder="搜索剧集名称..."
        shape="round"
        @search="doSearch"
        @clear="clearResults"
      />
    </div>

    <!-- 搜索结果 -->
    <div class="results" v-if="results.length">
      <div class="result-count">找到 {{ totalResults }} 个结果</div>
      <div v-for="item in results" :key="item.id" class="result-item" @click="goDetail(item)">
        <img :src="item.poster_path || item.poster" class="result-poster" />
        <div class="result-info">
          <div class="result-name">{{ item.name }}</div>
          <div class="result-meta">
            {{ item.first_air_date?.slice(0,4) || '未知' }}
            <van-tag v-if="item.vote_average" color="#ff6900" size="mini">⭐ {{ item.vote_average.toFixed(1) }}</van-tag>
          </div>
          <div class="result-desc">{{ item.overview || '暂无简介' }}</div>
        </div>
      </div>
      <div v-if="!hasMore" class="no-more">— 已经到底了 —</div>
    </div>

    <!-- 空状态 -->
    <div class="empty" v-else-if="searched">
      <van-icon name="search" size="48" color="#ccc" />
      <p>没有找到相关剧集</p>
      <p class="empty-hint">换个关键词试试？</p>
    </div>

    <!-- 初始状态 -->
    <div class="initial" v-else>
      <div class="hot-searches">
        <div class="hot-title">🔥 热门搜索</div>
        <div class="hot-tags">
          <van-tag
            v-for="tag in hotTags"
            :key="tag"
            color="#f5f5f5" text-color="#666" size="large"
            class="hot-tag"
            @click="quickSearch(tag)"
          >{{ tag }}</van-tag>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useMockApi } from '@/api/mockData'

const router = useRouter()
const api = useMockApi()

const keyword = ref('')
const results = ref([])
const searched = ref(false)
const hasMore = ref(false)
const totalResults = ref(0)

const hotTags = ['庆余年', '狂飙', '三体', '繁花', '琅琊榜', '甄嬛传', '漫长的季节', '陈情令']

const doSearch = async (val = keyword.value) => {
  if (!val.trim()) return
  searched.value = true
  try {
    const res = await api.searchTV(val)
    results.value = res.results || []
    totalResults.value = res.total_results || 0
    hasMore.value = false
  } catch (e) {
    console.error(e)
  }
}

const clearResults = () => { results.value = []; searched.value = false }

const quickSearch = (tag) => { keyword.value = tag; doSearch(tag) }

const goDetail = (item) => { router.push(`/detail/${item.id}`) }
</script>

<style scoped>
.search-bar { position:sticky; top:46px; z-index:10; background:#fff; }
.results { padding:0 12px; }
.result-count { font-size:12px; color:#999; padding:8px 0; }
.result-item { display:flex; gap:12px; padding:12px 0; border-bottom:1px solid #f5f5f5; cursor:pointer; }
.result-item:active { background:#fafafa; }
.result-poster { width:70px; height:100px; border-radius:6px; object-fit:cover; flex-shrink:0; background:#eee; }
.result-info { flex:1; min-width:0; }
.result-name { font-size:15px; font-weight:500; margin-bottom:4px; }
.result-meta { font-size:12px; color:#999; margin-bottom:6px; display:flex; align-items:center; gap:6px; }
.result-desc { font-size:12px; color:#666; line-height:1.4; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
.no-more { text-align:center; padding:16px; font-size:13px; color:#999; }
.empty { text-align:center; padding:80px 0; color:#999; }
.empty-hint { font-size:12px; margin-top:4px; }
.initial { padding:20px 12px; }
.hot-title { font-size:14px; font-weight:bold; margin-bottom:12px; }
.hot-tags { display:flex; flex-wrap:wrap; gap:8px; }
.hot-tag { cursor:pointer; padding:6px 12px; }
</style>
