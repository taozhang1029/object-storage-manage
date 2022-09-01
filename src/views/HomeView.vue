<template>
  <div class="home">
    <el-form ref="form" :model="form" label-width="80px" inline size="mini">
      <el-form-item label="文件桶">
        <el-input v-model="form.name" clearable></el-input>
      </el-form-item>

      <el-form-item label="创建时间">
        <el-date-picker
            type="daterange"
            value-format="yyyy-MM-dd"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            v-model="form.dates">
        </el-date-picker>
      </el-form-item>

      <el-form-item>
        <el-button type="primary">搜索</el-button>
        <el-button @click="reset">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table
        stripe
        :header-cell-style="{'text-align':'center'}"
        :cell-style="{'text-align':'center'}"
        :data="buckets"
        class="select-disabled buckets">
      <!-- 自定义索引名称 -->
      <el-table-column label="序号" type="index" width="60"></el-table-column>

      <!-- 文件桶名称 -->
      <el-table-column label="文件桶" property="bucketName" width="300"></el-table-column>

      <!-- 创建时间 -->
      <el-table-column label="创建时间" property="createTime" width="200"></el-table-column>

      <!-- 桶位置 -->
      <el-table-column label="桶位置" property="location"></el-table-column>

      <!-- 操作 -->
      <el-table-column label="操作" width="160">
        <template slot-scope="{row}">
          <el-button size="mini">修改</el-button>
          <el-button size="mini">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页组件 -->
    <Page :total="total" :page-size="pageSize"></Page>

  </div>
</template>

<script>
import {queryBuckets} from "@/api";
import Page from "@/components/Page";

export default {
  name: 'HomeView',
  components: {Page},
  data() {
    return {
      buckets: [],
      total: 0,
      pageSize: 10,
      form: {
        name: '',
        dates: []
      }
    }
  },
  created() {
    queryBuckets().then(resp => {
      this.buckets = resp.buckets
    })
  },
  methods: {
    pageNumChangeHandler(pageNum) {

    },
    reset() {
      this.form.name = ''
      this.form.dates = []
    }
  }
}
</script>
<style scoped lang="less">

</style>