declare namespace API {
  type AgentExecutionStatsVO = {
    taskId?: string
    totalDurationMs?: number
    agentCount?: number
    agentDurations?: Record<string, any>
    overallStatus?: string
    logs?: AgentLog[]
  }

  type AgentLog = {
    id?: number
    taskId?: string
    agentName?: string
    startTime?: string
    endTime?: string
    durationMs?: number
    status?: string
    errorMessage?: string
    prompt?: string
    inputData?: string
    outputData?: string
    createTime?: string
    updateTime?: string
    isDelete?: number
  }

  type ArticleAiModifyOutlineDTO = {
    taskId?: string
    modifySuggestion?: string
  }

  type ArticleConfirmOutlineDTO = {
    taskId?: string
    outlines?: OutlineSection[]
  }

  type ArticleConfirmTitleDTO = {
    taskId?: string
    selectedMainTitle?: string
    selectedSubTitle?: string
    userDescription?: string
  }

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

  type createPaymentRecordParams = {
    dto: PaymentRecordAddDTO
  }

  type DeleteRequest = {
    id?: string
  }

  type getArticleParams = {
    taskId: string
  }

  type getExecutionLogsParams = {
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
    vipTime?: string
    quota?: number
  }

  type OutlineItem = {
    section?: number
    title?: string
    points?: string[]
  }

  type OutlineSection = {
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

  type PaymentRecordAddDTO = {
    currency?: string
    description?: string
    amount?: number
    paymentType?: string
    productType?: string
  }

  type PaymentRecordVO = {
    userId?: string
    orderId?: string
    amount?: number
    currency?: string
    status?: string
    productType?: string
  }

  type payParams = {
    orderId: string
    userId: number
  }

  type Result = {
    code?: number
    message?: string
    data?: Record<string, any>
  }

  type ResultAgentExecutionStatsVO = {
    code?: number
    message?: string
    data?: AgentExecutionStatsVO
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

  type ResultListOutlineSection = {
    code?: number
    message?: string
    data?: OutlineSection[]
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

  type ResultPaymentRecordVO = {
    code?: number
    message?: string
    data?: PaymentRecordVO
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
