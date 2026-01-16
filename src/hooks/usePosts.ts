import { useState, useEffect } from 'react';
import { Post } from '../types/post';
import { PostService } from '../services/postService';
import { useAuthStore } from '../store/authStore';

export function usePosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, user } = useAuthStore();

  // Get current user ID
  const getCurrentUserId = (): string | null => {
    return user?.id || null;
  };

  // Load user posts
  const loadUserPosts = async () => {
    if (!isAuthenticated || !user?.id) {
      setPosts([]);
      setLoading(false);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const userId = getCurrentUserId();
      if (!userId) {
        setPosts([]);
        setLoading(false);
        return;
      }

      const data = await PostService.getUserPosts(userId);
      setPosts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading posts');
      console.error('Error loading posts:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load all posts for home feed
  const loadAllPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await PostService.getAllPosts();
      setPosts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading posts');
      console.error('Error loading posts:', err);
    } finally {
      setLoading(false);
    }
  };

  // Create a new post
  const createPost = async (postData: Omit<Post, 'id' | 'created_at' | 'updated_at' | 'user_id'>): Promise<Post> => {
    try {
      const userId = getCurrentUserId();
      if (!userId) {
        throw new Error('User not authenticated');
      }

      const newPost = await PostService.createPost(postData, userId);
      setPosts(prev => [newPost, ...prev]);
      return newPost;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error creating post';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Update an existing post
  const updatePost = async (id: string, postData: Partial<Post>): Promise<Post> => {
    try {
      const userId = getCurrentUserId();
      if (!userId) {
        throw new Error('User not authenticated');
      }

      const updatedPost = await PostService.updatePost(id, postData, userId);
      setPosts(prev => prev.map(post => post.id === id ? updatedPost : post));
      return updatedPost;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error updating post';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Delete a post
  const deletePost = async (id: string): Promise<void> => {
    try {
      const userId = getCurrentUserId();
      if (!userId) {
        throw new Error('User not authenticated');
      }

      await PostService.deletePost(id, userId);
      setPosts(prev => prev.filter(post => post.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error deleting post';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Search posts
  const searchPosts = async (searchTerm: string): Promise<Post[]> => {
    try {
      if (!searchTerm.trim()) {
        return posts;
      }

      const results = await PostService.searchPosts(searchTerm);
      return results;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error searching posts';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Load user posts when user changes
  useEffect(() => {
    loadUserPosts();
  }, [user]);

  return {
    posts,
    loading,
    error,
    createPost,
    updatePost,
    deletePost,
    searchPosts,
    loadUserPosts,
    loadAllPosts,
    refetch: loadUserPosts,
  };
}