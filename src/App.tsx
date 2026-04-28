import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { EconomicProvider } from '@/stores/economic'
import { PaymentCapacityMLProvider } from '@/stores/payment-capacity-ml'
import { AuthProvider, useAuth } from '@/hooks/use-auth'
import { ProtectedRoute } from '@/components/ProtectedRoute'

import Layout from '@/components/Layout'

// Consult Plan
import ConsultHome from '@/pages/consult-plan/Home'
import ConsultFunding from '@/pages/consult-plan/Funding'
import ConsultEntregaveis from '@/pages/consult-plan/Entregaveis'
import ConsultContato from '@/pages/consult-plan/Contato'
import ConsultBeneficios from '@/pages/consult-plan/Beneficios'
import ConsultSolicitarDiagnostico from '@/pages/consult-plan/SolicitarDiagnostico'
import ConsultSimuladores from '@/pages/consult-plan/Simuladores'

// Portal Cliente
import AnaliseFinanceira from '@/pages/portal-cliente/AnaliseFinanceira'
import DashboardExecutivo from '@/pages/portal-cliente/DashboardExecutivo'
import MeuProjeto from '@/pages/portal-cliente/MeuProjeto'
import Cenarios from '@/pages/portal-cliente/Cenarios'
import AnalisesSalvas from '@/pages/portal-cliente/AnalisesSalvas'
import Acompanhamento from '@/pages/portal-cliente/Acompanhamento'
import PortalClienteHome from '@/pages/portal-cliente/Home'
import ClientDashboard from '@/pages/portal-cliente/Dashboard'
import Simulador from '@/pages/portal-cliente/Simulador'
import DebtAnalysisPage from '@/pages/DebtAnalysis'
import HistoricoIndexadores from '@/pages/portal-cliente/HistoricoIndexadores'
import TaxasMercado from '@/pages/portal-cliente/TaxasMercado'
import InvestimentosCenarios from '@/pages/portal-cliente/InvestimentosCenarios'

// Admin
import AdminLogin from '@/pages/admin/Login'
import PortalAdminHome from '@/pages/admin/Home'
import AdminDashboard from '@/pages/admin/Dashboard'
import AdminParceiros from '@/pages/admin/Parceiros'
import AdminClientes from '@/pages/admin/Clientes'
import AdminAdministradores from '@/pages/admin/Administradores'
import Admin from '@/pages/admin/index'

// Portal Parceiro
import AreaParceiro from '@/pages/area-parceiro/index'
import GestaoClientes from '@/pages/portal-parceiro/GestaoClientes'
import AnexarDocumentos from '@/pages/portal-parceiro/AnexarDocumentos'
import PipelineDemandas from '@/pages/portal-parceiro/PipelineDemandas'
import PortalParceiroHome from '@/pages/portal-parceiro/Home'
import CrmParceiros from '@/pages/portal-parceiro/CrmParceiros'
import GestaoPendencias from '@/pages/portal-parceiro/GestaoPendencias'
import CadastrarCliente from '@/pages/portal-parceiro/CadastrarCliente'
import MeusClientes from '@/pages/portal-parceiro/MeusClientes'
import MinhasComissoes from '@/pages/portal-parceiro/MinhasComissoes'

import AdminProspeccoes from '@/pages/admin/Prospeccoes'
import AdminComissoes from '@/pages/admin/Comissoes'

import AlertasResponsavel from '@/pages/responsavel/Alertas'
import MeusClientesAssistente from '@/pages/assistente/MeusClientes'

import LoginPage from '@/pages/Login'
import SignupPage from '@/pages/Signup'
import CadastroParceiro from '@/pages/CadastroParceiro'
import LoginParceiro from '@/pages/LoginParceiro'
import PortalParceiroDashboard from '@/pages/portal-parceiro/Dashboard'
import NotFound from '@/pages/NotFound'
import SolicitarParceria from '@/pages/SolicitarParceria'

const RootRedirect = () => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 dark:bg-slate-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 animate-pulse">
          Carregando ambiente...
        </p>
      </div>
    )
  }

  if (user) {
    // Tenta pegar a role do metadata primeiro, senão usa a role padrão
    const role =
      (user as any).tipo_usuario || user.user_metadata?.tipo_usuario || (user as any).role

    // Redirecionamentos seguros com fallback
    if (role === 'admin' || role === 'administrador') {
      return <Navigate to="/admin/dashboard" replace />
    }
    if (role === 'parceiro') {
      return <Navigate to="/portal/parceiro" replace />
    }
    if (role === 'cliente') {
      return <Navigate to="/portal-cliente/dashboard" replace />
    }
    // Fallback para usuário autenticado mas sem role definida clara
    return <Navigate to="/portal-cliente/dashboard" replace />
  }

  // Fallback padrão seguro para rota pública que sempre existe
  return <Navigate to="/login" replace />
}

