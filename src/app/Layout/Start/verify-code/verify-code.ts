import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { Auth } from '../../../Core/services/auth';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-verify-code',
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
  templateUrl: './verify-code.html',
  styleUrl: './verify-code.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VerifyCode implements OnInit, OnDestroy {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly messageService = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly cdRef = inject(ChangeDetectorRef);

  readonly isLoading = signal(false);
  readonly countdown = signal<number>(60);
  private timerInterval: any;
  email = signal('');
  isSubmitted = false;

  otpForm = new FormGroup({
    code: new FormControl('', [Validators.required, Validators.minLength(8)]),
  });

  ngOnInit() {
    const emailFromUrl = this.route.snapshot.queryParamMap.get('email') || '';
    if (!emailFromUrl) this.router.navigate(['/forgotPassword']);
    this.email.set(emailFromUrl);
    this.startCountdown();
  }

  startCountdown() {
    this.countdown.set(60);
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      this.countdown.update((v) => v - 1);
      if (this.countdown() <= 0) clearInterval(this.timerInterval);
    }, 1000);
  }

  onResendCode() {
    if (this.countdown() > 0) return;
    this.auth
      .forgotPassword(this.email())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.messageService.add({ severity: 'info', detail: 'New code sent!' });
          this.startCountdown();
          this.cdRef.markForCheck();
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', detail: err.message });
          this.cdRef.markForCheck();
        },
      });
  }

  onSubmit() {
    this.isSubmitted = true;
    if (this.otpForm.invalid) return;

    this.isLoading.set(true);
    const payload = { email: this.email(), code: this.otpForm.value.code! };

    this.auth.verifyCode(payload).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res) => {
        if (res.success) {
          this.router.navigate(['/resetPassword'], {
            queryParams: { email: payload.email, code: payload.code },
          });
        }
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', detail: err.message });
        this.isLoading.set(false);
        this.cdRef.markForCheck();
      },
    });
  }

  showFieldError(fieldName: string): boolean {
    const control = this.otpForm.get(fieldName);
    return !!control && control.invalid && (control.touched || this.isSubmitted);
  }

  getFirstErrorMessage(fieldName: string): string {
    const control = this.otpForm.get(fieldName);
    if (!control || !control.errors) return '';
    if (control.errors['required']) return 'Code is required';
    return 'Invalid code';
  }

  onBackToLogin(): void {
    this.router.navigate(['/login']);
  }

  ngOnDestroy() {
    if (this.timerInterval) clearInterval(this.timerInterval);
  }
}
