import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import pb from '@/lib/pocketbase/client'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'
import { extractFieldErrors } from '@/lib/pocketbase/errors'

const maskCnpj = (v: string) => {
  v = v.replace(/\D/g, '')
  if (v.length > 14) v = v.substring(0, 14)
  return v
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
}

const maskCpf = (v: string) => {
  v = v.replace(/\D/g, '')
  if (v.length > 11) v = v.substring(0, 11)
  return v
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/(\d{3})\.(\d{3})\.(\d{3})(\d{1,2})$/, '$1.$2.$3-$4')
}

const maskPhone = (v: string) => {
  v = v.replace(/\D/g, '')
  if (v.length > 11) v = v.substring(0, 11)
  if (v.length > 10) return v.replace(/^(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  return v.replace(/^(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
}

export default function SolicitarParceria() {
  const { user } = useAuth()
  const [nomeEmpresa, setNomeEmpresa] = useState('')
  const [cnpj, setCnpj] = useState('')
  const [email, setEmail] = useState(user?.email || '')
  const [telefone, setTelefone] = useState('')
  const [cpf, setCpf] = useState('')

  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const navigate = useNavigate()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setLoading(true)

    try {
      if (!user?.id) throw new Error('Usuário não autenticado')

      await pb.collection('parceiros').create({
        usuario_id: user.id,
        nome_empresa: nomeEmpresa,
        cnpj: cnpj.replace(/\D/g, ''),
        email,
        telefone: telefone.replace(/\D/g, ''),
        cpf: cpf.replace(/\D/g, ''),
        status: 'pendente',
      })

      await pb.collection('users').update(user.id, {
        status: 'pendente_aprovacao',
      })

      toast({
        title: 'Solicitação enviada!',
        description: 'Sua solicitação de parceria foi enviada e está aguardando aprovação.',
      })
      navigate('/consult-plan/home')
    } catch (error: any) {
      const fieldErrors = extractFieldErrors(error)
      if (Object.keys(fieldErrors).length > 0) {
        setErrors(fieldErrors)
      } else {
        toast({
          title: 'Erro na solicitação',
          description: 'Verifique os dados informados ou tente novamente mais tarde.',
          variant: 'destructive',
        })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] w-full py-8 bg-slate-50 dark:bg-slate-950 px-4">
      <Card className="w-full max-w-lg shadow-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Solicitar Parceria</CardTitle>
          <CardDescription>
            Preencha os dados abaixo para solicitar sua conta de parceiro.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nomeEmpresa">Nome da Empresa</Label>
              <Input
                id="nomeEmpresa"
                type="text"
                placeholder="Razão Social ou Nome Fantasia"
                value={nomeEmpresa}
                onChange={(e) => setNomeEmpresa(e.target.value)}
                required
              />
              {errors.nome_empresa && <p className="text-xs text-red-500">{errors.nome_empresa}</p>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cnpj">CNPJ</Label>
                <Input
                  id="cnpj"
                  type="text"
                  placeholder="00.000.000/0000-00"
                  value={cnpj}
                  onChange={(e) => setCnpj(maskCnpj(e.target.value))}
                  required
                />
                {errors.cnpj && <p className="text-xs text-red-500">{errors.cnpj}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="cpf">CPF (Responsável)</Label>
                <Input
                  id="cpf"
                  type="text"
                  placeholder="000.000.000-00"
                  value={cpf}
                  onChange={(e) => setCpf(maskCpf(e.target.value))}
                  required
                />
                {errors.cpf && <p className="text-xs text-red-500">{errors.cpf}</p>}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Corporativo</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="contato@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  type="text"
                  placeholder="(00) 00000-0000"
                  value={telefone}
                  onChange={(e) => setTelefone(maskPhone(e.target.value))}
                  required
                />
                {errors.telefone && <p className="text-xs text-red-500">{errors.telefone}</p>}
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enviar Solicitação
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
