import {http} from "@/utils/http";

export function queryBuckets(p, n) {
  return http.get('/', {
    p, n
  })
}