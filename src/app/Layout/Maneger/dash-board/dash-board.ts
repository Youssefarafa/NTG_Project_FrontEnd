import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { DashboardService } from '../../../Core/services/Dashboard';
import { ProcessSummary, DashboardResponse } from '../../../Core/models/DashboardData';
import { Subject, debounceTime, distinctUntilChanged, switchMap, takeUntil, of } from 'rxjs';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { BadgeModule } from 'primeng/badge';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-dash-board',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ToastModule,
    ButtonModule,
    RippleModule,
    BadgeModule,
    InputTextModule,
  ],
  providers: [MessageService],
  templateUrl: './dash-board.html',
  styleUrl: './dash-board.css',
})
export class DashBoard implements OnInit, OnDestroy {
  private dashboardService = inject(DashboardService);
  private router = inject(Router);
  private messageService = inject(MessageService);

  // --- Signals ---
  totalJobs = signal(0);
  totalCandidates = signal(0);
  ongoingProcesses = signal(0);
  activeProcesses = signal<ProcessSummary[]>([]);
  allCompletedProcesses = signal<ProcessSummary[]>([]);
  filteredCompletedProcesses = signal<ProcessSummary[]>([]);

  isSearching = signal(false);
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  ngOnInit() {
    this.loadDashboard();
    this.setupSearchLogic();
  }

  loadDashboard() {
    this.dashboardService.getDashboardData().subscribe({
      next: (res: DashboardResponse) => {
        if (res.success && res.data) {
          const stats = res.data;
          this.totalJobs.set(stats.totalJobs);
          this.totalCandidates.set(stats.totalCandidates);
          this.ongoingProcesses.set(stats.ongoingProcessesCount);
          this.activeProcesses.set(stats.activePipelines);
          this.allCompletedProcesses.set(stats.recentHistory);
          this.filteredCompletedProcesses.set(stats.recentHistory);
        } else {
          this.showError('Dashboard Error', res.message || 'Data retrieval failed');
        }
      },
      error: (err) => {
        const backendMessage = err.error?.message || err.message || 'Internal Server Error';
        this.showError('Connection Error', backendMessage);
      },
    });
  }

  private setupSearchLogic() {
    this.searchSubject
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((query) => {
          if (!query.trim()) {
            this.filteredCompletedProcesses.set(this.allCompletedProcesses());
            this.isSearching.set(false);
            return of(null);
          }
          this.isSearching.set(true);
          return this.dashboardService.searchHistory(query);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (res) => {
          if (!res) return;

          if (res.success && res.data) {
            const results = Array.isArray(res.data)
              ? (res.data as any)
              : res.data.recentHistory || [];
            this.filteredCompletedProcesses.set(results);
          } else {
            this.filteredCompletedProcesses.set([]);
            if (res.message) this.showError('Search Results', res.message);
          }
          this.isSearching.set(false);
        },
        error: (err) => {
          this.isSearching.set(false);
          this.filteredCompletedProcesses.set([]);
          const searchErrorMessage = err.error?.message || 'Failed to fetch search results';
          this.showError('Search Error', searchErrorMessage);
        },
      });
  }

  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    if (value.trim()) {
      this.isSearching.set(true);
    } else {
      this.isSearching.set(false);
    }
    this.searchSubject.next(value);
  }

  private showError(summary: string, detail: string) {
    this.messageService.add({
      severity: 'error',
      summary: summary,
      detail: detail,
      life: 3000,
    });
  }

  scrollToActiveProcesses() {
    document.getElementById('active-processes-section')?.scrollIntoView({ behavior: 'smooth' });
  }

  navigateToProcessActive(id: string) {
    this.router.navigate(['/manager/processActive', id]);
  }
  navigateToProcessComplete(id: string) {
    this.router.navigate(['/manager/processComplete', id]);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.searchSubject.complete();
  }
}
