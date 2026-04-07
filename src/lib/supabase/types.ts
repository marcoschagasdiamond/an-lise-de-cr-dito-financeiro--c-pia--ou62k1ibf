// AVOID UPDATING THIS FILE DIRECTLY. It is automatically generated.
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.4'
  }
  public: {
    Tables: {
      acompanhamento_projetos: {
        Row: {
          data_criacao: string | null
          data_evento: string | null
          descricao: string | null
          id: string
          projeto_id: string | null
          responsavel: string | null
          tipo_evento: string | null
        }
        Insert: {
          data_criacao?: string | null
          data_evento?: string | null
          descricao?: string | null
          id?: string
          projeto_id?: string | null
          responsavel?: string | null
          tipo_evento?: string | null
        }
        Update: {
          data_criacao?: string | null
          data_evento?: string | null
          descricao?: string | null
          id?: string
          projeto_id?: string | null
          responsavel?: string | null
          tipo_evento?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'acompanhamento_projetos_projeto_id_fkey'
            columns: ['projeto_id']
            isOneToOne: false
            referencedRelation: 'projetos'
            referencedColumns: ['id']
          },
        ]
      }
      administradores: {
        Row: {
          data_criacao: string | null
          id: string
          nome: string | null
          permissoes: Json | null
          usuario_id: string | null
        }
        Insert: {
          data_criacao?: string | null
          id?: string
          nome?: string | null
          permissoes?: Json | null
          usuario_id?: string | null
        }
        Update: {
          data_criacao?: string | null
          id?: string
          nome?: string | null
          permissoes?: Json | null
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'administradores_usuario_id_fkey'
            columns: ['usuario_id']
            isOneToOne: false
            referencedRelation: 'usuarios'
            referencedColumns: ['id']
          },
        ]
      }
      analises_salvas: {
        Row: {
          cliente_id: string | null
          dados_analise: Json | null
          data_atualizacao: string | null
          data_criacao: string | null
          id: string
          nome_analise: string | null
          tipo_analise: string | null
        }
        Insert: {
          cliente_id?: string | null
          dados_analise?: Json | null
          data_atualizacao?: string | null
          data_criacao?: string | null
          id?: string
          nome_analise?: string | null
          tipo_analise?: string | null
        }
        Update: {
          cliente_id?: string | null
          dados_analise?: Json | null
          data_atualizacao?: string | null
          data_criacao?: string | null
          id?: string
          nome_analise?: string | null
          tipo_analise?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'analises_salvas_cliente_id_fkey'
            columns: ['cliente_id']
            isOneToOne: false
            referencedRelation: 'clientes'
            referencedColumns: ['id']
          },
        ]
      }
      balanco_patrimonial: {
        Row: {
          ano: number | null
          ativo_circulante: Json | null
          ativo_nao_circulante: Json | null
          data_criacao: string | null
          id: string
          passivo_circulante: Json | null
          passivo_nao_circulante: Json | null
          patrimonio_liquido: Json | null
          projeto_id: string | null
        }
        Insert: {
          ano?: number | null
          ativo_circulante?: Json | null
          ativo_nao_circulante?: Json | null
          data_criacao?: string | null
          id?: string
          passivo_circulante?: Json | null
          passivo_nao_circulante?: Json | null
          patrimonio_liquido?: Json | null
          projeto_id?: string | null
        }
        Update: {
          ano?: number | null
          ativo_circulante?: Json | null
          ativo_nao_circulante?: Json | null
          data_criacao?: string | null
          id?: string
          passivo_circulante?: Json | null
          passivo_nao_circulante?: Json | null
          patrimonio_liquido?: Json | null
          projeto_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'balanco_patrimonial_projeto_id_fkey'
            columns: ['projeto_id']
            isOneToOne: false
            referencedRelation: 'projetos'
            referencedColumns: ['id']
          },
        ]
      }
      cenarios_financiamento: {
        Row: {
          ativo: boolean | null
          dados_cenario: Json | null
          data_criacao: string | null
          id: string
          projeto_id: string | null
          tipo_cenario: string | null
        }
        Insert: {
          ativo?: boolean | null
          dados_cenario?: Json | null
          data_criacao?: string | null
          id?: string
          projeto_id?: string | null
          tipo_cenario?: string | null
        }
        Update: {
          ativo?: boolean | null
          dados_cenario?: Json | null
          data_criacao?: string | null
          id?: string
          projeto_id?: string | null
          tipo_cenario?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'cenarios_financiamento_projeto_id_fkey'
            columns: ['projeto_id']
            isOneToOne: false
            referencedRelation: 'projetos'
            referencedColumns: ['id']
          },
        ]
      }
      cenarios_investimento: {
        Row: {
          data_criacao: string | null
          descricao: string | null
          id: string
          nome_cenario: string | null
          parametros: Json | null
          projeto_id: string | null
          resultados: Json | null
        }
        Insert: {
          data_criacao?: string | null
          descricao?: string | null
          id?: string
          nome_cenario?: string | null
          parametros?: Json | null
          projeto_id?: string | null
          resultados?: Json | null
        }
        Update: {
          data_criacao?: string | null
          descricao?: string | null
          id?: string
          nome_cenario?: string | null
          parametros?: Json | null
          projeto_id?: string | null
          resultados?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: 'cenarios_investimento_projeto_id_fkey'
            columns: ['projeto_id']
            isOneToOne: false
            referencedRelation: 'projetos'
            referencedColumns: ['id']
          },
        ]
      }
      clientes: {
        Row: {
          cnpj: string | null
          data_cadastro: string | null
          empresa_nome: string | null
          endereco: string | null
          faturamento_anual: number | null
          id: string
          telefone: string | null
          usuario_id: string | null
        }
        Insert: {
          cnpj?: string | null
          data_cadastro?: string | null
          empresa_nome?: string | null
          endereco?: string | null
          faturamento_anual?: number | null
          id?: string
          telefone?: string | null
          usuario_id?: string | null
        }
        Update: {
          cnpj?: string | null
          data_cadastro?: string | null
          empresa_nome?: string | null
          endereco?: string | null
          faturamento_anual?: number | null
          id?: string
          telefone?: string | null
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'clientes_usuario_id_fkey'
            columns: ['usuario_id']
            isOneToOne: false
            referencedRelation: 'usuarios'
            referencedColumns: ['id']
          },
        ]
      }
      comissoes: {
        Row: {
          cliente_id: string | null
          data_criacao: string | null
          data_pagamento: string | null
          id: string
          parceiro_id: string | null
          percentual: number | null
          status: string | null
          valor_comissao: number | null
        }
        Insert: {
          cliente_id?: string | null
          data_criacao?: string | null
          data_pagamento?: string | null
          id?: string
          parceiro_id?: string | null
          percentual?: number | null
          status?: string | null
          valor_comissao?: number | null
        }
        Update: {
          cliente_id?: string | null
          data_criacao?: string | null
          data_pagamento?: string | null
          id?: string
          parceiro_id?: string | null
          percentual?: number | null
          status?: string | null
          valor_comissao?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'comissoes_cliente_id_fkey'
            columns: ['cliente_id']
            isOneToOne: false
            referencedRelation: 'clientes'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'comissoes_parceiro_id_fkey'
            columns: ['parceiro_id']
            isOneToOne: false
            referencedRelation: 'parceiros'
            referencedColumns: ['id']
          },
        ]
      }
      crm_parceiros: {
        Row: {
          cliente_id: string | null
          data_criacao: string | null
          data_proxima_acao: string | null
          historico_interacoes: Json | null
          id: string
          parceiro_id: string | null
          proxima_acao: string | null
        }
        Insert: {
          cliente_id?: string | null
          data_criacao?: string | null
          data_proxima_acao?: string | null
          historico_interacoes?: Json | null
          id?: string
          parceiro_id?: string | null
          proxima_acao?: string | null
        }
        Update: {
          cliente_id?: string | null
          data_criacao?: string | null
          data_proxima_acao?: string | null
          historico_interacoes?: Json | null
          id?: string
          parceiro_id?: string | null
          proxima_acao?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'crm_parceiros_cliente_id_fkey'
            columns: ['cliente_id']
            isOneToOne: false
            referencedRelation: 'clientes'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'crm_parceiros_parceiro_id_fkey'
            columns: ['parceiro_id']
            isOneToOne: false
            referencedRelation: 'parceiros'
            referencedColumns: ['id']
          },
        ]
      }
      dashboard_metricas: {
        Row: {
          data_calculo: string | null
          id: string
          metrica_nome: string | null
          projeto_id: string | null
          valor: number | null
        }
        Insert: {
          data_calculo?: string | null
          id?: string
          metrica_nome?: string | null
          projeto_id?: string | null
          valor?: number | null
        }
        Update: {
          data_calculo?: string | null
          id?: string
          metrica_nome?: string | null
          projeto_id?: string | null
          valor?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'dashboard_metricas_projeto_id_fkey'
            columns: ['projeto_id']
            isOneToOne: false
            referencedRelation: 'projetos'
            referencedColumns: ['id']
          },
        ]
      }
      diagnosticos: {
        Row: {
          cliente_id: string | null
          data_atualizacao: string | null
          data_criacao: string | null
          descricao: string | null
          id: string
          riscos_identificados: Json | null
          tipo_diagnostico: string | null
        }
        Insert: {
          cliente_id?: string | null
          data_atualizacao?: string | null
          data_criacao?: string | null
          descricao?: string | null
          id?: string
          riscos_identificados?: Json | null
          tipo_diagnostico?: string | null
        }
        Update: {
          cliente_id?: string | null
          data_atualizacao?: string | null
          data_criacao?: string | null
          descricao?: string | null
          id?: string
          riscos_identificados?: Json | null
          tipo_diagnostico?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'diagnosticos_cliente_id_fkey'
            columns: ['cliente_id']
            isOneToOne: false
            referencedRelation: 'clientes'
            referencedColumns: ['id']
          },
        ]
      }
      documentos: {
        Row: {
          data_criacao: string | null
          data_upload: string | null
          id: string
          nome_documento: string | null
          projeto_id: string | null
          tipo_documento: string | null
          url_storage: string | null
        }
        Insert: {
          data_criacao?: string | null
          data_upload?: string | null
          id?: string
          nome_documento?: string | null
          projeto_id?: string | null
          tipo_documento?: string | null
          url_storage?: string | null
        }
        Update: {
          data_criacao?: string | null
          data_upload?: string | null
          id?: string
          nome_documento?: string | null
          projeto_id?: string | null
          tipo_documento?: string | null
          url_storage?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'documentos_projeto_id_fkey'
            columns: ['projeto_id']
            isOneToOne: false
            referencedRelation: 'projetos'
            referencedColumns: ['id']
          },
        ]
      }
      dre: {
        Row: {
          ano: number | null
          custos_vendas: number | null
          data_criacao: string | null
          deducoes: number | null
          despesas_financeiras: Json | null
          despesas_operacionais: Json | null
          ebitda: number | null
          ebitda_percentual: number | null
          id: string
          lucratividade: number | null
          lucro_liquido: number | null
          projeto_id: string | null
          provisao_ir_csll: number | null
          receita_bruta: number | null
          receita_liquida: number | null
          resultado_operacional: number | null
          resultado_operacional_bruto: number | null
        }
        Insert: {
          ano?: number | null
          custos_vendas?: number | null
          data_criacao?: string | null
          deducoes?: number | null
          despesas_financeiras?: Json | null
          despesas_operacionais?: Json | null
          ebitda?: number | null
          ebitda_percentual?: number | null
          id?: string
          lucratividade?: number | null
          lucro_liquido?: number | null
          projeto_id?: string | null
          provisao_ir_csll?: number | null
          receita_bruta?: number | null
          receita_liquida?: number | null
          resultado_operacional?: number | null
          resultado_operacional_bruto?: number | null
        }
        Update: {
          ano?: number | null
          custos_vendas?: number | null
          data_criacao?: string | null
          deducoes?: number | null
          despesas_financeiras?: Json | null
          despesas_operacionais?: Json | null
          ebitda?: number | null
          ebitda_percentual?: number | null
          id?: string
          lucratividade?: number | null
          lucro_liquido?: number | null
          projeto_id?: string | null
          provisao_ir_csll?: number | null
          receita_bruta?: number | null
          receita_liquida?: number | null
          resultado_operacional?: number | null
          resultado_operacional_bruto?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'dre_projeto_id_fkey'
            columns: ['projeto_id']
            isOneToOne: false
            referencedRelation: 'projetos'
            referencedColumns: ['id']
          },
        ]
      }
      dre_projetado: {
        Row: {
          ano: number | null
          custos_vendas: number | null
          data_criacao: string | null
          deducoes: number | null
          despesas_financeiras: number | null
          despesas_operacionais: number | null
          ebitda: number | null
          ebitda_percentual: number | null
          id: string
          lucratividade: number | null
          lucro_liquido: number | null
          projeto_id: string | null
          provisao_ir_csll: number | null
          receita_bruta: number | null
          receita_liquida: number | null
          resultado_operacional: number | null
          resultado_operacional_bruto: number | null
          tir: number | null
          vpl_10anos: number | null
          vpl_5anos: number | null
        }
        Insert: {
          ano?: number | null
          custos_vendas?: number | null
          data_criacao?: string | null
          deducoes?: number | null
          despesas_financeiras?: number | null
          despesas_operacionais?: number | null
          ebitda?: number | null
          ebitda_percentual?: number | null
          id?: string
          lucratividade?: number | null
          lucro_liquido?: number | null
          projeto_id?: string | null
          provisao_ir_csll?: number | null
          receita_bruta?: number | null
          receita_liquida?: number | null
          resultado_operacional?: number | null
          resultado_operacional_bruto?: number | null
          tir?: number | null
          vpl_10anos?: number | null
          vpl_5anos?: number | null
        }
        Update: {
          ano?: number | null
          custos_vendas?: number | null
          data_criacao?: string | null
          deducoes?: number | null
          despesas_financeiras?: number | null
          despesas_operacionais?: number | null
          ebitda?: number | null
          ebitda_percentual?: number | null
          id?: string
          lucratividade?: number | null
          lucro_liquido?: number | null
          projeto_id?: string | null
          provisao_ir_csll?: number | null
          receita_bruta?: number | null
          receita_liquida?: number | null
          resultado_operacional?: number | null
          resultado_operacional_bruto?: number | null
          tir?: number | null
          vpl_10anos?: number | null
          vpl_5anos?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'dre_projetado_projeto_id_fkey'
            columns: ['projeto_id']
            isOneToOne: false
            referencedRelation: 'projetos'
            referencedColumns: ['id']
          },
        ]
      }
      fluxo_caixa: {
        Row: {
          ano: number | null
          data_criacao: string | null
          entradas: Json | null
          id: string
          projeto_id: string | null
          saidas: Json | null
          saldo_final: number | null
          saldo_inicial: number | null
        }
        Insert: {
          ano?: number | null
          data_criacao?: string | null
          entradas?: Json | null
          id?: string
          projeto_id?: string | null
          saidas?: Json | null
          saldo_final?: number | null
          saldo_inicial?: number | null
        }
        Update: {
          ano?: number | null
          data_criacao?: string | null
          entradas?: Json | null
          id?: string
          projeto_id?: string | null
          saidas?: Json | null
          saldo_final?: number | null
          saldo_inicial?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'fluxo_caixa_projeto_id_fkey'
            columns: ['projeto_id']
            isOneToOne: false
            referencedRelation: 'projetos'
            referencedColumns: ['id']
          },
        ]
      }
      indicadores_financeiros: {
        Row: {
          ano: number | null
          data_criacao: string | null
          id: string
          margem_liquida: number | null
          payback: number | null
          projeto_id: string | null
          roa: number | null
          roe: number | null
          tir: number | null
          vpl_10anos: number | null
          vpl_5anos: number | null
        }
        Insert: {
          ano?: number | null
          data_criacao?: string | null
          id?: string
          margem_liquida?: number | null
          payback?: number | null
          projeto_id?: string | null
          roa?: number | null
          roe?: number | null
          tir?: number | null
          vpl_10anos?: number | null
          vpl_5anos?: number | null
        }
        Update: {
          ano?: number | null
          data_criacao?: string | null
          id?: string
          margem_liquida?: number | null
          payback?: number | null
          projeto_id?: string | null
          roa?: number | null
          roe?: number | null
          tir?: number | null
          vpl_10anos?: number | null
          vpl_5anos?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'indicadores_financeiros_projeto_id_fkey'
            columns: ['projeto_id']
            isOneToOne: false
            referencedRelation: 'projetos'
            referencedColumns: ['id']
          },
        ]
      }
      investimentos: {
        Row: {
          data_criacao: string | null
          descricao: string | null
          id: string
          projeto_id: string | null
          tipo_investimento: string | null
          valor: number | null
        }
        Insert: {
          data_criacao?: string | null
          descricao?: string | null
          id?: string
          projeto_id?: string | null
          tipo_investimento?: string | null
          valor?: number | null
        }
        Update: {
          data_criacao?: string | null
          descricao?: string | null
          id?: string
          projeto_id?: string | null
          tipo_investimento?: string | null
          valor?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'investimentos_projeto_id_fkey'
            columns: ['projeto_id']
            isOneToOne: false
            referencedRelation: 'projetos'
            referencedColumns: ['id']
          },
        ]
      }
      parametros_dre: {
        Row: {
          aliquota_ir_csll: number | null
          crescimento_anual: number | null
          data_criacao: string | null
          id: string
          margem_custos: number | null
          margem_deducoes: number | null
          margem_despesas_fin: number | null
          margem_despesas_op: number | null
          projeto_id: string | null
          receita_ano1: number | null
        }
        Insert: {
          aliquota_ir_csll?: number | null
          crescimento_anual?: number | null
          data_criacao?: string | null
          id?: string
          margem_custos?: number | null
          margem_deducoes?: number | null
          margem_despesas_fin?: number | null
          margem_despesas_op?: number | null
          projeto_id?: string | null
          receita_ano1?: number | null
        }
        Update: {
          aliquota_ir_csll?: number | null
          crescimento_anual?: number | null
          data_criacao?: string | null
          id?: string
          margem_custos?: number | null
          margem_deducoes?: number | null
          margem_despesas_fin?: number | null
          margem_despesas_op?: number | null
          projeto_id?: string | null
          receita_ano1?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'parametros_dre_projeto_id_fkey'
            columns: ['projeto_id']
            isOneToOne: false
            referencedRelation: 'projetos'
            referencedColumns: ['id']
          },
        ]
      }
      parceiros: {
        Row: {
          cnpj: string | null
          comissao_percentual: number | null
          data_cadastro: string | null
          id: string
          nome_parceiro: string | null
          status: string | null
          usuario_id: string | null
        }
        Insert: {
          cnpj?: string | null
          comissao_percentual?: number | null
          data_cadastro?: string | null
          id?: string
          nome_parceiro?: string | null
          status?: string | null
          usuario_id?: string | null
        }
        Update: {
          cnpj?: string | null
          comissao_percentual?: number | null
          data_cadastro?: string | null
          id?: string
          nome_parceiro?: string | null
          status?: string | null
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'parceiros_usuario_id_fkey'
            columns: ['usuario_id']
            isOneToOne: false
            referencedRelation: 'usuarios'
            referencedColumns: ['id']
          },
        ]
      }
      pipeline_demandas: {
        Row: {
          cliente_id: string | null
          data_atualizacao: string | null
          data_criacao: string | null
          id: string
          parceiro_id: string | null
          status: string | null
          valor_oportunidade: number | null
        }
        Insert: {
          cliente_id?: string | null
          data_atualizacao?: string | null
          data_criacao?: string | null
          id?: string
          parceiro_id?: string | null
          status?: string | null
          valor_oportunidade?: number | null
        }
        Update: {
          cliente_id?: string | null
          data_atualizacao?: string | null
          data_criacao?: string | null
          id?: string
          parceiro_id?: string | null
          status?: string | null
          valor_oportunidade?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'pipeline_demandas_cliente_id_fkey'
            columns: ['cliente_id']
            isOneToOne: false
            referencedRelation: 'clientes'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'pipeline_demandas_parceiro_id_fkey'
            columns: ['parceiro_id']
            isOneToOne: false
            referencedRelation: 'parceiros'
            referencedColumns: ['id']
          },
        ]
      }
      projetos: {
        Row: {
          apresentacao_empresa: string | null
          apresentacao_projeto: string | null
          cliente_id: string | null
          data_criacao: string | null
          faturamento_anual: number | null
          id: string
          mercado_justificativa: string | null
          nome_projeto: string | null
          status: string | null
        }
        Insert: {
          apresentacao_empresa?: string | null
          apresentacao_projeto?: string | null
          cliente_id?: string | null
          data_criacao?: string | null
          faturamento_anual?: number | null
          id?: string
          mercado_justificativa?: string | null
          nome_projeto?: string | null
          status?: string | null
        }
        Update: {
          apresentacao_empresa?: string | null
          apresentacao_projeto?: string | null
          cliente_id?: string | null
          data_criacao?: string | null
          faturamento_anual?: number | null
          id?: string
          mercado_justificativa?: string | null
          nome_projeto?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'projetos_cliente_id_fkey'
            columns: ['cliente_id']
            isOneToOne: false
            referencedRelation: 'clientes'
            referencedColumns: ['id']
          },
        ]
      }
      relatorios_gerados: {
        Row: {
          data_geracao: string | null
          id: string
          projeto_id: string | null
          tipo_relatorio: string | null
          url_arquivo: string | null
        }
        Insert: {
          data_geracao?: string | null
          id?: string
          projeto_id?: string | null
          tipo_relatorio?: string | null
          url_arquivo?: string | null
        }
        Update: {
          data_geracao?: string | null
          id?: string
          projeto_id?: string | null
          tipo_relatorio?: string | null
          url_arquivo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'relatorios_gerados_projeto_id_fkey'
            columns: ['projeto_id']
            isOneToOne: false
            referencedRelation: 'projetos'
            referencedColumns: ['id']
          },
        ]
      }
      simulacoes_financeiras: {
        Row: {
          cliente_id: string | null
          data_criacao: string | null
          id: string
          parametros: Json | null
          resultado: Json | null
          tipo_simulacao: string | null
        }
        Insert: {
          cliente_id?: string | null
          data_criacao?: string | null
          id?: string
          parametros?: Json | null
          resultado?: Json | null
          tipo_simulacao?: string | null
        }
        Update: {
          cliente_id?: string | null
          data_criacao?: string | null
          id?: string
          parametros?: Json | null
          resultado?: Json | null
          tipo_simulacao?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'simulacoes_financeiras_cliente_id_fkey'
            columns: ['cliente_id']
            isOneToOne: false
            referencedRelation: 'clientes'
            referencedColumns: ['id']
          },
        ]
      }
      usuarios: {
        Row: {
          data_criacao: string | null
          email: string
          id: string
          nome: string | null
          senha_hash: string | null
          status: string | null
          tipo_usuario: string | null
        }
        Insert: {
          data_criacao?: string | null
          email: string
          id?: string
          nome?: string | null
          senha_hash?: string | null
          status?: string | null
          tipo_usuario?: string | null
        }
        Update: {
          data_criacao?: string | null
          email?: string
          id?: string
          nome?: string | null
          senha_hash?: string | null
          status?: string | null
          tipo_usuario?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

// ====== DATABASE EXTENDED CONTEXT (auto-generated) ======
// This section contains actual PostgreSQL column types, constraints, RLS policies,
// functions, triggers, indexes and materialized views not present in the type definitions above.
// IMPORTANT: The TypeScript types above map UUID, TEXT, VARCHAR all to "string".
// Use the COLUMN TYPES section below to know the real PostgreSQL type for each column.
// Always use the correct PostgreSQL type when writing SQL migrations.

// --- COLUMN TYPES (actual PostgreSQL types) ---
// Use this to know the real database type when writing migrations.
// "string" in TypeScript types above may be uuid, text, varchar, timestamptz, etc.
// Table: acompanhamento_projetos
//   id: uuid (not null, default: gen_random_uuid())
//   projeto_id: uuid (nullable)
//   tipo_evento: text (nullable)
//   descricao: text (nullable)
//   data_evento: timestamp with time zone (nullable)
//   responsavel: text (nullable)
//   data_criacao: timestamp with time zone (nullable, default: now())
// Table: administradores
//   id: uuid (not null, default: gen_random_uuid())
//   usuario_id: uuid (nullable)
//   nome: text (nullable)
//   permissoes: jsonb (nullable)
//   data_criacao: timestamp with time zone (nullable, default: now())
// Table: analises_salvas
//   id: uuid (not null, default: gen_random_uuid())
//   cliente_id: uuid (nullable)
//   nome_analise: text (nullable)
//   tipo_analise: text (nullable)
//   dados_analise: jsonb (nullable)
//   data_criacao: timestamp with time zone (nullable, default: now())
//   data_atualizacao: timestamp with time zone (nullable, default: now())
// Table: balanco_patrimonial
//   id: uuid (not null, default: gen_random_uuid())
//   projeto_id: uuid (nullable)
//   ano: integer (nullable)
//   ativo_circulante: jsonb (nullable)
//   ativo_nao_circulante: jsonb (nullable)
//   passivo_circulante: jsonb (nullable)
//   passivo_nao_circulante: jsonb (nullable)
//   patrimonio_liquido: jsonb (nullable)
//   data_criacao: timestamp with time zone (nullable, default: now())
// Table: cenarios_financiamento
//   id: uuid (not null, default: gen_random_uuid())
//   projeto_id: uuid (nullable)
//   tipo_cenario: text (nullable)
//   ativo: boolean (nullable, default: true)
//   dados_cenario: jsonb (nullable)
//   data_criacao: timestamp with time zone (nullable, default: now())
// Table: cenarios_investimento
//   id: uuid (not null, default: gen_random_uuid())
//   projeto_id: uuid (nullable)
//   nome_cenario: text (nullable)
//   descricao: text (nullable)
//   parametros: jsonb (nullable)
//   resultados: jsonb (nullable)
//   data_criacao: timestamp with time zone (nullable, default: now())
// Table: clientes
//   id: uuid (not null, default: gen_random_uuid())
//   usuario_id: uuid (nullable)
//   empresa_nome: text (nullable)
//   cnpj: text (nullable)
//   faturamento_anual: numeric (nullable)
//   telefone: text (nullable)
//   endereco: text (nullable)
//   data_cadastro: timestamp with time zone (nullable, default: now())
// Table: comissoes
//   id: uuid (not null, default: gen_random_uuid())
//   parceiro_id: uuid (nullable)
//   cliente_id: uuid (nullable)
//   valor_comissao: numeric (nullable)
//   percentual: numeric (nullable)
//   status: text (nullable)
//   data_criacao: timestamp with time zone (nullable, default: now())
//   data_pagamento: timestamp with time zone (nullable)
// Table: crm_parceiros
//   id: uuid (not null, default: gen_random_uuid())
//   parceiro_id: uuid (nullable)
//   cliente_id: uuid (nullable)
//   historico_interacoes: jsonb (nullable)
//   proxima_acao: text (nullable)
//   data_proxima_acao: timestamp with time zone (nullable)
//   data_criacao: timestamp with time zone (nullable, default: now())
// Table: dashboard_metricas
//   id: uuid (not null, default: gen_random_uuid())
//   projeto_id: uuid (nullable)
//   metrica_nome: text (nullable)
//   valor: numeric (nullable)
//   data_calculo: timestamp with time zone (nullable, default: now())
// Table: diagnosticos
//   id: uuid (not null, default: gen_random_uuid())
//   cliente_id: uuid (nullable)
//   tipo_diagnostico: text (nullable)
//   descricao: text (nullable)
//   riscos_identificados: jsonb (nullable)
//   data_criacao: timestamp with time zone (nullable, default: now())
//   data_atualizacao: timestamp with time zone (nullable, default: now())
// Table: documentos
//   id: uuid (not null, default: gen_random_uuid())
//   projeto_id: uuid (nullable)
//   nome_documento: text (nullable)
//   tipo_documento: text (nullable)
//   url_storage: text (nullable)
//   data_upload: timestamp with time zone (nullable, default: now())
//   data_criacao: timestamp with time zone (nullable, default: now())
// Table: dre
//   id: uuid (not null, default: gen_random_uuid())
//   projeto_id: uuid (nullable)
//   ano: integer (nullable)
//   receita_bruta: numeric (nullable)
//   deducoes: numeric (nullable)
//   receita_liquida: numeric (nullable)
//   custos_vendas: numeric (nullable)
//   resultado_operacional_bruto: numeric (nullable)
//   despesas_operacionais: jsonb (nullable)
//   despesas_financeiras: jsonb (nullable)
//   resultado_operacional: numeric (nullable)
//   provisao_ir_csll: numeric (nullable)
//   lucro_liquido: numeric (nullable)
//   ebitda: numeric (nullable)
//   ebitda_percentual: numeric (nullable)
//   lucratividade: numeric (nullable)
//   data_criacao: timestamp with time zone (nullable, default: now())
// Table: dre_projetado
//   id: uuid (not null, default: gen_random_uuid())
//   projeto_id: uuid (nullable)
//   ano: integer (nullable)
//   receita_bruta: numeric (nullable)
//   deducoes: numeric (nullable)
//   receita_liquida: numeric (nullable)
//   custos_vendas: numeric (nullable)
//   resultado_operacional_bruto: numeric (nullable)
//   despesas_operacionais: numeric (nullable)
//   despesas_financeiras: numeric (nullable)
//   resultado_operacional: numeric (nullable)
//   provisao_ir_csll: numeric (nullable)
//   lucro_liquido: numeric (nullable)
//   ebitda: numeric (nullable)
//   ebitda_percentual: numeric (nullable)
//   lucratividade: numeric (nullable)
//   tir: numeric (nullable)
//   vpl_5anos: numeric (nullable)
//   vpl_10anos: numeric (nullable)
//   data_criacao: timestamp with time zone (nullable, default: now())
// Table: fluxo_caixa
//   id: uuid (not null, default: gen_random_uuid())
//   projeto_id: uuid (nullable)
//   ano: integer (nullable)
//   saldo_inicial: numeric (nullable)
//   entradas: jsonb (nullable)
//   saidas: jsonb (nullable)
//   saldo_final: numeric (nullable)
//   data_criacao: timestamp with time zone (nullable, default: now())
// Table: indicadores_financeiros
//   id: uuid (not null, default: gen_random_uuid())
//   projeto_id: uuid (nullable)
//   ano: integer (nullable)
//   tir: numeric (nullable)
//   vpl_5anos: numeric (nullable)
//   vpl_10anos: numeric (nullable)
//   payback: numeric (nullable)
//   margem_liquida: numeric (nullable)
//   roe: numeric (nullable)
//   roa: numeric (nullable)
//   data_criacao: timestamp with time zone (nullable, default: now())
// Table: investimentos
//   id: uuid (not null, default: gen_random_uuid())
//   projeto_id: uuid (nullable)
//   tipo_investimento: text (nullable)
//   valor: numeric (nullable)
//   descricao: text (nullable)
//   data_criacao: timestamp with time zone (nullable, default: now())
// Table: parametros_dre
//   id: uuid (not null, default: gen_random_uuid())
//   projeto_id: uuid (nullable)
//   receita_ano1: numeric (nullable)
//   margem_deducoes: numeric (nullable)
//   margem_custos: numeric (nullable)
//   margem_despesas_op: numeric (nullable)
//   margem_despesas_fin: numeric (nullable)
//   aliquota_ir_csll: numeric (nullable)
//   crescimento_anual: numeric (nullable)
//   data_criacao: timestamp with time zone (nullable, default: now())
// Table: parceiros
//   id: uuid (not null, default: gen_random_uuid())
//   usuario_id: uuid (nullable)
//   nome_parceiro: text (nullable)
//   cnpj: text (nullable)
//   comissao_percentual: numeric (nullable)
//   status: text (nullable)
//   data_cadastro: timestamp with time zone (nullable, default: now())
// Table: pipeline_demandas
//   id: uuid (not null, default: gen_random_uuid())
//   parceiro_id: uuid (nullable)
//   cliente_id: uuid (nullable)
//   status: text (nullable)
//   valor_oportunidade: numeric (nullable)
//   data_criacao: timestamp with time zone (nullable, default: now())
//   data_atualizacao: timestamp with time zone (nullable, default: now())
// Table: projetos
//   id: uuid (not null, default: gen_random_uuid())
//   cliente_id: uuid (nullable)
//   nome_projeto: text (nullable)
//   apresentacao_empresa: text (nullable)
//   apresentacao_projeto: text (nullable)
//   mercado_justificativa: text (nullable)
//   faturamento_anual: numeric (nullable)
//   data_criacao: timestamp with time zone (nullable, default: now())
//   status: text (nullable)
// Table: relatorios_gerados
//   id: uuid (not null, default: gen_random_uuid())
//   projeto_id: uuid (nullable)
//   tipo_relatorio: text (nullable)
//   url_arquivo: text (nullable)
//   data_geracao: timestamp with time zone (nullable, default: now())
// Table: simulacoes_financeiras
//   id: uuid (not null, default: gen_random_uuid())
//   cliente_id: uuid (nullable)
//   tipo_simulacao: text (nullable)
//   parametros: jsonb (nullable)
//   resultado: jsonb (nullable)
//   data_criacao: timestamp with time zone (nullable, default: now())
// Table: usuarios
//   id: uuid (not null, default: gen_random_uuid())
//   email: text (not null)
//   senha_hash: text (nullable)
//   nome: text (nullable)
//   tipo_usuario: text (nullable)
//   status: text (nullable)
//   data_criacao: timestamp with time zone (nullable, default: now())

// --- CONSTRAINTS ---
// Table: acompanhamento_projetos
//   PRIMARY KEY acompanhamento_projetos_pkey: PRIMARY KEY (id)
//   FOREIGN KEY acompanhamento_projetos_projeto_id_fkey: FOREIGN KEY (projeto_id) REFERENCES projetos(id) ON DELETE CASCADE
//   CHECK acompanhamento_projetos_tipo_evento_check: CHECK ((tipo_evento = ANY (ARRAY['diagnostico'::text, 'analise'::text, 'implementacao'::text, 'resultado'::text])))
// Table: administradores
//   PRIMARY KEY administradores_pkey: PRIMARY KEY (id)
//   FOREIGN KEY administradores_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
// Table: analises_salvas
//   FOREIGN KEY analises_salvas_cliente_id_fkey: FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
//   PRIMARY KEY analises_salvas_pkey: PRIMARY KEY (id)
// Table: balanco_patrimonial
//   PRIMARY KEY balanco_patrimonial_pkey: PRIMARY KEY (id)
//   FOREIGN KEY balanco_patrimonial_projeto_id_fkey: FOREIGN KEY (projeto_id) REFERENCES projetos(id) ON DELETE CASCADE
// Table: cenarios_financiamento
//   PRIMARY KEY cenarios_financiamento_pkey: PRIMARY KEY (id)
//   FOREIGN KEY cenarios_financiamento_projeto_id_fkey: FOREIGN KEY (projeto_id) REFERENCES projetos(id) ON DELETE CASCADE
//   CHECK cenarios_financiamento_tipo_cenario_check: CHECK ((tipo_cenario = ANY (ARRAY['emprestimo'::text, 'investidor'::text, 'cotas'::text])))
// Table: cenarios_investimento
//   PRIMARY KEY cenarios_investimento_pkey: PRIMARY KEY (id)
//   FOREIGN KEY cenarios_investimento_projeto_id_fkey: FOREIGN KEY (projeto_id) REFERENCES projetos(id) ON DELETE CASCADE
// Table: clientes
//   PRIMARY KEY clientes_pkey: PRIMARY KEY (id)
//   FOREIGN KEY clientes_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
// Table: comissoes
//   FOREIGN KEY comissoes_cliente_id_fkey: FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
//   FOREIGN KEY comissoes_parceiro_id_fkey: FOREIGN KEY (parceiro_id) REFERENCES parceiros(id) ON DELETE CASCADE
//   PRIMARY KEY comissoes_pkey: PRIMARY KEY (id)
//   CHECK comissoes_status_check: CHECK ((status = ANY (ARRAY['pago'::text, 'pendente'::text])))
// Table: crm_parceiros
//   FOREIGN KEY crm_parceiros_cliente_id_fkey: FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
//   FOREIGN KEY crm_parceiros_parceiro_id_fkey: FOREIGN KEY (parceiro_id) REFERENCES parceiros(id) ON DELETE CASCADE
//   PRIMARY KEY crm_parceiros_pkey: PRIMARY KEY (id)
// Table: dashboard_metricas
//   PRIMARY KEY dashboard_metricas_pkey: PRIMARY KEY (id)
//   FOREIGN KEY dashboard_metricas_projeto_id_fkey: FOREIGN KEY (projeto_id) REFERENCES projetos(id) ON DELETE CASCADE
// Table: diagnosticos
//   FOREIGN KEY diagnosticos_cliente_id_fkey: FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
//   PRIMARY KEY diagnosticos_pkey: PRIMARY KEY (id)
//   CHECK diagnosticos_tipo_diagnostico_check: CHECK ((tipo_diagnostico = ANY (ARRAY['juridico'::text, 'tributario'::text, 'fiscal'::text, 'contabil'::text, 'financeiro'::text])))
// Table: documentos
//   PRIMARY KEY documentos_pkey: PRIMARY KEY (id)
//   FOREIGN KEY documentos_projeto_id_fkey: FOREIGN KEY (projeto_id) REFERENCES projetos(id) ON DELETE CASCADE
// Table: dre
//   PRIMARY KEY dre_pkey: PRIMARY KEY (id)
//   FOREIGN KEY dre_projeto_id_fkey: FOREIGN KEY (projeto_id) REFERENCES projetos(id) ON DELETE CASCADE
// Table: dre_projetado
//   PRIMARY KEY dre_projetado_pkey: PRIMARY KEY (id)
//   FOREIGN KEY dre_projetado_projeto_id_fkey: FOREIGN KEY (projeto_id) REFERENCES projetos(id) ON DELETE CASCADE
// Table: fluxo_caixa
//   PRIMARY KEY fluxo_caixa_pkey: PRIMARY KEY (id)
//   FOREIGN KEY fluxo_caixa_projeto_id_fkey: FOREIGN KEY (projeto_id) REFERENCES projetos(id) ON DELETE CASCADE
// Table: indicadores_financeiros
//   PRIMARY KEY indicadores_financeiros_pkey: PRIMARY KEY (id)
//   FOREIGN KEY indicadores_financeiros_projeto_id_fkey: FOREIGN KEY (projeto_id) REFERENCES projetos(id) ON DELETE CASCADE
// Table: investimentos
//   PRIMARY KEY investimentos_pkey: PRIMARY KEY (id)
//   FOREIGN KEY investimentos_projeto_id_fkey: FOREIGN KEY (projeto_id) REFERENCES projetos(id) ON DELETE CASCADE
// Table: parametros_dre
//   PRIMARY KEY parametros_dre_pkey: PRIMARY KEY (id)
//   FOREIGN KEY parametros_dre_projeto_id_fkey: FOREIGN KEY (projeto_id) REFERENCES projetos(id) ON DELETE CASCADE
// Table: parceiros
//   PRIMARY KEY parceiros_pkey: PRIMARY KEY (id)
//   CHECK parceiros_status_check: CHECK ((status = ANY (ARRAY['ativo'::text, 'inativo'::text, 'pendente'::text])))
//   FOREIGN KEY parceiros_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
// Table: pipeline_demandas
//   FOREIGN KEY pipeline_demandas_cliente_id_fkey: FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
//   FOREIGN KEY pipeline_demandas_parceiro_id_fkey: FOREIGN KEY (parceiro_id) REFERENCES parceiros(id) ON DELETE CASCADE
//   PRIMARY KEY pipeline_demandas_pkey: PRIMARY KEY (id)
//   CHECK pipeline_demandas_status_check: CHECK ((status = ANY (ARRAY['prospeccao'::text, 'qualificacao'::text, 'proposta'::text, 'negociacao'::text, 'fechado'::text])))
// Table: projetos
//   FOREIGN KEY projetos_cliente_id_fkey: FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
//   PRIMARY KEY projetos_pkey: PRIMARY KEY (id)
// Table: relatorios_gerados
//   PRIMARY KEY relatorios_gerados_pkey: PRIMARY KEY (id)
//   FOREIGN KEY relatorios_gerados_projeto_id_fkey: FOREIGN KEY (projeto_id) REFERENCES projetos(id) ON DELETE CASCADE
// Table: simulacoes_financeiras
//   FOREIGN KEY simulacoes_financeiras_cliente_id_fkey: FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
//   PRIMARY KEY simulacoes_financeiras_pkey: PRIMARY KEY (id)
// Table: usuarios
//   UNIQUE usuarios_email_key: UNIQUE (email)
//   PRIMARY KEY usuarios_pkey: PRIMARY KEY (id)
//   CHECK usuarios_tipo_usuario_check: CHECK ((tipo_usuario = ANY (ARRAY['cliente'::text, 'parceiro'::text, 'admin'::text])))

// --- ROW LEVEL SECURITY POLICIES ---
// Table: acompanhamento_projetos
//   Policy "authenticated_all_acompanhamento_projetos" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: administradores
//   Policy "authenticated_all_administradores" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: analises_salvas
//   Policy "authenticated_all_analises_salvas" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: balanco_patrimonial
//   Policy "authenticated_all_balanco" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: cenarios_financiamento
//   Policy "authenticated_all_cenarios_fin" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: cenarios_investimento
//   Policy "authenticated_all_cenarios_inv" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: clientes
//   Policy "authenticated_all_clientes" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: comissoes
//   Policy "authenticated_all_comissoes" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: crm_parceiros
//   Policy "authenticated_all_crm_parceiros" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: dashboard_metricas
//   Policy "authenticated_all_dashboard_metricas" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: diagnosticos
//   Policy "authenticated_all_diagnosticos" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: documentos
//   Policy "authenticated_all_documentos" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: dre
//   Policy "authenticated_all_dre" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: dre_projetado
//   Policy "authenticated_all_dre_projetado" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: fluxo_caixa
//   Policy "authenticated_all_fluxo" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: indicadores_financeiros
//   Policy "authenticated_all_indicadores" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: investimentos
//   Policy "authenticated_all_investimentos" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: parametros_dre
//   Policy "authenticated_all_parametros_dre" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: parceiros
//   Policy "authenticated_all_parceiros" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: pipeline_demandas
//   Policy "authenticated_all_pipeline_demandas" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: projetos
//   Policy "authenticated_all_projetos" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: relatorios_gerados
//   Policy "authenticated_all_relatorios_gerados" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: simulacoes_financeiras
//   Policy "authenticated_all_simulacoes" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: usuarios
//   Policy "authenticated_all_usuarios" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true

// --- DATABASE FUNCTIONS ---
// FUNCTION handle_new_user()
//   CREATE OR REPLACE FUNCTION public.handle_new_user()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   BEGIN
//     INSERT INTO public.usuarios (id, email, nome, tipo_usuario, status)
//     VALUES (
//       NEW.id,
//       NEW.email,
//       COALESCE(NEW.raw_user_meta_data->>'name', 'Usuário'),
//       COALESCE(NEW.raw_user_meta_data->>'tipo_usuario', 'cliente'),
//       'ativo'
//     )
//     ON CONFLICT (email) DO NOTHING;
//     RETURN NEW;
//   END;
//   $function$
//

// --- INDEXES ---
// Table: usuarios
//   CREATE UNIQUE INDEX usuarios_email_key ON public.usuarios USING btree (email)
