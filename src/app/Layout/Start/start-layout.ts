import { ChangeDetectionStrategy, Component, inject, Inject, OnInit, signal } from '@angular/core';
import { ChildrenOutletContexts, RouterOutlet } from '@angular/router';
import { NavBar } from '../../Shared/components/nav-bar/nav-bar';
import { NAVIGATION_TOKEN_START } from '../../Core/tokens/NavToken';
import { AppNavigation } from '../../Core/models/NavData';
import { slideInAnimation } from '../../Shared/animations/route-animations';

@Component({
  selector: 'app-start-layout',
  standalone: true,
  imports: [RouterOutlet, NavBar],
  animations: [slideInAnimation],
  templateUrl: './start-layout.html',
  styleUrl: './start-layout.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StartLayout implements OnInit {
private contexts = inject(ChildrenOutletContexts);
  public readonly navigation : AppNavigation = inject(NAVIGATION_TOKEN_START);
  readonly userName = signal<string | null>(null);

  ngOnInit(): void {
    this.loadUserName();
  }

  getRouteAnimationData() {
    return this.contexts.getContext('primary')?.route?.snapshot?.data?.['animation'];
  }

  private loadUserName(): void {
    this.userName.set(null);
  }
}
