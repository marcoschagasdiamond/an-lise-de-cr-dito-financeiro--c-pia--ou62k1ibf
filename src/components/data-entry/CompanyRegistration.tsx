import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useFinancialStore } from '@/store/main'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CalendarIcon, ArrowLeft, ArrowRight, Building, Plus, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export function CompanyRegistration() {
  const { companyDetails, setCompanyDetails, setCurrentStep, setCategory } = useFinancialStore()

  const getSafeDate = (dateVal: any): Date | undefined => {
    try {
      if (!dateVal) return undefined
      if (dateVal instanceof Date) return isNaN(dateVal.getTime()) ? undefined : dateVal
      if (typeof dateVal === 'string') {
        const parsed = new Date(dateVal)
        return isNaN(parsed.getTime()) ? undefined : parsed
      }
      return undefined
    } catch (e) {
      return undefined
    }
  }

  const safeDate = getSafeDate(companyDetails.dataFundacao)

  const handleBack = () => {
    setCategory(null)
    setCurrentStep(1)
  }

  const handleContinue = () => {
    setCurrentStep(3)
  }

  const addContact = () => {
    setCompanyDetails({
      contatos: [
        ...(companyDetails.contatos || []),
        { id: crypto.randomUUID(), nome: '', cargo: '', email: '', celular: '' },
      ],
    })
  }

  const updateContact = (id: string, field: string, value: string) => {
    setCompanyDetails({
      contatos: (companyDetails.contatos || []).map((c) =>
        c.id === id ? { ...c, [field]: value } : c,
      ),
    })
  }

  const removeContact = (id: string) => {
    setCompanyDetails({
      contatos: (companyDetails.contatos || []).filter((c) => c.id !== id),
    })
  }

  const isValid = companyDetails.razaoSocial?.trim() !== ''

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up mt-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={handleBack} className="shrink-0">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <Building className="w-8 h-8 text-primary" />
            Cadastro da Empresa
          </h2>
          <p className="text-muted-foreground text-lg mt-1">
            Preencha os dados de identificação do cliente para prosseguir. Apenas a Razão Social é
            obrigatória.
          </p>
        </div>
      </div>

      <Card className="border-border/50 shadow-sm">
        <CardContent className="p-8 space-y-6">
          <h3 className="font-bold text-lg border-b pb-2">Informações Legais e Operacionais</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label
                htmlFor="razaoSocial"
                className="text-sm font-semibold flex items-center gap-1"
              >
                Razão Social <span className="text-destructive">*</span>
              </Label>
              <Input
                id="razaoSocial"
                value={companyDetails.razaoSocial || ''}
                onChange={(e) => setCompanyDetails({ razaoSocial: e.target.value })}
                placeholder="Ex: Empresa Exemplo LTDA"
                className="h-11"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="nomeFantasia" className="text-sm font-semibold">
                Nome Fantasia
              </Label>
              <Input
                id="nomeFantasia"
                value={companyDetails.nomeFantasia || ''}
                onChange={(e) => setCompanyDetails({ nomeFantasia: e.target.value })}
                placeholder="Nome fantasia da empresa"
                className="h-11"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="cnpj" className="text-sm font-semibold">
                CNPJ
              </Label>
              <Input
                id="cnpj"
                value={companyDetails.cnpj || ''}
                onChange={(e) => setCompanyDetails({ cnpj: e.target.value })}
                placeholder="00.000.000/0000-00"
                className="h-11"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="endereco" className="text-sm font-semibold">
                Endereço Completo
              </Label>
              <Input
                id="endereco"
                value={companyDetails.endereco || ''}
                onChange={(e) => setCompanyDetails({ endereco: e.target.value })}
                placeholder="Rua, Número, Bairro, Cidade, UF"
                className="h-11"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="cnae" className="text-sm font-semibold">
                CNAE Fiscal
              </Label>
              <Input
                id="cnae"
                value={companyDetails.cnae || ''}
                onChange={(e) => setCompanyDetails({ cnae: e.target.value })}
                placeholder="Código CNAE"
                className="h-11"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="setor" className="text-sm font-semibold">
                Ramo de Atividade / Setor
              </Label>
              <Input
                id="setor"
                value={companyDetails.setor || ''}
                onChange={(e) => setCompanyDetails({ setor: e.target.value })}
                placeholder="Ex: Varejo, Tecnologia, Indústria"
                className="h-11"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="regimeTributario" className="text-sm font-semibold">
                Regime Tributário
              </Label>
              <Input
                id="regimeTributario"
                value={companyDetails.regimeTributario || ''}
                onChange={(e) => setCompanyDetails({ regimeTributario: e.target.value })}
                placeholder="Ex: Lucro Real, Lucro Presumido, Simples"
                className="h-11"
              />
            </div>

            <div className="space-y-3 flex flex-col justify-end">
              <Label className="text-sm font-semibold mb-3">Data de Fundação</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full h-11 justify-start text-left font-normal',
                      !safeDate && 'text-muted-foreground',
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {safeDate ? (
                      format(safeDate, 'PP', { locale: ptBR })
                    ) : (
                      <span>Selecione uma data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={safeDate}
                    onSelect={(date) => setCompanyDetails({ dataFundacao: date })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50 shadow-sm">
        <CardContent className="p-8 space-y-6">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="font-bold text-lg">Contatos Diretos</h3>
            <Button variant="outline" size="sm" onClick={addContact} className="gap-2">
              <Plus className="w-4 h-4" /> Inserir mais um contato
            </Button>
          </div>

          <div className="space-y-6">
            {(!companyDetails.contatos || companyDetails.contatos.length === 0) && (
              <p className="text-muted-foreground text-sm text-center py-4">
                Nenhum contato adicionado. Clique no botão acima para adicionar.
              </p>
            )}

            {companyDetails.contatos?.map((contato, index) => (
              <div key={contato.id} className="p-4 bg-muted/30 border rounded-md relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  onClick={() => removeContact(contato.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <div className="space-y-2">
                    <Label className="text-xs">Diretor(a) Responsável / Nome</Label>
                    <Input
                      value={contato.nome}
                      onChange={(e) => updateContact(contato.id, 'nome', e.target.value)}
                      placeholder="Nome do contato"
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Cargo</Label>
                    <Input
                      value={contato.cargo}
                      onChange={(e) => updateContact(contato.id, 'cargo', e.target.value)}
                      placeholder="Ex: Sócio, Diretor Financeiro"
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">E-mail</Label>
                    <Input
                      type="email"
                      value={contato.email}
                      onChange={(e) => updateContact(contato.id, 'email', e.target.value)}
                      placeholder="contato@empresa.com"
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Celular / Telefone</Label>
                    <Input
                      value={contato.celular}
                      onChange={(e) => updateContact(contato.id, 'celular', e.target.value)}
                      placeholder="(00) 00000-0000"
                      className="h-9"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center pt-4 border-t pb-10">
        <Button variant="ghost" onClick={handleBack} className="text-muted-foreground">
          Voltar para Seleção
        </Button>
        <Button onClick={handleContinue} disabled={!isValid} size="lg" className="px-8">
          Continuar <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  )
}
