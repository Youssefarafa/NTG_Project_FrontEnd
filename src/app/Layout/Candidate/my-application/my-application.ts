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

// PrimeNG Imports
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DatePickerModule } from 'primeng/datepicker';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { RadioButtonModule } from 'primeng/radiobutton';
import { MessageService } from 'primeng/api';

// Services & Models
import { Jobs } from '../../../Core/services/Jobs';
import { MyApplication as ApplicationService } from '../../../Core/services/MyApplication';
import { JobApplication } from '../../../Core/models/MyApplication';

// --- Validators ---
export const dateRangeValidator: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {
  const start = control.get('startDate')?.value;
  const end = control.get('endDate')?.value;
  if (!start || !end) return null;
  return new Date(end) < new Date(start) ? { dateRangeError: true } : null;
};

export const applicationLogicValidator: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {
  const age = control.get('age')?.value;
  const gradYear = control.get('graduationYear')?.value;
  const experiences = control.get('workExperience') as FormArray;

  const errors: any = {};
  if (age && gradYear) {
    const currentYear = new Date().getFullYear();
    const birthYear = currentYear - age;
    if (gradYear - birthYear < 20) errors.invalidGradAge = true;
  }
  if (gradYear && experiences && experiences.length > 0) {
    const firstExp = experiences.at(0);
    const startDate = firstExp.get('startDate')?.value;
    if (startDate && new Date(startDate).getFullYear() < gradYear) errors.expBeforeGrad = true;
  }
  return Object.keys(errors).length > 0 ? errors : null;
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
    InputNumberModule,
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
  private appService = inject(ApplicationService);
  private messageService = inject(MessageService);
  private destroyRef = inject(DestroyRef);

  jobId = signal<string | null>(null);
  jobTitle = signal<string | null>(null);
  isSubmitting = signal(false);
  hasExistingApp = signal(false);

  applicationForm!: FormGroup;
  maxDate: Date = new Date();
  currentYear = new Date().getFullYear();

  ngOnInit() {
    const idParam = this.route.snapshot.params['id'];
    const titleParam = this.route.snapshot.queryParamMap.get('title');
    this.jobId.set(idParam);
    this.jobTitle.set(titleParam);

    this.initForm(idParam);
    this.loadUserApplicationData();
  }

  private initForm(jobId: string) {
    this.applicationForm = this.fb.group(
      {
        jobId: [jobId],
        firstName: ['', [Validators.required, Validators.minLength(2)]],
        lastName: ['', [Validators.required, Validators.minLength(2)]],
        phone: ['', [Validators.required, Validators.pattern(/^01[0125][0-9]{8}$/)]],
        age: [null, [Validators.required, Validators.min(21), Validators.max(55)]],
        university: ['', [Validators.required]],
        faculty: ['', Validators.required],
        department: ['', Validators.required],
        graduationYear: [
          null,
          [Validators.required, Validators.min(1990), Validators.max(this.currentYear)],
        ],
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
      },
      { validators: [applicationLogicValidator] }
    );

    this.applicationForm
      .get('hasInternalReference')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((checked) =>
        checked
          ? this.internalReferees.length === 0 && this.addReferee()
          : this.internalReferees.clear()
      );
  }

  get areMainFieldsTouched(): boolean {
    return (
      this.applicationForm.get('firstName')?.touched ||
      this.applicationForm.get('age')?.touched ||
      this.applicationForm.get('graduationYear')?.touched ||
      false
    );
  }

  private loadUserApplicationData() {
    this.appService
      .getMyApplication()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data) => {
        if (data) {
          this.hasExistingApp.set(true);
          const nameParts = data.applicantName.split(' ');

          this.applicationForm.patchValue({
            firstName: nameParts[0] || '',
            lastName: nameParts.slice(1).join(' ') || '',
            phone: data.phone,
            age: data.age,
            university: data.university,
            faculty: data.faculty,
            department: data.department,
            graduationYear: data.graduationYear,
            cvLink: data.cvFile,
            hasInternalReference: data.hasInternalReference,
          });

          data.workExperience?.forEach((exp) => this.addExperience(exp));
          data.internalReferees?.forEach((ref) => this.addReferee(ref));
        }
      });
  }

  // --- Getters & Form Helpers ---
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

  addExperience(data?: any) {
    this.workExperience.push(
      this.fb.group(
        {
          jobTitle: [data?.jobTitle || '', Validators.required],
          companyName: [data?.companyName || '', Validators.required],
          startDate: [data?.startDate ? new Date(data.startDate) : null, Validators.required],
          endDate: [data?.endDate ? new Date(data.endDate) : null, Validators.required],
          achievements: [
            data?.achievements || '',
            [Validators.required, Validators.maxLength(500)],
          ],
        },
        { validators: dateRangeValidator }
      )
    );
  }

  removeExperience(index: number) {
    this.workExperience.removeAt(index);
  }

  addReferee(data?: any) {
    this.internalReferees.push(
      this.fb.group({
        name: [data?.name || '', Validators.required],
        email: [data?.email || '', [Validators.required, Validators.email]],
      })
    );
  }

  removeReferee(index: number) {
    this.internalReferees.removeAt(index);
  }

  // --- Submission Logic ---
  submitApplication() {
    if (this.applicationForm.invalid) {
      this.applicationForm.markAllAsTouched();
      this.messageService.add({
        severity: 'warn',
        summary: 'Incomplete',
        detail: 'Please check required fields',
      });
      return;
    }

    this.isSubmitting.set(true);
    const raw = this.applicationForm.getRawValue();

    const payload: JobApplication = {
      jobId: this.jobId()!,
      applicantName: `${raw.firstName} ${raw.lastName}`.trim(),
      phone: raw.phone,
      age: Number(raw.age),
      university: raw.university,
      faculty: raw.faculty,
      department: raw.department,
      graduationYear: Number(raw.graduationYear),
      hasInternalReference: raw.hasInternalReference,
      cvFile: raw.cvLink,
      internalReferees: raw.internalReferees,
      workExperience: raw.workExperience.map((exp: any) => ({
        ...exp,
        startDate: exp.startDate instanceof Date ? exp.startDate.toISOString() : exp.startDate,
        endDate: exp.endDate instanceof Date ? exp.endDate.toISOString() : exp.endDate,
      })),
    };

    const saveRequest = this.hasExistingApp()
      ? this.appService.updateMyApplication(payload)
      : this.appService.addMyApplication(payload);

    saveRequest.subscribe({
      next: () => {
        this.jobService.applyToJob(this.jobId()!).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Application submitted!',
            });
            setTimeout(() => this.router.navigate(['/candidate/availableJobs']), 2000);
          },
          error: (err) => this.handleError(err),
        });
      },
      error: (err) => this.handleError(err),
    });
  }

  private handleError(err: any) {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: err.message || 'Action failed',
    });
    this.isSubmitting.set(false);
  }

  isExperienceFieldInvalid = (i: number, f: string) =>
    !!(this.workExperience.at(i).get(f)?.invalid && this.workExperience.at(i).get(f)?.touched);
  isRefereeFieldInvalid = (i: number, f: string) =>
    !!(this.internalReferees.at(i).get(f)?.invalid && this.internalReferees.at(i).get(f)?.touched);
}
