import pb from '@/lib/pocketbase/client'

export const submitDiagnostic = async (data: any) => {
  return pb.send('/backend/v1/diagnostic/submit', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
  })
}
