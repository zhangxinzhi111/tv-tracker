<template>
  <van-nav-bar title="我的" fixed />
  <div class="page" style="padding-top:46px; padding-bottom:60px">

    <!-- 用户信息区 -->
    <div class="user-header">
      <div class="avatar-placeholder">追</div>
      <div class="user-info">
        <div class="username">追剧达人</div>
        <div class="user-id">ID: 888666</div>
      </div>
      <van-icon name="setting-o" class="settings-icon" size="20" />
    </div>

    <!-- 数据统计 -->
    <div class="stats-row">
      <div class="stat-item">
        <div class="stat-num">{{ historyCount }}</div>
        <div class="stat-label">观看记录</div>
      </div>
      <div class="stat-item">
        <div class="stat-num">{{ favList.length }}</div>
        <div class="stat-label">我的收藏</div>
      </div>
      <div class="stat-item">
        <div class="stat-num">0</div>
        <div class="stat-label">追剧日历</div>
      </div>
    </div>

    <!-- 功能菜单 -->
    <van-cell-group inset class="menu-group">
      <van-cell title="观看历史" is-link :value="historyCount ? `${historyCount}部` : ''" @click="showHistoryPanel = true" />
      <van-cell title="我的收藏" is-link :value="favList.length ? `${favList.length}部` : ''" @click="showFavPanel = true" />
      <van-cell title="追剧日历" is-link value="即将上线" />
    </van-cell-group>

    <van-cell-group inset class="menu-group">
      <van-cell title="播放设置" is-link />
      <van-cell title="清除缓存" is-link @click="showClearDialog = true" />
      <van-cell title="关于追剧吧" is-link />
      <van-cell title="检查更新" is-link @click="showToast('当前已是最新版本 v1.0.0')" />
    </van-cell-group>

    <!-- 观看历史弹窗 -->
    <van-popup v-model:show="showHistoryPanel" position="bottom" round :style="{ height: '60%' }">
      <div class="popup-header">
        <span>观看历史</span>
        <van-icon name="cross" @click="showHistoryPanel = false" />
      </div>
      <div class="popup-body">
        <div v-if="historyItems.length" class="history-list">
          <div v-for="item in historyItems" :key="item.id" class="history-row" @click="router.push(`/detail/${item.id}`)">
            <img :src="item.poster" class="history-poster" />
            <div class="history-info">
              <div class="history-name">{{ item.name }}</div>
              <div class="history-ep">看到第 {{ item.lastEp }} 集</div>
            </div>
          </div>
        </div>
        <van-empty v-else description="还没有观看记录" />
      </div>
    </van-popup>

    <!-- 收藏弹窗 -->
    <van-popup v-model:show="showFavPanel" position="bottom" round :style="{ height: '60%' }">
      <div class="popup-header">
        <span>我的收藏</span>
        <van-icon name="cross" @click="showFavPanel = false" />
      </div>
      <div class="popup-body">
        <div v-if="favList.length" class="fav-grid">
          <div v-for="item in favList" :key="item.id" class="fav-card" @click="router.push(`/detail/${item.id}`)">
            <img :src="item.poster" class="fav-poster" />
            <div class="fav-name">{{ item.name }}</div>
          </div>
        </div>
        <van-empty v-else description="还没有收藏" />
      </div>
    </van-popup>

    <!-- 清除确认 -->
    <van-dialog v-model:show="showClearDialog" title="确认清除？" show-cancel-button @confirm="confirmClear">
      <div style="padding:20px;text-align:center;color:#999;">将清除所有观看记录和缓存</div>
    </van-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { useMockApi } from '@/api/mockData'

const router = useRouter()
const api = useMockApi()

const showHistoryPanel = ref(false)
const showFavPanel = ref(false)
const showClearDialog = ref(false)
const favList = ref([])
const historyItems = ref([])

const historyCount = computed(() => historyItems.value.length)

onMounted(() => {
  loadHistory()
  loadFav()
})

