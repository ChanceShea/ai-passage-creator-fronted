export interface SSEMessage {
  type: string
  data?: any
  [key: string]: any
}

export interface SSEOptions {
  onMessage: (message: SSEMessage) => void
  onError: (error: Event) => void
  onComplete?: () => void
}

export const connectSSE = (taskId: string, options: SSEOptions): EventSource => {
  const { onMessage, onError, onComplete } = options

  const eventSource = new EventSource(`/api/article/progress/${taskId}`)
  eventSource.onmessage = (event) => {
    try {
      const message: SSEMessage = JSON.parse(event.data)
      onMessage(message)
      if (message.type === 'ALL_COMPLETE' || message.type === 'ERROR') {
        eventSource.close()
        onComplete?.()
      }
    } catch (error) {
      console.error('SSE消息解析失败', error)
    }
  }
  eventSource.onerror = (error) => {
    console.error('SSE连接错误', error)
    onError?.(error)
    eventSource.close()
  }
  return eventSource
}

export const closeSSE = (eventSource: EventSource | null) => {
  if (eventSource) {
    eventSource.close()
  }
}
