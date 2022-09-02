<template>
  <div class="home">
    <el-form ref="form" :model="form" label-width="80px" inline size="mini">
      <el-form-item label="文件桶">
        <el-input v-model="form.name" clearable></el-input>
      </el-form-item>

      <el-form-item label="创建时间">
        <el-date-picker
            type="daterange"
            value-format="yyyy-MM-dd HH:mm:ss"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            v-model="form.dates">
        </el-date-picker>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="search(1)">搜索</el-button>
        <el-button @click="reset">重置</el-button>
        <el-button type="success" @click="create">新建</el-button>
      </el-form-item>
    </el-form>

    <el-table
        stripe
        :header-cell-style="{'text-align':'center'}"
        :cell-style="{'text-align':'center'}"
        :data="buckets"
        class="buckets">
      <!-- 自定义索引名称 -->
      <el-table-column label="序号" type="index" width="60"></el-table-column>

      <!-- 文件桶名称 -->
      <el-table-column label="文件桶" property="bucketName" width="200"></el-table-column>

      <!-- 桶位置 -->
      <el-table-column label="桶位置" property="location"></el-table-column>

      <!-- 文件总数 -->
      <el-table-column label="文件总数" property="total" width="80"></el-table-column>

      <!-- 创建时间 -->
      <el-table-column label="创建时间" property="createTime" width="200"></el-table-column>

      <!-- 操作 -->
      <el-table-column label="操作" width="240">
        <template slot-scope="{row}">
          <el-button size="mini" icon="el-icon-view" title="查看" @click="viewBucket(row)"></el-button>
          <el-button size="mini" icon="el-icon-upload" title="上传文件"></el-button>
          <el-button size="mini" icon="el-icon-delete" title="删除"></el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页组件 -->
    <Page :total="total" :page-size.sync="pageSize"
          @pageNumChangeHandler="pageNumChange"
          @pageSizeChangeHandler="pageSizeChange"></Page>

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
      pageNum: 1,
      pageSize: 10,
      form: {
        name: '',
        dates: []
      }
    }
  },
  created() {
    this.search(1)
  },
  methods: {
    reset() {
      this.form.name = ''
      this.form.dates = []
    },
    create() {

    },
    search(pageNum) {
      this.pageNum = pageNum
      queryBuckets(this.form.name, this.form.dates, pageNum, this.pageSize).then(resp => {
        this.buckets = resp.buckets
        this.total = resp.total
      })
    },
    pageNumChange(pageNum) {
      this.search(pageNum)
    },
    pageSizeChange(pageSize) {
      this.pageSize = pageSize
      this.search(this.pageNum)
    },
    viewBucket(bucket) {
      this.$router.push({
        name: 'objects',
        params: {
          bucketName: bucket.bucketName,
        }
      })
    }
  }
}
</script>
<style scoped lang="less">

</style>