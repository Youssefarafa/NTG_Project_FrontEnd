import { inject } from "@angular/core";
import { Auth } from "../services/auth";
import { CanActivateFn, Router } from "@angular/router";

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(Auth);
  const router = inject(Router);

  if (auth.isAuthenticated()) {
    return true;
  }
  router.navigate(['/login'], {
    queryParams: { returnUrl: state.url },
  });
  return false;
};

export const verifiedGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  const router = inject(Router);

  if (auth.isAuthenticated() && auth.user()?.isVerified) {
    return true;
  }
  router.navigate(['/verify-account']);
  return false;
};

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

export const loginGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  const router = inject(Router);

  if (auth.isAuthenticated()) {
    const user = auth.user();
    if (user?.role === 'Manager') {
      router.navigate(['/manager/dashboard']);
    } else {
      router.navigate(['/candidate/availableJobs']);
    }
    return false;
  }
  return true;
};
