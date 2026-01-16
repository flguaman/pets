export interface Database {
  public: {
    Tables: {
      pets: {
        Row: {
          id: string;
          digital_id: string | null;
          name: string;
          owner: string;
          phone: string;
          address: string;
          type: string;
          breed: string;
          age: number;
          illness: string | null;
          observations: string | null;
          image_url: string | null;
          status: string;
          user_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          digital_id?: string | null;
          name: string;
          owner: string;
          phone: string;
          address: string;
          type: string;
          breed: string;
          age: number;
          illness?: string | null;
          observations?: string | null;
          image_url?: string | null;
          status?: string;
          user_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          digital_id?: string | null;
          name?: string;
          owner?: string;
          phone?: string;
          address?: string;
          type?: string;
          breed?: string;
          age?: number;
          illness?: string | null;
          observations?: string | null;
          image_url?: string | null;
          status?: string;
          user_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      posts: {
        Row: {
          id: string;
          title: string;
          description: string;
          type: string;
          pet_id: string | null;
          image_url: string | null;
          location: string | null;
          contact_info: string | null;
          reward: string | null;
          status: string;
          user_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          type: string;
          pet_id?: string | null;
          image_url?: string | null;
          location?: string | null;
          contact_info?: string | null;
          reward?: string | null;
          status?: string;
          user_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          type?: string;
          pet_id?: string | null;
          image_url?: string | null;
          location?: string | null;
          contact_info?: string | null;
          reward?: string | null;
          status?: string;
          user_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}