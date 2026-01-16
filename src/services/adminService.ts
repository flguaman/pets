import { supabase } from '../lib/supabase';
import { UserRole } from '../store/authStore';

export interface AdminUserStats {
  totalUsers: number;
  activeUsers: number;
  adminUsers: number;
  regularUsers: number;
}

export interface UserManagementOptions {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole;
}

export const getAdminUserStats = async (): Promise<AdminUserStats> => {
  try {
    // Get all users from Supabase Auth
    const { data: { users }, error } = await supabase.auth.admin.listUsers();
    
    if (error) throw error;
    
    const totalUsers = users.length;
    const adminUsers = users.filter(user => user.user_metadata?.role === 'admin').length;
    const regularUsers = totalUsers - adminUsers;
    
    // For active users, we can check last sign in time (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const activeUsers = users.filter(user => {
      const lastSignIn = user.last_sign_in_at ? new Date(user.last_sign_in_at) : null;
      return lastSignIn && lastSignIn > thirtyDaysAgo;
    }).length;
    
    return {
      totalUsers,
      activeUsers,
      adminUsers,
      regularUsers
    };
  } catch (error) {
    console.error('Error fetching admin user stats:', error);
    return {
      totalUsers: 0,
      activeUsers: 0,
      adminUsers: 0,
      regularUsers: 0
    };
  }
};

export const listUsers = async (options: UserManagementOptions = {}) => {
  try {
    const { page = 1, limit = 50, search, role } = options;
    
    const { data: { users }, error } = await supabase.auth.admin.listUsers();
    
    if (error) throw error;
    
    // Filter users based on options
    let filteredUsers = users;
    
    if (search) {
      const searchLower = search.toLowerCase();
      filteredUsers = filteredUsers.filter(user => 
        user.email?.toLowerCase().includes(searchLower) ||
        user.user_metadata?.name?.toLowerCase().includes(searchLower)
      );
    }
    
    if (role) {
      filteredUsers = filteredUsers.filter(user => user.user_metadata?.role === role);
    }
    
    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);
    
    return {
      users: paginatedUsers,
      totalCount: filteredUsers.length,
      page,
      totalPages: Math.ceil(filteredUsers.length / limit)
    };
  } catch (error) {
    console.error('Error listing users:', error);
    throw error;
  }
};

export const updateUserRole = async (userId: string, newRole: UserRole): Promise<void> => {
  try {
    const { error } = await supabase.auth.admin.updateUserById(userId, {
      user_metadata: {
        role: newRole,
        lastUpdated: new Date().toISOString()
      }
    });
    
    if (error) throw error;
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
};

export const deleteUser = async (userId: string): Promise<void> => {
  try {
    const { error } = await supabase.auth.admin.deleteUser(userId);
    
    if (error) throw error;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

export const getUserDetails = async (userId: string) => {
  try {
    const { data: { user }, error } = await supabase.auth.admin.getUserById(userId);
    
    if (error) throw error;
    
    return user;
  } catch (error) {
    console.error('Error getting user details:', error);
    throw error;
  }
};

export const isUserAdmin = async (userId: string): Promise<boolean> => {
  try {
    const user = await getUserDetails(userId);
    return user?.user_metadata?.role === 'admin';
  } catch (error) {
    console.error('Error checking if user is admin:', error);
    return false;
  }
};

export const bulkUpdateUserRoles = async (userIds: string[], newRole: UserRole): Promise<void> => {
  try {
    const updatePromises = userIds.map(userId => 
      updateUserRole(userId, newRole)
    );
    
    await Promise.all(updatePromises);
  } catch (error) {
    console.error('Error in bulk role update:', error);
    throw error;
  }
};

export default {
  getAdminUserStats,
  listUsers,
  updateUserRole,
  deleteUser,
  getUserDetails,
  isUserAdmin,
  bulkUpdateUserRoles
};