module.exports = {
  // publicPath: "/static/",
  publicPath: "./",
  devServer: {
    headers: {
      "Access-Control-Allow-Origin": "*"
    },
    // hot: true, //热更新替换，更新页面
    port: "8081", // 端口号
    host: "localhost",// 指定要使用的主机IP,默认情况下这是localhost。
    open: false,   //自动启动浏览器
    compress: true, //为所服务的一切启用gzip压缩
    proxy: {
      '/api': {
        withCredentials: true,
        target: 'http://storage.kingsley.com/',
        ws: true,
        changeOrigin: true,
        pathRewrite: {
          '^/api': ''  // 重写路径
        }
      }
    }
  }
}