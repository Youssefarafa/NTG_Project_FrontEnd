import { Component, computed, inject, Inject, OnInit, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NAVIGATION_TOKEN_CANDIDATE } from '../../Core/tokens/NavToken';
import { AppNavigation } from '../../Core/models/NavData';
import { NavBar } from '../../Shared/components/nav-bar/nav-bar';
import { Auth } from '../../Core/services/auth';

@Component({
  selector: 'app-candidate-layout',
  imports: [RouterModule, NavBar],
  templateUrl: './candidate-layout.html',
  styleUrl: './candidate-layout.css',
})
export class CandidateLayout implements OnInit {
  readonly userName = signal<string | null>(null);
  private readonly authService = inject(Auth);
  ngOnInit(): void {}
  constructor(@Inject(NAVIGATION_TOKEN_CANDIDATE) public readonly navigation: AppNavigation) {
    this.loadUserName();
  }

  private loadUserName(): void {
    let candidateName = computed(() => this.authService.user()?.fullName || 'Guest');
    this.userName.set(candidateName());
  }
}
