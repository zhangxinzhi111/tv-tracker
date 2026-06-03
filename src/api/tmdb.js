import axios from 'axios'

// TMDB API 配置
// 用户需要去 https://www.themoviedb.org/settings/api 申请免费 API Key
// 在 .env 文件中配置 VITE_TMDB_API_KEY=你的API_Key
const API_KEY = import.meta.env.VITE_TMDB_API_KEY || 'YOUR_TMDB_API_KEY'
const BASE_URL = 'https://api.themoviedb.org/3'
const IMG_BASE = 'https://image.tmdb.org/t/p'

const api = axios.create({
  baseURL: BASE_URL,
  params: {
    api_key: API_KEY,
    language: 'zh-CN'
  }
})

// 获取热门剧集
export const getPopularTV = (page = 1) =>
  api.get('/tv/popular', { params: { page } }).then(r => r.data)

// 获取TOP评分剧集
export const getTopRatedTV = (page = 1) =>
  api.get('/tv/top_rated', { params: { page } }).then(r => r.data)

// 获取正在播出剧集
export const getOnAirTV = (page = 1) =>
  api.get('/tv/on_the_air', { params: { page } }).then(r => r.data)

// 获取剧集详情
export const getTVDetail = (id) =>
  api.get(`/tv/${id}`, { params: { append_to_response: 'credits,videos,similar' } }).then(r => r.data)

// 获取季度集数
export const getSeason = (id, season) =>
  api.get(`/tv/${id}/season/${season}`).then(r => r.data)

// 搜索剧集
export const searchTV = (query, page = 1) =>
  api.get('/search/tv', { params: { query, page } }).then(r => r.data)

// 获取剧集分类
export const getGenres = () =>
  api.get('/genre/tv/list').then(r => r.data)

// 图片 URL 辅助函数
export const imgURL = (path, size = 'w500') => {
  if (!path) return 'https://via.placeholder.com/300x450?text=No+Image'
  return `${IMG_BASE}/${size}${path}`
}

export { IMG_BASE }
