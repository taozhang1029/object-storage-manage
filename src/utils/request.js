import axios from 'axios'
import Vue from "vue";
import fileDownload from "js-file-download";

// 允许携带cookie
axios.defaults.withCredentials = true

// 是否取消重复请求开关
const cancelDuplicated = true

// 存储每个请求中的map
const pendingXHRMap = new Map()

// 取消请求类型定义 便于后期对此类型不做异常处理
const REQUEST_TYPE = {
  DUPLICATED_REQUEST: 'duplicatedRequest'
}

const duplicatedKeyFn = (config) => {
  let {
    method,
    url,
    params,
    data
  } = config;
  // axios中取消请求及阻止重复请求的方法
  // 参数相同时阻止重复请求：
  return [method, url, JSON.stringify(params), JSON.stringify(data)].join("&");
  // 请求方法相同，参数不同时阻止重复请求
  // return [method, url].join("&");
}

const addPendingXHR = (config) => {
  if (!cancelDuplicated) {
    return
  }
  const duplicatedKey = JSON.stringify({
    duplicatedKey: duplicatedKeyFn(config),
    type: REQUEST_TYPE.DUPLICATED_REQUEST
  })
  config.cancelToken = config.cancelToken || new axios.CancelToken((cancel) => {
    if (duplicatedKey && !pendingXHRMap.has(duplicatedKey)) {
      pendingXHRMap.set(duplicatedKey, cancel)
    }
  })
}

const removePendingXHR = (config) => {
  if (!cancelDuplicated) {
    return
  }
  const duplicatedKey = JSON.stringify({
    duplicatedKey: duplicatedKeyFn(config),
    type: REQUEST_TYPE.DUPLICATED_REQUEST
  })
  if (duplicatedKey && pendingXHRMap.has(duplicatedKey)) {
    const cancel = pendingXHRMap.get(duplicatedKey)
    cancel(duplicatedKey)
    pendingXHRMap.delete(duplicatedKey)
  }
}

const request = axios.create({
  // baseURL: process.env.NODE_ENV === 'production' ? "http://storage.kingsley.com/" : "/api",
  baseURL: process.env.NODE_ENV === 'production' ? "/" : "/api",
  withCredentials: true,
  // timeout: 5000
})

//添加请求拦截器
request.interceptors.request.use(function (config) {
  // 处理重复请求
  removePendingXHR(config)
  addPendingXHR(config)
  //在发送请求之前做某事
  if (!config.params) {
    config.params = {}
  }
  config.params.t = Date.now()
  return config
}, function (error) {
  //请求错误时做些事
  return Promise.reject(error)
})

// 注册响应拦截器
// Add a response interceptor
request.interceptors.response.use(
  response => {
    // 获取响应头信息
    const headers = response.headers;
    // 判断请求头中数据是不是json格式数据
    let reg = RegExp(/application\/json/);
    if (headers["content-type"] && headers["content-type"].match(reg)) {
      return response.data
    } else {
      // 获取响应中返回的字符串
      //   console.log(headers["content-disposition"]);
      let fileName = headers["content-disposition"]
        .split(";")[1]
        .split("filename=")[1];
      let contentType = headers["content-type"];
      // 使用下面的方法解析响应的数据
      fileName = decodeURIComponent(fileName);
      fileDownload(response.data, fileName, contentType);
    }
  },
  error => {
    // 如果是取消请求类型则忽略异常处理
    let isDuplicatedType
    try {
      const errorType = (JSON.parse(error.message) || {}).type
      isDuplicatedType = errorType === REQUEST_TYPE.DUPLICATED_REQUEST
    } catch (error) {
      isDuplicatedType = false
    }
    if (!isDuplicatedType) {
      // 其他异常处理
      if (error.message.indexOf("timeout") !== -1) {
        Vue.prototype.$message.error("请求超时")
      } else {
        Vue.prototype.$message.error(error.message)
      }

      return Promise.reject(error)
    }
  })

export default request