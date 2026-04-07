import { useState, useEffect } from 'react'
import pb from '@/lib/pocketbase/client'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { format } from 'date-fns'
import { Send } from 'lucide-react'
import { toast } from 'sonner'
import { ScrollArea } from '@/components/ui/scroll-area'

export function DocumentComments({ documentoId }: { documentoId: string }) {
  const { user } = useAuth()
  const [comments, setComments] = useState<any[]>([])
  const [newComment, setNewComment] = useState('')

  const loadComments = async () => {
    try {
      const records = await pb.collection('document_comments').getFullList({
        filter: `documento_id = "${documentoId}"`,
        sort: 'created',
        expand: 'user_id',
      })
      setComments(records)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    if (documentoId) loadComments()
  }, [documentoId])

  useRealtime('document_comments', (e) => {
    if (e.record.documento_id === documentoId) {
      loadComments()
    }
  })

  const handleAddComment = async () => {
    if (!newComment.trim() || !user) return
    try {
      await pb.collection('document_comments').create({
        documento_id: documentoId,
        user_id: user.id,
        content: newComment.trim(),
      })
      setNewComment('')
    } catch (err) {
      toast.error('Erro ao enviar comentário')
    }
  }

  return (
    <div className="flex flex-col h-[350px]">
      <ScrollArea className="flex-1 pr-4">
        <div className="space-y-4">
          {comments.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-4">
              Nenhum comentário nesta versão.
            </p>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="flex gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarFallback>{c.expand?.user_id?.name?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <div className="flex-1 bg-muted/50 rounded-lg p-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-semibold">
                      {c.expand?.user_id?.name || 'Usuário'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(c.created), 'dd/MM/yy HH:mm')}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{c.content}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
      <div className="pt-4 flex gap-2 border-t mt-4">
        <Textarea
          placeholder="Adicione um comentário..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="resize-none h-10 min-h-[40px]"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleAddComment()
            }
          }}
        />
        <Button size="icon" onClick={handleAddComment}>
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
