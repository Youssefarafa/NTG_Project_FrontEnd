import {
  Component,
  signal,
  HostListener,
  inject,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnDestroy,
  input,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToolbarModule } from 'primeng/toolbar';
import { DarkLightTheme } from '../../../Core/services/DarkLightTheme';
import { AppNavigation } from '../../../Core/models/NavData';
import { Auth } from '../../../Core/services/auth';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [RouterModule, CommonModule, ToolbarModule],
  templateUrl: './nav-bar.html',
  styleUrl: './nav-bar.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavBar implements OnDestroy {
  private readonly authService = inject(Auth);
  private readonly cdRef = inject(ChangeDetectorRef);
  userName = input<string | null>(null);
  navigation = input<AppNavigation | undefined>(undefined);
  readonly mobileMenu = signal(false);
  readonly openDropdown = signal<number | null>(null);
  private closeTimer?: any;
  private focusTimer?: any;

  ngOnDestroy(): void {
    this.clearTimer();
    if (this.focusTimer) clearTimeout(this.focusTimer);
  }

  constructor(public readonly DarkLightTheme: DarkLightTheme) {}

  // Mobile Menu
  toggleMobileMenu(): void {
    this.mobileMenu.update((v) => !v);
  }

  closeMobileMenu(): void {
    this.mobileMenu.set(false);
  }

  // Dropdowns
  toggleDropdown(index: number): void {
    this.openDropdown.update((current) => (current === index ? null : index));
  }

  openDropdownMenu(index: number): void {
    this.clearTimer();
    this.openDropdown.set(index);
  }

  closeDropdownMenu(): void {
    this.clearTimer();
    this.openDropdown.set(null);
  }

  // Mouse Events
  handleMouseEnter(index: number): void {
    this.openDropdownMenu(index);
  }

  handleMouseLeave(): void {
    this.startCloseTimer();
  }

  handleDropdownMouseEnter(): void {
    this.clearTimer();
  }

  handleDropdownMouseLeave(): void {
    this.startCloseTimer();
  }

  // Focus Events
  handleFocusIn(index: number): void {
    this.openDropdownMenu(index);
  }

  handleFocusOut(index: number): void {
    if (this.focusTimer) clearTimeout(this.focusTimer);
    this.focusTimer = setTimeout(() => {
      const focused = document.activeElement;
      const dropdown = document.querySelector(`#dropdown-${index}`);
      if (dropdown && !dropdown.contains(focused)) {
        this.closeDropdownMenu();
        this.cdRef.markForCheck();
      }
    }, 100);
  }

  // Keyboard Events
  handleKey(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.closeDropdownMenu();
      this.closeMobileMenu();
    }
  }

  // Timer Management
  private startCloseTimer(delay = 150): void {
    this.clearTimer();
    this.closeTimer = setTimeout(() => {
      this.closeDropdownMenu();
      this.cdRef.markForCheck();
    }, delay);
  }

  private clearTimer(): void {
    if (this.closeTimer) {
      clearTimeout(this.closeTimer);
      this.closeTimer = undefined;
    }
  }

  // Global Listeners
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    // Close dropdown if clicking outside
    if (!target.closest('.dropdown-container, .parent-button') && this.openDropdown() !== null) {
      this.closeDropdownMenu();
    }

    // Close mobile menu if clicking outside
    if (!target.closest('.hamburger-button, .mobile-menu') && this.mobileMenu()) {
      this.closeMobileMenu();
    }
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    this.closeDropdownMenu();
    this.closeMobileMenu();
  }

  // TrackBy for ngFor
  trackByLink(index: number, item: any): string | number {
    return item.link || item.label || index;
  }

  handleButtonLogin(button: any): void {
    this.closeMobileMenu();
    if (button.label === 'Logout') {
      this.authService.logout();
      this.cdRef.markForCheck();
    }
  }
}
