import {
  Component,
  OnInit,
  signal,
  inject,
  ChangeDetectionStrategy,
  DestroyRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MessageService } from 'primeng/api';
import { Toast } from 'primeng/toast';
import { Button } from 'primeng/button';
import { Tag } from 'primeng/tag';
import { Jobs } from '../../../Core/services/Jobs';
import { Job } from '../../../Core/models/JobsData';

@Component({
  selector: 'app-available-jobs',
  standalone: true,
  imports: [CommonModule, Button, Tag, Toast],
  providers: [MessageService],
  templateUrl: './available-jobs.html',
  styleUrl: './available-jobs.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
}) 
export class AvailableJobs implements OnInit {
  private jobService = inject(Jobs);
  private messageService = inject(MessageService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  jobs = signal<Job[]>([]);
  appliedJobIds = signal<Set<string>>(new Set());
  mainLoading = signal<boolean>(false);
  actionLoading = signal<Record<string, boolean>>({});

  ngOnInit() {
    this.loadJobs();
  }

  loadJobs() {
    this.mainLoading.set(true);
    this.jobService
      .getJobs()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.jobs.set(data);
          const alreadyAppliedIds = data.filter((j) => j.isApplied).map((j) => j.id);
          this.appliedJobIds.set(new Set(alreadyAppliedIds));
        },
        error: () => this.showError('Could not load jobs'),
        complete: () => this.mainLoading.set(false),
      });
  }

  goToApplyForm(jobId: string, jobTitle: string) {
    console.log('Navigating to job:', jobTitle);
    this.router.navigate(['/candidate/myApplication', jobId], {
      queryParams: { title: jobTitle },
    });
  }

  withdraw(jobId: string) {
    if (this.actionLoading()[jobId]) return;

    this.toggleActionLoading(jobId, true);
    this.jobService
      .withdrawJob(jobId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.appliedJobIds.update((prev) => {
            const nextSet = new Set(prev);
            nextSet.delete(jobId);
            return nextSet;
          });
          this.messageService.add({
            severity: 'info',
            summary: 'Withdrawn',
            detail: 'Application removed.',
          });
        },
        error: () => this.showError('Failed to withdraw'),
        complete: () => this.toggleActionLoading(jobId, false),
      });
  }

  private toggleActionLoading(id: string, state: boolean) {
    this.actionLoading.update((prev) => ({ ...prev, [id]: state }));
  }

  private showError(msg: string) {
    this.messageService.add({ severity: 'error', summary: 'Error', detail: msg });
  }

  hasApplied = (id: string) => this.appliedJobIds().has(id);
  isLoading = (id: string) => !!this.actionLoading()[id];
}
