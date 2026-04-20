import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function AutomatedExplanatoryNote(props: any) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Nota Explicativa Automatizada</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          As notas explicativas automatizadas estarão disponíveis após o processamento dos dados e
          integração com a base de dados principal.
        </p>
      </CardContent>
    </Card>
  )
}
