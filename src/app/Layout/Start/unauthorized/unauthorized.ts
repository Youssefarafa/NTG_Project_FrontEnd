import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DarkLightTheme } from '../../../Core/services/DarkLightTheme';
import { Auth } from '../../../Core/services/auth';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [ButtonModule, CardModule],
  templateUrl: './unauthorized.html',
  styleUrl: './unauthorized.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Unauthorized {
  private readonly auth = inject(Auth);
  constructor(private router: Router, public _DarkLightTheme: DarkLightTheme) {}

  goHome() {
    this.auth.logout();
    this.router.navigate(['/home']);
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
