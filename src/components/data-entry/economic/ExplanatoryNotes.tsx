import { useState } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function ExplanatoryNotes(props: any) {
  const [notes, setNotes] = useState('')

  return (
    <div {...props}>
      <Card className="mt-6 shadow-sm">
        <CardHeader className="bg-slate-50/50 pb-4 border-b">
          <CardTitle className="text-lg text-[#003366]">Notas Explicativas</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-3">
            <Label className="text-sm font-medium text-slate-700">
              Observações e considerações sobre a análise econômica
            </Label>
            <Textarea
              placeholder="Insira as notas explicativas e premissas utilizadas nesta análise..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={6}
              className="resize-y"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
