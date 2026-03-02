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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      jobs: {
        Row: {
          attempts: number | null
          created_at: string | null
          id: string
          logs: Json | null
          order_id: string
          status: Database["public"]["Enums"]["job_status"]
          type: Database["public"]["Enums"]["product_type"]
          updated_at: string | null
        }
        Insert: {
          attempts?: number | null
          created_at?: string | null
          id?: string
          logs?: Json | null
          order_id: string
          status?: Database["public"]["Enums"]["job_status"]
          type: Database["public"]["Enums"]["product_type"]
          updated_at?: string | null
        }
        Update: {
          attempts?: number | null
          created_at?: string | null
          id?: string
          logs?: Json | null
          order_id?: string
          status?: Database["public"]["Enums"]["job_status"]
          type?: Database["public"]["Enums"]["product_type"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jobs_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_assets: {
        Row: {
          created_at: string | null
          id: string
          input_url: string | null
          order_id: string
          output_url: string | null
          preview_url: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          input_url?: string | null
          order_id: string
          output_url?: string | null
          preview_url?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          input_url?: string | null
          order_id?: string
          output_url?: string | null
          preview_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_assets_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_brief: {
        Row: {
          created_at: string | null
          data: Json
          id: string
          order_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          data?: Json
          id?: string
          order_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          data?: Json
          id?: string
          order_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_brief_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string | null
          customer_email: string
          customer_name: string
          customer_phone: string | null
          id: string
          order_number: string
          payment_status: Database["public"]["Enums"]["payment_status"]
          product_type: Database["public"]["Enums"]["product_type"]
          public_access_token: string | null
          status: Database["public"]["Enums"]["order_status"]
          total: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          customer_email: string
          customer_name: string
          customer_phone?: string | null
          id?: string
          order_number?: string
          payment_status?: Database["public"]["Enums"]["payment_status"]
          product_type: Database["public"]["Enums"]["product_type"]
          public_access_token?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          total?: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          customer_email?: string
          customer_name?: string
          customer_phone?: string | null
          id?: string
          order_number?: string
          payment_status?: Database["public"]["Enums"]["payment_status"]
          product_type?: Database["public"]["Enums"]["product_type"]
          public_access_token?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          total?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          created_at: string | null
          details: Json | null
          gateway: string
          id: string
          order_id: string
          payment_id: string | null
          status: string
        }
        Insert: {
          created_at?: string | null
          details?: Json | null
          gateway?: string
          id?: string
          order_id: string
          payment_id?: string | null
          status?: string
        }
        Update: {
          created_at?: string | null
          details?: Json | null
          gateway?: string
          id?: string
          order_id?: string
          payment_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
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
      app_role: "admin" | "user"
      job_status: "queued" | "processing" | "done" | "failed" | "needs_review"
      order_status:
        | "created"
        | "paid"
        | "awaiting_upload"
        | "processing"
        | "ready"
        | "delivered"
        | "needs_revision"
        | "cancelled"
      payment_status:
        | "pending"
        | "approved"
        | "rejected"
        | "cancelled"
        | "refunded"
      product_type: "restore" | "upscale" | "theme"
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
      app_role: ["admin", "user"],
      job_status: ["queued", "processing", "done", "failed", "needs_review"],
      order_status: [
        "created",
        "paid",
        "awaiting_upload",
        "processing",
        "ready",
        "delivered",
        "needs_revision",
        "cancelled",
      ],
      payment_status: [
        "pending",
        "approved",
        "rejected",
        "cancelled",
        "refunded",
      ],
      product_type: ["restore", "upscale", "theme"],
    },
  },
} as const
