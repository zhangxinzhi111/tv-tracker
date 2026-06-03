// 百度资源网 API 接入
// API 文档: https://www.bdzy.com
const API_BASE = 'https://api.apibdzy.com/api.php/provide/vod/'
const M3U8_PARSER = 'https://fj.xbdzyw.com/m3u8/?url='

// 搜索剧集
export async function searchVideo(keyword) {
  try {
    const encoded = encodeURIComponent(keyword)
    const res = await fetch(`${API_BASE}?ac=list&pg=1&wd=${encoded}`)
    const data = await res.json()
    if (data.code === 1 && data.list && data.list.length > 0) {
      // 返回第一个匹配结果（最相关）
      return data.list[0]
    }
    return null
  } catch (e) {
    console.error('BDZY search error:', e)
    return null
  }
}

// 获取剧集详情（包含 m3u8 地址）
export async function getVideoDetail(vodId) {
  try {
    const res = await fetch(`${API_BASE}?ac=detail&ids=${vodId}`)
    const data = await res.json()
    if (data.code === 1 && data.list && data.list.length > 0) {
      return parseVideoDetail(data.list[0])
    }
    return null
  } catch (e) {
    console.error('BDZY detail error:', e)
    return null
  }
}

// 解析视频详情，提取分集 m3u8 地址
function parseVideoDetail(vod) {
  const result = {
    name: vod.vod_name,
    pic: vod.vod_pic,
    desc: vod.vod_content?.replace(/<[^>]+>/g, '') || vod.vod_blurb || '',
    episodes: []
  }

  // 解析 vod_play_url 格式: 第01集$URL#第02集$URL
  const playUrl = vod.vod_play_url || ''
  if (playUrl) {
    const parts = playUrl.split('#')
    for (const part of parts) {
      const match = part.match(/^(.+?)\$(.+)$/)
      if (match) {
        result.episodes.push({
          title: match[1],
          url: M3U8_PARSER + encodeURIComponent(match[2]),
          originalUrl: match[2]
        })
      }
    }
  }

  return result
}

// 一键搜索并获取详情
export async function searchAndGetEpisodes(keyword) {
  const searchResult = await searchVideo(keyword)
  if (!searchResult) return null

  // 如果搜索结果已经有详情，直接解析
  if (searchResult.vod_play_url) {
    return parseVideoDetail(searchResult)
  }

  // 否则再调详情接口
  return await getVideoDetail(searchResult.vod_id)
}
