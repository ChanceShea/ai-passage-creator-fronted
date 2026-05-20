import { getLoginUser } from '@/api/userController'
import { DEFAULT_USERNAME } from '@/constants/user'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useLoginUserStore = defineStore('loginUser', () => {
  const loginUser = ref<API.LoginUserVO>({
    userName: DEFAULT_USERNAME,
  })

  async function fetchLoginUser() {
    try {
      const res = await getLoginUser()
      if (res.data.code === 200 && res.data.data) {
        loginUser.value = res.data.data
      }
      return true
    } catch (error) {
      console.error('fetchLoginUser error:', error)
      return false
    }
  }

  function setLoginUser(newLoginUser: any) {
    loginUser.value = newLoginUser
  }

  return {
    loginUser,
    fetchLoginUser,
    setLoginUser,
  }
})
