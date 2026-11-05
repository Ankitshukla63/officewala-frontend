import { keepPreviousData, queryOptions } from '@tanstack/react-query'
import { listVideos } from './videos'
import { listFridayPosts } from './friday'
import { listDeadlineNotes } from './deadline'

async function orEmpty<T>(run: () => Promise<T>, empty: T): Promise<T> {
  try {
    return await run()
  } catch (e: any) {
    if (e?.name === 'CanceledError' || e?.code === 'ERR_CANCELED') {
      return empty
    }
    if (e instanceof Error && (e.message.startsWith('Unauthorized') || (e as any).response?.status === 401)) {
      return empty
    }
    throw e
  }
}

export const videosQuery = (category?: string) =>
  queryOptions({
    queryKey: ['videos', category ?? 'all'],
    queryFn: ({ signal }) => orEmpty(() => listVideos(category, signal), []),
    staleTime: 60_000,
    gcTime: 5 * 60_000,
  })

export const fridayQuery = (page: number, pageSize = 12) =>
  queryOptions({
    queryKey: ['friday', page, pageSize],
    queryFn: ({ signal }) =>
      orEmpty(
        () => listFridayPosts(page, pageSize, signal),
        { items: [], total: 0, page, pageSize, pageCount: 1 }
      ),
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    placeholderData: keepPreviousData,
  })

export const deadlineNotesQuery = () =>
  queryOptions({
    queryKey: ['deadline-notes'],
    queryFn: ({ signal }) => orEmpty(() => listDeadlineNotes(signal), []),
    staleTime: 60_000,
    gcTime: 5 * 60_000,
  })
