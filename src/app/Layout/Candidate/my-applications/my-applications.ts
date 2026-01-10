import {
  Component,
  OnInit,
  signal,
  inject,
  ChangeDetectionStrategy,
  DestroyRef,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { DividerModule } from 'primeng/divider';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { Jobs } from '../../../Core/services/Jobs';
import { AppliedJob, AppliedJobsResponse } from '../../../Core/models/MyApplicationData';
import { Router } from '@angular/router';

@Component({
  selector: 'app-my-applications',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    TagModule,
    ToastModule,
    TooltipModule,
    DividerModule,
    ConfirmDialogModule,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './my-applications.html',
  styleUrl: './my-applications.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyApplications implements OnInit {
  private jobService = inject(Jobs);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);
  private readonly cdRef = inject(ChangeDetectorRef);

  appliedJobs = signal<AppliedJob[]>([]);
  mainLoading = signal<boolean>(false);
  actionLoading = signal<Record<string, boolean>>({});

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.confirmationService.close(); 
    });
  }

  ngOnInit() {
    this.loadAppliedJobs();
  }

  loadAppliedJobs() {
    this.mainLoading.set(true);
    this.jobService
      .getAppliedJobs()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res: AppliedJobsResponse) => {
          if (res.success) {
            this.appliedJobs.set(res.data);
          }
          this.cdRef.markForCheck();
        },
        error: (err) => {
          this.showError(err.error?.message || 'Failed to load applied jobs');
          this.mainLoading.set(false);
          this.cdRef.markForCheck();
        },
        complete: () => {
          this.mainLoading.set(false);
          this.cdRef.markForCheck();
        },
      });
  }

  withdraw(jobId: string) {
    this.actionLoading.update((prev) => ({ ...prev, [jobId]: true }));
this.cdRef.markForCheck();
    this.jobService
      .withdrawJob(jobId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.appliedJobs.update((jobs) => jobs.filter((j) => j.id !== jobId));
          this.messageService.add({
            severity: 'info',
            summary: 'Withdrawn',
            detail: res.message || 'Your application has been removed.',
          });
          this.cdRef.markForCheck();
        },
        error: (err) => {this.showError(err.error?.message || 'Withdrawal failed');this.cdRef.markForCheck();},
        complete: () => {
          this.actionLoading.update((prev) => ({ ...prev, [jobId]: false }));
          this.cdRef.markForCheck();
        },
      });
  }

  confirmWithdraw(jobId: string, jobTitle: string) {
    this.confirmationService.confirm({
      message: `Are you sure you want to withdraw your application for "${jobTitle}"? This action cannot be undone.`,
      header: 'Withdrawal Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Yes, Withdraw',
      rejectLabel: 'Cancel',
      acceptButtonStyleClass: 'p-button-danger p-button-text',
      rejectButtonStyleClass: 'p-button-secondary p-button-text',
      accept: () => {
        this.withdraw(jobId);
      },
    });
  }

  getStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    switch (status) {
      case 'Technically Approved':
        return 'success';
      case 'New (ShortListed)':
      case 'Called for Exam':
      case 'Called for Interview':
        return 'info';
      case 'Finished Exam':
      case 'Interviewed':
        return 'secondary';
      case 'Technically Waiting List':
        return 'warn';
      case 'Technically Rejected':
        return 'danger';
      default:
        return 'secondary';
    }
  }

  viewCv(fileUrl: string) {
    if (fileUrl) {
      window.open(fileUrl, '_blank');
    }
  }

  private showError(msg: string) {
    this.messageService.add({ severity: 'error', summary: 'Error', detail: msg });
  }

  isLoading = (id: string) => !!this.actionLoading()[id];

  onBackToAvailableJobs(): void {
    this.router.navigate(['candidate/availableJobs']);
  }
}
