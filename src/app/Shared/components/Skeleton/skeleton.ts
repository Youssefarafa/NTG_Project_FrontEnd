import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  imports: [SkeletonModule],
  templateUrl: './skeleton.html',
  styleUrl: './skeleton.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Skeleton {
}
