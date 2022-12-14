<template>
  <div class="objects">
    <el-dialog :visible.sync="visible">
      <span slot="title">
        <i class="el-icon-warning red">&nbsp;&nbsp;警告</i>
      </span>
      <div class="horizontal-center">确定要删除 {{ (currObj && currObj.key) }} - {{ (currObj && currObj.originName) }} 吗?
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="visible = false">取 消</el-button>
        <el-button type="primary" @click="deleteFile">确 定</el-button>
      </span>
    </el-dialog>

    <el-form ref="form" :model="form" label-width="60px" inline size="mini">
      <el-form-item>
        <h2>{{ bucketName }}</h2>
      </el-form-item>

      <el-form-item label="key:">
        <el-input v-model="form.key" clearable @keyup.enter="search(1)"></el-input>
      </el-form-item>

      <el-form-item label="文件名:">
        <el-input v-model="form.name" clearable @keyup.enter="search(1)"></el-input>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="search(1)">搜索</el-button>
        <el-button @click="reset">重置</el-button>
        <el-button @click="$router.push({name: 'home'})">返回</el-button>
        <el-button @click="batchSelect = !batchSelect" class="el-icon-menu">
          {{ batchSelect ? '取消' : '批量管理' }}
        </el-button>
        <el-button @click="deleteVisible = true" class="el-icon-delete-solid" style="color: red" v-show="batchSelect && selections.length">
          批量删除
        </el-button>
      </el-form-item>

      <el-form-item class="right">
        <Uploader :bucket-name="bucketName" @successUploadFinish="search(1)">
          <el-button type="success">上传</el-button>
        </Uploader>
      </el-form-item>
    </el-form>

    <el-table
        stripe
        size="small"
        @selection-change="handleSelectionChange"
        :header-cell-style="{backgroundColor: '#ece8e8', color: 'black'}"
        :data="objects"
        class="buckets">

      <el-table-column
          v-if="batchSelect"
          type="selection"
          width="55">
      </el-table-column>

      <!-- 自定义索引名称 -->
      <el-table-column label="序号" type="index" width="60"></el-table-column>

      <!-- 文件key -->
      <el-table-column label="key" property="key" width="200"></el-table-column>

      <!-- 文件名 -->
      <el-table-column label="文件名">
        <template slot-scope="{row}">
          <div class="text-inline-show" :title="row.originName">{{ row.originName }}</div>
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
          <el-button size="mini" icon="el-icon-delete" title="删除" @click="currObj=row;visible=true"></el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页组件 -->
    <Page :total="total" :page-size.sync="pageSize"
          @pageNumChangeHandler="pageNumChange"
          @pageSizeChangeHandler="pageSizeChange">
    </Page>

    <el-dialog title="删除文件" :visible.sync="deleteVisible" width="30%">
      您确定要删除所选文件吗？
      <span slot="footer" class="dialog-footer">
        <el-button @click="deleteVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirmBatchDelete">确 定</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>
import Page from "@/components/Page";
import {batchDelete, deleteObject, download, queryObjects} from "@/api";
import Uploader from "@/components/Uploader";

export default {
  name: "ObjectListView",
  components: {Uploader, Page},
  props: ['bucketName',],
  data() {
    return {
      deleteVisible: false,
      batchSelect: false,
      selections: [],
      currObj: null,
      visible: false,
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
    handleSelectionChange(val) {
      this.selections = val
    },
    reset() {
      this.form.name = ''
      this.form.dates = []
    },
    downloadFile(object) {
      download(this.bucketName, object.key)
    },
    confirmBatchDelete() {
      const keys = this.selections.map(item => item.key)
      batchDelete(this.bucketName, keys).then(success => {
        if (success) {
          this.deleteVisible = false
          this.$message.success('批量删除成功')
          this.search(1)
        } else {
          this.$message.success('批量删除失败，请稍后再试！')
        }
      })
    },
    deleteFile() {
      if (!this.currObj) {
        return
      }
      deleteObject(this.bucketName, this.currObj.key).then(resp => {
        if (resp) {
          this.$message.success('删除成功')
          this.visible = false
          this.search(this.pageNum)
        } else {
          this.$message.error('删除失败')
        }
      })
    },
    viewObject(object) {
      console.log(object)
      this.$router.push({
        name: 'object',
        params: {
          bucketName: object.bucket,
          objectKey: object.key,
        }
      })
      // getDownloadLink(object.bucket, object.key).then(resp => {
      //   if (resp) {
      //     this.$router.push({
      //       name: 'object',
      //       query: {
      //         resource: resp['url']
      //       },
      //       params: {
      //         bucketName: object.bucket,
      //         objectKey: object.key,
      //       }
      //     })
      //   }
      // })
    },
    search(pageNum) {
      this.pageNum = pageNum
      queryObjects(this.bucketName, this.form.key, this.form.name, this.form.dates, pageNum, this.pageSize).then(page => {
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