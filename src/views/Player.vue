<template>
  <div class="player-page">
    <van-nav-bar
      :title="`${tvName} 第${season}季 第${episode}集`"
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
        @play="isPlaying = true"
        @pause="isPlaying = false"
        @error="onVideoError"
      >
        您的浏览器不支持视频播放
      </video>
      <div class="video-overlay" v-if="showOverlay" @click="togglePlay">
        <van-icon name="play-circle-o" v-if="!isPlaying" class="overlay-icon" />
      </div>
      <div class="source-tag">片源: {{ currentSourceIdx + 1 }}/{{ videoSources.length }}</div>
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

    <!-- 切换片源 -->
    <div class="source-section">
      <div class="source-header">切换片源</div>
      <div class="source-list">
        <div
          v-for="(src, idx) in videoSources"
          :key="idx"
          class="source-item"
          :class="{ active: currentSourceIdx === idx }"
          @click="switchSource(idx)"
        >片源 {{ idx + 1 }}</div>
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

const router = useRouter()
const route = useRoute()
const api = useMockApi()

const videoRef = ref(null)
const isPlaying = ref(false)
const showOverlay = ref(true)
const isFav = ref(false)

const tvId = route.params.id
const season = ref(Number(route.params.season))
const episode = ref(Number(route.params.episode))
const episodeTotal = ref(40)
const tvName = ref('')
const currentSourceIdx = ref(0)

const videoSources = api.VIDEO_SOURCES.alternatives
const videoUrl = computed(() => videoSources[currentSourceIdx.value] || videoSources[0])

const episodeList = computed(() => Array.from({ length: episodeTotal.value }, (_, i) => i + 1))

const togglePlay = () => {
  if (!videoRef.value) return
  isPlaying.value ? videoRef.value.pause() : videoRef.value.play().catch(() => {})
}

const onVideoError = () => {
  // 自动切换到下一个片源
  if (currentSourceIdx.value < videoSources.length - 1) {
    currentSourceIdx.value++
  }
}

const switchSource = (idx) => {
  currentSourceIdx.value = idx
  showOverlay.value = true
  isPlaying.value = false
}

const goEpisode = (ep) => {
  episode.value = ep
  router.replace(`/player/${tvId}/${season.value}/${ep}`)
  saveHistory(ep)
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
  try {
    const tv = await api.getTVDetail(tvId)
    tvName.value = tv.name
    const s = tv.seasons?.find(s => s.season_number === season.value)
    episodeTotal.value = s?.episode_count || 40
  } catch (e) {
    console.error(e)
  }
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
.video-overlay {
  position:absolute; inset:0; display:flex; align-items:center; justify-content:center;
  background:rgba(0,0,0,.3); cursor:pointer;
}
.overlay-icon { font-size:56px; color:#fff; opacity:.85; }
.source-tag {
  position:absolute; top:8px; right:8px; background:rgba(0,0,0,.6); color:#ff6900;
  font-size:11px; padding:2px 8px; border-radius:4px;
}

.episode-panel { background:#1a1a1a; padding:12px; }
.panel-header { display:flex; justify-content:space-between; color:#fff; margin-bottom:10px; font-size:14px; }
.ep-total { color:#888; font-size:12px; }
.ep-grid { display:flex; flex-wrap:wrap; gap:8px; }
.ep-btn {
  width:48px; height:32px; border-radius:4px; background:#2a2a2a; color:#ccc;
  display:flex; align-items:center; justify-content:center; font-size:13px; cursor:pointer;
}
.ep-btn.active { background:#ff6900; color:#fff; }

.source-section { background:#1a1a1a; padding:12px; }
.source-header { font-size:13px; margin-bottom:8px; color:#999; }
.source-list { display:flex; gap:8px; }
.source-item {
  padding:6px 14px; border-radius:4px; background:#2a2a2a; color:#ccc;
  font-size:12px; cursor:pointer;
}
.source-item.active { background:#ff6900; color:#fff; }

.action-bar {
  display:flex; justify-content:space-around; padding:12px; background:#1a1a1a;
  border-top:1px solid #222; margin-top:8px;
}
.action-item { display:flex; align-items:center; gap:4px; color:#999; font-size:13px; cursor:pointer; }
.action-item:active { color:#ff6900; }
</style>
