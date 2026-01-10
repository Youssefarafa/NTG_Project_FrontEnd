import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DarkLightTheme } from '../Core/services/DarkLightTheme';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [ButtonModule, CardModule],
  templateUrl: './not-found.html',
  styleUrl: './not-found.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFound {
  constructor(
    private location: Location,
    private router: Router,
    public _DarkLightTheme: DarkLightTheme
  ) {}

  goBack(): void {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      this.router.navigate(['/home']);
    }
  }
}
