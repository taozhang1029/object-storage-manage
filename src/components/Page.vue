<template>
  <el-pagination
      background
      :total="total"
      :page-size="pageSize"
      :hide-on-single-page="hideOnSinglePage"
      @size-change="$emit('pageSizeChangeHandler',$event)"
      @current-change="$emit('pageNumChangeHandler',$event)"
      layout="sizes, prev, pager, next,total"
      style="text-align: right; margin-top: 15px">
  </el-pagination>
</template>

<script>
export default {
  name: "Page",
  props: ['total', 'pageSize', 'hideOnSinglePage']
}
</script>

<style scoped lang="less">
::v-deep .el-pagination.is-background .el-pager {
  li:not(.disabled).active {
    background-color: #ec4141;
  }

  li:not(.disabled).active:hover {
    color: white;
  }

  li:not(.disabled):hover {
    color: #353535;
  }
}
</style>