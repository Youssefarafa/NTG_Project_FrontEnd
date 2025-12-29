import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Services & Models
import { Candidates } from '../../../Core/services/Candidates';
import { Candidate } from '../../../Core/models/CandidateData';

// PrimeNG Modules
import { TableModule } from 'primeng/table';
import { DataViewModule } from 'primeng/dataview';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-view-users',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TableModule,
    DataViewModule,
    InputTextModule,
    ButtonModule,
    IconFieldModule,
    InputIconModule,
    ToastModule,
  ],
  providers: [MessageService],
  templateUrl: './view-users.html',
  styleUrl: './view-users.css',
})
export class ViewUsers implements OnInit {
  private candidatesService = inject(Candidates);
  private messageService = inject(MessageService);

  allCandidates = signal<Candidate[]>([]);

  searchName = signal<string>('');
  searchEmail = signal<string>('');

  filteredCandidates = computed(() => {
    const nameTerm = this.searchName().toLowerCase();
    const emailTerm = this.searchEmail().toLowerCase();

    return this.allCandidates().filter(
      (c) => c.name.toLowerCase().includes(nameTerm) && c.email.toLowerCase().includes(emailTerm)
    );
  });

  ngOnInit() {
    this.loadCandidates();
  }

  loadCandidates() {
    this.candidatesService.getCandidates().subscribe({
      next: (data) => this.allCandidates.set(data),
      error: () => this.showToast('error', 'Error', 'Failed to load candidates'),
    });
  }

  onNameSearch(event: Event) {
    this.searchName.set((event.target as HTMLInputElement).value);
  }

  onEmailSearch(event: Event) {
    this.searchEmail.set((event.target as HTMLInputElement).value);
  }

  private showToast(severity: string, summary: string, detail: string) {
    this.messageService.add({ severity, summary, detail });
  }
}
