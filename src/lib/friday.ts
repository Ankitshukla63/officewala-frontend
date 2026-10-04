import { api } from './api'
import type { FridayPost } from './categories'

export interface FridayPage { items: FridayPost[]; total: number; page: number; pageSize: number; pageCount: number }

export async function listFridayPosts(page: number, pageSize = 12): Promise<FridayPage> {
  const { data } = await api.get('/api/friday-posts', { params: { page, size: pageSize } })
  return {
    items: data.items.map(mapPost),
    total: data.total,
    page: data.page,
    pageSize: data.pageSize,
    pageCount: data.pageCount
  }
}

export async function createFridayPost(payload: { image_url: string; caption?: string|null }): Promise<FridayPost> {
  const { data } = await api.post('/api/friday-posts', { imageUrl: payload.image_url, caption: payload.caption })
  return mapPost(data)
}

export async function deleteFridayPost(id: string): Promise<void> {
  await api.delete(`/api/friday-posts/${id}`)
}

function mapPost(p: any): FridayPost {
  return {
    id: p.id,
    image_url: p.imageUrl,
    caption: p.caption,
    user_name: p.userName,
    created_at: p.createdAt,
    user_id: p.userId
  }
}
