import {
  Component,
  inject,
  signal,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import {
  FormBuilder,
  Validators,
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  ValidatorFn,
  ValidationErrors,
  AbstractControl,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Auth } from '../../../Core/services/auth';
import { MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageModule } from 'primeng/message';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';

@Component({
  selector: 'app-reset-password',
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
  providers: [MessageService],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css',
})
export class ResetPassword implements OnInit {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly cdRef = inject(ChangeDetectorRef);
  private readonly messageService = inject(MessageService);

  readonly isLoading = signal(false);
  readonly countdown = signal<number>(0);
  private timerInterval: any;

  passwordVisible = false;
  isSubmitted = false;

  resetForm = new FormGroup({
    email: new FormControl({ value: '', disabled: true }, [Validators.required, Validators.email]),
    code: new FormControl('', [Validators.required, Validators.minLength(4)]),
    newPassword: new FormControl('', [Validators.required, this.passwordStrengthValidator()]),
    confirmPassword: new FormControl('', [Validators.required, this.confirmPasswordValidator()]),
  });

  ngOnInit() {
    const emailFromUrl = this.route.snapshot.queryParamMap.get('email') || '';
    this.resetForm.patchValue({ email: emailFromUrl });
    this.startCountdown();
    this.resetForm.get('newPassword')?.valueChanges.subscribe(() => {
      this.resetForm.get('confirmPassword')?.updateValueAndValidity();
    });
  }

  // --- Logic Helpers ---

  private passwordStrengthValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const password = control.value;
      if (!password) return null;

      const hasUpper = /[A-Z]/.test(password);
      const hasLower = /[a-z]/.test(password);
      const hasNumber = /\d/.test(password);
      const hasSpecial = /[@$!%*?#&]/.test(password);
      const hasValidLength = password.length >= 8;

      if (!hasUpper || !hasLower || !hasNumber || !hasSpecial || !hasValidLength) {
        return { weakPassword: true };
      }
      return null;
    };
  }

  private confirmPasswordValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.parent) return null;
      const password = control.parent.get('newPassword')?.value;
      const confirmPassword = control.value;
      return password === confirmPassword ? null : { passwordMismatch: true };
    };
  }

  showFieldError(fieldName: string): boolean {
    const control = this.resetForm.get(fieldName);
    return !!control && control.invalid && (control.touched || this.isSubmitted);
  }

  getFirstErrorMessage(fieldName: string): string {
    const control = this.resetForm.get(fieldName);
    if (!control || !control.errors) return '';
    const errors = control.errors;

    if (errors['required']) return 'This field is required';
    if (errors['minlength']) return `Min ${errors['minlength'].requiredLength} digits`;
    if (errors['weakPassword']) return 'Weak password (needs Upper, Lower, Number & Symbol)';
    if (errors['passwordMismatch']) return 'Passwords do not match';
    return 'Invalid field';
  }

  // --- Actions ---

  startCountdown() {
    this.countdown.set(60);
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      this.countdown.update((v) => v - 1);
      if (this.countdown() <= 0) clearInterval(this.timerInterval);
      this.cdRef.markForCheck();
    }, 1000);
  }

  onResendCode() {
    if (this.countdown() > 0) return;
    const email = this.resetForm.getRawValue().email || '';

    this.auth.forgotPassword(email).subscribe({
      next: () => {
        this.messageService.add({ severity: 'info', summary: 'Resent', detail: 'New code sent!' });
        this.startCountdown();
      },
      error: (err) => this.messageService.add({ severity: 'error', detail: err.message }),
    });
  }

  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
    this.cdRef.markForCheck();
  }

  onSubmit() {
    this.isSubmitted = true;
    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      return;
    }
    const rawData = this.resetForm.getRawValue();
    const payload = {
      email: rawData.email!,
      code: rawData.code!,
      newPassword: rawData.newPassword!,
    };
    this.isLoading.set(true);
    this.auth.resetPassword(payload).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Password changed!',
        });
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', detail: err.message });
        this.isLoading.set(false);
        this.cdRef.markForCheck();
      },
    });
  }

  onBackToLogin() {
    this.router.navigate(['/login']);
  }

  ngOnDestroy() {
    if (this.timerInterval) clearInterval(this.timerInterval);
  }
}
