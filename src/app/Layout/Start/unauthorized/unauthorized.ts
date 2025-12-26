import { Component, ElementRef, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';;
import { CardModule } from 'primeng/card';
import { DarkLightTheme } from '../../../Core/services/DarkLightTheme';

@Component({
  selector: 'app-unauthorized',
  imports: [ButtonModule, CardModule],
  templateUrl: './unauthorized.html',
  styleUrl: './unauthorized.css',
})
export class Unauthorized {
  constructor(
    private router: Router,
    private renderer: Renderer2,
    private el: ElementRef,
    private _DarkLightTheme: DarkLightTheme
  ) {}

  goHome() {
    this.router.navigate(['/home']);
  }

  logout() {
    this.router.navigate(['/login']);
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
