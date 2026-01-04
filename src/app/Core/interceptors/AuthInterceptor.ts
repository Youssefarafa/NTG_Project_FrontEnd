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
let activeRequestsCount = 0;

export const authInterceptor = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const auth = inject(Auth);
  const spinner = inject(NgxSpinnerService);
  const skipSpinner = req.context.get(SKIP_SPINNER);

  if (!skipSpinner) {
    activeRequestsCount++;
    spinner.show();
  }

  const hideSpinner = () => {
    if (!skipSpinner) {
      activeRequestsCount--;
      if (activeRequestsCount <= 0) {
        activeRequestsCount = 0;
        spinner.hide();
      }
    }
  };

  const publicPaths = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/forgot-password',
    '/api/auth/reset-password',
    '/api/auth/resend-otp',
  ];

  const isPublicPath = publicPaths.some((path) => req.url.includes(path));

  if (isPublicPath) {
    return next(req).pipe(finalize(hideSpinner));
  }

  const token = auth.token;

  if (!token && !req.url.includes('/api/auth/refresh')) {
    return next(req).pipe(finalize(hideSpinner));
  }

  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      const isOtpError = error.error?.requiresOtp;
      if (error.status === 401 && !req.url.includes('/api/auth/refresh') && !isOtpError) {
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
        } else {
          auth.logout();
        }
      }
      return throwError(() => error);
    }),
    finalize(hideSpinner)
  );
};
