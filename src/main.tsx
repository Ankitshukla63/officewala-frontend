import React, { Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'
import { AuthProvider } from './hooks/useAuth'
import './styles.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
    },
  },
})

function AppFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="paint-panel max-w-sm p-6 text-center">
        <div className="mx-auto mb-3 size-9 animate-spin rounded-full border-3 border-brick border-t-transparent" />
        <p className="font-display text-xl text-ink">OFFICE WALA</p>
        <p className="font-hand text-base text-brick">Corporate Life FM</p>
      </div>
    </div>
  )
}

const router = createRouter({
  routeTree,
  context: {
    queryClient,
  },
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Suspense fallback={<AppFallback />}>
          <RouterProvider router={router} />
        </Suspense>
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>,
)
