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
      file: null
    }
  },
  mounted() {
    this.$bus.$on(['uploadFinish'], (success) => {
      if (success) {
        this.$message.success('上传成功')
        this.$emit('successUploadFinish')
      } else {
        this.$message.error('上传失败')
      }
      this.$refs.uploader.clearFiles()
      this.file = null
    })
  },
  beforeDestroy() {
    this.$bus.$off(['uploadFinish'])
  },
  methods: {
    beforeUpload(file) {
      this.file = file
    },
    requestUploadFile(e) {
      if (this.file != null) {
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