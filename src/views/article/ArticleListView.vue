<template>
  <div class="article-list-view">
    <!-- Background Decorations -->
    <div class="bg-decoration">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
      <div class="grid-overlay"></div>
    </div>

    <div class="page-header">
      <div class="header-container">
        <div class="header-content">
          <h1 class="page-title">历史记录</h1>
          <p class="page-subtitle">管理您创作的所有文章</p>
        </div>
        <a-button type="primary" size="large" @click="goToCreate" class="create-btn">
          <template #icon>
            <PlusOutlined />
          </template>
          创作新文章
        </a-button>
      </div>
    </div>
    <div class="container">
      <div class="filter-bar">
        <div class="filter-left">
          <a-input-search
            v-model:value="searchKeyword"
            placeholder="搜索文章标题..."
            style="width: 280px"
            @search="handleSearch"
            @change="handleSearchChange"
            allow-clear
            class="search-input"
          >
            <template #prefix>
              <SearchOutlined class="search-icon" />
            </template>
          </a-input-search>
          <a-range-picker
            v-model:value="dateRange"
            :placeholder="['开始日期', '结束日期']"
            @change="handleDateChange"
            class="date-picker"
          />
          <a-select
            v-model:value="statusFilter"
            placeholder="全部状态"
            style="width: 120px"
            allow-clear
            @change="handleStatusChange"
            class="status-select"
          >
            <a-select-option value="">全部状态</a-select-option>
            <a-select-option value="COMPLETED">已完成</a-select-option>
            <a-select-option value="PROCESSING">生成中</a-select-option>
            <a-select-option value="PENDING">等待中</a-select-option>
            <a-select-option value="FAILED">失败</a-select-option>
          </a-select>
        </div>
        <div class="filter-right">
          <span class="total-count">共{{ pagination.total }}篇文章</span>
        </div>
      </div>
      <a-card :bordered="false" class="table-card">
        <a-table
          :columns="columns"
          :data-source="dataSource"
          :loading="loading"
          :pagination="pagination"
          @change="handleTableChange"
          row-key="id"
          class="article-table"
          :scroll="{ x: 1000 }"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'title'">
              <div class="title-cell" @click="viewArticle(record)">
                <div class="main-title">{{ record.mainTitle || record.topic || '-' }}</div>
                <div class="sub-title">{{ record.subTitle || '-' }}</div>
              </div>
            </template>
            <template v-else-if="column.key === 'status'">
              <span :class="['status-badge', `status-${record.status?.toLowerCase()}`]">
                <span class="status-bot">
                  {{ getStatusText(record.status) }}
                </span>
              </span>
            </template>
            <template v-else-if="column.key === 'createTime'">
              <span class="time-text">{{ formatDate(record.createTime) }}</span>
            </template>
            <template v-else-if="column.key === 'action'">
              <div class="action-group">
                <a-button
                  type="link"
                  size="small"
                  @click="viewArticle(record)"
                  class="action-btn view-btn"
                >
                  <EyeOutlined />
                  查看
                </a-button>
                <a-button
                  v-if="record.status === 'FAILED'"
                  type="link"
                  size="small"
                  @click="retryArticle(record)"
                  class="action-btn retry-btn"
                >
                  <RedoOutlined />
                  重试
                </a-button>
                <a-button
                  v-else
                  type="link"
                  size="small"
                  @click="exportArticle(record)"
                  class="action-btn export-btn"
                >
                  <DownloadOutlined />
                  导出
                </a-button>
                <a-popconfirm
                  title="确定要删除这篇文章吗"
                  ok-text="确认"
                  cancel-text="取消"
                  @confirm="handleDeleteArticle(record)"
                >
                  <a-button type="link" size="small" danger class="action-btn delete-btn">
                    <DeleteOutlined />
                    删除
                  </a-button>
                </a-popconfirm>
              </div>
            </template>
          </template>
          <template #emptyText>
            <div class="empty-state">
              <FileTextOutlined class="empty-icon" />
              <p class="empty-title">暂无文章</p>
              <p class="empty-desc">开始创作您的第一篇文章吧</p>
              <a-button type="primary" @click="goToCreate">
                <PlusOutlined />
                创建文章
              </a-button>
            </div>
          </template>
        </a-table>
      </a-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import {
  SearchOutlined,
  PlusOutlined,
  EyeOutlined,
  RedoOutlined,
  DeleteOutlined,
  FileTextOutlined,
  DownloadOutlined,
} from '@ant-design/icons-vue'
import { onMounted, ref } from 'vue'
import { getArticle, listArticle, deleteArticle } from '@/api/articleController'
import dayjs, { Dayjs } from 'dayjs'
import { message, Modal } from 'ant-design-vue'

