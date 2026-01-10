import {
  Component,
  inject,
  signal,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  DestroyRef,
  OnDestroy,
} from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

// PrimeNG Imports
import { MessageService } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { CardModule } from 'primeng/card';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { MessageModule } from 'primeng/message';
import { DividerModule } from 'primeng/divider';

import { Auth } from '../../../Core/services/auth';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    ToastModule,
    CardModule,
    IconFieldModule,
    InputIconModule,
    MessageModule,
    DividerModule,
  ],
  providers: [MessageService],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForgotPassword implements OnDestroy {
  private fb = inject(FormBuilder);
  private authService = inject(Auth);
  private messageService = inject(MessageService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private cdRef = inject(ChangeDetectorRef);

  isLoading = signal(false);
  private navTimer: any;
  
  forgotForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  onSubmit() {
    if (this.forgotForm.invalid) {
      this.forgotForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    const email = this.forgotForm.value.email!;
    this.cdRef.markForCheck();

    this.authService.forgotPassword(email).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Check your email',
          detail: res.message || 'Reset link sent successfully!',
        });
        this.cdRef.markForCheck();

        this.navTimer = setTimeout(() => {
          this.router.navigate(['/verifyCode'], { queryParams: { email } });
        }, 1000);
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.message || 'Something went wrong',
        });
        this.isLoading.set(false);
        this.cdRef.markForCheck();
      },
    });
  }

  onBackToLogin(): void {
    this.router.navigate(['/login']);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.forgotForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  ngOnDestroy() {
    if (this.navTimer) clearTimeout(this.navTimer);
  }
}
