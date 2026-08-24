/**
 * Axios instance + interceptors for NAGAR-X API
 *
 * Handles:
 * - Base URL from env
 * - JWT auth header injection
 * - 401 → redirect to login
 * - Structured error normalisation
 * - Request/response logging in dev
 */

import axios, { AxiosError, type AxiosResponse } from 'axios'
import type { ApiError } from '../types'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
})

// ─── Request interceptor — inject JWT ────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('nagarx_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  if (import.meta.env.DEV) {
    console.debug(`[API] ${config.method?.toUpperCase()} ${config.url}`)
  }
  return config
})

// ─── Response interceptor — normalise errors ─────────────────────────────────
api.interceptors.response.use(
  (res: AxiosResponse) => res,
  (error: AxiosError<ApiError>) => {
    if (error.response?.status === 401) {
      // Token expired — clear and redirect
      localStorage.removeItem('nagarx_token')
      window.location.href = '/login'
    }

    const normalised: ApiError = {
      message: error.response?.data?.message || error.message || 'Network error',
      code: error.response?.data?.code || 'UNKNOWN_ERROR',
      statusCode: error.response?.status || 0,
      details: error.response?.data?.details,
    }

    if (import.meta.env.DEV) {
      console.error('[API Error]', normalised)
    }

    return Promise.reject(normalised)
  }
)