const SessionCleaner = () => {
  useEffect(() => {
    const checkSession = () => {
      try {
        const keys = Object.keys(localStorage)
        let hasInvalidSession = false
        for (const key of keys) {
          if (key.startsWith('sb-') && key.endsWith('-auth-token')) {
            const authData = localStorage.getItem(key)
            if (authData) {
              try {
                const parsed = JSON.parse(authData)
                // Limpa sessões conflitantes ou erros de autenticação
                if (parsed?.error || (parsed?.user && !parsed?.user?.id)) {
                  localStorage.removeItem(key)
                  hasInvalidSession = true
                }
              } catch (err) {
                localStorage.removeItem(key)
                hasInvalidSession = true
              }
            }
          }
        }
        if (hasInvalidSession && window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
      } catch (err) {
        // Fail silently se o localStorage estiver inacessível
      }
    }
    checkSession()
  }, [])
  return null
}

const App = () => (
  <AuthProvider>
    <SessionCleaner />
    <EconomicProvider>
      <PaymentCapacityMLProvider>
        <BrowserRouter>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/cadastro-parceiro" element={<CadastroParceiro />} />
              <Route path="/login-parceiro" element={<LoginParceiro />} />
              <Route path="/admin/login" element={<AdminLogin />} />

              <Route element={<Layout />}>
                {/* Public routes */}
                <Route path="/" element={<RootRedirect />} />
                <Route path="/consult-plan/home" element={<ConsultHome />} />
                <Route path="/consult-plan/funding" element={<ConsultFunding />} />
                <Route path="/consult-plan/entregaveis" element={<ConsultEntregaveis />} />
                <Route path="/consult-plan/beneficios" element={<ConsultBeneficios />} />
                <Route
                  path="/consult-plan/solicitar-diagnostico"
                  element={<ConsultSolicitarDiagnostico />}
                />
                <Route path="/consult-plan/contato" element={<ConsultContato />} />
                <Route path="/consult-plan/simuladores" element={<ConsultSimuladores />} />

                {/* Public Portal Landing Pages (Acesso Livre) */}
                <Route path="/portal-cliente" element={<PortalClienteHome />} />
                <Route path="/portal-parceiro" element={<PortalParceiroHome />} />
                <Route path="/portal-administrador" element={<PortalAdminHome />} />

                {/* Protected routes - Authenticated General */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/solicitar-parceria" element={<SolicitarParceria />} />
                </Route>

                {/* Protected routes - Cliente */}
                <Route
                  element={<ProtectedRoute allowedRoles={['cliente', 'admin', '', undefined]} />}
                >
                  <Route path="/portal-cliente/dashboard" element={<ClientDashboard />} />
                  <Route
                    path="/portal-cliente/analise-financeira"
                    element={<AnaliseFinanceira />}
                  />
                  <Route path="/portal-cliente/meu-projeto" element={<MeuProjeto />} />
                  <Route
                    path="/portal-cliente/dashboard-executivo"
                    element={<DashboardExecutivo />}
                  />
                  <Route path="/portal-cliente/cenarios" element={<Cenarios />} />
                  <Route path="/portal-cliente/analises-salvas" element={<AnalisesSalvas />} />
                  <Route
                    path="/portal-cliente/acompanhamento-desempenho"
                    element={<Acompanhamento />}
                  />
                  <Route path="/portal-cliente/simulador-financeiro" element={<Simulador />} />
                  <Route path="/portal-cliente/mapa-dividas" element={<DebtAnalysisPage />} />
                  <Route
                    path="/portal-cliente/historico-indexadores"
                    element={<HistoricoIndexadores />}
                  />
                  <Route path="/portal-cliente/taxas-mercado" element={<TaxasMercado />} />
                  <Route
                    path="/portal-cliente/investimentos-cenarios"
                    element={<InvestimentosCenarios />}
                  />
                </Route>

                {/* Protected routes - Parceiro */}
                <Route element={<ProtectedRoute allowedRoles={['parceiro', 'admin']} />}>
                  <Route path="/portal/parceiro" element={<PortalParceiroDashboard />} />
                  <Route path="/portal-parceiro/gestao-clientes" element={<GestaoClientes />} />
                  <Route path="/portal-parceiro/anexar-documentos" element={<AnexarDocumentos />} />
                  <Route path="/portal-parceiro/pipeline-demandas" element={<PipelineDemandas />} />
                  <Route path="/portal-parceiro/crm-parceiros" element={<CrmParceiros />} />
                  <Route path="/portal-parceiro/gestao-pendencias" element={<GestaoPendencias />} />

                  <Route path="/area-parceiro" element={<AreaParceiro />}>
                    <Route index element={<Navigate to="/portal/parceiro" replace />} />
                    <Route path="cadastrar-cliente" element={<CadastrarCliente />} />
                    <Route path="meus-clientes" element={<MeusClientes />} />
                    <Route path="minhas-comissoes" element={<MinhasComissoes />} />
                    <Route path="*" element={<Navigate to="/portal/parceiro" replace />} />
                  </Route>
                </Route>

                {/* Protected routes - Responsavel */}
                <Route element={<ProtectedRoute allowedRoles={['responsavel', 'admin']} />}>
                  <Route path="/responsavel/alertas" element={<AlertasResponsavel />} />
                </Route>

                {/* Protected routes - Assistente */}
                <Route element={<ProtectedRoute allowedRoles={['assistente', 'admin']} />}>
                  <Route path="/assistente/meus-clientes" element={<MeusClientesAssistente />} />
                </Route>

                {/* Protected routes - Admin */}
                <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                  <Route path="/admin" element={<Admin />}>
                    <Route index element={<Navigate to="/admin/dashboard" replace />} />
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="parceiros" element={<AdminParceiros />} />
                    <Route path="clientes" element={<AdminClientes />} />
                    <Route path="administradores" element={<AdminAdministradores />} />
                    <Route path="prospeccoes" element={<AdminProspeccoes />} />
                    <Route path="comissoes" element={<AdminComissoes />} />
                    <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
                  </Route>
                </Route>
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </BrowserRouter>
      </PaymentCapacityMLProvider>
    </EconomicProvider>
  </AuthProvider>
)

export default App
