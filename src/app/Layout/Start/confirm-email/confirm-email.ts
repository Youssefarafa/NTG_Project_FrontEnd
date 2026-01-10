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
  ChangeDetectionStrategy,
  DestroyRef,
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
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmEmail implements OnInit, OnDestroy {
  private readonly _destroyRef = inject(DestroyRef);
  private navigationTimer: any;
  private readonly _AuthService = inject(Auth);
  private readonly _Router = inject(Router);
  private readonly _MessageService = inject(MessageService);
  private readonly cdRef = inject(ChangeDetectorRef);

  digits: string[] = Array(6).fill('');
  @ViewChildren('inputRef') inputRefs!: QueryList<ElementRef<HTMLInputElement>>;
  @ViewChild('submitButton', { static: false, read: ElementRef })
  submitButton!: ElementRef<HTMLButtonElement>;

  errsubmitmessage = '';

  readonly isLoading = this._AuthService.isLoading;
  readonly emailToVerify = this._AuthService.otpEmail;

  countdown = 0;
  private timerSubscription!: Subscription;

  ngOnInit() {
    this.startCountdown();
    if (!this.emailToVerify()) {
      this._Router.navigate(['/login']);
    }
  }

  get isOtpValid(): boolean {
    return this.digits.every((d) => d !== '' && d !== null);
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
    this.countdown = 300;
    this.timerSubscription?.unsubscribe();
    this.timerSubscription = interval(1000)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(() => {
        if (this.countdown > 0) {
          this.countdown--;
          this.cdRef.markForCheck();
        } else {
          this.timerSubscription.unsubscribe();
        }
      });
  }

  goBackAndChangeEmail(): void {
    this._AuthService.cancelOtp();
    this._Router.navigate(['/register']);
  }

  resendCode(): void {
    if (!this.canResend) return;

    const email = this.emailToVerify();
    if (!email) return;

    this._AuthService
      .resendOtp(email)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: () => {
          this._MessageService.add({
            severity: 'info',
            summary: 'Code Resent',
            detail: 'A new verification code has been sent to your email.',
          });
          this.digits = Array(6).fill('');
          this.startCountdown();
          this.errsubmitmessage = '';
          this.cdRef.markForCheck();
        },
        error: (err) => {
          this.errsubmitmessage = err.message;
          this.cdRef.markForCheck();
        },
      });
  }

  onSubmit(): void {
    if (!this.isOtpValid || this.isLoading()) return;

    const otp = this.digits.join('');
    const email = this.emailToVerify();
    this.errsubmitmessage = '';

    this._AuthService
      .verifyOtp({ email, otp, type: 'register' })
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: () => {
          this._MessageService.add({
            severity: 'success',
            summary: 'Verified',
            detail: 'Your account has been successfully verified!',
          });
          this.cdRef.markForCheck();
          this.navigationTimer = setTimeout(() => this._Router.navigate(['/login']), 1000);
        },
        error: (err) => {
          this.errsubmitmessage = err.message;
          this.cdRef.markForCheck();
        },
      });
  }

  onInput(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/\D/g, '').slice(-1);

    this.digits[index] = value;

    if (value && index < 5) {
      setTimeout(() => this.focusNext(index), 0);
    } else if (this.isOtpValid) {
      setTimeout(() => this.submitButton.nativeElement.focus(), 0);
    }
  }

  onKeyDown(event: KeyboardEvent, index: number): void {
    if (event.key === 'Backspace') {
      if (this.digits[index] === '' && index > 0) {
        this.focusPrevious(index);
      } else {
        this.digits[index] = '';
      }
      event.preventDefault();
    } else if (event.key === 'ArrowLeft') {
      this.focusPrevious(index);
    } else if (event.key === 'ArrowRight') {
      this.focusNext(index);
    }
  }

  onPaste(event: ClipboardEvent) {
    event.preventDefault();
    const pasteData = event.clipboardData?.getData('text/plain').replace(/\D/g, '').slice(0, 6);
    if (!pasteData) return;

    const chars = pasteData.split('');
    chars.forEach((char, i) => {
      if (i < 6) this.digits[i] = char;
    });

    this.cdRef.markForCheck();

    if (this.isOtpValid) {
      setTimeout(() => this.submitButton.nativeElement.focus(), 0);
    } else {
      const firstEmpty = this.digits.findIndex((d) => d === '');
      setTimeout(() => this.inputRefs.get(firstEmpty)?.nativeElement.focus(), 0);
    }
  }

  private focusPrevious(index: number) {
    if (index > 0) this.inputRefs.get(index - 1)?.nativeElement.focus();
  }

  private focusNext(index: number) {
    if (index < 5) this.inputRefs.get(index + 1)?.nativeElement.focus();
  }

  ngOnDestroy() {
    this.timerSubscription?.unsubscribe();
    if (this.navigationTimer) clearTimeout(this.navigationTimer);
  }
}
