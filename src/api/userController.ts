// @ts-ignore
/* eslint-disable */
import request from '@/request'

/** 此处后端没有提供注释 POST /user/user/add */
export async function addUser(body: API.UserAddDTO, options?: { [key: string]: any }) {
  return request<API.ResultBoolean>('/user/user/add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 此处后端没有提供注释 DELETE /user/user/delete */
export async function deleteUsingDelete(body: API.DeleteRequest, options?: { [key: string]: any }) {
  return request<API.ResultBoolean>('/user/user/delete', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 此处后端没有提供注释 GET /user/user/get/login */
export async function getLoginUser(options?: { [key: string]: any }) {
  return request<API.ResultLoginUserVO>('/user/user/get/login', {
    method: 'GET',
    ...(options || {}),
  })
}

/** 此处后端没有提供注释 POST /user/user/login */
export async function login(body: API.UserLoginDTO, options?: { [key: string]: any }) {
  return request<API.ResultLoginUserVO>('/user/user/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 此处后端没有提供注释 GET /user/user/logout */
export async function logout(options?: { [key: string]: any }) {
  return request<API.ResultBoolean>('/user/user/logout', {
    method: 'GET',
    ...(options || {}),
  })
}

/** 此处后端没有提供注释 POST /user/user/register */
export async function register(body: API.UserRegisterDTO, options?: { [key: string]: any }) {
  return request<API.ResultLong>('/user/user/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}
