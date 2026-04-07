import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import pb from '@/lib/pocketbase/client'
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
  if (v.length > 10) {
    return v.replace(/^(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  }
  return v.replace(/^(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
}

export default function CadastroParceiro() {
  const [nomeEmpresa, setNomeEmpresa] = useState('')
  const [cnpj, setCnpj] = useState('')
  const [email, setEmail] = useState('')
  const [telefone, setTelefone] = useState('')
  const [cpf, setCpf] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')

  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const navigate = useNavigate()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password.length < 8) {
      setErrors({ password: 'A senha deve ter no mínimo 8 caracteres' })
      return
    }

    if (password !== passwordConfirm) {
      setErrors({ passwordConfirm: 'As senhas não coincidem' })
      return
    }

    setErrors({})
    setLoading(true)

    try {
      await pb.collection('users').create({
        email,
        password,
        passwordConfirm,
        name: nomeEmpresa,
        role: 'parceiro',
        status: 'pendente_aprovacao',
      })

      await pb.collection('users').authWithPassword(email, password)

      if (pb.authStore.record) {
        await pb.collection('parceiros').create({
          usuario_id: pb.authStore.record.id,
          nome_empresa: nomeEmpresa,
          cnpj: cnpj.replace(/\D/g, ''),
          email,
          telefone: telefone.replace(/\D/g, ''),
          cpf: cpf.replace(/\D/g, ''),
          status: 'pendente',
        })
      }

      pb.authStore.clear()

      toast({
        title: 'Cadastro realizado!',
        description: 'Aguarde aprovação do administrador.',
      })
      navigate('/login-parceiro')
    } catch (error: any) {
      pb.authStore.clear()
      const fieldErrors = extractFieldErrors(error)
      if (Object.keys(fieldErrors).length > 0) {
        setErrors(fieldErrors)
      } else {
        toast({
          title: 'Erro ao cadastrar',
          description: 'Verifique os dados informados ou se o email já está em uso.',
          variant: 'destructive',
        })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 px-4 py-8 w-full">
      <Card className="w-full max-w-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Cadastro de Parceiro</CardTitle>
          <CardDescription>Preencha os dados abaixo para solicitar sua parceria.</CardDescription>
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
              {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                />
                {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="passwordConfirm">Confirmar Senha</Label>
                <Input
                  id="passwordConfirm"
                  type="password"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  required
                  minLength={8}
                />
                {errors.passwordConfirm && (
                  <p className="text-xs text-red-500">{errors.passwordConfirm}</p>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Cadastrar
            </Button>
            <div className="text-sm text-center text-muted-foreground">
              Já é um parceiro?{' '}
              <Link to="/login-parceiro" className="text-primary hover:underline">
                Faça login
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
