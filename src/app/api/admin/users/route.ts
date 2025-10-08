import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase-server';

type ClerkClientType = Awaited<ReturnType<typeof clerkClient>>;

// Shape expected by the Admin UI
interface AdminUser {
  id: string;
  email: string;
  name?: string;
  role: 'admin' | 'moderator' | 'editor' | 'user';
  status: 'active' | 'inactive' | 'blocked';
  created_at: string;
  last_login?: string;
  permissions?: string[];
  profile?: {
    first_name?: string;
    last_name?: string;
    phone?: string;
    avatar_url?: string;
  };
}

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Optional: verify current user is admin using your existing admin_users table
    try {
      const supabase = createAdminClient();
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('id', userId)
        .eq('is_active', true)
        .single();

      if (adminError || !adminData) {
        return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
      }
    } catch (e) {
      // If admin table not set up, fail closed here or allow based on your policy
      // For safety, fail closed:
      return NextResponse.json({ error: 'Admin verification failed' }, { status: 403 });
    }

    // List users from Clerk (clerkClient is async in this SDK version)
    const client: ClerkClientType = await clerkClient();
    const list = await client.users.getUserList({ limit: 200 });

    const users: AdminUser[] = (list?.data || []).map((u: any) => {
      const primaryEmail = u.emailAddresses?.[0]?.emailAddress || '';
      const firstName = u.firstName || (u.publicMetadata?.first_name as string | undefined);
      const lastName = u.lastName || (u.publicMetadata?.last_name as string | undefined);
      const phone = u.phoneNumbers?.[0]?.phoneNumber || (u.publicMetadata?.phone as string | undefined);
      const avatarUrl =
        (typeof u.imageUrl === 'string' ? u.imageUrl : undefined) ||
        (u.profileImageUrl as string | undefined);

      // Role from publicMetadata.role if present, otherwise 'user'
      const role =
        (u.publicMetadata?.role as AdminUser['role'] | undefined) || 'user';

      // Status heuristic
      // Clerk doesn't expose 'blocked' directly here; adapt as needed if you use bans/suspensions
      const status: AdminUser['status'] = u.emailAddresses?.some((e: any) => e.verification?.status === 'verified')
        ? 'active'
        : 'inactive';

      return {
        id: u.id,
        email: primaryEmail,
        name: u.username || [firstName, lastName].filter(Boolean).join(' ') || primaryEmail,
        role,
        status,
        created_at: new Date(u.createdAt).toISOString(),
        last_login: u.lastSignInAt ? new Date(u.lastSignInAt).toISOString() : undefined,
        permissions: Array.isArray(u.publicMetadata?.permissions)
          ? (u.publicMetadata.permissions as string[])
          : undefined,
        profile: {
          first_name: firstName,
          last_name: lastName,
          phone,
          avatar_url: avatarUrl,
        },
      };
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error listing admin users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
