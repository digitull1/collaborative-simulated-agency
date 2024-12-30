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
      achievement_progress: {
        Row: {
          achievement_type_id: string
          current_progress: number | null
          id: string
          last_updated: string | null
          user_id: string
        }
        Insert: {
          achievement_type_id: string
          current_progress?: number | null
          id?: string
          last_updated?: string | null
          user_id: string
        }
        Update: {
          achievement_type_id?: string
          current_progress?: number | null
          id?: string
          last_updated?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "achievement_progress_achievement_type_id_fkey"
            columns: ["achievement_type_id"]
            isOneToOne: false
            referencedRelation: "achievement_types"
            referencedColumns: ["id"]
          },
        ]
      }
      achievement_types: {
        Row: {
          category: string | null
          created_at: string
          description: string
          icon: string
          id: string
          name: string
          points: number
          required_progress: number | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          description: string
          icon: string
          id?: string
          name: string
          points?: number
          required_progress?: number | null
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string
          icon?: string
          id?: string
          name?: string
          points?: number
          required_progress?: number | null
        }
        Relationships: []
      }
      achievements: {
        Row: {
          category: string | null
          created_at: string
          description: string
          icon: string
          id: string
          is_sharable: boolean | null
          name: string
          progress: number | null
          required_progress: number | null
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description: string
          icon: string
          id?: string
          is_sharable?: boolean | null
          name: string
          progress?: number | null
          required_progress?: number | null
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string
          icon?: string
          id?: string
          is_sharable?: boolean | null
          name?: string
          progress?: number | null
          required_progress?: number | null
          user_id?: string
        }
        Relationships: []
      }
      agent_collaboration_logs: {
        Row: {
          created_at: string | null
          id: string
          message: string
          project_id: string | null
          requesting_agent: string
          status: string | null
          target_agent: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          project_id?: string | null
          requesting_agent: string
          status?: string | null
          target_agent: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          project_id?: string | null
          requesting_agent?: string
          status?: string | null
          target_agent?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_collaboration_logs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "threads"
            referencedColumns: ["id"]
          },
        ]
      }
      collaboration_metrics: {
        Row: {
          agent_name: string
          details: Json | null
          id: string
          metric_type: string
          recorded_at: string | null
          value: number
          workflow_id: string | null
        }
        Insert: {
          agent_name: string
          details?: Json | null
          id?: string
          metric_type: string
          recorded_at?: string | null
          value: number
          workflow_id?: string | null
        }
        Update: {
          agent_name?: string
          details?: Json | null
          id?: string
          metric_type?: string
          recorded_at?: string | null
          value?: number
          workflow_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "collaboration_metrics_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      content_blocks: {
        Row: {
          age_range: unknown
          content_type: string
          created_at: string
          description: string
          id: string
          language: string | null
          metadata: Json | null
          title: string
          topic: string
        }
        Insert: {
          age_range: unknown
          content_type: string
          created_at?: string
          description: string
          id?: string
          language?: string | null
          metadata?: Json | null
          title: string
          topic: string
        }
        Update: {
          age_range?: unknown
          content_type?: string
          created_at?: string
          description?: string
          id?: string
          language?: string | null
          metadata?: Json | null
          title?: string
          topic?: string
        }
        Relationships: []
      }
      content_translations: {
        Row: {
          content_key: string
          created_at: string
          id: string
          language: string
          translated_content: string
        }
        Insert: {
          content_key: string
          created_at?: string
          id?: string
          language: string
          translated_content: string
        }
        Update: {
          content_key?: string
          created_at?: string
          id?: string
          language?: string
          translated_content?: string
        }
        Relationships: []
      }
      context_memory: {
        Row: {
          agent_name: string
          conversation_history: Json | null
          id: string
          last_updated: string | null
          project_details: Json | null
          thread_id: string | null
          user_id: string | null
        }
        Insert: {
          agent_name: string
          conversation_history?: Json | null
          id?: string
          last_updated?: string | null
          project_details?: Json | null
          thread_id?: string | null
          user_id?: string | null
        }
        Update: {
          agent_name?: string
          conversation_history?: Json | null
          id?: string
          last_updated?: string | null
          project_details?: Json | null
          thread_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "context_memory_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "threads"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_follow_ups: {
        Row: {
          completed: boolean | null
          context_key: string
          created_at: string | null
          follow_up_type: string
          id: string
          priority: number | null
          scheduled_for: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          completed?: boolean | null
          context_key: string
          created_at?: string | null
          follow_up_type: string
          id?: string
          priority?: number | null
          scheduled_for?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          completed?: boolean | null
          context_key?: string
          created_at?: string | null
          follow_up_type?: string
          id?: string
          priority?: number | null
          scheduled_for?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      conversation_memory: {
        Row: {
          context_type: string
          created_at: string
          expires_at: string | null
          id: string
          memory_key: string
          memory_value: Json
          user_id: string
        }
        Insert: {
          context_type: string
          created_at?: string
          expires_at?: string | null
          id?: string
          memory_key: string
          memory_value: Json
          user_id: string
        }
        Update: {
          context_type?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          memory_key?: string
          memory_value?: Json
          user_id?: string
        }
        Relationships: []
      }
      daily_challenges: {
        Row: {
          created_at: string | null
          description: string
          id: string
          points: number | null
          title: string
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          points?: number | null
          title: string
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          points?: number | null
          title?: string
        }
        Relationships: []
      }
      explored_topics: {
        Row: {
          emoji: string
          id: string
          last_explored_at: string | null
          time_spent: number | null
          topic: string
          user_id: string
        }
        Insert: {
          emoji: string
          id?: string
          last_explored_at?: string | null
          time_spent?: number | null
          topic: string
          user_id: string
        }
        Update: {
          emoji?: string
          id?: string
          last_explored_at?: string | null
          time_spent?: number | null
          topic?: string
          user_id?: string
        }
        Relationships: []
      }
      learning_time: {
        Row: {
          date: string
          id: string
          minutes_spent: number | null
          user_id: string
        }
        Insert: {
          date?: string
          id?: string
          minutes_spent?: number | null
          user_id: string
        }
        Update: {
          date?: string
          id?: string
          minutes_spent?: number | null
          user_id?: string
        }
        Relationships: []
      }
      message_reactions: {
        Row: {
          context: Json | null
          created_at: string | null
          id: string
          is_auto: boolean | null
          message_id: string
          reaction: string
          sentiment: string | null
          user_id: string
        }
        Insert: {
          context?: Json | null
          created_at?: string | null
          id?: string
          is_auto?: boolean | null
          message_id: string
          reaction: string
          sentiment?: string | null
          user_id: string
        }
        Update: {
          context?: Json | null
          created_at?: string | null
          id?: string
          is_auto?: boolean | null
          message_id?: string
          reaction?: string
          sentiment?: string | null
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          content: string
          id: string
          read: boolean | null
          sender: string
          thread_id: string | null
          timestamp: string
          type: string
        }
        Insert: {
          content: string
          id?: string
          read?: boolean | null
          sender: string
          thread_id?: string | null
          timestamp?: string
          type: string
        }
        Update: {
          content?: string
          id?: string
          read?: boolean | null
          sender?: string
          thread_id?: string | null
          timestamp?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "threads"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_state: {
        Row: {
          communication_preferences: Json | null
          completed_steps: string[] | null
          conversation_context: Json | null
          created_at: string
          goals: Json | null
          id: string
          interaction_history: Json | null
          interests: string[] | null
          learning_preferences: Json | null
          onboarding_step: string | null
          personality_traits: Json | null
          preferred_topics: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          communication_preferences?: Json | null
          completed_steps?: string[] | null
          conversation_context?: Json | null
          created_at?: string
          goals?: Json | null
          id?: string
          interaction_history?: Json | null
          interests?: string[] | null
          learning_preferences?: Json | null
          onboarding_step?: string | null
          personality_traits?: Json | null
          preferred_topics?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          communication_preferences?: Json | null
          completed_steps?: string[] | null
          conversation_context?: Json | null
          created_at?: string
          goals?: Json | null
          id?: string
          interaction_history?: Json | null
          interests?: string[] | null
          learning_preferences?: Json | null
          onboarding_step?: string | null
          personality_traits?: Json | null
          preferred_topics?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age: number
          created_at: string
          gender: string
          id: string
          language: string
          learning_style: Database["public"]["Enums"]["learning_style"] | null
          multimedia_enabled: boolean | null
          name: string | null
          onboarding_completed: boolean | null
          points: number | null
          preferred_language: string | null
          preferred_topics: string[] | null
          topics_of_interest: string[] | null
          updated_at: string
        }
        Insert: {
          age?: number
          created_at?: string
          gender?: string
          id: string
          language?: string
          learning_style?: Database["public"]["Enums"]["learning_style"] | null
          multimedia_enabled?: boolean | null
          name?: string | null
          onboarding_completed?: boolean | null
          points?: number | null
          preferred_language?: string | null
          preferred_topics?: string[] | null
          topics_of_interest?: string[] | null
          updated_at?: string
        }
        Update: {
          age?: number
          created_at?: string
          gender?: string
          id?: string
          language?: string
          learning_style?: Database["public"]["Enums"]["learning_style"] | null
          multimedia_enabled?: boolean | null
          name?: string | null
          onboarding_completed?: boolean | null
          points?: number | null
          preferred_language?: string | null
          preferred_topics?: string[] | null
          topics_of_interest?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      suggestion_patterns: {
        Row: {
          created_at: string | null
          frequency: number | null
          id: string
          last_suggested: string | null
          pattern_type: string
          pattern_value: Json
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          frequency?: number | null
          id?: string
          last_suggested?: string | null
          pattern_type: string
          pattern_value: Json
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          frequency?: number | null
          id?: string
          last_suggested?: string | null
          pattern_type?: string
          pattern_value?: Json
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          agent_name: string
          created_at: string | null
          created_by: string
          dependencies: Json | null
          description: string
          id: string
          last_updated: string | null
          project_id: string | null
          status: string | null
        }
        Insert: {
          agent_name: string
          created_at?: string | null
          created_by: string
          dependencies?: Json | null
          description: string
          id?: string
          last_updated?: string | null
          project_id?: string | null
          status?: string | null
        }
        Update: {
          agent_name?: string
          created_at?: string | null
          created_by?: string
          dependencies?: Json | null
          description?: string
          id?: string
          last_updated?: string | null
          project_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "threads"
            referencedColumns: ["id"]
          },
        ]
      }
      thread_messages: {
        Row: {
          content: string
          id: string
          sender: string
          thread_id: string | null
          timestamp: string
        }
        Insert: {
          content: string
          id?: string
          sender: string
          thread_id?: string | null
          timestamp?: string
        }
        Update: {
          content?: string
          id?: string
          sender?: string
          thread_id?: string | null
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "thread_messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "threads"
            referencedColumns: ["id"]
          },
        ]
      }
      threads: {
        Row: {
          created_at: string
          id: string
          last_message: string | null
          last_message_at: string | null
          participants: string[]
          title: string
          type: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_message?: string | null
          last_message_at?: string | null
          participants: string[]
          title: string
          type?: string
        }
        Update: {
          created_at?: string
          id?: string
          last_message?: string | null
          last_message_at?: string | null
          participants?: string[]
          title?: string
          type?: string
        }
        Relationships: []
      }
      user_goals: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          progress: number | null
          status: string | null
          target_date: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: string
          progress?: number | null
          status?: string | null
          target_date?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          progress?: number | null
          status?: string | null
          target_date?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_progress: {
        Row: {
          achievements_count: number | null
          created_at: string
          current_challenge_id: string | null
          daily_challenge_completed: boolean | null
          id: string
          last_challenge_date: string | null
          last_interaction_date: string
          level: number
          points: number
          questions_asked: number
          quiz_score: number
          streak_days: number
          topics_explored: number
          updated_at: string
          user_id: string
        }
        Insert: {
          achievements_count?: number | null
          created_at?: string
          current_challenge_id?: string | null
          daily_challenge_completed?: boolean | null
          id?: string
          last_challenge_date?: string | null
          last_interaction_date?: string
          level?: number
          points?: number
          questions_asked?: number
          quiz_score?: number
          streak_days?: number
          topics_explored?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          achievements_count?: number | null
          created_at?: string
          current_challenge_id?: string | null
          daily_challenge_completed?: boolean | null
          id?: string
          last_challenge_date?: string | null
          last_interaction_date?: string
          level?: number
          points?: number
          questions_asked?: number
          quiz_score?: number
          streak_days?: number
          topics_explored?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      weekly_recaps: {
        Row: {
          achievements_earned: number | null
          created_at: string | null
          id: string
          interaction_count: number | null
          mood_summary: Json | null
          points_earned: number | null
          topics_explored: string[] | null
          user_id: string
          week_end_date: string
          week_start_date: string
        }
        Insert: {
          achievements_earned?: number | null
          created_at?: string | null
          id?: string
          interaction_count?: number | null
          mood_summary?: Json | null
          points_earned?: number | null
          topics_explored?: string[] | null
          user_id: string
          week_end_date: string
          week_start_date: string
        }
        Update: {
          achievements_earned?: number | null
          created_at?: string | null
          id?: string
          interaction_count?: number | null
          mood_summary?: Json | null
          points_earned?: number | null
          topics_explored?: string[] | null
          user_id?: string
          week_end_date?: string
          week_start_date?: string
        }
        Relationships: []
      }
      workflow_assignments: {
        Row: {
          agent_name: string
          created_at: string | null
          expertise: Json | null
          id: string
          role: string | null
          workflow_id: string | null
        }
        Insert: {
          agent_name: string
          created_at?: string | null
          expertise?: Json | null
          id?: string
          role?: string | null
          workflow_id?: string | null
        }
        Update: {
          agent_name?: string
          created_at?: string | null
          expertise?: Json | null
          id?: string
          role?: string | null
          workflow_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workflow_assignments_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_dependencies: {
        Row: {
          created_at: string | null
          dependent_workflow_id: string | null
          id: string
          workflow_id: string | null
        }
        Insert: {
          created_at?: string | null
          dependent_workflow_id?: string | null
          id?: string
          workflow_id?: string | null
        }
        Update: {
          created_at?: string | null
          dependent_workflow_id?: string | null
          id?: string
          workflow_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workflow_dependencies_dependent_workflow_id_fkey"
            columns: ["dependent_workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_dependencies_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_updates: {
        Row: {
          agent_name: string
          content: string
          created_at: string | null
          id: string
          update_type: string
          workflow_id: string | null
        }
        Insert: {
          agent_name: string
          content: string
          created_at?: string | null
          id?: string
          update_type: string
          workflow_id?: string | null
        }
        Update: {
          agent_name?: string
          content?: string
          created_at?: string | null
          id?: string
          update_type?: string
          workflow_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workflow_updates_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      workflows: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          project_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          project_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          project_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workflows_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "threads"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      award_achievement: {
        Args: {
          p_user_id: string
          p_achievement_type_id: string
        }
        Returns: undefined
      }
      calculate_next_level_points: {
        Args: {
          current_level: number
        }
        Returns: number
      }
      cleanup_expired_memories: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      enhance_weekly_recap: {
        Args: {
          user_id_param: string
          week_start: string
        }
        Returns: {
          recap_id: string
          mood_summary: Json
          top_topics: string[]
          achievement_details: Json
          suggested_goals: Json
        }[]
      }
      generate_proactive_suggestions: {
        Args: {
          user_id_param: string
        }
        Returns: {
          suggestion_text: string
          context: string
          relevance_score: number
        }[]
      }
      generate_weekly_recap: {
        Args: {
          user_id_param: string
          week_start: string
        }
        Returns: string
      }
      update_user_progress: {
        Args: {
          points_to_add: number
          quiz_completed: boolean
        }
        Returns: undefined
      }
    }
    Enums: {
      gender_type: "boy" | "girl" | "other"
      learning_style: "visual" | "reading" | "interactive"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
