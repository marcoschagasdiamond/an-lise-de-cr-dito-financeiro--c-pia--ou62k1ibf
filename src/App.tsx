import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { FinancialProvider } from '@/store/main'
import { EconomicProvider } from '@/stores/economic'
import { PaymentCapacityMLProvider } from '@/stores/payment-capacity-ml'
import { AuthProvider } from '@/hooks/use-auth'
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

const App = () => (
  <AuthProvider>
    <FinancialProvider>
      <EconomicProvider>
        <PaymentCapacityMLProvider>
          <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
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
                  <Route path="/" element={<Navigate to="/consult-plan/home" replace />} />
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
                    element={
                      <ProtectedRoute allowedRoles={['cliente', 'administrador', '', undefined]} />
                    }
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
                  <Route element={<ProtectedRoute allowedRoles={['parceiro', 'administrador']} />}>
                    <Route path="/portal/parceiro" element={<PortalParceiroDashboard />} />
                    <Route
                      path="/portal-parceiro"
                      element={<Navigate to="/portal/parceiro" replace />}
                    />
                    <Route path="/portal-parceiro/gestao-clientes" element={<GestaoClientes />} />
                    <Route
                      path="/portal-parceiro/anexar-documentos"
                      element={<AnexarDocumentos />}
                    />
                    <Route
                      path="/portal-parceiro/pipeline-demandas"
                      element={<PipelineDemandas />}
                    />
                    <Route path="/portal-parceiro/crm-parceiros" element={<CrmParceiros />} />
                    <Route
                      path="/portal-parceiro/gestao-pendencias"
                      element={<GestaoPendencias />}
                    />

                    <Route path="/area-parceiro" element={<AreaParceiro />}>
                      <Route index element={<Navigate to="/portal/parceiro" replace />} />
                      <Route path="cadastrar-cliente" element={<CadastrarCliente />} />
                      <Route path="meus-clientes" element={<MeusClientes />} />
                      <Route path="minhas-comissoes" element={<MinhasComissoes />} />
                      <Route path="*" element={<Navigate to="/portal/parceiro" replace />} />
                    </Route>
                  </Route>

                  {/* Protected routes - Responsavel */}
                  <Route
                    element={<ProtectedRoute allowedRoles={['responsavel', 'administrador']} />}
                  >
                    <Route path="/responsavel/alertas" element={<AlertasResponsavel />} />
                  </Route>

                  {/* Protected routes - Assistente */}
                  <Route
                    element={<ProtectedRoute allowedRoles={['assistente', 'administrador']} />}
                  >
                    <Route path="/assistente/meus-clientes" element={<MeusClientesAssistente />} />
                  </Route>

                  {/* Protected routes - Admin */}
                  <Route element={<ProtectedRoute allowedRoles={['administrador']} />}>
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
    </FinancialProvider>
  </AuthProvider>
)

export default App
