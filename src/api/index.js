import {http} from "@/utils/http";

/**
 * 查询桶列表
 * @param bucketName
 * @param dateRange
 * @param pageNum
 * @param pageSize
 * @returns {Promise<AxiosResponse<any>>}
 */
export function queryBuckets(bucketName, dateRange, pageNum, pageSize) {
  return http.get('/', {
    bucketName,
    startTime: (dateRange && dateRange.length > 0) ? dateRange[0] : null,
    endTime: (dateRange && dateRange.length > 1) ? dateRange[1] : null,
    pageNum,
    pageSize
  })
}

/**
 * 查询文件列表
 * @param bucketName
 * @param objectKey
 * @param originName
 * @param dateRange
 * @param pageNum
 * @param pageSize
 * @returns {Promise<AxiosResponse<any>>}
 */
export function queryObjects(bucketName, objectKey, originName, dateRange, pageNum, pageSize) {
  return http.get('/objects', {
    bucketName,
    objectKey,
    originName,
    startTime: (dateRange && dateRange.length > 0) ? dateRange[0] : null,
    endTime: (dateRange && dateRange.length > 1) ? dateRange[1] : null,
    pageNum,
    pageSize
  })
}

/**
 * 获取下载链接
 * @param bucketName
 * @param key
 * @returns {Promise<AxiosResponse<any>>}
 */
export function getDownloadLink(bucketName, key) {
  return http.get('/url/' + bucketName + '/' + key)
}

/**
 * 下载文件
 * @param bucketName
 * @param key
 * @returns {Promise<AxiosResponse<any>>}
 */
export function download(bucketName, key) {
  getDownloadLink(bucketName, key).then(resp => {
    http.get(resp['url'].replace('http://storage.kingsley.com', ''))
  })
}

/**
 * 桶是否已存在
 * @param bucketName
 * @returns {Promise<AxiosResponse<any>>}
 */
export function existsBucket(bucketName) {
  return http.get('/exists', {
    bucketName
  })
}

/**
 * 创建桶
 * @param bucketName
 * @param location
 * @returns {Promise<AxiosResponse<any>>}
 */
export function createBucket(bucketName, location) {
  return http.put('/' + bucketName + "?location=" + location)
}

/**
 * 删除桶
 * @param bucketName
 * @returns {Promise<AxiosResponse<any>>}
 */
export function deleteBucket(bucketName) {
  return http.delete('/', {
    bucketName,
    isDeleteObj: false
  })
}

/**
 * 删除文件
 * @param bucketName
 * @param key
 * @returns {Promise<AxiosResponse<any>>}
 */
export function deleteObject(bucketName, key) {
  return http.delete('/', {
    bucketName,
    key,
    isDeleteObj: true
  })
}

/**
 * 以文件流形式上传文件
 * @param bucketName
 * @param key
 * @param originName
 * @returns {Promise<AxiosResponse<any>>}
 */
export function uploadFile(bucketName, key, originName) {
  return http.put('/' + bucketName + '/' + key + "?originName=" + originName)
}

/**
 * 从外部链接上传文件
 * @param bucketName
 * @param key
 * @param originName
 * @param outerUrl
 * @returns {Promise<AxiosResponse<any>>}
 */
export function pullOuterFile(bucketName, key, originName, outerUrl) {
  return http.put('/' + bucketName + '/' + key + "?originName=" + originName, {
    outerUrl
  })
}

/**
 * 批量删除
 * @param bucketName
 * @param keys
 * @returns {Promise<AxiosResponse<any>>}
 */
export function batchDelete(bucketName, keys) {
  return http.delete('/batchDelete', {
    bucketName,
    keys
  })
}