import axios from "axios";
import MD5 from "@/utils/MD5Util";
import {Loading} from "element-ui";
import Vue from "vue";

/**
 * 每个分片的大小
 * @type {number}
 */
const CHUNK_SIZE = 5 * 1024 * 1024

//正常上传
const upload = (url, data, headers) => {
  return new Promise((resolve, reject) => {
    axios({
      url,
      method: "post",
      data,
      headers: {
        ...headers,
        'Content-Type': 'multipart/form-data'
      }
    }).then(res => {
      return resolve(res.data)
    }).catch(err => {
      return reject(err)
    })
  })
}

//分片上传
async function uploadFile(file, {originName, bucketName, key}) {
  let loadingInstance = Loading.service({
    text: "正在上传文件，请稍后...",
  });
  try {
    // 如果文件小于5MB，直接上传
    if (file.size <= CHUNK_SIZE) {
      let formData = new FormData();
      formData.append("file", file);
      formData.append("originName", originName);
      formData.append("bucketName", bucketName);
      formData.append("key", key);
      const res = await upload('/api/uploadSingleChunk', formData);
      loadingInstance.close();
      Vue.prototype.$bus.$emit('uploadFinish', res)
    } else {
      // 如果文件大于等于5MB，分片上传
      await uploadByPieces('/api/uploadMultiChunk', {file: file, originName, bucketName, key});
      loadingInstance.close();
    }
  } catch (e) {
    loadingInstance.close();
    return e;
  }
}

function uploadByPieces(uploadUrl, {file, originName, bucketName, key}) {
  let fileSize = file.size;
  let pageData = {
    chunkSize: CHUNK_SIZE,
  }
  pageData.chunkCount = Math.ceil(fileSize / pageData.chunkSize);
  const fileMD5 = MD5.hex_md5(file.type + originName + fileSize)
  // console.log("计算文件MD：" + fileMD5);
  pageData.showProgress = true;
  let worker = new Worker('worker.js');
  let param = {
    uploadUrl,
    bucketName,
    key,
    originName,
    fileSize,
    fileMD5,
    pageData,
    file
  }

  worker.onmessage = function (event) {
    let workResult = event.data;
    if (workResult.code === 0) {
      pageData.percent = workResult.percent;
      if (workResult.percent === 100) {
        pageData.showProgress = false;
        worker.terminate();
      }
      if (workResult.chunkCount === workResult.index + 1) {
        Vue.prototype.$bus.$emit('uploadFinish', true)
      }
    } else {
      pageData.showProgress = false;
      worker.terminate();
      Vue.prototype.$bus.$emit('uploadFinish', false)
    }
  }
  worker.postMessage(param);
}

export {uploadFile}