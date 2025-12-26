import { Component, Inject, OnInit, signal } from '@angular/core';
import { RouterModule } from "@angular/router";
import { NAVIGATION_TOKEN_MANGER } from '../../Core/tokens/NavToken';
import { AppNavigation } from '../../Core/models/NavData';
import { NavBar } from '../../Shared/components/nav-bar/nav-bar';

@Component({
  selector: 'app-manger-layout',
  imports: [RouterModule, NavBar],
  templateUrl: './manger-layout.html',
  styleUrl: './manger-layout.css',
})
export class MangerLayout implements OnInit {
  readonly userName = signal<string | null>(null);

  ngOnInit(): void {}
  constructor(@Inject(NAVIGATION_TOKEN_MANGER) public readonly navigation: AppNavigation) {
    this.loadUserName();
  }

  private loadUserName(): void {
    this.userName.set('Mohammed Hassan');
  }
}
