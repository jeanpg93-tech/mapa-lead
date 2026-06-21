export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      api_cache: {
        Row: {
          cache_key: string
          created_at: string
          expires_at: string | null
          id: string
          owner_id: string | null
          provider: string
          request_params: Json
          response_data: Json
          updated_at: string
        }
        Insert: {
          cache_key: string
          created_at?: string
          expires_at?: string | null
          id?: string
          owner_id?: string | null
          provider: string
          request_params?: Json
          response_data: Json
          updated_at?: string
        }
        Update: {
          cache_key?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          owner_id?: string | null
          provider?: string
          request_params?: Json
          response_data?: Json
          updated_at?: string
        }
        Relationships: []
      }
      contatos: {
        Row: {
          base_legal: string | null
          consentimento: Database["public"]["Enums"]["consentimento_contato"]
          created_at: string
          email: string | null
          id: string
          local_id: string | null
          nao_contatar: boolean
          nome: string
          origem: Database["public"]["Enums"]["origem_dado"]
          owner_id: string
          telefone: string | null
          tipo: Database["public"]["Enums"]["tipo_contato"]
          updated_at: string
        }
        Insert: {
          base_legal?: string | null
          consentimento?: Database["public"]["Enums"]["consentimento_contato"]
          created_at?: string
          email?: string | null
          id?: string
          local_id?: string | null
          nao_contatar?: boolean
          nome: string
          origem?: Database["public"]["Enums"]["origem_dado"]
          owner_id: string
          telefone?: string | null
          tipo: Database["public"]["Enums"]["tipo_contato"]
          updated_at?: string
        }
        Update: {
          base_legal?: string | null
          consentimento?: Database["public"]["Enums"]["consentimento_contato"]
          created_at?: string
          email?: string | null
          id?: string
          local_id?: string | null
          nao_contatar?: boolean
          nome?: string
          origem?: Database["public"]["Enums"]["origem_dado"]
          owner_id?: string
          telefone?: string | null
          tipo?: Database["public"]["Enums"]["tipo_contato"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contatos_local_id_fkey"
            columns: ["local_id"]
            isOneToOne: false
            referencedRelation: "locais"
            referencedColumns: ["id"]
          },
        ]
      }
      fontes: {
        Row: {
          created_at: string
          descricao: string | null
          id: string
          nome: string
          owner_id: string
          registros: number
          status: Database["public"]["Enums"]["status_fonte"]
          tipo: Database["public"]["Enums"]["tipo_fonte"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          descricao?: string | null
          id?: string
          nome: string
          owner_id: string
          registros?: number
          status?: Database["public"]["Enums"]["status_fonte"]
          tipo: Database["public"]["Enums"]["tipo_fonte"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          descricao?: string | null
          id?: string
          nome?: string
          owner_id?: string
          registros?: number
          status?: Database["public"]["Enums"]["status_fonte"]
          tipo?: Database["public"]["Enums"]["tipo_fonte"]
          updated_at?: string
        }
        Relationships: []
      }
      integration_logs: {
        Row: {
          action: string
          created_at: string
          error_message: string | null
          id: string
          owner_id: string | null
          provider: string
          request_params: Json
          status: string
        }
        Insert: {
          action: string
          created_at?: string
          error_message?: string | null
          id?: string
          owner_id?: string | null
          provider: string
          request_params?: Json
          status: string
        }
        Update: {
          action?: string
          created_at?: string
          error_message?: string | null
          id?: string
          owner_id?: string | null
          provider?: string
          request_params?: Json
          status?: string
        }
        Relationships: []
      }
      locais: {
        Row: {
          bairro: string | null
          cidade: string | null
          confianca: Database["public"]["Enums"]["grau_confianca"]
          created_at: string
          endereco: string | null
          id: string
          nome: string
          observacoes: string | null
          origem: Database["public"]["Enums"]["origem_dado"]
          owner_id: string
          tipo: Database["public"]["Enums"]["tipo_local"]
          uf: string | null
          unidades_estimadas: number | null
          updated_at: string
        }
        Insert: {
          bairro?: string | null
          cidade?: string | null
          confianca?: Database["public"]["Enums"]["grau_confianca"]
          created_at?: string
          endereco?: string | null
          id?: string
          nome: string
          observacoes?: string | null
          origem?: Database["public"]["Enums"]["origem_dado"]
          owner_id: string
          tipo: Database["public"]["Enums"]["tipo_local"]
          uf?: string | null
          unidades_estimadas?: number | null
          updated_at?: string
        }
        Update: {
          bairro?: string | null
          cidade?: string | null
          confianca?: Database["public"]["Enums"]["grau_confianca"]
          created_at?: string
          endereco?: string | null
          id?: string
          nome?: string
          observacoes?: string | null
          origem?: Database["public"]["Enums"]["origem_dado"]
          owner_id?: string
          tipo?: Database["public"]["Enums"]["tipo_local"]
          uf?: string | null
          unidades_estimadas?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      oportunidades: {
        Row: {
          created_at: string
          id: string
          local_id: string | null
          owner_id: string
          responsavel: string | null
          status: Database["public"]["Enums"]["status_oportunidade"]
          titulo: string
          updated_at: string
          valor_estimado: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          local_id?: string | null
          owner_id: string
          responsavel?: string | null
          status?: Database["public"]["Enums"]["status_oportunidade"]
          titulo: string
          updated_at?: string
          valor_estimado?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          local_id?: string | null
          owner_id?: string
          responsavel?: string | null
          status?: Database["public"]["Enums"]["status_oportunidade"]
          titulo?: string
          updated_at?: string
          valor_estimado?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "oportunidades_local_id_fkey"
            columns: ["local_id"]
            isOneToOne: false
            referencedRelation: "locais"
            referencedColumns: ["id"]
          },
        ]
      }
      tarefas: {
        Row: {
          created_at: string
          id: string
          local_id: string | null
          oportunidade_id: string | null
          owner_id: string
          prazo: string | null
          responsavel: string | null
          status: Database["public"]["Enums"]["status_tarefa"]
          titulo: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          local_id?: string | null
          oportunidade_id?: string | null
          owner_id: string
          prazo?: string | null
          responsavel?: string | null
          status?: Database["public"]["Enums"]["status_tarefa"]
          titulo: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          local_id?: string | null
          oportunidade_id?: string | null
          owner_id?: string
          prazo?: string | null
          responsavel?: string | null
          status?: Database["public"]["Enums"]["status_tarefa"]
          titulo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tarefas_local_id_fkey"
            columns: ["local_id"]
            isOneToOne: false
            referencedRelation: "locais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tarefas_oportunidade_id_fkey"
            columns: ["oportunidade_id"]
            isOneToOne: false
            referencedRelation: "oportunidades"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      consentimento_contato: "Sim" | "Não" | "Pendente"
      grau_confianca: "Baixo" | "Médio" | "Alto"
      origem_dado: "manual" | "demo" | "parceiro" | "importação" | "público"
      status_fonte: "Ativa" | "Planejada" | "Pausada"
      status_oportunidade:
        | "Novo"
        | "Em pesquisa"
        | "Potencial identificado"
        | "Contato permitido"
        | "Em negociação"
        | "Convertido"
        | "Perdido"
      status_tarefa: "Aberta" | "Em andamento" | "Concluída"
      tipo_contato:
        | "Administradora"
        | "Síndico"
        | "Empresa"
        | "Lead manual"
        | "Demo"
      tipo_fonte:
        | "Base manual"
        | "Mock/Demo"
        | "API"
        | "Parceiro"
        | "Importação"
        | "Dados públicos"
      tipo_local:
        | "Condomínio"
        | "Edifício"
        | "Bairro"
        | "Rua"
        | "Região Comercial"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
      consentimento_contato: ["Sim", "Não", "Pendente"],
      grau_confianca: ["Baixo", "Médio", "Alto"],
      origem_dado: ["manual", "demo", "parceiro", "importação", "público"],
      status_fonte: ["Ativa", "Planejada", "Pausada"],
      status_oportunidade: [
        "Novo",
        "Em pesquisa",
        "Potencial identificado",
        "Contato permitido",
        "Em negociação",
        "Convertido",
        "Perdido",
      ],
      status_tarefa: ["Aberta", "Em andamento", "Concluída"],
      tipo_contato: [
        "Administradora",
        "Síndico",
        "Empresa",
        "Lead manual",
        "Demo",
      ],
      tipo_fonte: [
        "Base manual",
        "Mock/Demo",
        "API",
        "Parceiro",
        "Importação",
        "Dados públicos",
      ],
      tipo_local: [
        "Condomínio",
        "Edifício",
        "Bairro",
        "Rua",
        "Região Comercial",
      ],
    },
  },
} as const
