import { inject } from '@angular/core';
import { Auth } from '../services/auth';
import { CanActivateFn, Router } from '@angular/router';

export const featureGuard = (
  featureKey: 'isForgetPasswordEnabled' | 'isOtpEnabled'
): CanActivateFn => {
  return () => {
    const auth = inject(Auth);
    const router = inject(Router);

    if (auth[featureKey]()) {
      return true;
    }
    router.navigate(['/notFound']);
    return false;
  };
};