const router = useRouter()

const columns = [
  {
    title: '选题',
    dataIndex: 'topic',
    key: 'topic',
    width: 220,
    ellipsis: true,
  },
  {
    title: '标题',
    key: 'title',
    width: 280,
  },
  {
    title: '状态',
    key: 'status',
    width: 120,
    align: 'center',
  },
  {
    title: '创建时间',
    key: 'createTime',
    width: 180,
  },
  {
    title: '操作',
    key: 'action',
    width: 280,
    fixed: 'right',
  },
]
const loading = ref(false)
const searchKeyword = ref('')
const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number) => `共 ${total} 条`,
  pageSizeOptions: ['10', '20', '50', '100'],
})
const statusFilter = ref<string>('')
const dateRange = ref<[Dayjs, Dayjs] | null>(null)
const dataSource = ref<API.ArticleVO[]>([])

// 搜索文章
const handleSearch = async () => {
  pagination.value.current = 1
  loadData()
}

// 搜索关键词改变时触发
const handleSearchChange = () => {
  if (!searchKeyword.value) {
    handleSearch()
  }
}

// 日期范围改变时触发
const handleDateChange = () => {
  pagination.value.current = 1
  loadData()
}

// 状态改变时触发
const handleStatusChange = () => {
  pagination.value.current = 1
  loadData()
}

// 表格改变时触发
const handleTableChange = () => {
  pagination.value.current = 1
  loadData()
}

// 加载文章列表
const loadData = async () => {
  loading.value = true
  try {
    const res = await listArticle({
      page: pagination.value.current,
      size: pagination.value.pageSize,
    })
    if (res.data.code === 200 && res.data.data) {
      const pageData = res.data.data
      let records = pageData?.records || []

      if (searchKeyword.value) {
        const keyword = searchKeyword.value.toLowerCase()
        records = records.filter((item: API.ArticleVO) => {
          return (
            item.mainTitle?.toLowerCase().includes(keyword) ||
            item.topic?.toLowerCase().includes(keyword)
          )
        })
      }
      if (statusFilter.value) {
        records = records.filter((item: API.ArticleVO) => item.status === statusFilter.value)
      }
      if (dateRange.value) {
        const [start, end] = dateRange.value
        records = records.filter((item: API.ArticleVO) => {
          const createTime = dayjs(item.createTime)
          return createTime.isAfter(start.startOf('day')) && createTime.isBefore(end.endOf('day'))
        })
      }
      dataSource.value = records
      pagination.value.total = pageData?.totalRow || 0
    }
  } catch (err: any) {
    message.error(err.message || '加载失败')
  } finally {
    loading.value = false
  }
}

