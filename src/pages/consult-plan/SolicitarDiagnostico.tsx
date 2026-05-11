import { useState } from 'react'
import { Header } from '@/components/Header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import { SharedClientForm } from '@/components/forms/SharedClientForm'

export default function ConsultPlanSolicitarDiagnostico() {
  const [isSuccess, setIsSuccess] = useState(false)

  if (isSuccess) {
    return (
      <div className="flex flex-col h-full overflow-y-auto bg-muted/20">
        <Header title="Solicitar Diagnóstico" />
        <div className="p-6 md:p-8 max-w-3xl mx-auto w-full flex flex-col items-center justify-center text-center space-y-6 mt-12 animate-fade-in-up">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Solicitação Enviada!</h1>
          <p className="text-muted-foreground text-lg max-w-md">
            Obrigado! Recebemos os dados do seu projeto e nossa equipe de especialistas entrará em
            contato em breve para os próximos passos.
          </p>
          <Button asChild className="mt-8">
            <Link to="/consult-plan/home">Voltar para a Home</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-muted/20">
      <Header title="Solicitar Diagnóstico" />
      <div className="p-6 md:p-8 max-w-4xl mx-auto w-full space-y-8 animate-fade-in-up pb-20">
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild className="gap-2">
            <Link to="/consult-plan/home">
              <ArrowLeft className="w-4 h-4" /> Voltar
            </Link>
          </Button>
        </div>

        <div className="space-y-4">
          <h1 className="text-3xl font-bold tracking-tight text-primary">Solicitar Diagnóstico</h1>
          <p className="text-muted-foreground text-lg">
            Preencha o formulário abaixo para que nossa equipe entenda as necessidades do seu
            projeto e prepare uma análise inicial de viabilidade.
          </p>
        </div>

        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle>Dados da Empresa e Projeto</CardTitle>
            <CardDescription>
              As informações fornecidas serão tratadas com total confidencialidade.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SharedClientForm onSuccess={() => setIsSuccess(true)} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
