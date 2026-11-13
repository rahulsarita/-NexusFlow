import { useCallback } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = err.response?.data?.message || err.message || 'Request failed'
    console.error('[API Error]', message)
    return Promise.reject(err)
  }
)

export function useApi() {
  const get = useCallback(async (url, params = {}) => {
    try {
      const { data } = await api.get(url, { params })
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err }
    }
  }, [])

  const post = useCallback(async (url, body = {}) => {
    try {
      const { data } = await api.post(url, body)
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err }
    }
  }, [])

  const put = useCallback(async (url, body = {}) => {
    try {
      const { data } = await api.put(url, body)
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err }
    }
  }, [])

  const patch = useCallback(async (url, body = {}) => {
    try {
      const { data } = await api.patch(url, body)
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err }
    }
  }, [])

  const del = useCallback(async (url) => {
    try {
      const { data } = await api.delete(url)
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err }
    }
  }, [])

  const withToast = useCallback(
    async (fn, { loading = 'Processing...', success = 'Done!', error = 'Failed' } = {}) => {
      return toast.promise(fn(), { loading, success, error })
    },
    []
  )

  return { get, post, put, patch, del, withToast, api }
}

export default api
