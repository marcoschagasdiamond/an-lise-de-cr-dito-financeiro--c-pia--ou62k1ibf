import { supabase } from '@/lib/supabase/client'

export const submitDiagnostic = async (data: any) => {
  return supabase.functions.invoke('diagnostic-submit', {
    body: data,
  })
}
