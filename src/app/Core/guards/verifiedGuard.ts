import { inject } from '@angular/core';
import { Auth } from '../services/auth';
import { CanActivateFn, Router } from '@angular/router';

export const verifiedGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  const router = inject(Router);

  if (auth.isAuthenticated() && (auth.user()?.isVerified || !auth.isOtpEnabled())) {
    return true;
  }
  router.navigate(['/verify-account']);
  return false;
};