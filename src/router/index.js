import Vue from 'vue'
import Router from 'vue-router'
import Login from '@/components/login'
import Home from '@/components/home'
import Welcome from '@/components/Welcome'
import User from '@/components/User'

Vue.use(Router)

var router = new Router({
  routes: [
    {
      path: '/login',
      component: Login
    },
    { path: '/home', component: Home,redirect:'/Welcome', children:[
      {path:'/Welcome',component: Welcome},
      {path:'/users',component: User}
    ]}
  ]
})
// 路由导航守卫 检测token如果不存在 就跳转大login登录组件去
router.beforeEach((to, from, next) => {
  if (to.path === '/login') {
    return next()
  }
  var token = window.sessionStorage.getItem('token')
  if (!token) {
    return next('/login')
  }
  next()
})
export default router
