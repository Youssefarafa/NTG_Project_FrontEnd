import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, ReactiveFormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToastModule } from 'primeng/toast';
import { DatePickerModule } from 'primeng/datepicker';
import { Jobs } from '../../../Core/services/Jobs';
import { Job, JobsResponse } from '../../../Core/models/JobsData';

@Component({
  selector: 'app-add-job',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    ToastModule,
    DatePickerModule,
  ],
  providers: [MessageService],
  templateUrl: './add-job.html',
  styleUrl: './add-job.css',
})
export class AddJob implements OnInit {
  private fb = inject(FormBuilder);
  private jobsService = inject(Jobs);
  private messageService = inject(MessageService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  minDate: Date = new Date();
  addJobForm: FormGroup;
  isSubmitting = signal(false);
  isEditMode = signal(false);
  jobId: string | null = null;

  constructor() {
    this.addJobForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(50)]],
      reportsTo: ['', [Validators.required, Validators.minLength(3)]],
      experience: [null, [Validators.required, Validators.min(0), Validators.max(20)]],
      expiresAt: [null, Validators.required],
      responsibilities: this.fb.array([]),
      requiredSkills: this.fb.array([]),
    });
  }

  ngOnInit() {
    this.jobId = this.route.snapshot.paramMap.get('id');

    if (this.jobId) {
      this.isEditMode.set(true);
      this.loadJobData(this.jobId);
    } else {
      this.addResponsibility();
      this.addSkill();
    }
  }

  loadJobData(id: string) {
    this.jobsService.getJobById(id).subscribe({
      next: (res: JobsResponse) => {
        if (res.success && res.data) {
          const job = res.data as Job;

          this.responsibilities.clear();
          this.requiredSkills.clear();

          job.responsibilities?.forEach((res: string) => this.addResponsibility(res));
          job.requiredSkills?.forEach((skill: string) => this.addSkill(skill));

          const jobData = {
            ...job,
            expiresAt: job.expiresAt ? new Date(job.expiresAt) : null,
          };

          this.addJobForm.patchValue(jobData);
        } else {
          this.showError(res.message || 'Job data not found');
        }
      },
      error: (err) => {
        const errorMsg = err.error?.message || 'Could not load job data';
        this.showError(errorMsg);
      },
    });
  }

  get responsibilities() {
    return this.addJobForm.get('responsibilities') as FormArray;
  }
  get requiredSkills() {
    return this.addJobForm.get('requiredSkills') as FormArray;
  }

  addResponsibility(value: string = '') {
    this.responsibilities.push(
      this.fb.control(value, [Validators.required, Validators.minLength(10)])
    );
  }

  addSkill(value: string = '') {
    this.requiredSkills.push(
      this.fb.control(value, [Validators.required, Validators.minLength(5)])
    );
  }

  removeResponsibility(index: number) {
    if (this.responsibilities.length > 1) this.responsibilities.removeAt(index);
  }

  removeSkill(index: number) {
    if (this.requiredSkills.length > 1) this.requiredSkills.removeAt(index);
  }

  submitApplication() {
    if (this.addJobForm.invalid) {
      this.addJobForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    
    const request$ = this.isEditMode()
      ? this.jobsService.updateJob(this.jobId!, this.addJobForm.value)
      : this.jobsService.addJob(this.addJobForm.value);

    request$.subscribe({
      next: (res: JobsResponse) => {
        if (res.success) {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: res.message || (this.isEditMode() ? 'Job updated!' : 'Job created!'),
          });

          const targetRoute = this.isEditMode() ? '/manager/viewJobs' : '/manager/dashboard';
          setTimeout(() => {
            this.isSubmitting.set(false);
            this.router.navigate([targetRoute]);
          }, 1500);
        }
      },
      error: (err) => {
        this.isSubmitting.set(false);
        const errorMsg = err.error?.message || 'Operation failed';
        this.showError(errorMsg);
      },
    });
  }

  isFieldInvalid(controlName: string): boolean {
    const control = this.addJobForm.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  private showError(msg: string) {
    this.messageService.add({ severity: 'error', summary: 'Error', detail: msg });
  }

  onCancel() {
    const targetRoute = this.isEditMode() ? '/manager/viewJobs' : '/manager/dashboard';
    this.router.navigate([targetRoute]);
  }
}