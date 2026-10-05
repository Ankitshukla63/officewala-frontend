import { api } from './api'
import { getApiBaseUrl } from './network'

export async function uploadToBucket(bucket: string, file: File): Promise<string> {
  const form = new FormData()
  form.append('file', file)
  const { data } = await api.post<string>(`/api/files/upload?bucket=${encodeURIComponent(bucket)}`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return new URL(data, getApiBaseUrl()).toString()
}
