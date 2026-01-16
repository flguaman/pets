import { v4 as uuidv4 } from 'uuid';

// Centralized demo accounts and helper functions.
export const DEFAULT_ACCOUNTS = {
    user: {
        id: uuidv4(),
        email: 'usuario@mascotas.ec',
        password: 'usuario123',
        name: 'Usuario Demo',
        role: 'user'
    },
    admin: {
        id: uuidv4(),
        email: 'admin@mascotas.ec',
        password: 'admin123',
        name: 'Administrador Demo',
        role: 'admin'
    }
};

// Attempt to create accounts in Supabase (client-side). Returns the raw results.
export async function createDefaultAccountsInSupabase(supabase: any) {
    const results: any = {};
    try {
        const signupResultUser = await supabase.auth.signUp({
            email: DEFAULT_ACCOUNTS.user.email,
            password: DEFAULT_ACCOUNTS.user.password,
            options: { data: { name: DEFAULT_ACCOUNTS.user.name, role: DEFAULT_ACCOUNTS.user.role } }
        });
        results.user = signupResultUser;
    } catch (err) {
        results.user = { error: err };
    }

    try {
        const signupResultAdmin = await supabase.auth.signUp({
            email: DEFAULT_ACCOUNTS.admin.email,
            password: DEFAULT_ACCOUNTS.admin.password,
            options: { data: { name: DEFAULT_ACCOUNTS.admin.name, role: DEFAULT_ACCOUNTS.admin.role } }
        });
        results.admin = signupResultAdmin;
    } catch (err) {
        results.admin = { error: err };
    }

    return results;
}

// Build a local AppUser-like object for demo sessions (no dependency on Supabase types).
export function buildLocalDemoAppUser(role: 'user' | 'admin') {
    const creds = role === 'admin' ? DEFAULT_ACCOUNTS.admin : DEFAULT_ACCOUNTS.user;
    return {
        id: creds.id,
        name: creds.name,
        email: creds.email,
        picture: `https://ui-avatars.com/api/?name=${encodeURIComponent(creds.name)}&background=10b981&color=fff`,
        role: creds.role,
        isVerified: true,
        lastLogin: new Date().toISOString(),
        permissions: role === 'admin' ? {
            canCreatePets: true,
            canEditPets: true,
            canDeletePets: true,
            canManageUsers: true,
            canViewAnalytics: true,
            canModerateContent: true,
        } : {
            canCreatePets: false,
            canEditPets: false,
            canDeletePets: false,
            canManageUsers: false,
            canViewAnalytics: false,
            canModerateContent: false,
        },
        preferences: {
            notifications: true,
            emailUpdates: true,
            publicProfile: false,
            language: 'es',
            theme: 'dark'
        },
        stats: {
            petsCreated: 0,
            postsCreated: 0,
            joinDate: new Date().toISOString(),
            lastActivity: new Date().toISOString()
        }
    };
}

export default {
    DEFAULT_ACCOUNTS,
    createDefaultAccountsInSupabase,
    buildLocalDemoAppUser
};
