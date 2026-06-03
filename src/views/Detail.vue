<template>
  <van-nav-bar :title="tv?.name || '详情'" left-arrow @click-left="router.back()" fixed />
  <div class="page" style="padding-top:46px; padding-bottom:60px">

    <!-- 加载中 -->
    <div v-if="loading" class="loading-wrap">
      <van-loading type="spinner" color="#ff6900">加载中...</van-loading>
    </div>

    <template v-else-if="tv">
      <!-- 剧集头部 -->
      <div class="hero">
        <img :src="tv.backdrop || tv.poster" class="hero-bg" />
        <div class="hero-overlay">
          <img :src="tv.poster_path || tv.poster" class="hero-poster" />
          <div class="hero-info">
            <h2 class="hero-name">{{ tv.name }}</h2>
            <p class="hero-meta">
              {{ tv.first_air_date?.slice(0,4) }} · {{ tv.number_of_seasons }}季
              <van-tag v-for="g in tv.genres?.slice(0,2)" :key="g.id" size="mini" color="#ff6900">{{ g.name }}</van-tag>
            </p>
            <p class="hero-rating">⭐ {{ tv.vote_average?.toFixed(1) }} <span class="rating-count">({{ tv.vote_count }}人评价)</span></p>
            <p class="hero-desc">{{ tv.overview }}</p>
          </div>
        </div>
      </div>

      <!-- 季+集列表 -->
      <div class="seasons">
        <div class="season-tabs">
          <div
            v-for="s in tv.seasons?.filter(s => s.season_number >= 0)"
            :key="s.id"
            class="season-tab"
            :class="{ active: currentSeason === s.season_number }"
            @click="switchSeason(s.season_number)"
          >{{ s.season_number === 0 ? '特辑' : `第${s.season_number}季` }}</div>
        </div>

        <div class="episode-grid">
          <van-loading v-if="epLoading" class="ep-loading" size="20px">加载中...</van-loading>
          <template v-else>
            <div
              v-for="ep in episodes"
              :key="ep.id"
              class="episode-card"
              @click="playEpisode(ep)"
            >
              <div class="ep-num">{{ ep.episode_number }}</div>
              <div class="ep-info">
                <div class="ep-name">{{ ep.name }}</div>
                <div class="ep-desc">{{ ep.overview }}</div>
              </div>
              <van-icon name="play-circle-o" class="ep-play" />
            </div>
          </template>
        </div>
      </div>

      <!-- 演员 -->
      <div class="cast-section" v-if="tv.credits?.cast?.length">
        <div class="section-title">主要演员</div>
        <div class="cast-list">
          <div v-for="c in tv.credits.cast.slice(0, 10)" :key="c.id" class="cast-item">
            <div class="cast-avatar-placeholder">{{ c.name?.[0] }}</div>
            <div class="cast-name">{{ c.name }}</div>
            <div class="cast-role">{{ c.character }}</div>
          </div>
        </div>
      </div>

      <!-- 相似推荐 -->
      <Section v-if="tv.similar?.results?.length" title="相似推荐" :list="tv.similar.results" :imgFn="imgFn" @item-click="goDetail" />
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useMockApi } from '@/api/mockData'
import Section from '@/components/Section.vue'

const router = useRouter()
const route = useRoute()
const api = useMockApi()
const imgFn = api.imgURL

const tv = ref(null)
const episodes = ref([])
const currentSeason = ref(1)
const loading = ref(true)
const epLoading = ref(false)

onMounted(async () => {
  const id = route.params.id
  try {
    tv.value = await api.getTVDetail(id)
    if (tv.value.seasons?.length) {
      const firstSeason = tv.value.seasons.find(s => s.season_number >= 1)?.season_number || 1
      currentSeason.value = firstSeason
      await loadEpisodes(id, firstSeason)
    }
  } catch (e) {
    console.error('加载详情失败:', e)
  } finally {
    loading.value = false
  }
})

const switchSeason = async (seasonNum) => {
  currentSeason.value = seasonNum
  await loadEpisodes(route.params.id, seasonNum)
}

const loadEpisodes = async (id, season) => {
  epLoading.value = true
  try {
    const res = await api.getSeason(id, season)
    episodes.value = res.episodes || []
  } catch (e) {
    console.error('加载集数失败:', e)
  } finally {
    epLoading.value = false
  }
}

const playEpisode = (ep) => {
  router.push(`/player/${route.params.id}/${currentSeason.value}/${ep.episode_number}`)
}

const goDetail = (item) => {
  router.push(`/detail/${item.id}`)
}
</script>

<style scoped>
.hero { position:relative; }
.hero-bg { width:100%; height:220px; object-fit:cover; filter:brightness(.5); }
.hero-overlay {
  position:absolute; top:0; left:0; right:0; bottom:0;
  display:flex; padding:16px; align-items:flex-end; gap:12px;
  background:linear-gradient(transparent 30%, rgba(0,0,0,.8));
}
.hero-poster { width:100px; height:140px; border-radius:8px; object-fit:cover; flex-shrink:0; background:#333; }
.hero-info { color:#fff; }
.hero-name { font-size:16px; font-weight:bold; margin-bottom:4px; }
.hero-meta { font-size:12px; opacity:.85; margin-bottom:4px; display:flex; gap:4px; align-items:center; flex-wrap:wrap; }
.hero-rating { font-size:13px; margin-bottom:6px; }
.rating-count { font-size:11px; opacity:.7; }
.hero-desc { font-size:11px; opacity:.8; display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden; }

.season-tabs { display:flex; gap:8px; padding:12px 12px 8px; overflow-x:auto; }
.season-tab {
  padding:4px 12px; border-radius:16px; font-size:13px; white-space:nowrap;
  background:#f0f0f0; color:#666; cursor:pointer;
}
.season-tab.active { background:#ff6900; color:#fff; }

.episode-grid { padding:0 12px 16px; }
.ep-loading { text-align:center; padding:20px; }
.episode-card {
  display:flex; align-items:center; padding:10px 0; gap:10px;
  border-bottom:1px solid #f0f0f0; cursor:pointer;
}
.episode-card:active { background:#fafafa; }
.ep-num {
  width:32px; height:32px; border-radius:50%; background:#ff6900; color:#fff;
  display:flex; align-items:center; justify-content:center; font-size:13px; flex-shrink:0;
}
.ep-info { flex:1; min-width:0; }
.ep-name { font-size:14px; font-weight:500; }
.ep-desc { font-size:11px; color:#999; margin-top:2px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.ep-play { color:#ff6900; font-size:20px; flex-shrink:0; }

.section-title { padding:12px 12px 8px; font-size:15px; font-weight:bold; }
.cast-list { display:flex; gap:10px; padding:0 12px 16px; overflow-x:auto; }
.cast-item { text-align:center; flex-shrink:0; width:72px; }
.cast-avatar-placeholder {
  width:56px; height:56px; border-radius:50%; background:linear-gradient(135deg, #ff6900, #ff8c33);
  color:#fff; font-size:22px; display:flex; align-items:center; justify-content:center;
  margin:0 auto;
}
.cast-name { font-size:11px; margin-top:4px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.cast-role { font-size:10px; color:#999; }

.loading-wrap { display:flex; justify-content:center; align-items:center; height:300px; }
</style>
