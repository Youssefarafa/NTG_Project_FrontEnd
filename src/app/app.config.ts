import {
  ApplicationConfig,
  importProvidersFrom,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import Lara from '@primeng/themes/lara';
import { routes } from './app.routes';
import { CORE_PROVIDERS } from './Core/core.providers';
import { providePrimeNG } from 'primeng/config';
import { BrowserAnimationsModule, provideAnimations } from '@angular/platform-browser/animations';
import { NgxSpinnerModule } from 'ngx-spinner';
import { withPreloading, PreloadAllModules } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './Core/interceptors/AuthInterceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideRouter(routes, withPreloading(PreloadAllModules), withComponentInputBinding()),
    provideAnimations(),BrowserAnimationsModule,
    importProvidersFrom(NgxSpinnerModule.forRoot({ type: 'ball-clip-rotate-multiple' })),
    ...CORE_PROVIDERS,
    providePrimeNG({
      ripple: true,
      theme: {
        preset: Lara,
        options: {
          // prefix: 'NTG',
          darkModeSelector: '.app-dark',
        },
      },
    }),
  ],
};
