import { CommonModule } from '@angular/common';
import {
  Component,
  ViewChildren,
  QueryList,
  ElementRef,
  ViewChild,
  inject,
  ChangeDetectorRef,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { interval, Subscription } from 'rxjs';

// PrimeNG
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DividerModule } from 'primeng/divider';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Auth } from '../../../Core/services/auth';

@Component({
  selector: 'app-confirm-email',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    DividerModule,
    ToastModule,
  ],
  templateUrl: './confirm-email.html',
  styleUrl: './confirm-email.css',
  providers: [MessageService],
})
export class ConfirmEmail implements OnInit, OnDestroy {
  private readonly _AuthService = inject(Auth);
  private readonly _Router = inject(Router);
  private readonly _MessageService = inject(MessageService);
  private readonly cdRef = inject(ChangeDetectorRef);

  digits: string[] = Array(6).fill('');
  @ViewChildren('inputRef') inputRefs!: QueryList<ElementRef<HTMLInputElement>>;
  @ViewChild('submitButton', { static: false, read: ElementRef })
  submitButton!: ElementRef<HTMLButtonElement>;

  errsubmitmessage = '';

  // استخدام Signals من السيرفس مباشرة
  readonly isLoading = this._AuthService.isLoading;
  readonly emailToVerify = this._AuthService.otpEmail;

  countdown = 0;
  private timerSubscription!: Subscription;

  ngOnInit() {
    this.startCountdown();
    // حماية الصفحة: إذا لم يوجد إيميل في السيرفس، العودة للرئيسية
    if (!this.emailToVerify()) {
      this._Router.navigate(['/login']);
    }
  }

  ngOnDestroy() {
    this.timerSubscription?.unsubscribe();
  }

  get isOtpValid(): boolean {
    return this.digits.every((d) => d !== '');
  }

  get formattedCountdown(): string {
    const minutes = Math.floor(this.countdown / 60)
      .toString()
      .padStart(2, '0');
    const seconds = (this.countdown % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  }

  get canResend(): boolean {
    return this.countdown === 0;
  }

  startCountdown(): void {
    this.countdown = 300; // 5 دقائق
    this.timerSubscription?.unsubscribe();
    this.timerSubscription = interval(1000).subscribe(() => {
      if (this.countdown > 0) {
        this.countdown--;
        this.cdRef.markForCheck();
      } else {
        this.timerSubscription.unsubscribe();
      }
    });
  }

  // العودة وتصفير حالة الـ OTP في السيرفس
  goBackAndChangeEmail(): void {
    this._AuthService.cancelOtp();
    this._Router.navigate(['/register']);
  }

  resendCode(): void {
    if (!this.canResend) return;

    const email = this.emailToVerify();
    if (!email) return;

    this._AuthService.resendOtp(email).subscribe({
      next: (res) => {
        this._MessageService.add({
          severity: 'info',
          summary: 'Code Resent',
          detail: 'A new verification code has been sent to your email.',
        });
        this.digits = Array(6).fill('');
        this.startCountdown();
        this.errsubmitmessage = '';
      },
      error: (err) => {
        this.errsubmitmessage = err.message;
      },
    });
  }

  onSubmit(): void {
    if (!this.isOtpValid || this.isLoading()) return;

    const otp = this.digits.join('');
    const email = this.emailToVerify();

    this.errsubmitmessage = '';

    this._AuthService.verifyOtp({ email, otp, type: 'register' }).subscribe({
      next: (res) => {
        this._MessageService.add({
          severity: 'success',
          summary: 'Verified',
          detail: 'Your account has been successfully verified!',
        });
        // السيرفس بداخلها دالة handleAuthSuccess تقوم بالتوجيه حسب الـ Role
      },
      error: (err) => {
        this.errsubmitmessage = err.message;
        this.cdRef.markForCheck();
      },
    });
  }

  /* --- Logic لوحة المفاتيح --- */
  onPaste(event: ClipboardEvent) {
    event.preventDefault();
    const pasteData = event.clipboardData?.getData('text/plain').replace(/\D/g, '').slice(0, 6);
    if (!pasteData) return;

    for (let i = 0; i < 6; i++) this.digits[i] = pasteData[i] || '';

    if (this.isOtpValid) {
      this.submitButton.nativeElement.focus();
    } else {
      const firstEmpty = this.digits.findIndex((d) => d === '');
      this.inputRefs.get(firstEmpty)?.nativeElement.focus();
    }
  }

  trackByFn(index: number) {
    return index;
  }

  onKeyDown(event: KeyboardEvent, index: number): void {
    const allowedKeys = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight'];
    if (event.ctrlKey && event.key === 'v') return;
    if (!/\d/.test(event.key) && !allowedKeys.includes(event.key)) event.preventDefault();

    const input = event.target as HTMLInputElement;
    if (event.key === 'Backspace' && input.value === '') this.focusPrevious(index);
  }

  onInput(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/\D/g, '');
    this.digits[index] = value;

    if (value && index < 5) this.focusNext(index);
    else if (this.isOtpValid) this.submitButton.nativeElement.focus();
  }

  private focusPrevious(index: number) {
    if (index > 0) this.inputRefs.get(index - 1)?.nativeElement.focus();
  }

  private focusNext(index: number) {
    if (index < 5) this.inputRefs.get(index + 1)?.nativeElement.focus();
  }
}
