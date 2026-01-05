import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { Process } from '../../../Core/services/Process';
import {
  ProcessCandidateDetails,
  CandidateStatus,
  FullProcessResponse,
} from '../../../Core/models/ProcessData';

// PrimeNG Imports
import { MessageService, ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'app-process-active',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    ButtonModule,
    DialogModule,
    SelectModule,
    InputTextModule,
    TextareaModule,
    TagModule,
    ToastModule,
    ConfirmDialogModule,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './process-active.html',
  styleUrl: './process-active.css',
})
export class ProcessActive implements OnInit {
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private processService = inject(Process);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  processData = signal<FullProcessResponse['data'] | null>(null);
  selectedCandidate = signal<ProcessCandidateDetails | null>(null);
  isModalOpen = signal(false);
  isLoading = signal(false); 

  evaluationForm!: FormGroup;

  candidateStatuses: CandidateStatus[] = [
    'New (ShortListed)',
    'Called for Exam',
    'Finished Exam',
    'Called for Interview',
    'Interviewed',
    'Technically Approved',
    'Technically Rejected',
    'Technically Waiting List',
  ];

  ngOnInit() {
    const processId = this.route.snapshot.paramMap.get('id');
    if (processId) this.loadProcessDetails(processId);
  }

  loadProcessDetails(id: string) {
    this.isLoading.set(true);
    this.processService.getFullProcessDetails(id).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.processData.set(res.data);
          this.buildForm(res.data.candidates);

          if (res.data.status === 'Completed') {
            this.evaluationForm.disable();
          }
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Connection Error',
          detail: err.error?.message || 'Could not fetch process details.',
        });
      },
    });
  }

  buildForm(candidates: ProcessCandidateDetails[]) {
    const formGroups = candidates.map((c) =>
      this.fb.group({
        candidateId: [c.id],
        status: [c.status, Validators.required],
        grade: [c.grade || ''],
        feedback: [c.feedback || ''],
      })
    );
    this.evaluationForm = this.fb.group({
      evaluations: this.fb.array(formGroups),
    });
  }

  get evaluations() {
    return this.evaluationForm.get('evaluations') as FormArray;
  }

  getEvaluationGroup(index: number): FormGroup {
    return this.evaluations.at(index) as FormGroup;
  }

  openCandidateDetails(index: number) {
    const candidate = this.processData()?.candidates[index];
    if (candidate) {
      this.selectedCandidate.set(candidate);
      this.isModalOpen.set(true);
    }
  }

  saveAll() {
    if (this.evaluationForm.invalid || this.isLoading()) return;

    const id = this.processData()?.id;
    if (!id) return;

    this.isLoading.set(true);
    this.processService.updateEvaluations(id, this.evaluationForm.value.evaluations).subscribe({
      next: (res) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Saved',
          detail: res.message || 'All changes saved successfully.',
        });
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Save Failed',
          detail: err.error?.message || 'Error occurred while saving.',
        });
      },
    });
  }

  confirmEndProcess() {
    if (this.isLoading()) return;

    this.confirmationService.confirm({
      message:
        'Are you sure you want to end this process? This will lock all evaluations permanently.',
      header: 'Finalize Process',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Yes, End It',
      rejectLabel: 'Cancel',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        const id = this.processData()?.id;
        if (!id) return;

        this.isLoading.set(true);
        this.processService.completeProcess(id).subscribe({
          next: (res) => {
            this.processData.update((prev) => (prev ? { ...prev, status: 'Completed' } : null));
            this.evaluationForm.disable(); 

            this.messageService.add({
              severity: 'info',
              summary: 'Process Completed',
              detail: res.message || 'The hiring process is now closed.',
            });
            this.isLoading.set(false);
          },
          error: (err) => {
            this.isLoading.set(false);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: err.error?.message || 'Failed to complete the process.',
            });
          },
        });
      },
    });
  }

  getStatusSeverity(status: string): 'success' | 'danger' | 'warn' | 'info' | 'secondary' {
    if (status.includes('Approved')) return 'success';
    if (status.includes('Rejected')) return 'danger';
    if (status.includes('Waiting')) return 'warn';
    if (status.includes('New')) return 'info';
    return 'secondary';
  }

  shouldShowGrade(index: number): boolean {
    const group = this.getEvaluationGroup(index);
    const status = group.get('status')?.value;
    return (
      !!group.get('grade')?.value ||
      [
        'Finished Exam',
        'Called for Interview',
        'Interviewed',
        'Technically Approved',
        'Technically Rejected',
        'Technically Waiting List',
      ].includes(status)
    );
  }

  shouldShowFeedback(index: number): boolean {
    const group = this.getEvaluationGroup(index);
    const status = group.get('status')?.value;
    return (
      !!group.get('feedback')?.value ||
      [
        'Interviewed',
        'Technically Approved',
        'Technically Rejected',
        'Technically Waiting List',
      ].includes(status)
    );
  }
}
