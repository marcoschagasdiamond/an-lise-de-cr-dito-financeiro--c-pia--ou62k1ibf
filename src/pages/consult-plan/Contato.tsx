import { Header } from '@/components/Header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

export default function ConsultPlanContato() {
  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <Header title="Formulário de Contato" />
      <div className="p-6 md:p-8 max-w-2xl mx-auto w-full">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Fale com Nossos Especialistas</CardTitle>
            <CardDescription>
              Deixe suas informações para agendarmos um diagnóstico preliminar gratuito.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="space-y-2">
                <Label>Nome Completo</Label>
                <Input placeholder="Seu nome" />
              </div>
              <div className="space-y-2">
                <Label>Empresa</Label>
                <Input placeholder="Nome da sua empresa" />
              </div>
              <div className="space-y-2">
                <Label>E-mail Corporativo</Label>
                <Input type="email" placeholder="seu@email.com.br" />
              </div>
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input placeholder="(11) 99999-9999" />
              </div>
              <Button className="w-full mt-4" type="button">
                Enviar Solicitação
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
