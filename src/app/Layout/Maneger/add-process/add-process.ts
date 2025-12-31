import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
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
import { Job } from '../../../Core/models/JobsData';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
// import { JobApplication } from '../../../Core/models/MyApplication';

@Component({
  selector: 'aap-add-process',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, ToastModule],
  providers: [MessageService],
  templateUrl: './add-process.html',
  styleUrl: './add-process.css',
})
export class AddProcess implements OnInit {
  isLoading = signal(false);
  private fb = inject(FormBuilder);
  private processService = inject(Process);
  private jobsService = inject(Jobs);
  private messageService = inject(MessageService);
  private router = inject(Router);

  // Signals for state management
  jobs = signal<Job[]>([]);
  applicants = signal<any[]>([]);
  selectedJobId = signal<string>('');
  isApplicationModalOpen = signal(false);
  selectedApplication = signal<any | null>(null);

  addProcessForm = this.fb.group({
    jobId: ['', Validators.required],
    testLink: ['', [Validators.required, Validators.pattern('https?://.+')]],
    candidates: this.fb.array([], [this.atLeastOneSelected]),
  });

  ngOnInit() {
    this.loadJobs();
  }

  atLeastOneSelected(control: AbstractControl): ValidationErrors | null {
    const formArray = control as FormArray;
    const isAnySelected = formArray.controls.some((c) => c.value === true);
    return isAnySelected ? null : { noCandidateSelected: true };
  }

  loadJobs() {
    this.jobsService.getJobs().subscribe({
      next: (data) => this.jobs.set(data),
      error: () => this.showToast('error', 'Error', 'Failed to load jobs list'),
    });
  }

  get candidatesArray() {
    return this.addProcessForm.get('candidates') as FormArray;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.addProcessForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onJobChange(event: any) {
    const jobId = event.target.value;
    this.selectedJobId.set(jobId);

    this.processService.getApplicantsByJob(jobId).subscribe({
      next: (data) => {
        this.applicants.set(data);
        this.candidatesArray.clear();
        data.forEach(() => {
          this.candidatesArray.push(new FormControl(false));
        });
        this.candidatesArray.updateValueAndValidity();
      },
      error: () => this.showToast('error', 'Error', 'Could not fetch applicants for this job'),
    });
  }

  viewApplication(id: string) {
    this.processService.getApplicationDetails(id).subscribe({
      next: (details) => {
        this.selectedApplication.set(details);
        this.isApplicationModalOpen.set(true);
      },
      error: () => this.showToast('warn', 'Wait', 'Could not load application details'),
    });
  }

  closeApplicationModal() {
    this.isApplicationModalOpen.set(false);
    this.selectedApplication.set(null);
  }

  createProcess() {
    if (this.addProcessForm.invalid) {
      this.addProcessForm.markAllAsTouched();
      this.showToast('warn', 'Invalid Form', 'Please complete all required fields correctly');
      return;
    }
    this.isLoading.set(true);
    const selectedIds = this.applicants()
      .filter((_, index) => this.candidatesArray.at(index).value === true)
      .map((a) => a.id);

    const payload = {
      jobId: this.addProcessForm.value.jobId,
      testLink: this.addProcessForm.value.testLink,
      candidateIds: selectedIds,
    };

    this.processService.createHiringProcess(payload).subscribe({
      next: () => {
        this.showToast('success', 'Process Created', 'Emails sent to candidates!');
        this.resetForm();
        setTimeout(() => {
          this.isLoading.set(false);
          this.router.navigate(['/manager/dashboard']);
        }, 1500);
      },
      error: () => {
        this.showToast('error', 'Submission Failed', 'Error creating the process');
        this.isLoading.set(false);
      },
    });
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
