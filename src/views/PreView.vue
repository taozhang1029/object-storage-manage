<template>
  <iframe :src="resourceUrl"
          width="100%"
          :height="iframeH"
          :frameborder="0"
          :scrolling="'yes'"
          ref="iframe"
          class="iframe">
  </iframe>
</template>

<script>

export default {
  name: "PreView",
  date() {
    return {
      resourceUrl: null,
      iframeH: 0
    }
  },
  created() {
    this.resourceUrl = (process.env.NODE_ENV === 'production' ? "" : "/api") + '/getObj/' + this.$route.params.bucketName + '/' + this.$route.params.objectKey
  },
  mounted() {
    let timer = setTimeout(() => {
      // 必须在页面加载完成之后获取高
      this.$nextTick(() => {
        // iframe自适应高
        // this.iframeH = this.$refs.iframe.contentWindow.document.documentElement.scrollHeight || this.$refs.iframe.contentWindow.document.body.scrollHeight
        // console.log(this.$root.$refs.contentContainer);
        this.$root.$children[0].$children[0].$children[1].$ELEMENT.padding = 0
      })
    }, 300)
    // 清除定时器
    this.$once('hook:beforeDestroy', () => {
      clearInterval(timer);
      timer = null;
    })
  },
  methods: {}
}
</script>

<style scoped>
.iframe {
  width: 100%;
  height: 100%;
}
</style>