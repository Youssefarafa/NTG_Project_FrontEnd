import { Auth } from './../../../Core/services/auth';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

// PrimeNG Components
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { PasswordModule } from 'primeng/password';
import { DividerModule } from 'primeng/divider';
import { CardModule } from 'primeng/card';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { CheckboxModule } from 'primeng/checkbox';
import { LoginData } from '../../../Core/models/AuthData';

@Component({
  selector: 'app-login',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    MessageModule,
    ToastModule,
    PasswordModule,
    DividerModule,
    CardModule,
    IconFieldModule,
    InputIconModule,
    CheckboxModule,
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
  providers: [MessageService],
})
export class Login {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);
  private readonly cdRef = inject(ChangeDetectorRef);
  private readonly messageService = inject(MessageService);

  readonly isLoading = this.auth.isLoading;

  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email, Validators.maxLength(50)]),
    password: new FormControl('', [Validators.required]),
    rememberMe: new FormControl(false),
  });

  passwordVisible = false;
  isSubmitted = false;

  get f() {
    return this.loginForm.controls;
  }

  showFieldError(fieldName: string): boolean {
    const control = this.loginForm.get(fieldName);
    return !!control && control.invalid && (control.touched || this.isSubmitted);
  }

  getFirstErrorMessage(fieldName: string): string {
    const control = this.loginForm.get(fieldName);
    if (!control?.errors) return '';
    if (control.errors['required']) return 'This field is required';
    if (control.errors['email']) return 'Please enter a valid email address';
    return 'Invalid field';
  }

  onFieldBlur(fieldName: string) {
    this.loginForm.get(fieldName)?.markAsTouched();
    this.cdRef.markForCheck();
  }

  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
    this.cdRef.markForCheck();
  }

  onSubmit() {
    this.isSubmitted = true;
    if (this.loginForm.invalid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Please check your inputs',
      });
      return;
    }

    const loginData: LoginData = {
      email: this.f.email.value!,
      password: this.f.password.value!,
      rememberMe: this.f.rememberMe.value || false,
    };

    this.auth.login(loginData).subscribe({
      next: (res) => {
        if (res.requiresOtp) {
          this.messageService.add({
            severity: 'info',
            summary: 'Verification',
            detail: 'OTP required',
          });
          this.router.navigate(['/confirm-email']);
        }
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Login Failed',
          detail: err?.message || 'Invalid email or password',
        });
        this.cdRef.markForCheck();
      },
    });
  }

  navigateToRegister() {
    this.router.navigate(['/register']);
  }
}
