import { supabase } from '../lib/supabase';
import { Post } from '../types/post';
import { Database } from '../types/database';

type PostRow = Database['public']['Tables']['posts']['Row'];
type PostInsert = Database['public']['Tables']['posts']['Insert'];
type PostUpdate = Database['public']['Tables']['posts']['Update'];

// Convert database row to Post type
function convertRowToPost(row: any): Post {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    type: row.type,
    pet_id: row.pet_id,
    image_url: row.image_url,
    location: row.location,
    contact_info: row.contact_info,
    reward: row.reward,
    status: row.status,
    user_id: row.user_id,
    created_at: row.created_at,
    updated_at: row.updated_at,
    pet: row.pets ? {
      id: row.pets.id,
      name: row.pets.name,
      type: row.pets.type,
      breed: row.pets.breed,
      image_url: row.pets.image_url
    } : undefined
  };
}

export class PostService {
  // Get all posts for home feed
  static async getAllPosts(): Promise<Post[]> {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        pets (
          id,
          name,
          type,
          breed,
          image_url
        )
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      throw new Error(`Error fetching posts: ${error.message}`);
    }

    return data.map(convertRowToPost);
  }

  // Get posts by user
  static async getUserPosts(userId: string): Promise<Post[]> {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        pets (
          id,
          name,
          type,
          breed,
          image_url
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error fetching user posts: ${error.message}`);
    }

    return data.map(convertRowToPost);
  }

  // Get posts by type
  static async getPostsByType(type: string): Promise<Post[]> {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        pets (
          id,
          name,
          type,
          breed,
          image_url
        )
      `)
      .eq('type', type)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error fetching posts by type: ${error.message}`);
    }

    return data.map(convertRowToPost);
  }

  // Create a new post
  static async createPost(postData: Omit<Post, 'id' | 'created_at' | 'updated_at'>, userId: string): Promise<Post> {
    const insertData: PostInsert = {
      title: postData.title,
      description: postData.description,
      type: postData.type,
      pet_id: postData.pet_id || null,
      image_url: postData.image_url || null,
      location: postData.location || null,
      contact_info: postData.contact_info || null,
      reward: postData.reward || null,
      status: postData.status || 'active',
      user_id: userId,
    };

    const { data, error } = await supabase
      .from('posts')
      .insert(insertData)
      .select(`
        *,
        pets (
          id,
          name,
          type,
          breed,
          image_url
        )
      `)
      .single();

    if (error) {
      throw new Error(`Error creating post: ${error.message}`);
    }

    return convertRowToPost(data);
  }

  // Update a post
  static async updatePost(id: string, postData: Partial<Post>, userId: string): Promise<Post> {
    const updateData: PostUpdate = {
      title: postData.title,
      description: postData.description,
      type: postData.type,
      pet_id: postData.pet_id || null,
      image_url: postData.image_url || null,
      location: postData.location || null,
      contact_info: postData.contact_info || null,
      reward: postData.reward || null,
      status: postData.status,
    };

    const { data, error } = await supabase
      .from('posts')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select(`
        *,
        pets (
          id,
          name,
          type,
          breed,
          image_url
        )
      `)
      .single();

    if (error) {
      throw new Error(`Error updating post: ${error.message}`);
    }

    return convertRowToPost(data);
  }

  // Delete a post
  static async deletePost(id: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Error deleting post: ${error.message}`);
    }
  }

  // Search posts
  static async searchPosts(searchTerm: string): Promise<Post[]> {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        pets (
          id,
          name,
          type,
          breed,
          image_url
        )
      `)
      .eq('status', 'active')
      .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error searching posts: ${error.message}`);
    }

    return data.map(convertRowToPost);
  }
}