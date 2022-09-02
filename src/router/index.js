import Vue from 'vue'
import VueRouter from 'vue-router'


// 解决ElementUI导航栏中的vue-router在3.0版本以上重复点菜单报错问题
const originalPush = VueRouter.prototype.push
VueRouter.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err)
}

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'home',
    redirect: '/bucket/list'
  },
  {
    path: '/bucket/list',
    name: 'buckets',
    component: () => import('@/views/HomeView')
  },
  {
    path: '/bucket/:bucketName',
    name: 'objects',
    component: () => import('@/views/ObjectListView'),
    props: true
  },
]

const router = new VueRouter({
  routes
})

export default router
