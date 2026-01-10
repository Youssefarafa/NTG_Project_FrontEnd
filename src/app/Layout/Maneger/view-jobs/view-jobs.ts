import {
  Component,
  inject,
  signal,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  DestroyRef,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Jobs } from '../../../Core/services/Jobs';
import { Job, JobsResponse } from '../../../Core/models/JobsData';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { TableModule } from 'primeng/table';
import { DataViewModule } from 'primeng/dataview';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-view-jobs',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ToastModule,
    TableModule,
    ButtonModule,
    TagModule,
    DataViewModule,
  ],
  providers: [MessageService, DatePipe],
  templateUrl: './view-jobs.html',
  styleUrl: './view-jobs.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewJobs implements OnInit {
  private jobsService = inject(Jobs);
  private messageService = inject(MessageService);
  private readonly cdRef = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  jobs = signal<Job[]>([]);

  ngOnInit() {
    this.loadJobs();
  }

  loadJobs() {
    this.jobsService
      .getJobsManager()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res: JobsResponse) => {
          if (res.success && res.data) {
            this.jobs.set(res.data as Job[]);
          }
          this.cdRef.markForCheck();
        },
        error: (err) => {
          const errorMsg = err.error?.message || 'Failed to load jobs';
          this.showToast('error', 'Error', errorMsg);
        },
      });
  }

  deleteJob(id: string, title: string) {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      this.jobsService
        .deleteJob(id)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (res: JobsResponse) => {
            if (res.success) {
              this.jobs.update((prev) => prev.filter((j) => j.id !== id));
              this.showToast('success', 'Deleted', res.message || 'Job removed successfully');
            }
            this.cdRef.markForCheck();
          },
          error: (err) => {
            const errorMsg = err.error?.message || 'Delete operation failed';
            this.showToast('error', 'Error', errorMsg);
          },
        });
    }
  }

  isExpired(job: Job): boolean {
    if (!job.expiresAt) return false;
    return new Date(job.expiresAt) < new Date();
  }

  private showToast(severity: string, summary: string, detail: string) {
    this.messageService.add({ severity, summary, detail });
    this.cdRef.markForCheck();
  }
}
