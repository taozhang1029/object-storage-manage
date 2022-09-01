<template>
  <div id="app" style="height: 100%">
    <el-container>
      <el-header class="select-disabled">
        <img src="./assets/images/storage.svg" alt="">
        <h3>对象存储管理后台</h3>
      </el-header>
      <el-container style="height: 90%">
        <el-aside width="210px">
          <div class="route-item">
            <i class="el-icon-s-cooperation"></i>
            文件桶
          </div>
        </el-aside>
        <el-container>
          <el-main>
            <router-view/>
          </el-main>
          <el-footer height="35px">
            <a href="https://github.com/taozhang1029" target="_blank">
              <i class="iconfont icon-github"></i>
              版权所有 © Kingsley
            </a>
          </el-footer>
        </el-container>
      </el-container>
    </el-container>
  </div>
</template>
<style lang="less">
.el-header {
  position: relative;
  background-color: #0e0e0e;
  height: 10%;

  img {
    position: absolute;
    width: 30px;
    top: 50%;
    left: 10px;
    height: 30px;
    line-height: 30px;
    margin-top: -15px;
  }

  h3 {
    position: absolute;
    display: inline-block;
    color: #edeff1;
    top: 50%;
    left: 50px;
    height: 30px;
    line-height: 30px;
    margin-top: -15px;
  }
}

.el-container {
  height: 100%;
}

.el-aside {
  background-color: #0e0e0e;
  color: #edeff1;
  .route-item {
    padding-left: 20px;
    height: 60px;
    width: 100%;
    line-height: 60px;
    cursor: pointer;
    font-size: 18px;
    i {
      margin-right: 10px;
    }
    &:hover {
      background-color: #666363;
    }
  }
}

.el-main {
  overflow-y: auto;
}

.el-footer {
  width: 100%;
  text-align: center;
  font-size: 14px;
}
</style>