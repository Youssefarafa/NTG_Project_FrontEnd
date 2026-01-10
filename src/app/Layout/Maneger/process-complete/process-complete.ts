import {
  Component,
  OnInit,
  inject,
  signal,
  computed,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  DestroyRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Process } from '../../../Core/services/Process';
import { FullProcessResponse, ProcessCandidateDetails } from '../../../Core/models/ProcessData';
import { MessageService } from 'primeng/api';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-process-complete',
  standalone: true,
  imports: [
    CommonModule,
    TagModule,
    ButtonModule,
    ProgressSpinnerModule,
    ToastModule,
    RouterModule,
    DialogModule,
    InputTextModule,
  ],
  providers: [MessageService],
  templateUrl: './process-complete.html',
  styleUrl: './process-complete.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProcessComplete implements OnInit {
  searchTerm = signal('');
  private processService = inject(Process);
  private messageService = inject(MessageService);
  private route = inject(ActivatedRoute);
  private readonly cdRef = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);

  processData = signal<FullProcessResponse['data'] | null>(null);
  isLoading = signal(false);

  displayModal = signal(false);
  selectedCandidate = signal<ProcessCandidateDetails | null>(null);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.loadProcessDetails(id);
  }

  loadProcessDetails(id: string) {
    this.isLoading.set(true);
    this.processService
      .getFullProcessDetails(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.processData.set(res.data);
          } else {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: res.message });
          }
          this.isLoading.set(false);
          this.cdRef.markForCheck();
        },
        error: () => {
          this.isLoading.set(false);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Server Connection Failed',
          });
          this.cdRef.markForCheck();
        },
      });
  }

  getStatusSeverity(status: string): 'success' | 'danger' | 'warn' | 'info' | 'secondary' {
    const s = status.toLowerCase();
    if (s.includes('approved')) return 'success';
    if (s.includes('rejected')) return 'danger';
    if (s.includes('waiting')) return 'warn';
    if (s.includes('interview')) return 'info';
    return 'secondary';
  }

  countByStatus(candidates: ProcessCandidateDetails[], status: string): number {
    return candidates.filter((c) => c.status === status).length;
  }

  viewDetails(candidate: ProcessCandidateDetails) {
    this.selectedCandidate.set(candidate);
    this.displayModal.set(true);
  }

  openCV(url: string) {
    window.open(url, '_blank');
  }

  filteredCandidates = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const data = this.processData();
    if (!data) return [];
    if (!term) return data.candidates;

    return data.candidates.filter(
      (c) => c.fullName.toLowerCase().includes(term) || c.email.toLowerCase().includes(term)
    );
  });

  onSearchChange(event: any) {
    this.searchTerm.set(event.target.value);
  }
}
