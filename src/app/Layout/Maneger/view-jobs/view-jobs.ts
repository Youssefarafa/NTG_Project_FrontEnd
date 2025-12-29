import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Jobs } from '../../../Core/services/Jobs';
import { Job } from '../../../Core/models/JobsData';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { TableModule } from 'primeng/table';
import { DataViewModule } from 'primeng/dataview';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-view-jobs',
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
})
export class ViewJobs implements OnInit {
  private jobsService = inject(Jobs);
  private messageService = inject(MessageService);

  jobs = signal<Job[]>([]);

  ngOnInit() {
    this.loadJobs();
  }

  loadJobs() {
    this.jobsService.getJobs().subscribe({
      next: (data) => this.jobs.set(data),
      error: () => this.showToast('error', 'Error', 'Failed to load jobs'),
    });
  }

  deleteJob(id: string, title: string) {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      this.jobsService.deleteJob(id).subscribe({
        next: () => {
          this.jobs.set(this.jobs().filter((j) => j.id !== id));
          this.showToast('success', 'Deleted', 'Job removed successfully');
        },
        error: () => this.showToast('error', 'Error', 'Failed to delete job'),
      });
    }
  }

  isExpired(job: Job): boolean {
    if (!job.expiresAt) return false;
    return new Date(job.expiresAt) < new Date();
  }

  private showToast(severity: string, summary: string, detail: string) {
    this.messageService.add({ severity, summary, detail });
  }
  
}
