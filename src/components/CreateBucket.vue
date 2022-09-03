<template>
  <el-dialog :visible="visible" :title="title">
    <div slot="title">
      <slot name="title"></slot>
    </div>
    <div slot="footer">
      <slot name="footer"></slot>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: "Dialog",
  props: ['visible','title']
}
</script>

<style scoped>

</style>