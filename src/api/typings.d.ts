declare namespace API {
  type ArticleCreateDTO = {
    topic?: string
    style?: string
    enableImageMethods?: string[]
  }

  type ArticleQueryDTO = {
    page?: number
    size?: number
    userId?: number
    status?: string
  }

  type ArticleVO = {
    id?: number
    taskId?: string
    userId?: number
    topic?: string
    userDescription?: string
    mainTitle?: string
    subTitle?: string
    titleOptions?: TitleOption[]
    outline?: OutlineItem[]
    content?: string
    fullContent?: string
    coverImage?: string
    images?: ImageItem[]
    status?: string
    phase?: string
    errorMessage?: string
    createTime?: string
    completedTime?: string
  }

  type DeleteRequest = {
    id?: string
  }

  type getArticleParams = {
    taskId: string
  }

  type getProgressParams = {
    taskId: string
  }

  type ImageItem = {
    position?: number
    url?: string
    method?: string
    keywords?: string
    sectionTitle?: string
    description?: string
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

  type OutlineItem = {
    section?: number
    title?: string
    points?: string[]
  }

  type PageArticleVO = {
    records?: ArticleVO[]
    pageNumber?: number
    pageSize?: number
    totalPage?: number
    totalRow?: number
    optimizeCountQuery?: boolean
  }

  type ResultArticleVO = {
    code?: number
    message?: string
    data?: ArticleVO
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

  type ResultPageArticleVO = {
    code?: number
    message?: string
    data?: PageArticleVO
  }

  type ResultString = {
    code?: number
    message?: string
    data?: string
  }

  type SseEmitter = {
    timeout?: number
  }

  type TitleOption = {
    mainTitle?: string
    subTitle?: string
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
