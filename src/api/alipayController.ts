// @ts-ignore
/* eslint-disable */
import request from '@/request'

/** 此处后端没有提供注释 POST /alipay/notify */
export async function notify(options?: { [key: string]: any }) {
  return request<string>('/alipay/notify', {
    method: 'POST',
    ...(options || {}),
  })
}

/** 此处后端没有提供注释 GET /alipay/pay */
export async function pay(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.payParams,
  options?: { [key: string]: any }
) {
  return request<any>('/alipay/pay', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  })
}

/** 此处后端没有提供注释 GET /alipay/return */
export async function returnPay(options?: { [key: string]: any }) {
  return request<any>('/alipay/return', {
    method: 'GET',
    ...(options || {}),
  })
}
