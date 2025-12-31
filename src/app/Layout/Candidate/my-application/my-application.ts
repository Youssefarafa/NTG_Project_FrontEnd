import {
  Component,
  OnInit,
  signal,
  inject,
  DestroyRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  ReactiveFormsModule,
  ValidatorFn,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DatePickerModule } from 'primeng/datepicker';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { RadioButtonModule } from 'primeng/radiobutton';
import { MessageService } from 'primeng/api';

import { Jobs } from '../../../Core/services/Jobs';

import { ApplyJobRequest } from '../../../Core/models/MyApplicationData';

export const dateRangeValidator: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {
  const start = control.get('startDate')?.value;
  const end = control.get('endDate')?.value;
  if (!start || !end) return null;
  return new Date(end) < new Date(start) ? { dateRangeError: true } : null;
};

@Component({
  selector: 'app-my-application',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    ButtonModule,
    InputTextModule,
    DatePickerModule,
    TextareaModule,
    ToastModule,
    RadioButtonModule,
  ],
  templateUrl: './my-application.html',
  styleUrl: './my-application.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [MessageService],
})
export class MyApplication implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private jobService = inject(Jobs);
  private messageService = inject(MessageService);
  private destroyRef = inject(DestroyRef);

  jobId = signal<string | null>(null);
  jobTitle = signal<string | null>(null);
  isSubmitting = signal(false);

  applicationForm!: FormGroup;
  maxDate: Date = new Date();

  ngOnInit() {
    const idParam = this.route.snapshot.params['id'];
    const titleParam = this.route.snapshot.queryParamMap.get('title');
    this.jobId.set(idParam);
    this.jobTitle.set(titleParam);

    this.initForm(idParam);
  }

  private initForm(jobId: string) {
    this.applicationForm = this.fb.group({
      jobId: [jobId],
      cvLink: [
        '',
        [
          Validators.required,
          Validators.pattern(/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/),
        ],
      ],
      workExperience: this.fb.array([]),
      hasInternalReference: [false],
      internalReferees: this.fb.array([]),
    });

    this.applicationForm
      .get('hasInternalReference')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((checked) =>
        checked
          ? this.internalReferees.length === 0 && this.addReferee()
          : this.internalReferees.clear()
      );
  }

  get workExperience() {
    return this.applicationForm.get('workExperience') as FormArray;
  }
  get internalReferees() {
    return this.applicationForm.get('internalReferees') as FormArray;
  }

  isFieldInvalid(fieldName: string) {
    const field = this.applicationForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  addExperience() {
    this.workExperience.push(
      this.fb.group(
        {
          jobTitle: ['', Validators.required],
          companyName: ['', Validators.required],
          startDate: [null, Validators.required],
          endDate: [null, Validators.required],
          achievements: ['', [Validators.required, Validators.maxLength(500)]],
        },
        { validators: dateRangeValidator }
      )
    );
  }

  removeExperience(index: number) {
    this.workExperience.removeAt(index);
  }

  addReferee() {
    this.internalReferees.push(
      this.fb.group({
        name: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
      })
    );
  }

  removeReferee(index: number) {
    this.internalReferees.removeAt(index);
  }

  submitApplication() {
    if (this.applicationForm.invalid) {
      this.applicationForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const raw = this.applicationForm.getRawValue();

    const payload: ApplyJobRequest = {
      jobId: this.jobId()!,
      isApplied: true,
      cvFile: raw.cvLink,
      hasInternalReference: raw.hasInternalReference,
      internalReferees: raw.internalReferees,
      workExperience: raw.workExperience.map((exp: any) => ({
        ...exp,
        startDate: exp.startDate instanceof Date ? exp.startDate.toISOString() : exp.startDate,
        endDate: exp.endDate instanceof Date ? exp.endDate.toISOString() : exp.endDate,
      })),
    };

    this.jobService.applyToJob(payload).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Application submitted successfully!',
        });
        setTimeout(() => this.router.navigate(['/candidate/availableJobs']), 2000);
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.message || 'Failed to apply for the job',
        });
        this.isSubmitting.set(false);
      },
    });
  }

  isExperienceFieldInvalid = (i: number, f: string) =>
    !!(this.workExperience.at(i).get(f)?.invalid && this.workExperience.at(i).get(f)?.touched);
  isRefereeFieldInvalid = (i: number, f: string) =>
    !!(this.internalReferees.at(i).get(f)?.invalid && this.internalReferees.at(i).get(f)?.touched);
}
