export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          display_name: string;
          location: string;
          profile_url: string;
          level: number;
          verification_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          display_name?: string;
          location?: string;
          profile_url?: string;
          level?: number;
          verification_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          display_name?: string;
          location?: string;
          profile_url?: string;
          level?: number;
          verification_count?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      sharing_posts: {
        Row: {
          id: number;
          user_id: string;
          title: string;
          content: string;
          image_url: string;
          location: string;
          exchange_option: string;
          tags: string[];
          views: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          title: string;
          content: string;
          image_url?: string;
          location?: string;
          exchange_option?: string;
          tags?: string[];
          views?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          content?: string;
          image_url?: string;
          location?: string;
          exchange_option?: string;
          tags?: string[];
          views?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'sharing_posts_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      sharing_comments: {
        Row: {
          id: number;
          post_id: number;
          user_id: string;
          content: string;
          created_at: string;
        };
        Insert: {
          post_id: number;
          user_id: string;
          content: string;
          created_at?: string;
        };
        Update: {
          content?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'sharing_comments_post_id_fkey';
            columns: ['post_id'];
            isOneToOne: false;
            referencedRelation: 'sharing_posts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'sharing_comments_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      board_posts: {
        Row: {
          id: number;
          user_id: string;
          title: string;
          content: string;
          image_url: string;
          views: number;
          comment_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          title: string;
          content: string;
          image_url?: string;
          views?: number;
          comment_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          content?: string;
          image_url?: string;
          views?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'board_posts_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      board_comments: {
        Row: {
          id: number;
          post_id: number;
          user_id: string;
          content: string;
          created_at: string;
        };
        Insert: {
          post_id: number;
          user_id: string;
          content: string;
          created_at?: string;
        };
        Update: {
          content?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'board_comments_post_id_fkey';
            columns: ['post_id'];
            isOneToOne: false;
            referencedRelation: 'board_posts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'board_comments_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      chat_rooms: {
        Row: {
          id: number;
          user1_id: string;
          user2_id: string;
          post_id: number | null;
          last_message: string;
          last_message_at: string;
          created_at: string;
        };
        Insert: {
          user1_id: string;
          user2_id: string;
          post_id?: number | null;
          last_message?: string;
          last_message_at?: string;
          created_at?: string;
        };
        Update: {
          last_message?: string;
          last_message_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'chat_rooms_user1_id_fkey';
            columns: ['user1_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'chat_rooms_user2_id_fkey';
            columns: ['user2_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      chat_messages: {
        Row: {
          id: number;
          room_id: number;
          sender_id: string;
          message: string;
          created_at: string;
        };
        Insert: {
          room_id: number;
          sender_id: string;
          message: string;
          created_at?: string;
        };
        Update: {
          message?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'chat_messages_room_id_fkey';
            columns: ['room_id'];
            isOneToOne: false;
            referencedRelation: 'chat_rooms';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'chat_messages_sender_id_fkey';
            columns: ['sender_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      search_logs: {
        Row: {
          id: number;
          query: string;
          created_at: string;
        };
        Insert: {
          query: string;
          created_at?: string;
        };
        Update: {
          query?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      increment_sharing_views: {
        Args: { target_post_id: number };
        Returns: undefined;
      };
      increment_board_views: {
        Args: { target_post_id: number };
        Returns: undefined;
      };
      get_popular_searches: {
        Args: { limit_count?: number };
        Returns: { query: string; search_count: number }[];
      };
      search_sharing_posts: {
        Args: { search_query: string };
        Returns: Database['public']['Tables']['sharing_posts']['Row'][];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
