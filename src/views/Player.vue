<template>
  <div class="player-page">
    <van-nav-bar
      :title="pageTitle"
      left-arrow
      @click-left="router.back()"
      class="player-nav"
    />

    <!-- 视频播放器 -->
    <div class="video-container">
      <video
        ref="videoRef"
        :src="videoUrl"
        controls
        autoplay
        playsinline
        class="video-player"
        @play="isPlaying = true; showOverlay = false"
        @pause="isPlaying = false; showOverlay = true"
        @error="onVideoError"
      >
        您的浏览器不支持视频播放
      </video>

      <!-- 加载中 -->
      <div class="video-loading" v-if="loading">
        <van-loading type="spinner" color="#ff6900" />
        <p class="loading-text">正在解析片源...</p>
      </div>

      <!-- 播放按钮遮罩 -->
      <div class="video-overlay" v-if="showOverlay && !loading" @click="togglePlay">
        <van-icon name="play-circle-o" v-if="!isPlaying" class="overlay-icon" />
      </div>

      <!-- 片源标识 -->
      <div class="source-tag" v-if="!loading">
        {{ bdzyData ? 'BDZY片源' : '演示片源' }}
        <span v-if="bdzyData"> | 第{{ currentEpIdx + 1 }}/{{ bdzyData.episodes.length }}集</span>
      </div>
    </div>

    <!-- 剧集信息 -->
    <div class="tv-info" v-if="bdzyData">
      <h3 class="tv-name">{{ bdzyData.name }}</h3>
      <p class="tv-desc">{{ bdzyData.desc }}</p>
    </div>

    <!-- 选集面板 -->
    <div class="episode-panel">
      <div class="panel-header">
        <span>选集</span>
        <span class="ep-total">共 {{ episodeTotal }} 集</span>
      </div>
      <div class="ep-grid">
        <div
          v-for="ep in episodeList"
          :key="ep"
          class="ep-btn"
          :class="{ active: ep === Number(episode) }"
          @click="goEpisode(ep)"
        >{{ ep }}</div>
      </div>
    </div>

    <!-- 操作栏 -->
    <div class="action-bar">
      <div class="action-item" @click="toggleFav">
        <van-icon :name="isFav ? 'star' : 'star-o'" :color="isFav ? '#ff6900' : ''" />
        <span>{{ isFav ? '已收藏' : '收藏' }}</span>
      </div>
      <div class="action-item" @click="prevEp">
        <van-icon name="arrow-left" /> <span>上一集</span>
      </div>
      <div class="action-item" @click="nextEp">
        <span>下一集</span> <van-icon name="arrow" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useMockApi } from '@/api/mockData'
import { searchAndGetEpisodes } from '@/api/bdzy'

const router = useRouter()
const route = useRoute()
const api = useMockApi()

const videoRef = ref(null)
const isPlaying = ref(false)
const showOverlay = ref(true)
const isFav = ref(false)
const loading = ref(true)
const bdzyData = ref(null)
const currentEpIdx = ref(0)

const tvId = route.params.id
const season = ref(Number(route.params.season))
const episode = ref(Number(route.params.episode))
const episodeTotal = ref(40)
const tvName = ref('')
const sourceError = ref(false)

// 演示片源（备用）
const demoSources = api.VIDEO_SOURCES.alternatives

// 当前视频地址
const videoUrl = computed(() => {
  if (bdzyData.value && bdzyData.value.episodes[currentEpIdx.value]) {
    return bdzyData.value.episodes[currentEpIdx.value].url
  }
  return demoSources[0]
})

const pageTitle = computed(() => {
  if (bdzyData.value) {
    return `${bdzyData.value.name} 第${episode.value}集`
  }
  return `${tvName.value} 第${episode.value}集`
})

const episodeList = computed(() => Array.from({ length: episodeTotal.value }, (_, i) => i + 1))

const togglePlay = () => {
  if (!videoRef.value) return
  isPlaying.value ? videoRef.value.pause() : videoRef.value.play().catch(() => {})
}

const onVideoError = () => {
  sourceError.value = true
  // 如果是 BDZY 片源出错，尝试原始地址（不带解析器）
  if (bdzyData.value && bdzyData.value.episodes[currentEpIdx.value]) {
    const ep = bdzyData.value.episodes[currentEpIdx.value]
    if (videoRef.value.src === ep.url && ep.originalUrl) {
      videoRef.value.src = ep.originalUrl
      videoRef.value.load()
      videoRef.value.play().catch(() => {})
    }
  }
}

