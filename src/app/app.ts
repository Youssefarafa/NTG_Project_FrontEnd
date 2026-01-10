import { AfterViewInit, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import {
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router,
  RouterOutlet,
} from '@angular/router';
import { NgxSpinnerModule } from 'ngx-spinner';
import { CommonModule } from '@angular/common';
import { Skeleton } from './Shared/components/Skeleton/skeleton';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NgxSpinnerModule, Skeleton, CommonModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
})
export class App implements OnInit, AfterViewInit {
  isPageLoading = false;
  private router = inject(Router);
  private cd = inject(ChangeDetectorRef);

  ngAfterViewInit() {
    this.cd.detectChanges();
  }

  ngOnInit() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        Promise.resolve().then(() => {
          this.isPageLoading = true;
          this.cd.markForCheck();
        });
      } else if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        setTimeout(() => {
          this.isPageLoading = false;
          this.cd.markForCheck();
        }, 400);
      }
    });
  }
}
