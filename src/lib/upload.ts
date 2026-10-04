import { api } from './api'

export async function uploadToBucket(bucket: string, file: File): Promise<string> {
  const form = new FormData()
  form.append('file', file)
  const { data } = await api.post(`/api/files/upload?bucket=${bucket}`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data.startsWith('http') ? data : `http://localhost:8080${data}`
}
