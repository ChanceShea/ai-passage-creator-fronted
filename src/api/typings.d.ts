declare namespace API {
  type DeleteRequest = {
    id?: string
  }

  type LoginUserVO = {
    id?: number
    userAccount?: string
    userName?: string
    userAvatar?: string
    userProfile?: string
    userRole?: string
    createTime?: string
    updateTime?: string
  }

  type ResultBoolean = {
    code?: number
    message?: string
    data?: boolean
  }

  type ResultLoginUserVO = {
    code?: number
    message?: string
    data?: LoginUserVO
  }

  type ResultLong = {
    code?: number
    message?: string
    data?: number
  }

  type ResultString = {
    code?: number
    message?: string
    data?: string
  }

  type UserAddDTO = {
    userAccount?: string
    userPassword?: string
    userName?: string
    userAvatar?: string
    userProfile?: string
    userRole?: string
  }

  type UserLoginDTO = {
    userAccount?: string
    userPassword?: string
  }

  type UserRegisterDTO = {
    userAccount?: string
    userPassword?: string
    checkPassword?: string
  }
}
