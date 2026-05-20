// @ts-ignore
/* eslint-disable */
import request from '@/request'

/** 此处后端没有提供注释 POST /user/add */
export async function addUser(body: API.UserAddDTO, options?: { [key: string]: any }) {
  return request<API.ResultBoolean>('/user/add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 此处后端没有提供注释 DELETE /user/delete */
export async function deleteUsingDelete(body: API.DeleteRequest, options?: { [key: string]: any }) {
  return request<API.ResultBoolean>('/user/delete', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 此处后端没有提供注释 GET /user/get/login */
export async function getLoginUser(options?: { [key: string]: any }) {
  return request<API.ResultLoginUserVO>('/user/get/login', {
    method: 'GET',
    ...(options || {}),
  })
}

/** 此处后端没有提供注释 POST /user/login */
export async function login(body: API.UserLoginDTO, options?: { [key: string]: any }) {
  return request<API.ResultLoginUserVO>('/user/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 此处后端没有提供注释 GET /user/login/github */
export async function githubLogin(options?: { [key: string]: any }) {
  return request<any>('/user/login/github', {
    method: 'GET',
    ...(options || {}),
  })
}

/** 此处后端没有提供注释 GET /user/logout */
export async function logout(options?: { [key: string]: any }) {
  return request<API.ResultBoolean>('/user/logout', {
    method: 'GET',
    ...(options || {}),
  })
}

/** 此处后端没有提供注释 POST /user/register */
export async function register(body: API.UserRegisterDTO, options?: { [key: string]: any }) {
  return request<API.ResultLong>('/user/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}
