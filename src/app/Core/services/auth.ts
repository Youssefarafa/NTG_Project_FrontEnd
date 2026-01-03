import { Injectable, inject, signal, computed, PLATFORM_ID, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError, BehaviorSubject, of, timer } from 'rxjs';
import { catchError, switchMap, tap, filter, take, finalize, retry } from 'rxjs/operators';
import * as CryptoJS from 'crypto-js';
import { environment } from '../../Shared/environment';
import { HttpContext } from '@angular/common/http';
import {
  AuthState,
  LoginData,
  LoginResponse,
  OtpResponse,
  RefreshResponse,
  RegisterData,
  RegisterResponse,
  User,
  VerifyOtpData,
} from '../models/AuthData';
import { SKIP_SPINNER } from '../interceptors/AuthInterceptor';

/* ===================== Auth Service ===================== */
@Injectable({ providedIn: 'root' })
export class Auth {
  readonly isOtpEnabled = signal<boolean>(false);
  readonly isRememberMeEnabled = signal<boolean>(false);
  readonly isRefreshEnabled = signal<boolean>(false);
  readonly isForgetPasswordEnabled = signal<boolean>(false);

  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);

  private readonly API_URL = environment.apiUrl;
  private readonly TOKEN_SECRET = environment.tokenSecret;
  private readonly TOKEN_REFRESH_INTERVAL = 15 * 60 * 1000;
  private readonly STORAGE_KEYS = {
    token: 'auth_token',
    user: 'current_user',
    tokenExpiry: 'token_expiry',
    rememberMe: 'remember_me',
  } as const; // Signals State

  private _user = signal<User | null>(null);
  private _isRefreshing = signal<boolean>(false);
  private _isAuthenticating = signal<boolean>(false);
  private _requiresOtp = signal<boolean>(false);
  private _otpEmail = signal<string>('');

  private refreshTokenSubject = new BehaviorSubject<string | null>(null);

  readonly user = computed(() => this._user());
  readonly role = computed(() => this._user()?.role ?? null);
  readonly isAuthenticated = computed(() => !!this.token && !this.isTokenExpired());
  readonly isLoading = computed(() => this._isRefreshing() || this._isAuthenticating());
  readonly requiresOtp = computed(() => this._requiresOtp());
  readonly otpEmail = computed(() => this._otpEmail());
  readonly authState = computed<AuthState>(() => ({
    user: this.user(),
    isAuthenticated: this.isAuthenticated(),
    isLoading: this.isLoading(),
    requiresOtp: this.requiresOtp(),
    otpEmail: this.otpEmail(),
  }));

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.initializeAuth();
    }
  } /* ===================== Initialization ===================== */

  private initializeAuth(): void {
    this.syncFromStorage(); // Auto-token refresh
    this.startAutoRefresh(); // Storage event listener
    window.addEventListener('storage', (e) => this.handleStorageEvent(e)); // Auto-logout on token expiry
    if (this.token && this.isTokenExpired()) {
      this.logout();
    }
  }

  private startAutoRefresh(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    timer(0, this.TOKEN_REFRESH_INTERVAL)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        if (this.isRefreshEnabled() && this.isAuthenticated() && !this._isRefreshing()) {
          if (this.getTokenTimeLeft() < 5 * 60 * 1000) {
            this.refreshToken()
              .pipe(catchError(() => of(null)))
              .subscribe();
          }
        }
      });
  }

  private getTokenTimeLeft(): number {
    if (!isPlatformBrowser(this.platformId)) return 0;
    const expiry = localStorage.getItem(this.STORAGE_KEYS.tokenExpiry);
    if (!expiry) return 0;
    return parseInt(expiry, 10) - new Date().getTime();
  }

  private isTokenExpired(): boolean {
    return this.getTokenTimeLeft() <= 0;
  } /* ===================== Auth Methods ===================== */

  register(data: RegisterData): Observable<RegisterResponse> {
    this._isAuthenticating.set(true);

    return this.http.post<RegisterResponse>(`${this.API_URL}/api/auth/register`, data).pipe(
      tap((res) => {
        if (res?.success) {
          if (!!res?.requiresOtp && this.isOtpEnabled()) {
            this._requiresOtp.set(true);
            this._otpEmail.set(data.email);
          } else {
            this.router.navigate(['/login']);
          }
        }
      }),
      catchError((e) => this.handleHttpError(e)),
      finalize(() => this._isAuthenticating.set(false))
    );
  }

  login(data: LoginData): Observable<LoginResponse> {
    this._isAuthenticating.set(true);
    const shouldRemember = this.isRememberMeEnabled() && !!data.rememberMe;
    const { rememberMe, ...payload } = data;
    if (shouldRemember) {
      localStorage.setItem(this.STORAGE_KEYS.rememberMe, 'true');
    } else {
      localStorage.removeItem(this.STORAGE_KEYS.rememberMe);
    }
    return this.http.post<LoginResponse>(`${this.API_URL}/api/auth/login`, payload).pipe(
      tap((res) => {
        if (res?.success) {
          if (!!res.requiresOtp && this.isOtpEnabled()) {
            this._requiresOtp.set(true);
            this._otpEmail.set(data.email);
          } else if (res.token && res.user) {
            const expiresIn = shouldRemember ? 30 * 24 * 3600 : 3600;
            this.handleAuthSuccess(res, expiresIn);
          }
        }
      }),
      catchError((e) => this.handleHttpError(e)),
      finalize(() => this._isAuthenticating.set(false))
    );
  } /* ===================== Forget Password Logic ===================== */

  forgotPassword(email: string): Observable<{ success: boolean; message: string }> {
    this._isAuthenticating.set(true);
    return this.http
      .post<{ success: boolean; message: string }>(`${this.API_URL}/api/auth/forgot-password`, {
        email,
      })
      .pipe(
        catchError((e) => this.handleHttpError(e)),
        finalize(() => this._isAuthenticating.set(false))
      );
  }

  resetPassword(data: {
    email: string;
    code: string;
    newPassword: string;
  }): Observable<{ success: boolean; message: string }> {
    this._isAuthenticating.set(true);
    return this.http
      .post<{ success: boolean; message: string }>(`${this.API_URL}/api/auth/reset-password`, data)
      .pipe(
        catchError((e) => this.handleHttpError(e)),
        finalize(() => this._isAuthenticating.set(false))
      );
  }

  /* ===================== OTP Methods ===================== */

  verifyOtp(data: VerifyOtpData): Observable<OtpResponse> {
    this._isAuthenticating.set(true);
    return this.http.post<OtpResponse>(`${this.API_URL}/api/auth/verify-otp`, data).pipe(
      tap((res) => {
        if (res.success && res.token && res.user) {
          this._requiresOtp.set(false);
          this.handleAuthSuccess(res);
        }
      }),
      catchError((e) => this.handleHttpError(e)),
      finalize(() => this._isAuthenticating.set(false))
    );
  }

  resendOtp(email: string): Observable<{ success: boolean; message: string }> {
    return this.http
      .post<{ success: boolean; message: string }>(
        `${this.API_URL}/api/auth/resend-otp`,
        { email },
        {
          context: new HttpContext().set(SKIP_SPINNER, true),
        }
      )
      .pipe(
        retry({ count: 2, delay: 2000 }),
        catchError((e) => this.handleHttpError(e))
      );
  }

  cancelOtp(): void {
    this._requiresOtp.set(false);
    this._otpEmail.set('');
  }
  /* ===================== Storage & Helpers ===================== */

  private handleAuthSuccess(
    res: RegisterResponse | LoginResponse | OtpResponse,
    expiresIn?: number
  ): void {
    if (res?.success && res.token && res.user) {
      let finalExpiresIn = expiresIn;

      if (!finalExpiresIn) {
        const isRemembered =
          isPlatformBrowser(this.platformId) &&
          localStorage.getItem(this.STORAGE_KEYS.rememberMe) === 'true';

        finalExpiresIn = this.isRememberMeEnabled() && isRemembered ? 30 * 24 * 3600 : 3600;
      }

      this.storeAuthData(res.token, res.user, finalExpiresIn);
      this._user.set(res.user);
      this._requiresOtp.set(false);
      this.redirectAfterLogin(res.user);
    }
  }

  private storeAuthData(token: string, user: User, expiresIn: number): void {
    if (!isPlatformBrowser(this.platformId)) return;

    localStorage.setItem(this.STORAGE_KEYS.token, this.encrypt(token));
    localStorage.setItem(this.STORAGE_KEYS.user, JSON.stringify(user));

    const expiryTime = new Date().getTime() + expiresIn * 1000;
    localStorage.setItem(this.STORAGE_KEYS.tokenExpiry, expiryTime.toString());
  }

  private redirectAfterLogin(user: User): void {
    const returnUrl = this.router.routerState.snapshot.root.queryParams['returnUrl'];
    if (returnUrl) {
      this.router.navigateByUrl(returnUrl);
    } else {
      switch (user.role) {
        case 'Manager':
          this.router.navigate(['/manager/dashboard']);
          break;
        case 'Candidate':
          this.router.navigate(['/candidate/availableJobs']);
          break;
        default:
          this.router.navigate(['/dashboard']);
      }
    }
  }

  private encrypt(text: string): string {
    return CryptoJS.AES.encrypt(text, this.TOKEN_SECRET).toString();
  }

  private decrypt(encryptedText: string): string | null {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedText, this.TOKEN_SECRET);
      return bytes.toString(CryptoJS.enc.Utf8) || null;
    } catch {
      console.warn('Failed to decrypt token');
      return null;
    }
  }

  get token(): string | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    const encrypted = localStorage.getItem(this.STORAGE_KEYS.token);
    return encrypted ? this.decrypt(encrypted) : null;
  }

  syncFromStorage(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const rawUser = localStorage.getItem(this.STORAGE_KEYS.user);
    const user = rawUser ? JSON.parse(rawUser) : null;
    const isValid = !!this.token && !this.isTokenExpired();
    this._user.set(isValid ? user : null);
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      const isRemembered = localStorage.getItem(this.STORAGE_KEYS.rememberMe) === 'true';
      const keepRememberKey = this.isRememberMeEnabled() && isRemembered;

      Object.values(this.STORAGE_KEYS).forEach((key) => {
        if (key === this.STORAGE_KEYS.rememberMe && keepRememberKey) {
          return;
        }
        localStorage.removeItem(key);
      });
    }

    this._user.set(null);
    this._requiresOtp.set(false);
    this._otpEmail.set('');
    this.router.navigate(['/login']);
  } /* ===================== Refresh Logic ===================== */

  refreshToken(): Observable<RefreshResponse> {
    if (!this.isRefreshEnabled()) {
      return of({ success: false, token: '' } as RefreshResponse);
    }

    if (this._isRefreshing()) {
      return this.refreshTokenSubject.pipe(
        filter((t) => t !== null),
        take(1),
        switchMap((t) => of({ success: true, token: t! }))
      );
    }

    this._isRefreshing.set(true);
    this.refreshTokenSubject.next(null);

    return this.http
      .post<RefreshResponse>(
        `${this.API_URL}/api/auth/refresh`,
        {},
        {
          context: new HttpContext().set(SKIP_SPINNER, true),
        }
      )
      .pipe(
        tap((res) => {
          this._isRefreshing.set(false);
          if (res?.success && res.token) {
            const isRemembered =
              isPlatformBrowser(this.platformId) &&
              localStorage.getItem(this.STORAGE_KEYS.rememberMe) === 'true';
            const shouldKeepLongSession = this.isRememberMeEnabled() && isRemembered;

            const finalExpiresIn = shouldKeepLongSession ? res.expiresIn || 30 * 24 * 3600 : 3600;

            this.storeAuthData(res.token, res.user || this.user()!, finalExpiresIn);
            this.refreshTokenSubject.next(res.token);
          }
        }),
        catchError((err) => {
          this._isRefreshing.set(false);
          this.logout();
          return throwError(() => err);
        })
      );
  }

  /* ===================== Profile Management ===================== */

  updateProfile(data: Partial<User>): Observable<any> {
    return this.http.patch<any>(`${this.API_URL}/api/auth/profile`, data).pipe(
      tap((res) => {
        if (res.success) {
          const currentUser = this.user();
          if (currentUser) {
            const updatedUser = { ...currentUser, ...data };
            this.storeUser(updatedUser as User);
            this._user.set(updatedUser as User);
          }
        }
      }),
      catchError((e) => this.handleHttpError(e))
    );
  }

  changePassword(data: {
    currentPassword: string;
    newPassword: string;
  }): Observable<{ success: boolean; message: string }> {
    return this.http
      .post<{ success: boolean; message: string }>(`${this.API_URL}/api/auth/change-password`, data)
      .pipe(catchError((e) => this.handleHttpError(e)));
  }

  private storeUser(user: User): void {
    if (!isPlatformBrowser(this.platformId)) return;
    localStorage.setItem(this.STORAGE_KEYS.user, JSON.stringify(user));
  } /* ===================== Error Handling ===================== */

  private handleHttpError(error: HttpErrorResponse) {
    let message = error.error?.message || 'An unexpected error occurred.';
    switch (error.status) {
      case 0:
        message = 'Unable to connect to the server. Please check your internet connection.';
        break;
      case 401:
        if (error.error?.requiresOtp && this.isOtpEnabled()) {
          this._requiresOtp.set(true);
          message = 'Please enter the verification code to continue.';
        } else {
          message = 'Your session has expired. Please log in again.';
        }
        break;

      case 403:
        message = 'You do not have permission to perform this action.';
        break;

      case 422:
        message = 'Invalid data provided. Please review your input and try again.';
        break;

      case 429:
        message = 'Too many attempts. Please wait a moment and try again.';
        break;
    }

    return throwError(() => ({
      status: error.status,
      message,
      errors: error.error?.errors ?? null,
      requiresOtp: error.error?.requiresOtp,
    }));
  }

  private handleStorageEvent(event: StorageEvent) {
    if (Object.values(this.STORAGE_KEYS).includes(event.key as any)) {
      this.syncFromStorage();
      if (!this.isAuthenticated()) {
        this.router.navigate(['/login']);
      }
    }
  }
}