const goEpisode = (ep) => {
  episode.value = ep
  currentEpIdx.value = ep - 1
  router.replace(`/player/${tvId}/${season.value}/${ep}`)
  saveHistory(ep)
  // 更新视频地址
  if (videoRef.value) {
    videoRef.value.load()
    videoRef.value.play().catch(() => {})
  }
}

const prevEp = () => { if (episode.value > 1) goEpisode(episode.value - 1) }
const nextEp = () => { if (episode.value < episodeTotal.value) goEpisode(episode.value + 1) }

const toggleFav = () => { isFav.value = !isFav.value }

const saveHistory = (ep) => {
  const history = JSON.parse(localStorage.getItem('watchHistory') || '{}')
  if (!history[tvId]) history[tvId] = {}
  history[tvId][season.value] = ep
  localStorage.setItem('watchHistory', JSON.stringify(history))
}

onMounted(async () => {
  // 加载剧集基本信息
  let showInfo = null
  try {
    const tv = await api.getTVDetail(tvId)
    tvName.value = tv.name
    showInfo = tv
    const s = tv.seasons?.find(s => s.season_number === season.value)
    episodeTotal.value = s?.episode_count || 40
  } catch (e) {
    console.error(e)
  }

  // 从 BDZY 搜索真实片源
  const searchName = showInfo?.name || tvName.value
  if (searchName) {
    try {
      const data = await searchAndGetEpisodes(searchName)
      if (data && data.episodes.length > 0) {
        bdzyData.value = data
        // 根据当前集数调整
        currentEpIdx.value = Math.min(episode.value - 1, data.episodes.length - 1)
        episodeTotal.value = data.episodes.length
      }
    } catch (e) {
      console.error('BDZY fetch failed:', e)
    }
  }

  loading.value = false

  // 加载历史收藏状态
  const fav = JSON.parse(localStorage.getItem('favList') || '[]')
  isFav.value = fav.some(f => f.id === Number(tvId))
})
</script>

<style scoped>
.player-page { background:#111; min-height:100vh; color:#fff; }
.player-nav { background:#111 !important; }
.player-nav :deep(.van-nav-bar__title) { color:#fff !important; }
.player-nav :deep(.van-icon) { color:#fff !important; }

.video-container { position:relative; background:#000; }
.video-player { width:100%; max-height:56vw; object-fit:contain; }

.video-loading {
  position:absolute; inset:0; display:flex; flex-direction:column;
  align-items:center; justify-content:center; background:#000; z-index:10;
}
.loading-text { color:#999; font-size:13px; margin-top:12px; }

.video-overlay {
  position:absolute; inset:0; display:flex; align-items:center; justify-content:center;
  background:rgba(0,0,0,.3); cursor:pointer;
}
.overlay-icon { font-size:56px; color:#fff; opacity:.85; }

.source-tag {
  position:absolute; top:8px; right:8px; background:rgba(0,0,0,.6); color:#ff6900;
  font-size:11px; padding:2px 8px; border-radius:4px;
}

.tv-info { padding:12px; background:#1a1a1a; }
.tv-name { font-size:16px; font-weight:600; margin-bottom:6px; }
.tv-desc { font-size:12px; color:#999; line-height:1.5; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }

.episode-panel { background:#1a1a1a; padding:12px; }
.panel-header { display:flex; justify-content:space-between; color:#fff; margin-bottom:10px; font-size:14px; }
.ep-total { color:#888; font-size:12px; }
.ep-grid { display:flex; flex-wrap:wrap; gap:8px; }
.ep-btn {
  width:48px; height:32px; border-radius:4px; background:#2a2a2a; color:#ccc;
  display:flex; align-items:center; justify-content:center; font-size:13px; cursor:pointer;
}
.ep-btn.active { background:#ff6900; color:#fff; }

.action-bar {
  display:flex; justify-content:space-around; padding:12px; background:#1a1a1a;
  border-top:1px solid #222; margin-top:8px;
}
.action-item { display:flex; align-items:center; gap:4px; color:#999; font-size:13px; cursor:pointer; }
.action-item:active { color:#ff6900; }
</style>
