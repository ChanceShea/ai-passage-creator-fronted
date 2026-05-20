import { message } from 'ant-design-vue'
import { USER_ROLE_ADMIN } from './constants/user'
import router from './router'
import { useLoginUserStore } from './stores/loginUser'

let firstFetchLoginUser = true

router.beforeEach(async (to, from, next) => {
  const loginUserStore = useLoginUserStore()
  let loginUser = loginUserStore.loginUser
  if (firstFetchLoginUser) {
    await loginUserStore.fetchLoginUser()
    loginUser = loginUserStore.loginUser
    firstFetchLoginUser = false
  }

  const toUrl = to.fullPath
  if (toUrl.startsWith('/admin')) {
    if (!loginUser || loginUser.userRole !== USER_ROLE_ADMIN) {
      message.error('您没有权限访问该页面')
      next(`/user/login?redirect=${to.fullPath}`)
      return
    }
  }
  next()
})
