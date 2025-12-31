import {
  HttpContextToken,
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, finalize, Observable, switchMap, throwError } from 'rxjs';
import { Auth } from '../services/auth';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';

export const SKIP_SPINNER = new HttpContextToken<boolean>(() => false);
export const authInterceptor = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const auth = inject(Auth);
  const router = inject(Router);
  const spinner = inject(NgxSpinnerService);
  const skipSpinner = req.context.get(SKIP_SPINNER);

  if (!skipSpinner) spinner.show();

  const hideSpinner = () => {
    if (!skipSpinner) spinner.hide();
  };

  if (
    req.url.includes('/auth/') &&
    !req.url.includes('/auth/refresh') &&
    !req.url.includes('/auth/profile')
  ) {
    return next(req).pipe(finalize(hideSpinner));
  }

  const token = auth.token;

  if (!token && !req.url.includes('/auth/refresh')) {
    if (!req.url.includes('/public/') && !req.url.includes('/auth/login')) {
      // router.navigate(['/login']);
    }
    return next(req).pipe(finalize(hideSpinner));
  }

  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
      'X-Client-Time': new Date().toISOString(),
    },
  });

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      const isOtpError = error.error?.requiresOtp;

      if (error.status === 401 && !req.url.includes('/auth/refresh') && !isOtpError) {
        if (auth.isRefreshEnabled()) {
          return auth.refreshToken().pipe(
            switchMap((res) => {
              if (res.token) {
                const newAuthReq = req.clone({
                  setHeaders: { Authorization: `Bearer ${res.token}` },
                });
                return next(newAuthReq);
              }
              auth.logout();
              return throwError(() => error);
            }),
            catchError((refreshError) => {
              auth.logout();
              return throwError(() => refreshError);
            })
          );
        }

        else {
          auth.logout();
        }
      }

      return throwError(() => error);
    }),
    finalize(hideSpinner)
  );
};
