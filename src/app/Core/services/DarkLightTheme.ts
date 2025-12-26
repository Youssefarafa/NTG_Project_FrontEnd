import { Injectable, Inject, effect, signal, Renderer2, RendererFactory2 } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class DarkLightTheme {
  private getInitialTheme(): boolean {
    const savedTheme = localStorage.getItem('user-theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  isDark = signal<boolean>(this.getInitialTheme());
  private renderer: Renderer2;

  constructor(rendererFactory: RendererFactory2, @Inject(DOCUMENT) private document: Document) {
    this.renderer = rendererFactory.createRenderer(null, null);

    effect(() => {
      const htmlElement = this.document.documentElement;
      const currentStatus = this.isDark();

      if (currentStatus) {
        this.renderer.addClass(htmlElement, 'app-dark');
        localStorage.setItem('user-theme', 'dark');
      } else {
        this.renderer.removeClass(htmlElement, 'app-dark');
        localStorage.setItem('user-theme', 'light');
      }
    });

    this.listenToSystemChanges();
  }

  private listenToSystemChanges() {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem('user-theme')) {
        this.isDark.set(e.matches);
      }
    });
  }

  toggle() {
    this.isDark.update((v) => !v);
  }
}
