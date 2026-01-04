import { inject } from '@angular/core';
import { Auth } from '../services/auth';
import { CanActivateFn, Router } from '@angular/router';

export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return () => {
    const auth = inject(Auth);
    const router = inject(Router);
    const userRole = auth.role();

    if (auth.isAuthenticated() && userRole && allowedRoles.includes(userRole)) {
      return true;
    }
    router.navigate(['/unauthorized']);
    return false;
  };
};