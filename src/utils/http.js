import request from "@/utils/request";

export const http = {
  get(url, params, headers) {
    return request.get(url, {
      headers,
      params: {
        ...params
      }
    })
  },
  post(url, params, headers) {
    return request.post(url, {
      ...params
    }, {
      headers: {
        ...headers
      }
    })
  },
  delete(url, params) {
    return request.delete(url, {
      params: {
        ...params
      }
    })
  },
  put(url, params) {
    return request.put(url, {
      ...params
    })
  },
}