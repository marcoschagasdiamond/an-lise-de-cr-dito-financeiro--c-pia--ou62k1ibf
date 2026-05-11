import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import { SharedClientForm } from '@/components/forms/SharedClientForm'

export default function CadastrarCliente() {
  const navigate = useNavigate()

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Button variant="ghost" className="mb-6" onClick={() => navigate(-1)}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Cadastrar Novo Cliente</CardTitle>
          <CardDescription>
            Preencha os dados abaixo para cadastrar um novo cliente vinculado à sua conta.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SharedClientForm onSuccess={() => navigate('/portal/parceiro')} />
        </CardContent>
      </Card>
    </div>
  )
}
