import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import '@/assets/css/common.css'
import "@/assets/css/icomoon.css"

import ElementUI, {MessageBox} from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';

Vue.use(ElementUI, {
  size: 'medium'
});
Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App),
  beforeCreate() {
    // 事件总线
    Vue.prototype.$bus = this
    Vue.prototype.$confirm = MessageBox.confirm
  },
}).$mount('#app')
