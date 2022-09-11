<template>
  <div class="home">
    <el-dialog :visible.sync="createVisible" title="创建文件桶" width="30%">
      <el-form ref="createForm" :model="createForm" :rules="createFormRules" label-width="80px">
        <el-form-item label="文件桶" prop="name">
          <el-input v-model="createForm.name" clearable placeholder="请输入文件桶名称"></el-input>
        </el-form-item>
        <el-form-item label="存储路径" prop="location">
          <el-input v-model="createForm.location" clearable placeholder="请输入存储路径，以 / 开头"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="requestCreateBucket('createForm')">立即创建</el-button>
          <el-button @click="createVisible=false">取消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>

    <el-dialog :visible.sync="deleteVisible">
      <span slot="title">
        <i class="el-icon-warning red">&nbsp;&nbsp;警告</i>
      </span>
      <div class="horizontal-center">确定要删除 {{ (currBucket && currBucket.bucketName) }} 吗?
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="deleteVisible = false">取 消</el-button>
        <el-button type="primary" @click="requestDeleteBucket">确 定</el-button>
      </span>
    </el-dialog>

    <el-form ref="form" :model="filterForm" label-width="80px" inline size="mini">
      <el-form-item label="文件桶">
        <el-input v-model="filterForm.name" clearable placeholder="请输入文件桶名称关键字"></el-input>
      </el-form-item>

      <el-form-item label="创建时间">
        <el-date-picker
            type="daterange"
            value-format="yyyy-MM-dd HH:mm:ss"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            v-model="filterForm.dates">
        </el-date-picker>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="search(1)">搜索</el-button>
        <el-button @click="reset">重置</el-button>
        <el-button type="success" @click="createVisible=true">新建</el-button>
        <span style="margin-left: 20px;font-size: 12px" v-show="uploading">
          上传进度：
          <el-progress :text-inside="true" :stroke-width="18" :percentage="uploadPercent" status="success" style="display: inline-block;width: 200px"></el-progress>
        </span>
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
          <div class="operations">
            <el-button size="mini" icon="el-icon-view" title="查看" @click="viewBucket(row)"></el-button>
            <el-upload
                :ref="'uploader'+row.bucketName"
                with-credentials
                class="avatar-uploader"
                action="#"
                :auto-upload="true"
                :show-file-list="true"
                :http-request="requestUploadFile"
                :before-upload="beforeUpload">
              <el-button slot="trigger" size="mini" icon="el-icon-upload" title="上传文件" @click="targetBucket = row"></el-button>
            </el-upload>
            <el-button size="mini" icon="el-icon-delete" title="删除" @click="currBucket=row;deleteVisible=true"></el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页组件 -->
    <Page :total="total" :page-size.sync="pageSize" @pageNumChangeHandler="pageNumChange" @pageSizeChangeHandler="pageSizeChange"></Page>

  </div>
</template>

<script>
import {createBucket, deleteBucket, existsBucket, queryBuckets} from "@/api";
import Page from "@/components/Page";
import {uploadFile} from "@/utils/upload";
import MD5 from "@/utils/MD5Util";

export default {
  name: 'HomeView',
  components: {Page},
  data() {
    // 校验路径格式
    const reg = new RegExp('^(\\/[\u4E00-\u9FA5A-Za-z0-9_]+)+$')
    const validateLocationFormat = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入存储路径'))
      } else if (!reg.test(value)) {
        callback(new Error('存储路径非法，必须符合文件路径格式，并以 / 开头'))
      }
      callback();
    };
    const validateBucketExist = (rule, value, callback) => {
      if (!value || value.length < 3 || value.length > 20) {
        return
      }
      existsBucket(value).then(exist => {
        if (exist) {
          callback(new Error('文件桶已存在'))
        } else {
          callback()
        }
      })
    };
    return {
      uploading: false,
      uploadPercent: 0,
      targetBucket: null,
      file: null,
      currBucket: null,
      createVisible: false,
      deleteVisible: false,
      buckets: [],
      total: 0,
      pageNum: 1,
      pageSize: 10,
      createForm: {
        name: '',
        location: ''
      },
      createFormRules: {
        name: [
          {required: true, message: '请输入文件桶名称', trigger: 'blur'},
          {min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur'},
          {validator: validateBucketExist, trigger: 'change'},
          {validator: validateBucketExist, trigger: 'blur'}
        ],
        location: [
          {required: true, message: '请输入存储路径', trigger: 'blur'},
          {validator: validateLocationFormat, trigger: 'blur'}
        ]
      },
      filterForm: {
        name: '',
        dates: []
      }
    }
  },
  created() {
    this.search(1)
  },
  mounted() {
    this.$bus.$on(['uploadProcess'], pageData => {
      if (!pageData.success) {
        this.$message.error('上传失败')
        this.$refs['uploader' + this.targetBucket.bucketName].clearFiles()
        this.file = null
        return
      }
      this.uploadPercent = pageData.percent
      if (pageData.finished) {
        this.$message.success('上传成功')
        this.$refs['uploader' + this.targetBucket.bucketName].clearFiles()
        this.file = null
        this.search(this.pageNum)
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
    reset() {
      this.filterForm.name = ''
      this.filterForm.dates = []
    },
    search(pageNum) {
      this.pageNum = pageNum
      queryBuckets(this.filterForm.name, this.filterForm.dates, pageNum, this.pageSize).then(resp => {
        this.buckets = resp.buckets
        this.total = resp.total
      })
    },
    pageNumChange(pageNum) {
      this.search(pageNum)
    },
    pageSizeChange(pageSize) {
      this.pageSize = pageSize
      this.search(1)
    },
    requestDeleteBucket() {
      if (!this.currBucket) {
        return
      }
      deleteBucket(this.currBucket.bucketName).then(success => {
        if (success) {
          this.$message.success("删除成功")
          this.search(this.pageNum)
          this.deleteVisible = false
        } else {
          this.$message.error("删除失败")
        }
      })
    },
    requestCreateBucket(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          createBucket(this.createForm.name, this.createForm.location).then(success => {
            if (success) {
              this.$message.success("创建成功")
              this.createVisible = false
              this.search(1)
            } else {
              this.$message.error("创建失败")
            }
          })
        } else {
          return false;
        }
      });
    },
    beforeUpload(file) {
      this.file = file
    },
    requestUploadFile(e) {
      if (this.file != null) {
        this.uploading = true
        uploadFile(this.file, {
          bucketName: this.targetBucket.bucketName,
          originName: this.file.name,
          key: MD5.hex_md5(this.targetBucket.bucketName + this.file.name + new Date().getTime()).substring(0, 8)
        })
      } else {
        this.$message.warning("请先选择要上传的文件");
      }
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
.operations {
  .el-button {
    margin-right: 5px
  }

  .el-button:last-child {
    margin-right: 0
  }

  .avatar-uploader {
    display: inline-block;
  }
}
</style>