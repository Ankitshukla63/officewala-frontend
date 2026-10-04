import { api } from './api'
import type { DeadlineNote } from './categories'

export async function listDeadlineNotes(): Promise<DeadlineNote[]> {
  const { data } = await api.get('/api/deadline-notes')
  return data.map(mapNote)
}

export async function createDeadlineNote(payload: { title: string; note?: string|null; funny_line?: string|null; due_date?: string|null }): Promise<DeadlineNote> {
  const payloadCamel = {
    title: payload.title,
    note: payload.note,
    funnyLine: payload.funny_line,
    dueDate: payload.due_date
  }
  const { data } = await api.post('/api/deadline-notes', payloadCamel)
  return mapNote(data)
}

export async function deleteDeadlineNote(id: string): Promise<void> {
  await api.delete(`/api/deadline-notes/${id}`)
}

function mapNote(n: any): DeadlineNote {
  return {
    id: n.id,
    title: n.title,
    note: n.note,
    funny_line: n.funnyLine,
    due_date: n.dueDate,
    created_at: n.createdAt,
    user_id: n.userId,
    author_name: n.authorName
  }
}
