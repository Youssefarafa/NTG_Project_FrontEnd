import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormArray,
  FormControl,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Process } from '../../../Core/services/Process';
import { Jobs } from '../../../Core/services/Jobs';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

import {
  JobBasicInfo,
  ApplicantJoinData,
  CreateProcessPayload,
  ApplicantsResponse,
  ProcessResponse,
} from '../../../Core/models/ProcessData';
import { JobsResponse } from '../../../Core/models/JobsData';
@Component({
  selector: 'aap-add-process',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, ToastModule],
  providers: [MessageService],
  templateUrl: './add-process.html',
  styleUrl: './add-process.css',
})
export class AddProcess implements OnInit {
  // --- Signals ---
  isLoading = signal(false);
  jobs = signal<JobBasicInfo[]>([]);
  applicants = signal<ApplicantJoinData[]>([]);
  selectedJobId = signal<string>('');
  isApplicationModalOpen = signal(false);
  selectedApplication = signal<ApplicantJoinData | null>(null);

  // --- Injections ---
  private fb = inject(FormBuilder);
  private processService = inject(Process);
  private jobsService = inject(Jobs);
  private messageService = inject(MessageService);
  private router = inject(Router);

  // --- Form ---
  addProcessForm = this.fb.group({
    jobId: ['', Validators.required],
    testLink: ['', [Validators.required, Validators.pattern('https?://.+')]],
    candidates: this.fb.array([], [this.atLeastOneSelected]),
  });

  ngOnInit() {
    this.loadJobs();
  }

  loadJobs() {
    this.jobsService.getJobsManager().subscribe({
      next: (response: JobsResponse) => {
        if (response.success && Array.isArray(response.data)) {
          const formattedJobs: JobBasicInfo[] = response.data.map((job) => ({
            id: job.id || '',
            title: job.title || '',
          }));
          this.jobs.set(formattedJobs);
        } else {
          this.showToast('error', 'Process Error', response.message || 'Something went wrong');
        }
      },
      error: (err) => {
        const serverErrorMessage = err.error?.message || 'Server connection failed';
        this.showToast('error', 'Server Error', serverErrorMessage);
      },
    });
  }

  onJobChange(event: Event) {
    const jobId = (event.target as HTMLSelectElement).value;
    this.selectedJobId.set(jobId);

    this.processService.getApplicantsByJob(jobId).subscribe({
      next: (response: ApplicantsResponse) => {
        if (response.success && response.data) {
          this.applicants.set(response.data);
          this.candidatesArray.clear();
          response.data.forEach(() => {
            this.candidatesArray.push(new FormControl(false));
          });
        } else {
          this.applicants.set([]);
          this.candidatesArray.clear();
          this.showToast('error', 'Notification', response.message || 'No candidates found.');
        }
      },
      error: (err) => {
        this.applicants.set([]);
        this.candidatesArray.clear();
        const errorMsg = err.error?.message || 'Technical error occurred';
        this.showToast('error', 'Server Error', errorMsg);
      },
    });
  }

  viewApplication(id: string) {
    const details = this.applicants().find((a) => a.id === id);
    if (details) {
      this.selectedApplication.set(details);
      this.isApplicationModalOpen.set(true);
    }
  }
  
  createProcess() {
    if (this.addProcessForm.invalid) {
      this.addProcessForm.markAllAsTouched();
      this.showToast('warn', 'Invalid Form', 'Please complete all fields');
      return;
    }

    this.isLoading.set(true);
    const selectedIds = this.applicants()
      .filter((_, index) => this.candidatesArray.at(index).value === true)
      .map((app) => app.id);

    const payload: CreateProcessPayload = {
      jobId: this.addProcessForm.value.jobId as string,
      candidateIds: selectedIds,
      testLink: this.addProcessForm.value.testLink as string,
    };

    this.processService.createHiringProcess(payload).subscribe({
      next: (response: ProcessResponse) => {
        if (response.success) {
          this.showToast('success', 'Success', response.message || 'Hiring process initiated!');
          this.resetForm();

          setTimeout(() => {
            this.isLoading.set(false);
            this.router.navigate(['/manager/dashboard']);
          }, 1500);
        } else {
          this.showToast('error', 'Failed', response.message || 'Could not create process');
          this.isLoading.set(false);
        }
      },
      error: (err) => {
        const errorMsg = err.error?.message || 'Submission failed due to server error';
        this.showToast('error', 'Error', errorMsg);
        this.isLoading.set(false);
      },
    });
  }

  // --- Helpers ---
  get candidatesArray() {
    return this.addProcessForm.get('candidates') as FormArray;
  }

  atLeastOneSelected(control: AbstractControl): ValidationErrors | null {
    const formArray = control as FormArray;
    const isAnySelected = formArray.controls.some((c) => c.value === true);
    return isAnySelected ? null : { noCandidateSelected: true };
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.addProcessForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  closeApplicationModal() {
    this.isApplicationModalOpen.set(false);
    this.selectedApplication.set(null);
  }

  private resetForm() {
    this.addProcessForm.reset({ jobId: '', testLink: '' });
    this.candidatesArray.clear();
    this.applicants.set([]);
    this.selectedJobId.set('');
  }

  private showToast(severity: string, summary: string, detail: string) {
    this.messageService.add({ severity, summary, detail, life: 5000 });
  }
}
