import { Component, Inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavBar } from '../../Shared/components/nav-bar/nav-bar';
import { NAVIGATION_TOKEN_START } from '../../Core/tokens/NavToken';
import { AppNavigation } from '../../Core/models/NavData';

@Component({
  selector: 'app-start-layout',
  imports: [RouterOutlet, NavBar],
  templateUrl: './start-layout.html',
  styleUrl: './start-layout.css',
})
export class StartLayout implements OnInit {
  readonly userName = signal<string | null>(null);

  ngOnInit(): void {}
  constructor(@Inject(NAVIGATION_TOKEN_START) public readonly navigation: AppNavigation) {
    this.loadUserName();
  }

  private loadUserName(): void {
    this.userName.set(null);
  }
}

