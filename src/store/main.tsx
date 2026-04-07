import React from 'react'
import { create } from 'zustand'

export type CompanyCategory =
  | 'Constituição Inicial'
  | 'Pequeno Porte'
  | 'Média e Grande Porte'
  | null

export interface CompanyDetails {
  razaoSocial?: string
  nomeFantasia?: string
  cnpj?: string
  endereco?: string
  cnae?: string
  setor?: string
  regimeTributario?: string
  dataFundacao?: Date
  contatos?: Array<{
    id: string
    nome: string
    cargo: string
    email: string
    celular: string
  }>
}

export interface BalanceSheet {
  year: number
  ativoCirculante: number
  disponibilidades?: number
  aplicacoesFinanceiras?: number
  clientesReceber?: number
  contasReceber?: number
  provisaoDevedores?: number
  estoques: number
  despesasAntecipadas?: number
  outrosRealizaveisCurtoPrazo?: number
  outrosCreditos?: number

  ativoNaoCirculante: number
  realizavelLongoPrazo?: number
  investimentos?: number
  imobilizado?: number
  depreciacaoAcumulada?: number
  outrosAtivosNaoCirculantes?: number
  intangivel?: number

  passivoCirculante: number
  fornecedores?: number
  obrigacoesFiscais?: number
  adiantamentoClientes?: number
  provisaoImpostosRenda?: number
  emprestimosCurtoPrazo?: number
  duplicatasDescontadas?: number
  outrasObrigacoesCirculantes?: number
  outrasObrigacoes?: number

  passivoNaoCirculante: number
  emprestimosLongoPrazo?: number
  outrasObrigacoesLongoPrazo?: number

  patrimonioLiquido: number
  capitalSocial?: number
  reservas?: number
  lucrosPrejuizosAcumulados?: number
  outrosRecursosPL?: number
}

export interface DRE {
  year: number
  receita: number
  impostosSobreVendas?: number
  devolucoesDescontosAbatimentos?: number
  cpv: number
  despesasOperacionais: number
  outrasReceitasOperacionaisTributaveis?: number
  despesasComPessoal?: number
  prestacaoServicosTerceiros?: number
  despesasComerciaisTributarias?: number
  despesasAdministrativas?: number
  outrasDespesasOperacionais?: number
  depreciacao?: number
  juros?: number
  receitasFinanceiras?: number
  despesasNaoOperacionais?: number
  receitasNaoOperacionais?: number
  provisaoImpostos?: number
  participacoesEReservas?: number
  outrasReceitasLiquidasNaoTributadas?: number
}

export interface Scenario {
  id: string
  name: string
  balanceSheets: BalanceSheet[]
}

export interface Notification {
  id: string
  type: 'discrepancy' | 'audit' | 'info'
  message: string
  timestamp: string | Date
  read: boolean
  link?: string
}

export interface AiAnalysisHistory {
  id: string
  section:
    | 'Ativo'
    | 'Passivo'
    | 'Patrimônio Líquido'
    | 'DRE'
    | 'Endividamento'
    | 'Receitas e Despesas'
    | 'Capacidade'
  text: string
  tone: string
  timestamp: string | Date
}

export interface FinancialData {
  balanceSheets: BalanceSheet[]
  dre: DRE[]
}

export interface FinancialStore {
  category: CompanyCategory
  setCategory: (c: CompanyCategory) => void
  currentStep: number
  setCurrentStep: (step: number) => void
  status: string
  setStatus: (status: string) => void
  baseYear: number
  setBaseYear: (year: number) => void

  companyDetails: CompanyDetails
  setCompanyDetails: (details: Partial<CompanyDetails>) => void

  balanceSheets: BalanceSheet[]
  updateBalanceSheet: (year: number, data: Partial<BalanceSheet>) => void

  dre: DRE[]
  updateDRE: (year: number, data: Partial<DRE>) => void

  currentExerciseDRE: any
  setCurrentExerciseDRE: (val: any) => void

  notifications: Notification[]
  markNotificationRead: (id: string) => void

  scenarios: Scenario[]
  activeScenarioId: string | null
  saveScenario: (name: string) => void
  loadScenario: (id: string) => void

  saveData: () => boolean
  saveAnalysis: () => void

  printMode: string
  setPrintMode: (mode: string) => void

  ativoNotes: string
  setAtivoNotes: (val: string) => void
  passivoNotes: string
  setPassivoNotes: (val: string) => void
  plNotes: string
  setPlNotes: (val: string) => void
  dreNotes: string
  setDreNotes: (val: string) => void

  aiAnalysisAtivo: string
  setAiAnalysisAtivo: (val: string) => void
  aiAnalysisPassivo: string
  setAiAnalysisPassivo: (val: string) => void
  aiAnalysisPL: string
  setAiAnalysisPL: (val: string) => void
  aiAnalysisDRE: string
  setAiAnalysisDRE: (val: string) => void
  aiAnalysisEndividamento: string
  setAiAnalysisEndividamento: (val: string) => void
  aiAnalysisCurrent: string
  setAiAnalysisCurrent: (val: string) => void
  aiAnalysisCapacidade: string
  setAiAnalysisCapacidade: (val: string) => void

  aiAnalysisHistory: AiAnalysisHistory[]
  addAiAnalysisHistory: (entry: Omit<AiAnalysisHistory, 'id' | 'timestamp'>) => void
  addAuditLog: (msg: string) => void

  economicValueData: any
  setEconomicValueData: (val: any | ((prev: any) => any)) => void
}

const currentYear = new Date().getFullYear()

