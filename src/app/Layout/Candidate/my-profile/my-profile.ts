import { Component, signal, inject, OnInit, ChangeDetectorRef, effect } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';

// PrimeNG Imports
import { MessageService } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { DatePickerModule } from 'primeng/datepicker';
import { InputMaskModule } from 'primeng/inputmask';
import { InputNumberModule } from 'primeng/inputnumber';
import { Auth } from '../../../Core/services/auth';

@Component({
  selector: 'app-my-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputMaskModule,
    InputNumberModule,
    DatePickerModule,
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
  private authService = inject(Auth);
  private messageService = inject(MessageService);
  private cdRef = inject(ChangeDetectorRef);

  profileForm!: FormGroup;
  passwordForm!: FormGroup;

  isSubmittingProfile = signal(false);
  isSubmittingPassword = signal(false);
  isLoadingData = signal(false);

  ngOnInit() {
    this.initForms();
    this.loadInitialData();
  }

  constructor() {
    effect(() => {
      const u = this.authService.user();
      if (u) {
        this.profileForm.patchValue({
          ...u,
          birthDate: u.birthDate ? new Date(u.birthDate) : null,
        });
      }
    });
  }

  private initForms() {
    this.profileForm = this.fb.group({
      fullName: [{ value: '', disabled: true }, Validators.required],
      email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^01[0125][0-9]{8}$/)]],
      birthDate: [null, [Validators.required]],
      university: ['', Validators.required],
      faculty: ['', Validators.required],
      department: ['', Validators.required],
      graduationYear: [null, [Validators.required, Validators.min(1990), Validators.max(2026)]],
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
  }

  private loadInitialData() {
    const currentUser = this.authService.user();
    if (currentUser) {
      this.profileForm.patchValue({
        fullName: currentUser.fullName,
        email: currentUser.email,
        phone: currentUser.phone,
        birthDate: currentUser.birthDate ? new Date(currentUser.birthDate) : null,
        university: currentUser.university,
        faculty: currentUser.faculty,
        department: currentUser.department,
        graduationYear: currentUser.graduationYear,
      });
    }
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const newPass = control.get('newPassword')?.value;
    const confirmPass = control.get('confirmPassword')?.value;
    return newPass === confirmPass ? null : { passwordMismatch: true };
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.profileForm.get(fieldName);
    return !!(control && control.invalid && (control.touched || control.dirty));
  }

  shouldShowFieldError(fieldName: string): boolean {
    const control = this.passwordForm.get(fieldName);
    if (!control) return false;

    if (fieldName === 'confirmPassword') {
      return !!(
        control.touched &&
        (control.invalid || this.passwordForm.hasError('passwordMismatch'))
      );
    }

    return !!(control.invalid && (control.touched || control.hasError('serverError')));
  }

  getSharedInputClass(): string {
    return 'w-full px-4 py-3 border rounded-lg transition-colors duration-200 text-sm';
  }

  onFieldBlur(form: FormGroup, fieldName: string) {
    form.get(fieldName)?.markAsTouched();
    this.cdRef.markForCheck();
  }

  // --- Actions ---
  updateProfile() {
    if (this.profileForm.valid) {
      const rawData = this.profileForm.getRawValue();
      const payload = {
        ...rawData,
        birthDate:
          rawData.birthDate instanceof Date ? rawData.birthDate.toISOString() : rawData.birthDate,
      };
      this.isSubmittingProfile.set(true);
      this.authService.updateProfile(payload).subscribe({
        next: (res) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: res.message || 'Profile updated',
          });
          this.profileForm.markAsPristine();
          this.isSubmittingProfile.set(false);
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: err.message });
          this.isSubmittingProfile.set(false);
        },
      });
    }
  }

  changePassword() {
    if (this.passwordForm.valid) {
      this.isSubmittingPassword.set(true);
      const { currentPassword, newPassword } = this.passwordForm.value;
      this.authService.changePassword({ currentPassword, newPassword }).subscribe({
        next: (res) => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: res.message });
          this.passwordForm.reset();
          this.isSubmittingPassword.set(false);
        },
        error: (err) => {
          this.passwordForm.get('currentPassword')?.setErrors({ serverError: true });
          this.messageService.add({ severity: 'error', summary: 'Error', detail: err.message });
          this.isSubmittingPassword.set(false);
        },
      });
    }
  }
}
