export interface Post {
  id: string;
  title: string;
  description: string;
  type: 'adoption' | 'lost' | 'stolen' | 'disoriented' | 'general';
  pet_id?: string;
  image_url?: string;
  location?: string;
  contact_info?: string;
  reward?: string;
  status: 'active' | 'resolved' | 'closed';
  user_id: string;
  created_at: string;
  updated_at: string;
  // Populated from joins
  pet?: {
    id: string;
    name: string;
    type: string;
    breed: string;
    image_url: string;
  };
}

export type PostType = Post['type'];
export type PostStatus = Post['status'];