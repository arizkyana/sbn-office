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
    PostgrestVersion: "14.18"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      campaigns: {
        Row: {
          content: string | null
          cover: string | null
          created_at: string
          description: string | null
          end_date: string | null
          id: number
          slug: string
          start_date: string
          status: Database["public"]["Enums"]["campaign_status"]
          target_budget: number | null
          title: string
          updated_at: string
          users_id: string | null
          uuid: string
        }
        Insert: {
          content?: string | null
          cover?: string | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: never
          slug: string
          start_date?: string
          status?: Database["public"]["Enums"]["campaign_status"]
          target_budget?: number | null
          title: string
          updated_at?: string
          users_id?: string | null
          uuid?: string
        }
        Update: {
          content?: string | null
          cover?: string | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: never
          slug?: string
          start_date?: string
          status?: Database["public"]["Enums"]["campaign_status"]
          target_budget?: number | null
          title?: string
          updated_at?: string
          users_id?: string | null
          uuid?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          alias: string
          created_at: string
          id: number
          name: string
          updated_at: string
          uuid: string
        }
        Insert: {
          alias: string
          created_at?: string
          id?: never
          name: string
          updated_at?: string
          uuid?: string
        }
        Update: {
          alias?: string
          created_at?: string
          id?: never
          name?: string
          updated_at?: string
          uuid?: string
        }
        Relationships: []
      }
      posts: {
        Row: {
          categories_id: number
          content: string | null
          cover: string | null
          created_at: string
          description: string | null
          id: number
          published_at: string | null
          slug: string
          status: Database["public"]["Enums"]["post_status"]
          title: string
          type: Database["public"]["Enums"]["post_type"]
          updated_at: string
          users_id: string | null
          uuid: string
          video_url: string | null
        }
        Insert: {
          categories_id: number
          content?: string | null
          cover?: string | null
          created_at?: string
          description?: string | null
          id?: never
          published_at?: string | null
          slug: string
          status?: Database["public"]["Enums"]["post_status"]
          title: string
          type: Database["public"]["Enums"]["post_type"]
          updated_at?: string
          users_id?: string | null
          uuid?: string
          video_url?: string | null
        }
        Update: {
          categories_id?: number
          content?: string | null
          cover?: string | null
          created_at?: string
          description?: string | null
          id?: never
          published_at?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["post_status"]
          title?: string
          type?: Database["public"]["Enums"]["post_type"]
          updated_at?: string
          users_id?: string | null
          uuid?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_categories_id_fkey"
            columns: ["categories_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          is_active: boolean
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id: string
          is_active?: boolean
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          is_active?: boolean
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      settings: {
        Row: {
          created_at: string
          id: number
          key: string
          updated_at: string
          uuid: string
          value: string
        }
        Insert: {
          created_at?: string
          id?: never
          key: string
          updated_at?: string
          uuid?: string
          value?: string
        }
        Update: {
          created_at?: string
          id?: never
          key?: string
          updated_at?: string
          uuid?: string
          value?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          campaigns_id: number
          created_at: string
          donor_email: string
          donor_name: string
          donor_phone: string | null
          id: number
          is_anonymous: boolean
          midtrans_payload: Json | null
          order_id: string
          paid_at: string | null
          payment_method: string | null
          payment_status: Database["public"]["Enums"]["payment_status"]
          updated_at: string
          users_id: string | null
          uuid: string
        }
        Insert: {
          amount: number
          campaigns_id: number
          created_at?: string
          donor_email: string
          donor_name: string
          donor_phone?: string | null
          id?: never
          is_anonymous?: boolean
          midtrans_payload?: Json | null
          order_id: string
          paid_at?: string | null
          payment_method?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
          users_id?: string | null
          uuid?: string
        }
        Update: {
          amount?: number
          campaigns_id?: number
          created_at?: string
          donor_email?: string
          donor_name?: string
          donor_phone?: string | null
          id?: never
          is_anonymous?: boolean
          midtrans_payload?: Json | null
          order_id?: string
          paid_at?: string | null
          payment_method?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
          users_id?: string | null
          uuid?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_campaigns_id_fkey"
            columns: ["campaigns_id"]
            isOneToOne: false
            referencedRelation: "campaign_progress"
            referencedColumns: ["campaigns_id"]
          },
          {
            foreignKeyName: "transactions_campaigns_id_fkey"
            columns: ["campaigns_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      campaign_progress: {
        Row: {
          campaigns_id: number | null
          collected_amount: number | null
          donor_count: number | null
        }
        Relationships: []
      }
      public_donations: {
        Row: {
          amount: number | null
          campaigns_id: number | null
          display_name: string | null
          paid_at: string | null
        }
        Insert: {
          amount?: number | null
          campaigns_id?: number | null
          display_name?: never
          paid_at?: string | null
        }
        Update: {
          amount?: number | null
          campaigns_id?: number | null
          display_name?: never
          paid_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_campaigns_id_fkey"
            columns: ["campaigns_id"]
            isOneToOne: false
            referencedRelation: "campaign_progress"
            referencedColumns: ["campaigns_id"]
          },
          {
            foreignKeyName: "transactions_campaigns_id_fkey"
            columns: ["campaigns_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      campaign_status: "DRAFT" | "PUBLISH" | "ARCHIVED"
      payment_status: "PENDING" | "SUCCESS" | "FAILED" | "EXPIRED"
      post_status: "DRAFT" | "PUBLISH"
      post_type: "ARTICLE" | "VIDEO"
      user_role: "ADMIN" | "DONATUR"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      campaign_status: ["DRAFT", "PUBLISH", "ARCHIVED"],
      payment_status: ["PENDING", "SUCCESS", "FAILED", "EXPIRED"],
      post_status: ["DRAFT", "PUBLISH"],
      post_type: ["ARTICLE", "VIDEO"],
      user_role: ["ADMIN", "DONATUR"],
    },
  },
} as const
