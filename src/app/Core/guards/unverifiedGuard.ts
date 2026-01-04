import { inject } from '@angular/core';
import { Auth } from '../services/auth';
import { CanActivateFn, Router } from '@angular/router';

export const unverifiedGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  const router = inject(Router);
  if (auth.isAuthenticated() && !auth.user()?.isVerified) {
    return true;
  }

  if (auth.isAuthenticated() && auth.user()?.isVerified) {
    const role = auth.role();
    router.navigate([role === 'Manager' ? '/manager/dashboard' : '/candidate/availableJobs']);
    return false;
  }
  router.navigate(['/login']);
  return false;
};