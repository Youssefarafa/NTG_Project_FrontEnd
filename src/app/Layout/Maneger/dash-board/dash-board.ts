import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HiringProcess } from '../../../Core/models/ProcessData';
import { DashboardService } from '../../../Core/services/Dashboard';

@Component({
  selector: 'app-dash-board',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dash-board.html',
  styleUrl: './dash-board.css',
})
export class DashBoard implements OnInit {
  private dashboardService = inject(DashboardService);
  private router = inject(Router);

  // Stats Signals
  totalJobs = signal(0);
  totalCandidates = signal(0);
  ongoingProcesses = signal(0);

  // Main Data Signal
  allProcesses = signal<HiringProcess[]>([]);

  // Search Term Signal
  completedSearchTerm = signal('');

  activeProcesses = computed(() => this.allProcesses().filter((p) => p.status === 'active'));

  filteredCompletedProcesses = computed(() => {
    const term = this.completedSearchTerm().toLowerCase();
    return this.allProcesses().filter(
      (p) =>
        p.status === 'completed' &&
        (p.jobTitle.toLowerCase().includes(term) ||
          p.candidates.some((c) => c.name.toLowerCase().includes(term)))
    );
  });

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.dashboardService.getDashboardStats().subscribe((stats) => {
      this.totalJobs.set(stats.totalJobs);
      this.totalCandidates.set(stats.totalCandidates);
      this.ongoingProcesses.set(stats.ongoingProcesses);
    });

    this.dashboardService.getAllHiringProcesses().subscribe((data) => {
      this.allProcesses.set(data);
    });
  }

  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.completedSearchTerm.set(value);
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
}
