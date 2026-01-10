import {
  Component,
  inject,
  signal,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  DestroyRef,
} from '@angular/core';
import {
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
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    MessageModule,
    ToastModule,
    CardModule,
    IconFieldModule,
    InputIconModule,
  ],
  providers: [MessageService],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResetPassword implements OnInit, OnDestroy {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly cdRef = inject(ChangeDetectorRef);
  private readonly messageService = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);

  private navigationTimer?: any;
  readonly isLoading = signal(false);
  passwordVisible = false;
  isSubmitted = false;

  resetForm = new FormGroup({
    email: new FormControl({ value: '', disabled: true }),
    code: new FormControl({ value: '', disabled: true }),
    newPassword: new FormControl('', [Validators.required, this.passwordStrengthValidator()]),
    confirmPassword: new FormControl('', [Validators.required, this.confirmPasswordValidator()]),
  });

  ngOnInit() {
    const email = this.route.snapshot.queryParamMap.get('email');
    const code = this.route.snapshot.queryParamMap.get('code');

    if (!email || !code) {
      this.router.navigate(['/verifyCode']);
      return;
    }

    this.resetForm.patchValue({ email, code });

    this.resetForm
      .get('newPassword')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.resetForm.get('confirmPassword')?.updateValueAndValidity();
      });
  }

  // --- Validators ---
  private passwordStrengthValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const v = control.value;
      if (!v) return null;
      const isValid =
        /[A-Z]/.test(v) && /[a-z]/.test(v) && /\d/.test(v) && /[@$!%*?#&]/.test(v) && v.length >= 8;
      return isValid ? null : { weakPassword: true };
    };
  }

  private confirmPasswordValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.parent) return null;
      return control.value === control.parent.get('newPassword')?.value
        ? null
        : { passwordMismatch: true };
    };
  }

  showFieldError(fieldName: string): boolean {
    const control = this.resetForm.get(fieldName);
    return !!control && control.invalid && (control.touched || this.isSubmitted);
  }

  getFirstErrorMessage(fieldName: string): string {
    const errors = this.resetForm.get(fieldName)?.errors;
    if (!errors) return '';
    if (errors['required']) return 'This field is required';
    if (errors['weakPassword']) return 'Password too weak';
    if (errors['passwordMismatch']) return 'Passwords do not match';
    return 'Invalid field';
  }

  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
    this.cdRef.markForCheck();
  }

  onSubmit() {
    this.isSubmitted = true;
    if (this.resetForm.invalid) return;

    this.isLoading.set(true);
    const { email, code, newPassword } = this.resetForm.getRawValue();

    this.auth
      .resetPassword({ email: email!, code: code!, newPassword: newPassword! })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Password changed!',
          });
          this.navigationTimer = setTimeout(() => this.router.navigate(['/login']), 1000);
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
    if (this.navigationTimer) clearTimeout(this.navigationTimer);
  }
}
