<template>
  <el-upload
      ref="uploader"
      with-credentials
      multiple
      class="avatar-uploader"
      action="#"
      :auto-upload="true"
      :show-file-list="true"
      :http-request="requestUploadFile"
      :before-upload="beforeUpload">
    <div slot="trigger">
      <span style="margin: 0 20px;font-size: 12px" v-show="uploading">
        上传进度：
        <el-progress :text-inside="true" :stroke-width="18" :percentage="uploadPercent" status="success" style="display: inline-block;width: 200px"></el-progress>
      </span>
      <slot></slot>
    </div>
  </el-upload>
</template>

<script>
import {uploadFile} from "@/utils/upload";
import MD5 from "@/utils/MD5Util";

export default {
  name: "Uploader",
  props: ['bucketName'],
  data() {
    return {
      file: null,
      uploading: false,
      uploadPercent: 0,
    }
  },
  mounted() {
    this.$bus.$on(['uploadProcess'], pageData => {
      if (!pageData.success) {
        this.$message.error('上传失败')
        this.$refs.uploader.clearFiles()
        this.file = null
        return
      }
      this.uploadPercent = pageData.percent
      if (pageData.finished) {
        this.$message.success('上传成功')
        this.$emit('successUploadFinish')
        this.$refs.uploader.clearFiles()
        this.file = null
        setTimeout(() => {
          this.uploading = false
        }, 1000)
      }
    })
  },
  beforeDestroy() {
    this.$bus.$off(['uploadProcess'])
  },
  methods: {
    beforeUpload(file) {
      this.file = file
    },
    requestUploadFile(e) {
      if (this.file != null) {
        this.uploading = true
        uploadFile(this.file, {
          bucketName: this.bucketName,
          originName: this.file.name,
          key: MD5.hex_md5(this.bucketName + this.file.name + new Date().getTime()).substring(0, 8)
        })
      } else {
        this.$message.warning("请先选择要上传的文件");
      }
    },
  }
}
</script>

<style scoped>
.avatar-uploader {
  display: inline-block;
}

/deep/ .el-upload-list {
  display: none;
}
</style>