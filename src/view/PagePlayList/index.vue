<template>
  <div class="content-page">
    <div class="content-box">
      <BgPic
        :url="playListInfo.picUrl"
        :is-default-blur="true"
        :is-hover-blur="false"
        :width="300"
      />
      <div class="info">
        <div class="title">{{ playListInfo.name }}</div>
        <div class="other-info">
          <div class="creator">
            <BgPic
              :url="playListInfo.creator.avatarUrl"
              :width="40"
              :is-round="true"
              :is-hover-blur="false"
            />
            <div class="nickname">
              {{ playListInfo.creator.nickname }}
            </div>
            <div class="create-time">{{ createTimeFormat }} 创建</div>
          </div>
          <div class="count">
            <div>歌曲：{{ playListInfo.trackCount }}</div>
            <div>播放：{{ playListInfo.playCount }}</div>
          </div>
          <div class="description">
            {{
              playListInfo.description ? playListInfo.description : "暂无介绍"
            }}
          </div>
        </div>
      </div>
    </div>
    <MusicList
      :list="musicList"
      :loading="searchLoading"
      :no-more="noMore"
      :from-play-list-id="searchPage.id"
      :from-play-list-type="'PL'"
      @load-more="loadMore"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { watch, reactive, ref } from "vue";
import { useRoute } from "vue-router";
import { PlayListPageParams } from "../../api/interface/music";
import { fetchPlayListSongs, fetchPlayListDetails } from "../../api/music";
import BgPic from "../../components/BgPic.vue";
import MusicList from "../../components/MusicList.vue";
const route = useRoute();

const noMore = ref<boolean>(false);
const searchLoading = ref<boolean>(false);
const musicList = reactive<any[]>([]);
const playListInfo = reactive<{
  name: string;
  picUrl: string;
  creator: any;
  createTime?: number;
  description?: string;
  playCount?: number;
  trackCount?: number;
}>({
  name: "",
  picUrl: "",
  creator: {},
});

const searchPage = reactive<PlayListPageParams>({
  id: 0,
  limit: 50,
  offset: 0,
});

async function fetchAllSong() {
  searchLoading.value = true;
  try {
    const res: any = await fetchPlayListSongs(searchPage);
    Array.prototype.push.apply(musicList, res.songs);
    if (res.songs.length < searchPage.limit!) noMore.value = true;
  } catch (error) {
    console.error(error);
  } finally {
    searchLoading.value = false;
  }
}

async function fetchPlayListDetail() {
  try {
    const res: any = await fetchPlayListDetails({ id: searchPage.id });
    const { playlist } = res;
    playListInfo.name = playlist.name;
    playListInfo.picUrl = playlist.coverImgUrl;
    playListInfo.creator = playlist.creator;
    playListInfo.playCount = playlist.playCount;
    playListInfo.trackCount = playlist.trackCount;
    playListInfo.createTime = playlist.createTime;
    playListInfo.description = playlist.description;
  } catch (e) {
    console.error(e);
  }
}

function loadMore() {
  if (noMore.value) return;
  searchPage.offset! += 50;
}

watch(
  () => searchPage,
  () => {
    fetchAllSong();
  },
  { deep: true }
);

watch(
  () => route.query.id,
  (nv: any, ov: any) => {
    if (route.path.indexOf("playList") == -1) return;
    searchPage.id = parseInt(nv) as number;
  },
  { immediate: true }
);

const createTimeFormat = computed(() => {
  const date: Date = new Date(playListInfo.createTime!);
  const year = date.getFullYear() != null ? date.getFullYear() : "0000";
  const month = date.getMonth() != null ? date.getMonth() + 1 : "0";
  const day = date.getDay() != null ? date.getDay() : "00";
  return `${year}年${month}月${day}日`;
});

fetchPlayListDetail();
</script>

<style scoped lang="scss">
.content-box {
  margin-bottom: 20px;
  display: flex;
  .info {
    margin-left: 40px;
    padding: 10px 0;
    display: flex;
    flex-direction: column;
    .title {
      font-size: 30px;
      font-weight: bold;
      flex: 1;
    }
    .other-info {
      flex: 2;
      .creator {
        display: flex;
        align-items: center;
        font-size: 20px;
        > * {
          margin-right: 10px;
        }
        .create-time {
          color: rgba($color: #000000, $alpha: 0.5);
        }
      }
      .count {
        margin-top: 20px;
        font-size: 16px;
        display: flex;
        color: rgba($color: #000000, $alpha: 0.6);
        > * {
          margin-right: 20px;
        }
      }
      .description {
        padding-right: 10px;
        line-height: 30px;
        max-height: 90px;
        margin-top: 20px;
        font-size: 18px;
        overflow-y: scroll;
      }
    }
  }
}
</style>
