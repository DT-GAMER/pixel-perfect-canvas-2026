export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      blog_posts: {
        Row: {
          author_name: string
          author_role: string | null
          category_id: string | null
          content: Json
          cover_image_alt: string | null
          cover_image_url: string | null
          created_at: string
          excerpt: string
          id: string
          is_free: boolean
          preview_paragraphs: number
          published_at: string | null
          reading_minutes: number
          seo_description: string | null
          seo_title: string | null
          slug: string
          status: string
          tags: string[]
          title: string
          updated_at: string
        }
        Insert: {
          author_name?: string
          author_role?: string | null
          category_id?: string | null
          content?: Json
          cover_image_alt?: string | null
          cover_image_url?: string | null
          created_at?: string
          excerpt: string
          id?: string
          is_free?: boolean
          preview_paragraphs?: number
          published_at?: string | null
          reading_minutes?: number
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          status?: string
          tags?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          author_name?: string
          author_role?: string | null
          category_id?: string | null
          content?: Json
          cover_image_alt?: string | null
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string
          id?: string
          is_free?: boolean
          preview_paragraphs?: number
          published_at?: string | null
          reading_minutes?: number
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          status?: string
          tags?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_category_id_fkey"
            columns: ["category_id"]
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          display_order: number
          id: string
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      faqs: {
        Row: {
          answer: string
          created_at: string
          display_order: number
          id: string
          is_published: boolean
          question: string
          updated_at: string
        }
        Insert: {
          answer: string
          created_at?: string
          display_order?: number
          id?: string
          is_published?: boolean
          question: string
          updated_at?: string
        }
        Update: {
          answer?: string
          created_at?: string
          display_order?: number
          id?: string
          is_published?: boolean
          question?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          invited_by: string | null
          last_sign_in_at: string | null
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          invited_by?: string | null
          last_sign_in_at?: string | null
          role: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          invited_by?: string | null
          last_sign_in_at?: string | null
          role?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_invited_by_fkey"
            columns: ["invited_by"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      registration_rate_limits: {
        Row: {
          attempt_count: number
          key_hash: string
          updated_at: string
          window_started_at: string
        }
        Insert: {
          attempt_count?: number
          key_hash: string
          updated_at?: string
          window_started_at?: string
        }
        Update: {
          attempt_count?: number
          key_hash?: string
          updated_at?: string
          window_started_at?: string
        }
        Relationships: []
      }
      registrations: {
        Row: {
          city: string
          confirmation_email_error: string | null
          confirmation_email_id: string | null
          confirmation_email_sent_at: string | null
          confirmation_email_status: string
          country: string
          created_at: string
          email: string
          email_normalized: string | null
          full_name: string
          id: string
          other_profession: string | null
          privacy_agreed: boolean
          profession: string
          subscribe_updates: boolean
          updated_at: string
        }
        Insert: {
          city: string
          confirmation_email_error?: string | null
          confirmation_email_id?: string | null
          confirmation_email_sent_at?: string | null
          confirmation_email_status?: string
          country: string
          created_at?: string
          email: string
          email_normalized?: string | null
          full_name: string
          id?: string
          other_profession?: string | null
          privacy_agreed: boolean
          profession: string
          subscribe_updates?: boolean
          updated_at?: string
        }
        Update: {
          city?: string
          confirmation_email_error?: string | null
          confirmation_email_id?: string | null
          confirmation_email_sent_at?: string | null
          confirmation_email_status?: string
          country?: string
          created_at?: string
          email?: string
          email_normalized?: string | null
          full_name?: string
          id?: string
          other_profession?: string | null
          privacy_agreed?: boolean
          profession?: string
          subscribe_updates?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      speakers: {
        Row: {
          bio: string | null
          created_at: string
          display_order: number
          id: string
          instagram_url: string | null
          is_featured: boolean
          is_published: boolean
          linkedin_url: string | null
          name: string
          organization: string | null
          photo_alt: string | null
          photo_url: string | null
          role: string | null
          slug: string
          track: string | null
          updated_at: string
          website_url: string | null
          x_url: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string
          display_order?: number
          id?: string
          instagram_url?: string | null
          is_featured?: boolean
          is_published?: boolean
          linkedin_url?: string | null
          name: string
          organization?: string | null
          photo_alt?: string | null
          photo_url?: string | null
          role?: string | null
          slug: string
          track?: string | null
          updated_at?: string
          website_url?: string | null
          x_url?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string
          display_order?: number
          id?: string
          instagram_url?: string | null
          is_featured?: boolean
          is_published?: boolean
          linkedin_url?: string | null
          name?: string
          organization?: string | null
          photo_alt?: string | null
          photo_url?: string | null
          role?: string | null
          slug?: string
          track?: string | null
          updated_at?: string
          website_url?: string | null
          x_url?: string | null
        }
        Relationships: []
      }
      sponsor_enquiries: {
        Row: {
          company: string
          created_at: string
          email: string
          id: string
          message: string
          name: string
          notes: string | null
          notification_error: string | null
          notified_at: string | null
          phone: string | null
          status: string
          tier_interest: string
          updated_at: string
        }
        Insert: {
          company: string
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          notes?: string | null
          notification_error?: string | null
          notified_at?: string | null
          phone?: string | null
          status?: string
          tier_interest: string
          updated_at?: string
        }
        Update: {
          company?: string
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          notes?: string | null
          notification_error?: string | null
          notified_at?: string | null
          phone?: string | null
          status?: string
          tier_interest?: string
          updated_at?: string
        }
        Relationships: []
      }
      sponsors: {
        Row: {
          created_at: string
          description: string | null
          display_order: number
          id: string
          is_visible: boolean
          logo_alt: string | null
          logo_url: string | null
          name: string
          tier: string
          updated_at: string
          website_url: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          is_visible?: boolean
          logo_alt?: string | null
          logo_url?: string | null
          name: string
          tier: string
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          is_visible?: boolean
          logo_alt?: string | null
          logo_url?: string | null
          name?: string
          tier?: string
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      blog_post_is_live: {
        Args: { p_status: string; p_published_at: string }
        Returns: boolean
      }
      consume_registration_attempt: {
        Args: {
          p_key_hash: string
          p_window_seconds?: number
          p_max_attempts?: number
        }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
