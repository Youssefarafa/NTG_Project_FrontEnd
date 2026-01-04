import { inject } from '@angular/core';
import { Auth } from '../services/auth';
import { CanActivateFn, Router } from '@angular/router';

export const loginGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  const router = inject(Router);

  if (auth.isAuthenticated()) {
    const role = auth.role();
    if (role === 'Manager') {
      router.navigate(['/manager/dashboard']);
    } else {
      router.navigate(['/candidate/availableJobs']);
    }
    return false;
  }
  return true;
};