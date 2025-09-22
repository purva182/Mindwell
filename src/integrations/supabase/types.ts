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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      counselor_patients: {
        Row: {
          assigned_at: string
          counselor_id: string
          id: string
          is_active: boolean
          patient_id: string
        }
        Insert: {
          assigned_at?: string
          counselor_id: string
          id?: string
          is_active?: boolean
          patient_id: string
        }
        Update: {
          assigned_at?: string
          counselor_id?: string
          id?: string
          is_active?: boolean
          patient_id?: string
        }
        Relationships: []
      }
      emergency_alerts: {
        Row: {
          alert_message: string | null
          alert_sent_to_counselor: boolean
          alert_sent_to_parent: boolean
          counselor_email: string | null
          created_at: string
          id: string
          parent_phone: string | null
          questionnaire_type: string
          severity_level: string
          total_score: number
          user_id: string
          user_location: string | null
        }
        Insert: {
          alert_message?: string | null
          alert_sent_to_counselor?: boolean
          alert_sent_to_parent?: boolean
          counselor_email?: string | null
          created_at?: string
          id?: string
          parent_phone?: string | null
          questionnaire_type: string
          severity_level: string
          total_score: number
          user_id: string
          user_location?: string | null
        }
        Update: {
          alert_message?: string | null
          alert_sent_to_counselor?: boolean
          alert_sent_to_parent?: boolean
          counselor_email?: string | null
          created_at?: string
          id?: string
          parent_phone?: string | null
          questionnaire_type?: string
          severity_level?: string
          total_score?: number
          user_id?: string
          user_location?: string | null
        }
        Relationships: []
      }
      feedback: {
        Row: {
          category: string
          created_at: string
          id: string
          message: string
          rating: number | null
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          message: string
          rating?: number | null
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          message?: string
          rating?: number | null
          user_id?: string
        }
        Relationships: []
      }
      journal_entries: {
        Row: {
          content: string
          created_at: string
          id: string
          mood_rating: number | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          mood_rating?: number | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          mood_rating?: number | null
          user_id?: string
        }
        Relationships: []
      }
      Profile: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          id: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          id?: string
          username?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          id?: string
          username?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          date_of_birth: string | null
          email: string
          emergency_contact_name: string | null
          full_name: string | null
          id: string
          parent_phone: string | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date_of_birth?: string | null
          email: string
          emergency_contact_name?: string | null
          full_name?: string | null
          id?: string
          parent_phone?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date_of_birth?: string | null
          email?: string
          emergency_contact_name?: string | null
          full_name?: string | null
          id?: string
          parent_phone?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      questionnaire_responses: {
        Row: {
          completed_at: string
          id: string
          questionnaire_type: string
          responses: Json
          severity_level: string
          total_score: number
          user_id: string
        }
        Insert: {
          completed_at?: string
          id?: string
          questionnaire_type: string
          responses: Json
          severity_level: string
          total_score: number
          user_id: string
        }
        Update: {
          completed_at?: string
          id?: string
          questionnaire_type?: string
          responses?: Json
          severity_level?: string
          total_score?: number
          user_id?: string
        }
        Relationships: []
      }
      user_permissions: {
        Row: {
          data_sharing_permission: boolean
          emergency_contact_permission: boolean
          granted_at: string
          id: string
          location_permission: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          data_sharing_permission?: boolean
          emergency_contact_permission?: boolean
          granted_at?: string
          id?: string
          location_permission?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          data_sharing_permission?: boolean
          emergency_contact_permission?: boolean
          granted_at?: string
          id?: string
          location_permission?: boolean
          updated_at?: string
          user_id?: string
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
      user_role: "patient" | "counselor" | "admin"
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
      user_role: ["patient", "counselor", "admin"],
    },
  },
} as const
