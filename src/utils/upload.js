import axios from "axios";
import {Loading} from "element-ui";
//正常上传
const upload = (url, data, headers) => {
  return new Promise((resolve, reject) => {
    axios({
      url,
      method: "put",
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
const uploadByPieces = async (url, params) => {
  const file = params.file
  // 上传过程中用到的变量
  const chunkSize = 5 * 1024 * 1024; // 5MB一片
  const chunkCount = Math.ceil(file.size / chunkSize); // 总片数
  // 获取当前chunk数据
  const getChunkInfo = (file, index) => {
    let start = index * chunkSize;
    let end = Math.min(file.size, start + chunkSize);
    let chunk = file.slice(start, end);
    return {start, end, chunk};
  };
  // 分片上传接口
  const uploadChunk = (data) => {
    return new Promise((resolve, reject) => {
      axios({
        url,
        method: "put",
        data,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }).then(res => {
        return resolve(res.data)
      }).catch(err => {
        return reject(err)
      })
    })
  }
  // 针对单个文件进行chunk上传
  const readChunk = (index) => {
    const {chunk} = getChunkInfo(file, index);
    let fetchForm = new FormData();
    fetchForm.append("chunk", chunk);
    fetchForm.append("index", index);
    fetchForm.append("chunkTotal", chunkCount);
    return uploadChunk(fetchForm)
  };
  // 针对每个文件进行chunk处理
  const promiseList = []
  try {
    for (let index = 0; index < chunkCount; ++index) {
      promiseList.push(readChunk(index))
    }
    return await Promise.all(promiseList)
  } catch (e) {
    return e
  }
}

async function uploadFile(file, params) {
  // data是上传时附带的额外参数，file是文件
  // 上传文件接口
  let url = "/api/" + params['bucketName'] + '/' + params['key'] + '?originName=' + params['originName']
  let loadingInstance = Loading.service({
    text: "正在上传文件，请稍后...",
  });
  try {
    // 如果文件小于5MB，直接上传
    if (file.size < 5 * 1024 * 1024) {
      let formData = new FormData();
      for (let key in params) {
        formData.append(key, params[key]);
      }
      formData.append("file", file);

      const res = await upload(url, formData);
      loadingInstance.close();
      return res;
    } else {
      // 如果文件大于等于5MB，分片上传
      params.file = file;
      const res = await uploadByPieces(url, params);
      loadingInstance.close();
      return res;
    }
  } catch (e) {
    loadingInstance.close();
    return e;
  }
}

export {upload, uploadByPieces, uploadFile}