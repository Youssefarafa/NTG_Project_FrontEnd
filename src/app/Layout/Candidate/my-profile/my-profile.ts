import { Component, signal, inject, OnInit, DestroyRef } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Profile } from '../../../Core/services/Profile';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

// PrimeNG Imports
import { MessageService } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-my-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    ToastModule,
  ],
  providers: [MessageService],
  templateUrl: './my-profile.html',
  styleUrl: './my-profile.css',
})
export class MyProfile implements OnInit {
  private fb = inject(FormBuilder);
  private profileService = inject(Profile);
  private messageService = inject(MessageService);
  private destroyRef = inject(DestroyRef);

  profileForm!: FormGroup;
  passwordForm!: FormGroup;

  isSubmittingProfile = signal(false);
  isSubmittingPassword = signal(false);
  isLoadingData = signal(true);

  ngOnInit() {
    this.initForms();
    this.fetchUserProfile();
  }

  private initForms() {
    this.profileForm = this.fb.group({
      name: [
        '',
        [Validators.required, Validators.minLength(6), Validators.pattern(/^[a-zA-Z\s]*$/)],
      ],
      email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
    });

    this.passwordForm = this.fb.group(
      {
        currentPassword: ['', Validators.required],
        newPassword: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/),
          ],
        ],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.passwordMatchValidator }
    );

    this.passwordForm.get('currentPassword')?.valueChanges.subscribe(() => {
      if (this.passwordForm.get('currentPassword')?.hasError('serverError')) {
        this.passwordForm.get('currentPassword')?.setErrors(null);
      }
    });
  }

  private fetchUserProfile() {
    this.profileService
      .getProfile()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.profileForm.patchValue({
            name: data.name,
            email: data.email,
          });
          this.isLoadingData.set(false);
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Could not load profile data',
          });
          this.isLoadingData.set(false);
        },
      });
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const newPass = control.get('newPassword')?.value;
    const confirmPass = control.get('confirmPassword')?.value;
    return newPass === confirmPass ? null : { passwordMismatch: true };
  }

  isFieldInvalid(form: FormGroup, fieldName: string): boolean {
    const field = form.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  allPasswordFieldsFilled(): boolean {
    const { currentPassword, newPassword, confirmPassword } = this.passwordForm.value;
    return !!(currentPassword?.trim() && newPassword?.trim() && confirmPassword?.trim());
  }

  shouldShowFieldError(fieldName: string): boolean {
    const field = this.passwordForm.get(fieldName);
    if (field?.hasError('serverError')) return true;
    if (!this.allPasswordFieldsFilled()) return false;

    return !!(field && field.invalid && field.touched);
  }

  getInputStyleClass(fieldName: string): string {
    const baseClasses = '!w-full !px-4 !py-3 !border !rounded-lg !transition-colors !duration-200';

    if (this.shouldShowFieldError(fieldName)) {
      return `${baseClasses} !border-red-500 !bg-red-50 !text-red-900 focus:ring-red-500`;
    }

    return `${baseClasses} !border-teal-500 !bg-teal-50 !text-gray-900 focus:ring-teal-500`;
  }

  updateProfile() {
    if (this.profileForm.valid) {
      this.isSubmittingProfile.set(true);
      this.profileService.updateProfile(this.profileForm.getRawValue()).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Profile updated',
          });
          this.profileForm.markAsPristine();
          this.isSubmittingProfile.set(false);
        },
        error: () => this.isSubmittingProfile.set(false),
      });
    }
  }

  changePassword() {
    if (this.passwordForm.valid) {
      this.isSubmittingPassword.set(true);
      this.profileService
        .changePassword({
          currentPassword: this.passwordForm.value.currentPassword,
          newPassword: this.passwordForm.value.newPassword
        })
        .subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Password changed successfully',
            });
            this.passwordForm.reset();
            this.isSubmittingPassword.set(false);
          },
          error: (err) => {
            this.isSubmittingPassword.set(false);
            this.passwordForm.get('currentPassword')?.setErrors({ serverError: true });

            this.messageService.add({
              severity: 'error',
              summary: 'Authentication Error',
              detail: err.error?.message || 'The current password you entered is incorrect',
            });
          },
        });
    }
  }
}
