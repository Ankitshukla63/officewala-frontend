import { api } from './api'
import type { Clip } from './categories'

export async function listVideos(category?: string): Promise<Clip[]> {
  const params = category ? { category } : {}
  const { data } = await api.get('/api/videos', { params })
  return data.map(mapVideo)
}

export async function createVideo(payload: Omit<Clip, 'id' | 'created_at' | 'user_id'>): Promise<Clip> {
  const payloadCamel = {
    title: payload.title,
    description: payload.description,
    notes: payload.notes,
    videoUrl: payload.video_url,
    thumbnailUrl: payload.thumbnail_url,
    imageUrl: payload.image_url,
    category: payload.category,
    clientName: payload.client_name,
    eventDate: payload.event_date,
    startTime: payload.start_time,
    endTime: payload.end_time,
  }
  const { data } = await api.post('/api/videos', payloadCamel)
  return mapVideo(data)
}

export async function deleteVideo(id: string): Promise<void> {
  await api.delete(`/api/videos/${id}`)
}

export async function getRandomVideo(): Promise<Clip | null> {
  const { data } = await api.get('/api/videos/random')
  if (!data) return null
  return mapVideo(data)
}

function mapVideo(v: any): Clip {
  return {
    id: v.id,
    title: v.title,
    description: v.description,
    notes: v.notes,
    video_url: v.videoUrl,
    thumbnail_url: v.thumbnailUrl,
    image_url: v.imageUrl,
    category: v.category,
    client_name: v.clientName,
    event_date: v.eventDate,
    start_time: v.startTime,
    end_time: v.endTime,
    user_id: v.userId,
    author_name: v.authorName,
    created_at: v.createdAt,
  }
}
