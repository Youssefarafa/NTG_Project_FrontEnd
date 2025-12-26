import { Component, ElementRef, Renderer2 } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DarkLightTheme } from '../Core/services/DarkLightTheme';

@Component({
  selector: 'app-not-found',
  imports: [ButtonModule, CardModule],
  templateUrl: './not-found.html',
  styleUrl: './not-found.css',
})
export class NotFound {
  constructor(
    private location: Location,
    private router: Router,
    private renderer: Renderer2,
    private el: ElementRef,
    private _DarkLightTheme: DarkLightTheme
  ) {}

  goBack(): void {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      this.router.navigate(['/home']);
    }
  }

  ngOnInit() {
    this.detectAndApplyTheme();
  }

  detectAndApplyTheme() {
    const container = this.el.nativeElement.querySelector('.theme-container');

    if (this._DarkLightTheme.isDark()) {
      this.renderer.addClass(container, 'app-dark');
    } else {
      this.renderer.removeClass(container, 'app-dark');
    }

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (e.matches) {
        this.renderer.addClass(container, 'app-dark');
      } else {
        this.renderer.removeClass(container, 'app-dark');
      }
    });
  }
}
