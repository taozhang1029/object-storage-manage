import request from "@/utils/request";
import qs from 'qs'

export const http = {
  get(url, params, headers) {
    return request.get(url, {
      headers,
      params: {
        ...params
      },
      paramsSerializer: params => {
        return qs.stringify(params, {indices: false})
      }
    })
  },
  post(url, params, headers) {
    return request.post(url, qs.stringify(
      {
        ...params
      }, {indices: false}
    ), {
      headers: {
        ...headers
      }
    })
  },
  delete(url, params,) {
    return request.delete(url, {
      params: {
        ...params
      },
      paramsSerializer: params => {
        return qs.stringify(params, {indices: false})
      }
    })
  },
  put(url, params) {
    return request.put(url, qs.stringify({
      ...params
    }, {indices: false}))
  },
}