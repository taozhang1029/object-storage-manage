<template>
  <div class="objects">
    <el-form ref="form" :model="form" label-width="70px" inline size="mini">
      <el-form-item>
        <h2>{{ bucketName }}</h2>
      </el-form-item>

      <el-form-item label="key">
        <el-input v-model="form.key" clearable></el-input>
      </el-form-item>

      <el-form-item label="文件名">
        <el-input v-model="form.name" clearable></el-input>
      </el-form-item>

      <el-form-item label="上传时间">
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
      </el-form-item>
    </el-form>

    <el-table
        stripe
        size="small"
        :header-cell-style="{backgroundColor: '#ece8e8', color: 'black'}"
        :data="objects"
        class="buckets">
      <!-- 自定义索引名称 -->
      <el-table-column label="序号" type="index" width="60"></el-table-column>

      <!-- 文件key -->
      <el-table-column label="key" property="key" width="200"></el-table-column>

      <!-- 文件名 -->
      <el-table-column label="文件名">
        <template slot-scope="{row}">
          <div class="text-inline-show">{{row.originName}}</div>
        </template>
      </el-table-column>

      <!-- 文件类型 -->
      <el-table-column label="文件类型" property="headers.type"></el-table-column>

      <!-- 文件大小 -->
      <el-table-column label="文件大小" property="headers.size"></el-table-column>

      <!-- 创建时间 -->
      <el-table-column label="上传时间" property="createTime" width="200"></el-table-column>

      <!-- 操作 -->
      <el-table-column label="操作" width="180">
        <template slot-scope="{row}">
          <el-button size="mini" icon="el-icon-view" title="查看" @click="viewObject(row)"></el-button>
          <el-button size="mini" icon="el-icon-download" title="下载" @click="downloadFile(row)"></el-button>
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
import Page from "@/components/Page";
import {download, queryObjects} from "@/api";

export default {
  name: "ObjectListView",
  components: {Page},
  props: ['bucketName'],
  data() {
    return {
      objects: [],
      total: 0,
      pageNum: 1,
      pageSize: 10,
      form: {
        key: '',
        name: '',
        dates: []
      }
    }
  },
  mounted() {
    this.search(1)
  },
  methods: {
    reset() {
      this.form.name = ''
      this.form.dates = []
    },
    downloadFile(object) {
      download(this.bucketName, object.key)
    },
    viewObject(object){

    },
    search(pageNum) {
      this.pageNum = pageNum
      queryObjects(this.bucketName, this.form.dates, pageNum, this.pageSize).then(page => {
        this.objects = page.content
        this.total = page.total
      })
    },
    pageNumChange(pageNum) {
      this.search(pageNum)
    },
    pageSizeChange(pageSize) {
      this.pageSize = pageSize
      this.search(this.pageNum)
    },
  }
}
</script>

<style scoped>

</style>