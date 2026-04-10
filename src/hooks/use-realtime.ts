import { useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase/client'

/**
 * Hook for real-time subscriptions to a Supabase collection.
 * ALWAYS use this hook instead of subscribing inline.
 */
export function useRealtime(
  collectionName: string,
  callback: (data: any) => void,
  enabled: boolean = true,
) {
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  useEffect(() => {
    if (!enabled) return

    let cancelled = false

    const channel = supabase
      .channel(`public:${collectionName}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: collectionName },
        (payload) => {
          if (cancelled) return
          const actionMap: Record<string, string> = {
            INSERT: 'create',
            UPDATE: 'update',
            DELETE: 'delete',
          }
          callbackRef.current({
            action: actionMap[payload.eventType] || payload.eventType,
            record: payload.eventType === 'DELETE' ? payload.old : payload.new,
            originalPayload: payload,
          })
        },
      )
      .subscribe()

    return () => {
      cancelled = true
      supabase.removeChannel(channel)
    }
  }, [collectionName, enabled])
}
