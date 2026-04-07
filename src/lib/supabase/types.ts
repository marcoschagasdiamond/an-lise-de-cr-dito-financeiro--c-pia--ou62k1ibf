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
// Table: administradores
//   id: uuid (not null, default: gen_random_uuid())
//   usuario_id: uuid (nullable)
//   nome: text (nullable)
//   permissoes: jsonb (nullable)
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
// Table: diagnosticos
//   id: uuid (not null, default: gen_random_uuid())
//   cliente_id: uuid (nullable)
//   tipo_diagnostico: text (nullable)
//   descricao: text (nullable)
//   riscos_identificados: jsonb (nullable)
//   data_criacao: timestamp with time zone (nullable, default: now())
//   data_atualizacao: timestamp with time zone (nullable, default: now())
// Table: parceiros
//   id: uuid (not null, default: gen_random_uuid())
//   usuario_id: uuid (nullable)
//   nome_parceiro: text (nullable)
//   cnpj: text (nullable)
//   comissao_percentual: numeric (nullable)
//   status: text (nullable)
//   data_cadastro: timestamp with time zone (nullable, default: now())
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
// Table: administradores
//   PRIMARY KEY administradores_pkey: PRIMARY KEY (id)
//   FOREIGN KEY administradores_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
// Table: clientes
//   PRIMARY KEY clientes_pkey: PRIMARY KEY (id)
//   FOREIGN KEY clientes_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
// Table: diagnosticos
//   FOREIGN KEY diagnosticos_cliente_id_fkey: FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
//   PRIMARY KEY diagnosticos_pkey: PRIMARY KEY (id)
//   CHECK diagnosticos_tipo_diagnostico_check: CHECK ((tipo_diagnostico = ANY (ARRAY['juridico'::text, 'tributario'::text, 'fiscal'::text, 'contabil'::text, 'financeiro'::text])))
// Table: parceiros
//   PRIMARY KEY parceiros_pkey: PRIMARY KEY (id)
//   CHECK parceiros_status_check: CHECK ((status = ANY (ARRAY['ativo'::text, 'inativo'::text, 'pendente'::text])))
//   FOREIGN KEY parceiros_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
// Table: projetos
//   FOREIGN KEY projetos_cliente_id_fkey: FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
//   PRIMARY KEY projetos_pkey: PRIMARY KEY (id)
// Table: simulacoes_financeiras
//   FOREIGN KEY simulacoes_financeiras_cliente_id_fkey: FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
//   PRIMARY KEY simulacoes_financeiras_pkey: PRIMARY KEY (id)
// Table: usuarios
//   UNIQUE usuarios_email_key: UNIQUE (email)
//   PRIMARY KEY usuarios_pkey: PRIMARY KEY (id)
//   CHECK usuarios_tipo_usuario_check: CHECK ((tipo_usuario = ANY (ARRAY['cliente'::text, 'parceiro'::text, 'admin'::text])))

// --- ROW LEVEL SECURITY POLICIES ---
// Table: administradores
//   Policy "authenticated_all_administradores" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: clientes
//   Policy "authenticated_all_clientes" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: diagnosticos
//   Policy "authenticated_all_diagnosticos" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: parceiros
//   Policy "authenticated_all_parceiros" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: projetos
//   Policy "authenticated_all_projetos" (ALL, PERMISSIVE) roles={authenticated}
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

// --- INDEXES ---
// Table: usuarios
//   CREATE UNIQUE INDEX usuarios_email_key ON public.usuarios USING btree (email)
