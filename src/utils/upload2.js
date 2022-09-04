//断点分片上传
function uploadByPieces({ file, pieceSize = 5, success, error }) {
  // 上传过程中用到的变量
  let fileMD5 = ""; // md5加密文件的标识
  const chunkSize = pieceSize * 1024 * 1024; // 分片大小
  const chunkCount = Math.ceil(file.size / chunkSize); // 总片数

  //得到某一片的分片
  const getChunkInfo = (file, currentChunk, chunkSize) => {
    let start = currentChunk * chunkSize;
    let end = Math.min(file.size, start + chunkSize);
    return file.slice(start, end);
  };

  // 第一步
  const readFileMD5 = () => {
    // 读取视频文件的md5
    console.log("获取文件的MD5值");
    //得到第一片和最后一片
    const startChunk = getChunkInfo(file, 0, chunkSize);
    const endChunk = getChunkInfo(file, chunkCount - 1, chunkSize);
    console.log(startChunk, endChunk);
    //对第一片进行转码然后md5加密，网上很多是直接对整个文件转码加密得到标识，但是我发现大文件尤其是几个G的文件会崩溃，所以我是先分片然后取第一片加密
    let fileRederInstance = new FileReader();
    fileRederInstance.readAsBinaryString(startChunk);
    fileRederInstance.addEventListener("load", (e) => {
      let fileBolb = e.target.result;
      fileMD5 = md5(fileBolb);
      //检查文件有没有上传过的状态
      uploadCheckAxios({ identifier: fileMD5, totalChunks: chunkCount })
        .then((res) => {
          if (res.data.needMerge) {
            console.log("文件都已上传，现在需要合并");
            //调用合并接口，合并接口后端做了异步处理不然会超时
            let time = new Date().getTime();
            mergeFileAxios({
              name: this.form.name,
              subjectName: this.form.subjectName,
              teacherName: this.form.teacherName,
              categoryId: this.form.categoryId,
              description: this.form.description,
              identifier: fileMD5,
              totalSize: file.size,
              filename: time + "_" + file.name,
            })
              .then((res) => {
                console.log("文件合并成功");
                success && success(res);
              })
              .catch((e) => {
                console.log(e, "文件合并错误");
                error && error(e);
              });
          } else {
            //这里很多博客都是直接for循环，可我实际联调发现for循环不等返回，虽然上传对顺序没影响但是很多分片其实是超时了会上传失败，所以我处理成数组，从需要上传的数组第一个分片上传有了返回后就从前面删掉数组元素直到数组为[]
            //文件未被上传
            if (res.data.status === 0) {
              console.log("文件未被上传");
              //整理需要上传的分片的数组
              let needUploadList = [];
              for (let i = 0; i < chunkCount; i++) {
                needUploadList.push(i);
              }
              console.log(needUploadList);
              readChunkMD5(needUploadList);
            }
            //文件已被上传过一部分
            else {
              let arr = res.data.uploaded;
              //如果上传过，进度条开始的数据要计算一下
              let per = 100 / chunkCount;
              this.percentage = Number((arr.length * per).toFixed(2));
              console.log(this.percentage);
              console.log(arr);
              let needUploadList = [];
              console.log("文件已被上传过一部分");
              //整理需要上传的分片的数组
              for (let i = 0; i < chunkCount; i++) {
                if (!arr.includes(i)) {
                  needUploadList.push(i);
                }
              }
              console.log(needUploadList);
              readChunkMD5(needUploadList);
            }
          }
        })
        .catch((e) => {
          error && error(e);
        });
    });
  };

  // 针对每个分片文件进行上传处理
  const readChunkMD5 = (needUploadList) => {
    if (needUploadList.length > 0) {
      let i = needUploadList[0];
      console.log(i);
      //得到当前需要上传的分片文件
      const chunk = getChunkInfo(file, i, chunkSize);
      let fetchForm = new FormData();
      //后端需要的参数
      fetchForm.append("chunkNumber", i);
      fetchForm.append("chunkSize", chunkSize);
      fetchForm.append("currentChunkSize", chunk.size);
      fetchForm.append("file", chunk);
      fetchForm.append("filename", fileMD5 + "-" + i);
      fetchForm.append("identifier", fileMD5);
      fetchForm.append("totalChunks", chunkCount);
      fetchForm.append("totalSize", file.size);
      //上传接口
      uploadVideoChunkAxios(fetchForm)
        .then((res) => {
          console.log(res);
          //都上传了，等待合并
          if (res.data === true) {
            console.log("文件开始合并");
            let time = new Date().getTime();
            mergeFileAxios({
              name: this.form.name,
              subjectName: this.form.subjectName,
              teacherName: this.form.teacherName,
              categoryId: this.form.categoryId,
              description: this.form.description,
              identifier: fileMD5,
              totalSize: file.size,
              filename: time + "_" + file.name,
            })
              .then((res) => {
                console.log("文件合并成功");
                success && success(res);
              })
              .catch((e) => {
                console.log(e, "文件合并错误");
                error && error(e);
              });
          } else {
            //每上传一个就在进度条上加数据
            let per = 100 / chunkCount;
            console.log(per, this.percentage);
            let totalPrecent = Number((this.percentage + per).toFixed(2));
            if (totalPrecent > 100) {
              this.percentage === 100;
            } else {
              this.percentage = totalPrecent;
            }
            console.log(this.percentage);
            let newArr = JSON.parse(JSON.stringify(needUploadList));
            if (newArr.length > 0) {
              newArr.shift();
              readChunkMD5(newArr);
            }
          }
        })
        .catch((e) => {
          error && error(e);
        });
    } else {
      console.log("上传结束");
    }
  };

  readFileMD5(); // 开始执行代码
}