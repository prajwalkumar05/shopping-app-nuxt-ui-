import { getApiBaseUrl } from '../config'

export const getUserLoginApi = () => {
  return `${getApiBaseUrl()}/auth/login`
}

export const getUserRefreshTokenApi = () => {
  return `${getApiBaseUrl()}/auth/refresh`
}