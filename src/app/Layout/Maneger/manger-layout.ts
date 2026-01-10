import { ChangeDetectionStrategy, Component, inject, Inject, OnInit, signal } from '@angular/core';
import { ChildrenOutletContexts, RouterModule } from '@angular/router';
import { NAVIGATION_TOKEN_MANGER } from '../../Core/tokens/NavToken';
import { AppNavigation } from '../../Core/models/NavData';
import { NavBar } from '../../Shared/components/nav-bar/nav-bar';
import { slideInAnimation } from '../../Shared/animations/route-animations';
import { Auth } from '../../Core/services/auth';

@Component({
  selector: 'app-manger-layout',
  standalone: true,
  imports: [RouterModule, NavBar],
  animations: [slideInAnimation],
  templateUrl: './manger-layout.html',
  styleUrl: './manger-layout.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MangerLayout {
  // private readonly authService = inject(Auth);
  private readonly contexts = inject(ChildrenOutletContexts);
  // readonly userName = computed(() => this.authService.user()?.fullName || 'Manager');
  readonly userName = signal<string>('Mohammed Hassan');

  constructor(@Inject(NAVIGATION_TOKEN_MANGER) public readonly navigation: AppNavigation) {}

  getRouteAnimationData() {
    return this.contexts.getContext('primary')?.route?.snapshot?.data?.['animation'];
  }
}
