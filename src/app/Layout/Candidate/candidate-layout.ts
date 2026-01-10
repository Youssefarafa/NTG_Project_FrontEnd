import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  Inject,
  OnInit,
  signal,
} from '@angular/core';
import { ChildrenOutletContexts, RouterModule } from '@angular/router';
import { NAVIGATION_TOKEN_CANDIDATE } from '../../Core/tokens/NavToken';
import { AppNavigation } from '../../Core/models/NavData';
import { NavBar } from '../../Shared/components/nav-bar/nav-bar';
import { Auth } from '../../Core/services/auth';
import { slideInAnimation } from '../../Shared/animations/route-animations';

@Component({
  selector: 'app-candidate-layout',
  standalone: true,
  imports: [RouterModule, NavBar],
  animations: [slideInAnimation],
  templateUrl: './candidate-layout.html',
  styleUrl: './candidate-layout.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CandidateLayout {
  private readonly authService = inject(Auth);
  private contexts = inject(ChildrenOutletContexts);
  readonly userName = computed(() => this.authService.user()?.fullName || 'Guest');

  constructor(@Inject(NAVIGATION_TOKEN_CANDIDATE) public readonly navigation: AppNavigation) {}

  getRouteAnimationData() {
    return this.contexts.getContext('primary')?.route?.snapshot?.data?.['animation'];
  }
}
