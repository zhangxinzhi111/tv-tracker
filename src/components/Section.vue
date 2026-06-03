<template>
  <div class="section">
    <div class="section-header">
      <span class="section-title">{{ title }}</span>
    </div>
    <div class="section-list">
      <div
        v-for="item in list"
        :key="item.id"
        class="card"
        @click="$emit('item-click', item)"
      >
        <div class="card-cover">
          <img :src="imgFn(item.poster_path || item.poster)" class="card-img" loading="lazy" />
          <div class="card-rating" v-if="item.vote_average">
            ⭐ {{ (item.vote_average).toFixed(1) }}
          </div>
        </div>
        <div class="card-name">{{ item.name }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({ title: String, list: Array, imgFn: Function })
defineEmits(['item-click'])
</script>

<style scoped>
.section { padding: 12px 12px 4px; }
.section-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:10px; }
.section-title { font-size:16px; font-weight:bold; }
.section-list {
  display:flex; gap:10px; overflow-x:auto;
  padding-bottom:8px; -webkit-overflow-scrolling:touch;
}
.card { flex-shrink:0; width:110px; cursor:pointer; }
.card-cover { position:relative; border-radius:8px; overflow:hidden; }
.card-img { width:110px; height:155px; object-fit:cover; background:#eee; }
.card-rating {
  position:absolute; bottom:4px; right:4px;
  background:rgba(0,0,0,.65); color:#ffd700; font-size:11px;
  padding:1px 5px; border-radius:4px;
}
.card-name {
  font-size:12px; margin-top:4px;
  overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:110px;
}
</style>
