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
import { Job, JobsResponse } from '../../../Core/models/JobsData';

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
  
  jobs = signal<Partial<Job>[]>([]);
  appliedJobIds = signal<Set<string>>(new Set());
  mainLoading = signal<boolean>(false);
  actionLoading = signal<Record<string, boolean>>({});

  ngOnInit() {
    this.loadJobs();
  }

  loadJobs() {
    this.mainLoading.set(true);
    this.jobService
      .getJobsCandidate()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res: JobsResponse) => {
          if (res.success && res.data) {
            const jobsList = (res.data as Partial<Job>[]) || [];
            this.jobs.set(jobsList);

            const alreadyAppliedIds = jobsList
              .filter((j) => j.isApplied && j.id)
              .map((j) => j.id as string);

            this.appliedJobIds.set(new Set(alreadyAppliedIds));
          }
        },
        error: (err) => {
          this.mainLoading.set(false);
          const errorMsg = err.error?.message || 'Could not connect to server';
          this.showError(errorMsg);
        },
        complete: () => this.mainLoading.set(false),
      });
  }

  goToApplyForm(jobId: string, jobTitle: string) {
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
        next: (res: JobsResponse) => {
          if (res.success) {
            this.appliedJobIds.update((prev) => {
              const nextSet = new Set(prev);
              nextSet.delete(jobId);
              return nextSet;
            });

            this.messageService.add({
              severity: 'info',
              summary: 'Withdrawn',
              detail: res.message || 'Application removed successfully.',
            });
          }
        },
        error: (err) => {
          this.toggleActionLoading(jobId, false);
          const errorMsg = err.error?.message || 'Withdrawal failed';
          this.showError(errorMsg);
        },
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
