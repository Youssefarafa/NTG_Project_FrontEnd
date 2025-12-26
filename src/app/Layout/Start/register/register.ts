import { Auth } from './../../../Core/services/auth';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

// PrimeNG Components
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { DividerModule } from 'primeng/divider';
import { CardModule } from 'primeng/card';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { RegisterData } from '../../../Core/models/AuthData';

@Component({
  selector: 'app-register',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    MessageModule,
    ToastModule,
    DividerModule,
    CardModule,
    IconFieldModule,
    InputIconModule,
  ],
  templateUrl: './register.html',
  styleUrl: './register.css',
  providers: [MessageService],
})
export class Register {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);
  private readonly cdRef = inject(ChangeDetectorRef);
  private readonly messageService = inject(MessageService);

  readonly isLoading = this.auth.isLoading;

  signupForm = new FormGroup({
    fullName: new FormControl('', [
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(30),
    ]),
    email: new FormControl('', [Validators.required, Validators.email, Validators.maxLength(50)]),
    password: new FormControl('', [Validators.required, this.passwordStrengthValidator()]),
    confirmPassword: new FormControl('', [Validators.required, this.confirmPasswordValidator()]),
  });

  passwordVisible = false;
  confirmPasswordVisible = false;
  isSubmitted = false;

  get f() {
    return this.signupForm.controls;
  }

  private passwordStrengthValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const password = control.value;
      if (!password) return null;
      const confirmControl = control.parent?.get('confirmPassword');
      if (confirmControl) confirmControl.updateValueAndValidity();

      const hasUpper = /[A-Z]/.test(password);
      const hasLower = /[a-z]/.test(password);
      const hasNumber = /\d/.test(password);
      const hasSpecial = /[@$!%*?#&]/.test(password);
      const hasValidLength = password.length >= 8 && password.length <= 15;

      let score = 0;
      if (hasValidLength) score++;
      if (hasUpper) score++;
      if (hasLower) score++;
      if (hasNumber) score++;
      if (hasSpecial) score++;

      return score < 5 ? { weakPassword: true, strengthScore: score } : null;
    };
  }

  private confirmPasswordValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.parent) return null;
      const password = control.parent.get('password')?.value;
      const confirmPassword = control.value;
      return password === confirmPassword ? null : { passwordMismatch: true };
    };
  }

  showFieldError(fieldName: string): boolean {
    const control = this.signupForm.get(fieldName);
    return !!control && control.invalid && (control.touched || this.isSubmitted);
  }

  getFirstErrorMessage(fieldName: string): string {
    const control = this.signupForm.get(fieldName);
    if (!control || !control.errors) return '';
    const errors = control.errors;
    if (errors['required']) return 'This field is required';
    if (errors['email']) return 'Invalid email address';
    if (errors['minlength']) return `Min ${errors['minlength'].requiredLength} chars`;
    if (errors['weakPassword']) return 'Password is too weak';
    if (errors['passwordMismatch']) return 'Passwords do not match';
    return 'Invalid field';
  }

  onFieldBlur(fieldName: string) {
    this.signupForm.get(fieldName)?.markAsTouched();
    this.cdRef.markForCheck();
  }

  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
    this.cdRef.markForCheck();
  }

  toggleConfirmPasswordVisibility() {
    this.confirmPasswordVisible = !this.confirmPasswordVisible;
    this.cdRef.markForCheck();
  }

  onSubmit() {
    this.isSubmitted = true;
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }

    const registerData: RegisterData = {
      fullName: this.f.fullName.value!,
      email: this.f.email.value!,
      password: this.f.password.value!,
    };

    this.auth.register(registerData).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Account created! Please verify your email.',
        });
        this.router.navigate(['/confirm-email']);
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Registration Failed',
          detail: err?.message || 'Email might already be registered',
          life: 5000,
        });
        this.cdRef.markForCheck();
      },
    });
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }
}
