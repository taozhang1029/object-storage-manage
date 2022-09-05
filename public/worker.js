function FormAjax_Sync(data, url, success) {
  let xmlHttp = new XMLHttpRequest();
  xmlHttp.open("post", url, false);
  xmlHttp.onreadystatechange = function () {
    if (xmlHttp.status === 200) {
      let result = JSON.parse(this.responseText);
      let status = this.status
      success(result, status);
    }
  };
  xmlHttp.send(data);
}

/**
 * 响应主线程发过来的数据进行处理
 * @param evt
 */
onmessage = function (evt) {
  let params = evt.data;
  console.log(params)
  // 传递的参数
  const file = params.file
  const fileSize = params.fileSize
  const chunkSize = params.pageData.chunkSize
  const chunkCount = params.pageData.chunkCount
  let start = 0;
  let end;
  let index = 0;
  let startTime = new Date().getTime();
  while (start < fileSize) {
    end = start + chunkSize;
    if (end > fileSize) {
      end = fileSize;
    }
    let chunk = file.slice(start, end); // 切割文件
    let formData = new FormData();
    formData.append("bucketName", params.bucketName);
    formData.append("key", params.key);
    formData.append("originalFilename", params.originName);
    formData.append("fileTotalSize", params.fileSize);
    formData.append("file", chunk, params.originName);
    formData.append("fileMD5", params.fileMD5);
    formData.append("chunkCount", chunkCount + '')
    formData.append("chunkIndex", index + '');
    formData.append("chunkSize", (end - start) + '');
    //上传文件
    FormAjax_Sync(formData, params.uploadUrl, function (result, status) {
      let code = 0;
      let percent = 0;
      if (result.code === 0) {
        console.log("分片共" + chunkCount + "个" + ",已成功上传第" + index + "个")
        percent = parseInt((parseInt(formData.get("chunkIndex")) + 1) * 100 / chunkCount);
      } else {
        params.fileSize = -1;
        code = -1
        console.log("分片第" + index + "个上传失败")
      }
      self.postMessage({code: code, percent: percent});
    })
    start = end;
    index++;
  }
  console.log("上传分片总时间：" + (new Date().getTime() - startTime));
  console.log("分片完成");
}