// 导出文章
const exportArticle = async (record: API.ArticleVO) => {
  try {
    const res = await getArticle({ taskId: record.taskId || '' })
    if (res.data.code === 200 && res.data.data) {
      const article = res.data.data
      if (!article) {
        message.error('文章不存在')
        return
      }
      let markdown = `# ${article.mainTitle}\n\n`
      markdown += `> ${article.subTitle}\n\n`
      if (article.fullContent) {
        markdown += article.fullContent
      } else {
        markdown += article.content || ''
      }
      const blob = new Blob([markdown], { type: 'text/markdown' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${article.mainTitle || '文章'}.md`
      a.click()
      URL.revokeObjectURL(url)

      message.success('导出成功')
    }
  } catch (err: any) {
    message.error(err.message || '导出失败')
  }
}

// 删除文章
const handleDeleteArticle = async (record: API.ArticleVO) => {
  try {
    await deleteArticle({ id: record.id })
    message.success('删除成功')
    loadData()
  } catch (err: any) {
    message.error(err.message || '删除失败')
  }
}

// 获取状态文本
const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    PENDING: '等待中',
    PROCESSING: '生成中',
    COMPLETED: '已完成',
    FAILED: '失败',
  }
  return textMap[status] || status
}

// 查看文章详情
const viewArticle = (record: API.ArticleVO) => {
  router.push(`/article/${record.taskId}`)
}

// 格式化日期
const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

// 重试文章
const retryArticle = async (record: API.ArticleVO) => {
  Modal.confirm({
    title: '确认重试',
    content: `将使用相同的选题"${record.topic}"重新创建文章，是否继续？`,
    okText: '确认',
    cancelText: '取消',
    onOk: () => {
      router.push({
        path: '/create',
        query: {
          topic: record.topic || '',
          style: record.userDescription || '',
        },
      })
    },
  })
}

// 跳转创建文章页面
const goToCreate = () => {
  router.push('/article/create')
}

onMounted(() => {
  loadData()
})
</script>

<style scoped lang="scss">
.article-list-view {
  min-height: 100vh;
  background-color: var(--bg-page);
  position: relative;
  overflow: hidden;
  padding-bottom: 60px;
  font-family: 'Montserrat', sans-serif;
  transition: background-color 0.3s ease;
}

/* Background Decorations */
.bg-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;

  .circle {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    opacity: 0.4;
  }

  .circle-1 {
    width: 400px;
    height: 400px;
    background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
    top: -100px;
    right: -100px;
    animation: float 20s infinite alternate;
  }

  .circle-2 {
    width: 300px;
    height: 300px;
    background: linear-gradient(135deg, #3b82f6 0%, #2dd4bf 100%);
    bottom: -50px;
    left: -50px;
    animation: float 15s infinite alternate-reverse;
  }

  .grid-overlay {
    position: absolute;
    inset: 0;
    background-image: radial-gradient(#e2e8f0 1px, transparent 1px);
    background-size: 32px 32px;
    mask-image: linear-gradient(to bottom, transparent, black, transparent);
  }
}

.page-header {
  position: relative;
  z-index: 1;
  background: var(--bg-glass);
  backdrop-filter: blur(20px);
  padding: 80px 0 48px;
  margin-bottom: 40px;
  border-bottom: 1px solid var(--border-glass);
  animation: slideIn 0.8s cubic-bezier(0.16, 1, 0.3, 1);

  .header-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 40px;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
  }

  .page-title {
    font-family: 'Playfair Display', serif;
    font-size: 3rem;
    font-weight: 800;
    color: var(--primary-color);
    margin-bottom: 12px;
    letter-spacing: -0.02em;
  }

  .page-subtitle {
    font-size: 0.9rem;
    color: var(--text-muted);
    margin: 0;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    font-weight: 600;
  }

  .create-btn {
    height: 54px;
    padding: 0 32px;
    border-radius: 14px;
    font-weight: 600;
    font-size: 1rem;
    background: var(--primary-color);
    color: var(--text-inverse);
    border: none;
    box-shadow: 0 10px 20px rgba(var(--primary-color-rgb), 0.1);
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);

    &:hover {
      opacity: 0.9;
      transform: translateY(-2px);
      box-shadow: 0 15px 30px rgba(var(--primary-color-rgb), 0.15);
    }
  }
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 40px;
  position: relative;
  z-index: 1;
  animation: slideIn 1s cubic-bezier(0.16, 1, 0.3, 1);
}

.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  gap: 20px;
  flex-wrap: wrap;

  .filter-left {
    display: flex;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;

    :deep(.ant-input-affix-wrapper),
    :deep(.ant-picker),
    :deep(.ant-select-selector) {
      border-radius: 12px !important;
      border: 1px solid var(--border-glass) !important;
      background: var(--bg-glass-deep) !important;
      backdrop-filter: blur(10px);
      height: 48px !important;
      display: flex;
      align-items: center;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);

      &:hover {
        border-color: var(--accent-color) !important;
        background: var(--bg-glass) !important;
      }
    }

    :deep(.ant-input-affix-wrapper-focused),
    :deep(.ant-picker-focused),
    :deep(.ant-select-focused .ant-select-selector) {
      border-color: var(--accent-color) !important;
      box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1) !important;
    }

    :deep(.ant-input) {
      background: transparent !important;
    }
  }

  .total-count {
    color: var(--text-muted);
    font-size: 0.85rem;
    font-weight: 600;
    background: var(--bg-glass-deep);
    backdrop-filter: blur(10px);
    padding: 8px 18px;
    border-radius: 20px;
    border: 1px solid var(--border-glass);
  }
}

.table-card {
  background: var(--bg-glass) !important;
  backdrop-filter: blur(20px);
  border-radius: 32px !important;
  border: 1px solid var(--border-glass) !important;
  box-shadow: var(--card-shadow) !important;
  overflow: hidden;

  :deep(.ant-card-body) {
    padding: 0;
  }
}

.article-table {
  :deep(.ant-table) {
    background: transparent !important;
  }

  :deep(.ant-table-thead > tr > th) {
    background: rgba(var(--primary-color-rgb), 0.02) !important;
    color: var(--primary-color);
    font-weight: 700;
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    padding: 20px 24px;
    border-bottom: 1px solid var(--border-glass);
  }

  :deep(.ant-table-tbody > tr > td) {
    padding: 20px 24px;
    border-bottom: 1px solid var(--border-glass);
    transition: all 0.3s ease;
  }

  :deep(.ant-table-tbody > tr:hover > td) {
    background: rgba(99, 102, 241, 0.02) !important;
  }
}

.title-cell {
  cursor: pointer;

  .main-title {
    font-family: 'Playfair Display', serif;
    font-weight: 700;
    color: var(--primary-color);
    font-size: 1.15rem;
    margin-bottom: 4px;
    transition: all 0.3s;

    &:hover {
      color: var(--accent-color);
    }
  }

  .sub-title {
    font-size: 0.85rem;
    color: var(--text-muted);
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
}

.status-badge {
  padding: 8px 16px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  letter-spacing: 0.02em;

  &::before {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 50%;
    margin-right: 8px;
  }

  &.status-completed {
    background: #ecfdf5;
    color: #059669;
    &::before {
      background: #10b981;
    }
  }

  &.status-processing {
    background: #eef2ff;
    color: #4f46e5;
    &::before {
      background: #6366f1;
      animation: pulse 2s infinite;
    }
  }

  &.status-pending {
    background: #fffbeb;
    color: #d97706;
    &::before {
      background: #f59e0b;
    }
  }

  &.status-failed {
    background: #fef2f2;
    color: #dc2626;
    &::before {
      background: #ef4444;
    }
  }
}

@keyframes float {
  0% {
    transform: translate(0, 0) scale(1);
  }
  100% {
    transform: translate(20px, 40px) scale(1.1);
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0% {
    transform: scale(0.95);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.7;
  }
  100% {
    transform: scale(0.95);
    opacity: 1;
  }
}

.time-text {
  color: var(--text-muted);
  font-size: 0.85rem;
  font-weight: 600;
}

.action-group {
  display: flex;
  gap: 4px;
  justify-content: flex-start;
  align-items: center;

  .action-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 6px 10px;
    border-radius: 10px;
    font-weight: 600;
    font-size: 0.85rem;
    transition: all 0.3s;
    color: var(--text-muted);
    border: 1px solid transparent;
    white-space: nowrap;

    &:hover {
      background: rgba(255, 255, 255, 0.8);
      color: var(--primary-color);
      border-color: rgba(0, 0, 0, 0.06);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
    }

    &.view-btn:hover {
      color: var(--accent-color);
      background: rgba(99, 102, 241, 0.05);
      border-color: rgba(99, 102, 241, 0.1);
    }

    &.export-btn:hover {
      color: #0ea5e9;
      background: rgba(14, 165, 233, 0.05);
      border-color: rgba(14, 165, 233, 0.1);
    }

    &.delete-btn:hover {
      color: #ef4444;
      background: rgba(239, 68, 68, 0.05);
      border-color: rgba(239, 68, 68, 0.1);
    }

    :deep(.anticon) {
      font-size: 1rem;
    }
  }
}

/* Fixed Column Glassmorphism Fix */
:deep(.ant-table-cell-fix-right) {
  background: var(--bg-glass) !important;
  backdrop-filter: blur(20px);
}

:deep(.ant-table-tbody > tr:hover > .ant-table-cell-fix-right) {
  background: rgba(245, 247, 255, 0.95) !important;
}

.empty-state {
  padding: 120px 0;
  text-align: center;

  .empty-icon {
    font-size: 80px;
    color: #e5e7eb;
    margin-bottom: 24px;
    opacity: 0.5;
  }

  .empty-title {
    font-family: 'Playfair Display', serif;
    font-size: 2rem;
    font-weight: 700;
    color: var(--primary-color);
    margin-bottom: 12px;
  }

  .empty-desc {
    color: var(--text-muted);
    margin-bottom: 32px;
    font-size: 1rem;
  }
}

/* Responsive Adjustments */
@media (max-width: 768px) {
  .page-header {
    padding: 60px 0 40px;

    .header-container {
      flex-direction: column;
      align-items: flex-start;
      gap: 24px;
      padding: 0 24px;
    }

    .page-title {
      font-size: 2.25rem;
    }
  }

  .container {
    padding: 0 24px;
  }

  .filter-bar {
    flex-direction: column;
    align-items: stretch;

    .filter-left {
      flex-direction: column;
      align-items: stretch;

      :deep(.ant-input-search),
      :deep(.ant-picker),
      :deep(.ant-select) {
        width: 100% !important;
      }
    }
  }
}
</style>