export const useFinancialStore = create<FinancialStore>((set, get) => ({
  category: null,
  setCategory: (c) => set({ category: c }),
  currentStep: 1,
  setCurrentStep: (step) => set({ currentStep: step }),
  status: 'Rascunho',
  setStatus: (status) => set({ status }),
  baseYear: currentYear - 2,
  setBaseYear: (year) => set({ baseYear: year }),

  companyDetails: {},
  setCompanyDetails: (details) =>
    set((state) => ({ companyDetails: { ...state.companyDetails, ...details } })),

  balanceSheets: [
    {
      year: currentYear - 2,
      ativoCirculante: 0,
      estoques: 0,
      ativoNaoCirculante: 0,
      passivoCirculante: 0,
      passivoNaoCirculante: 0,
      patrimonioLiquido: 0,
    },
    {
      year: currentYear - 1,
      ativoCirculante: 0,
      estoques: 0,
      ativoNaoCirculante: 0,
      passivoCirculante: 0,
      passivoNaoCirculante: 0,
      patrimonioLiquido: 0,
    },
    {
      year: currentYear,
      ativoCirculante: 0,
      estoques: 0,
      ativoNaoCirculante: 0,
      passivoCirculante: 0,
      passivoNaoCirculante: 0,
      patrimonioLiquido: 0,
    },
    {
      year: currentYear + 1,
      ativoCirculante: 0,
      estoques: 0,
      ativoNaoCirculante: 0,
      passivoCirculante: 0,
      passivoNaoCirculante: 0,
      patrimonioLiquido: 0,
    },
  ],
  updateBalanceSheet: (year, data) =>
    set((state) => {
      let exists = false
      const newBs = state.balanceSheets.map((b) => {
        if (b.year === year) {
          exists = true
          return { ...b, ...data }
        }
        return b
      })
      if (!exists) {
        newBs.push({
          year,
          ativoCirculante: 0,
          estoques: 0,
          ativoNaoCirculante: 0,
          passivoCirculante: 0,
          passivoNaoCirculante: 0,
          patrimonioLiquido: 0,
          ...data,
        })
      }
      return { balanceSheets: newBs }
    }),

  dre: [],
  updateDRE: (year, data) =>
    set((state) => {
      let exists = false
      const newDre = state.dre.map((d) => {
        if (d.year === year) {
          exists = true
          return { ...d, ...data }
        }
        return d
      })
      if (!exists) {
        newDre.push({
          year,
          receita: 0,
          cpv: 0,
          despesasOperacionais: 0,
          ...data,
        })
      }
      return { dre: newDre }
    }),

  currentExerciseDRE: {},
  setCurrentExerciseDRE: (val) =>
    set((state) => ({ currentExerciseDRE: { ...state.currentExerciseDRE, ...val } })),

  notifications: [],
  markNotificationRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    })),

  scenarios: [],
  activeScenarioId: null,
  saveScenario: (name) =>
    set((state) => {
      const newScenario = { id: crypto.randomUUID(), name, balanceSheets: [...state.balanceSheets] }
      return { scenarios: [...state.scenarios, newScenario], activeScenarioId: newScenario.id }
    }),
  loadScenario: (id) =>
    set((state) => {
      const sc = state.scenarios.find((s) => s.id === id)
      if (sc) return { balanceSheets: sc.balanceSheets, activeScenarioId: id }
      return {}
    }),

  saveData: () => true,
  saveAnalysis: () => {},

  printMode: 'default',
  setPrintMode: (mode) => set({ printMode: mode }),

  ativoNotes: '',
  setAtivoNotes: (val) => set({ ativoNotes: val }),
  passivoNotes: '',
  setPassivoNotes: (val) => set({ passivoNotes: val }),
  plNotes: '',
  setPlNotes: (val) => set({ plNotes: val }),
  dreNotes: '',
  setDreNotes: (val) => set({ dreNotes: val }),

  aiAnalysisAtivo: '',
  setAiAnalysisAtivo: (val) => set({ aiAnalysisAtivo: val }),
  aiAnalysisPassivo: '',
  setAiAnalysisPassivo: (val) => set({ aiAnalysisPassivo: val }),
  aiAnalysisPL: '',
  setAiAnalysisPL: (val) => set({ aiAnalysisPL: val }),
  aiAnalysisDRE: '',
  setAiAnalysisDRE: (val) => set({ aiAnalysisDRE: val }),
  aiAnalysisEndividamento: '',
  setAiAnalysisEndividamento: (val) => set({ aiAnalysisEndividamento: val }),
  aiAnalysisCurrent: '',
  setAiAnalysisCurrent: (val) => set({ aiAnalysisCurrent: val }),
  aiAnalysisCapacidade: '',
  setAiAnalysisCapacidade: (val) => set({ aiAnalysisCapacidade: val }),

  aiAnalysisHistory: [],
  addAiAnalysisHistory: (entry) =>
    set((state) => ({
      aiAnalysisHistory: [
        ...state.aiAnalysisHistory,
        { ...entry, id: crypto.randomUUID(), timestamp: new Date() },
      ],
    })),
  addAuditLog: (msg) => {},

  economicValueData: {},
  setEconomicValueData: (val) =>
    set((state) => ({
      economicValueData: typeof val === 'function' ? val(state.economicValueData) : val,
    })),
}))

export const FinancialProvider = ({ children }: { children: React.ReactNode }) => {
  return React.createElement(React.Fragment, null, children)
}

interface DataState {
  baseYear: number
  setBaseYear: (year: number) => void
  clearAllData: () => void
  clearBankDebtsData: () => void
}

export const useDataStore = create<DataState>((set) => ({
  baseYear: currentYear,
  setBaseYear: (year) => set({ baseYear: year }),

  clearAllData: () => {
    set((state) => ({ ...state }))
  },

  clearBankDebtsData: () => {
    set((state) => ({ ...state }))
  },
}))
