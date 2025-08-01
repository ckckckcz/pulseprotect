import { redirect } from "next/navigation";

type UserRole = 'admin' | 'dokter' | 'user' | null | undefined;

// Define the home paths for each role
const ROLE_HOME_PATHS = {
  admin: '/admin/dashboard',
  dokter: '/dokter',
  user: '/'  // Regular users go to dashboard
};

// Function to redirect based on role
export function redirectToRoleHome(role: UserRole) {
  console.log(`Redirecting based on role: ${role}`);
  const path = ROLE_HOME_PATHS[role as keyof typeof ROLE_HOME_PATHS] || '/login';
  redirect(path);
}

// Function to get the path for a role (without redirecting)
export function getHomePathForRole(role: UserRole): string {
  console.log(`Getting home path for role: ${role}`);
  if (!role) return '/login';
  return ROLE_HOME_PATHS[role as keyof typeof ROLE_HOME_PATHS] || '/dashboard';
}

// Function to check if current role meets required role(s)
export function requireRole(currentRole: UserRole, requiredRole: UserRole | UserRole[]) {
  if (!currentRole) {
    console.log('No role found, redirecting to login');
    return redirect('/login');
  }
  
  if (Array.isArray(requiredRole)) {
    if (!requiredRole.includes(currentRole as any)) {
      console.log(`Role ${currentRole} not in allowed roles, redirecting`);
      redirectToRoleHome(currentRole);
    }
  } else if (currentRole !== requiredRole) {
    console.log(`Role ${currentRole} doesn't match required ${requiredRole}, redirecting`);
    redirectToRoleHome(currentRole);
  }
}