const loadHistory = () => {
  const history = JSON.parse(localStorage.getItem('watchHistory') || '{}')
  const ids = Object.keys(history)
  if (ids.length === 0) { historyItems.value = []; return }
  // 从mock数据中查找匹配的剧集
  const allData = [
    { id:1, name:'庆余年', poster:'https://img1.doubanio.com/view/photo/s_ratio_poster/public/p2575233241.jpg' },
    { id:2, name:'狂飙', poster:'https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2887928096.jpg' },
    { id:3, name:'三体', poster:'https://img2.doubanio.com/view/photo/s_ratio_poster/public/p2892604421.jpg' },
    { id:4, name:'繁花', poster:'https://img2.doubanio.com/view/photo/s_ratio_poster/public/p2902325546.jpg' },
    { id:5, name:'琅琊榜', poster:'https://img1.doubanio.com/view/photo/s_ratio_poster/public/p2265332931.jpg' },
    { id:6, name:'甄嬛传', poster:'https://img3.doubanio.com/view/photo/s_ratio_poster/public/p1374168085.jpg' },
    { id:7, name:'漫长的季节', poster:'https://img3.doubanio.com/view/photo/s_ratio_poster/public/p2900072983.jpg' },
    { id:8, name:'觉醒年代', poster:'https://img2.doubanio.com/view/photo/s_ratio_poster/public/p2632803896.jpg' },
    { id:9, name:'隐秘的角落', poster:'https://img1.doubanio.com/view/photo/s_ratio_poster/public/p2616285881.jpg' },
    { id:10, name:'开端', poster:'https://img3.doubanio.com/view/photo/s_ratio_poster/public/p2867989933.jpg' },
    { id:11, name:'人世间', poster:'https://img1.doubanio.com/view/photo/s_ratio_poster/public/p2840618304.jpg' },
    { id:12, name:'沉默的真相', poster:'https://img2.doubanio.com/view/photo/s_ratio_poster/public/p2621550099.jpg' },
    { id:13, name:'知否知否应是绿肥红瘦', poster:'https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2539017642.jpg' },
    { id:14, name:'去有风的地方', poster:'https://img3.doubanio.com/view/photo/s_ratio_poster/public/p2890286434.jpg' },
    { id:15, name:'陈情令', poster:'https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2562640081.jpg' },
  ]
  historyItems.value = ids.map(id => {
    const found = allData.find(d => d.id === Number(id))
    const seasons = history[id]
    const lastSeason = Object.keys(seasons).pop()
    return {
      id: Number(id),
      name: found?.name || `剧集 ${id}`,
      poster: found?.poster || '',
      lastEp: seasons[lastSeason] || '?'
    }
  })
}

const loadFav = () => { favList.value = JSON.parse(localStorage.getItem('favList') || '[]') }

const confirmClear = () => {
  localStorage.removeItem('watchHistory')
  localStorage.removeItem('favList')
  historyItems.value = []
  favList.value = []
}
</script>

<style scoped>
.user-header {
  display:flex; align-items:center; padding:24px 16px; gap:14px;
  background:linear-gradient(135deg, #ff6900, #ff8c33); color:#fff;
}
.avatar-placeholder {
  width:64px; height:64px; border-radius:50%; border:3px solid rgba(255,255,255,.5);
  background:rgba(255,255,255,.2); display:flex; align-items:center; justify-content:center;
  font-size:28px; font-weight:bold;
}
.user-info { flex:1; }
.username { font-size:18px; font-weight:bold; }
.user-id { font-size:12px; opacity:.8; margin-top:2px; }
.settings-icon { opacity:.8; }

.stats-row {
  display:flex; justify-content:space-around; padding:16px;
  background:#fff; margin:12px; border-radius:12px;
  box-shadow:0 2px 8px rgba(0,0,0,.06);
}
.stat-item { text-align:center; }
.stat-num { font-size:20px; font-weight:bold; color:#ff6900; }
.stat-label { font-size:12px; color:#999; margin-top:2px; }

.menu-group { margin-top:12px; }

.popup-header {
  display:flex; justify-content:space-between; align-items:center;
  padding:16px; font-size:16px; font-weight:bold; border-bottom:1px solid #f0f0f0;
}
.popup-body { padding:12px; overflow-y:auto; height:calc(100% - 56px); }

.history-row { display:flex; align-items:center; gap:10px; padding:8px 0; border-bottom:1px solid #f5f5f5; }
.history-poster { width:48px; height:68px; border-radius:6px; object-fit:cover; flex-shrink:0; }
.history-info { flex:1; }
.history-name { font-size:14px; font-weight:500; }
.history-ep { font-size:12px; color:#999; margin-top:4px; }

.fav-grid { display:grid; grid-template-columns:repeat(3, 1fr); gap:12px; }
.fav-card { cursor:pointer; }
.fav-poster { width:100%; height:140px; border-radius:8px; object-fit:cover; }
.fav-name { font-size:12px; margin-top:4px; text-align:center; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
</style>
