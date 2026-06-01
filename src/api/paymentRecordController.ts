// @ts-ignore
/* eslint-disable */
import request from '@/request'

/** 此处后端没有提供注释 GET /payment-record/create */
export async function createPaymentRecord(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.createPaymentRecordParams,
  options?: { [key: string]: any }
) {
  return request<API.ResultPaymentRecordVO>('/payment-record/create', {
    method: 'GET',
    params: {
      ...params,
      dto: undefined,
      ...params['dto'],
    },
    ...(options || {}),
  })
}
