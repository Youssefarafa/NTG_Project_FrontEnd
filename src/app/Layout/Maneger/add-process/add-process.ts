import {
  Component,
  inject,
  signal,
  OnInit,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  DestroyRef,
  effect,
  computed,
} from '@angular/core';
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
import { MessageService, ConfirmationService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { EditorModule } from 'primeng/editor';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import {
  JobBasicInfo,
  ApplicantJoinData,
  CreateProcessPayload,
  ApplicantsResponse,
  ProcessResponse,
} from '../../../Core/models/ProcessData';
import { JobsResponse } from '../../../Core/models/JobsData';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

export function noEmptyHtml(control: AbstractControl): ValidationErrors | null {
  const value = control.value || '';
  const plainText = value.replace(/<[^>]*>/g, '').trim();
  return plainText.length > 0 ? null : { htmlEmpty: true };
}

export function atLeastOneSelected(control: AbstractControl): ValidationErrors | null {
  const formArray = control as FormArray;
  const isAnySelected = formArray.controls.some((c) => c.value === true);
  return isAnySelected ? null : { noCandidateSelected: true };
}

@Component({
  selector: 'aap-add-process',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    ToastModule,
    EditorModule,
    ConfirmDialogModule,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './add-process.html',
  styleUrl: './add-process.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddProcess implements OnInit {
  // Signals
  isLoading = signal(false);
  jobs = signal<JobBasicInfo[]>([]);
  applicants = signal<ApplicantJoinData[]>([]);
  selectedJobId = signal<string>('');
  selectedJobTitle = signal<string>('{{jobTitle}}');
  isEmailEditedManually = signal(false);

  isApplicationModalOpen = signal(false);
  selectedApplication = signal<ApplicantJoinData | null>(null);

  private lastJobTitleValue: string = '{{jobTitle}}';
  private lastTestLinkValue: string = '{{testLink}}';

  defaultEmailTemplate = `
  <p>Dear Candidate,</p>
  <p>We are pleased to inform you that you have been shortlisted for the <strong>{{jobTitle}}</strong> position.</p>
  <p style="background-color: #f0fdfa; padding: 15px; border-left: 4px solid #0d9488;">
    <strong>Assessment Instructions:</strong><br>
    Below is your dedicated assessment link. Please <strong>save this link</strong> and keep it secure. 
    <br><br>
    <span style="color: #be123c; font-weight: bold;">⚠️ Important:</span> 
    Do not start the assessment until you receive a formal notification from us to begin.
  </p>
  <p>Your Assessment Link: <br>
    <a href="{{testLink}}" target="_blank" style="color: #0d9488; font-weight: bold; text-decoration: underline;">{{testLink}}</a>
  </p>
  <p>If you have any questions, feel free to reach out.</p>
  <p>Best Regards,<br><strong>HR Recruitment Team</strong></p>
`;

  private fb = inject(FormBuilder);
  private processService = inject(Process);
  private jobsService = inject(Jobs);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private router = inject(Router);
  private readonly cdRef = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);
  showEmailWarning = signal(false);

  onEmailFocus() {
    if (this.showEmailWarning()) return;
    const jobInvalid = !this.addProcessForm.get('jobId')?.valid;
    const candidatesInvalid = !this.addProcessForm.get('candidates')?.valid;
    const testLinkInvalid = !this.addProcessForm.get('testLink')?.valid;
    if (jobInvalid || candidatesInvalid || testLinkInvalid) {
      this.showEmailWarning.set(true);
      this.cdRef.markForCheck();
    }
  }

  addProcessForm = this.fb.group({
    jobId: ['', Validators.required],
    testLink: ['', [Validators.required, Validators.pattern('https?://.+')]],
    candidates: this.fb.array([], [atLeastOneSelected]),
    emailBody: [this.defaultEmailTemplate, [Validators.required, noEmptyHtml]],
  });

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.confirmationService.close();
    });
    this.addProcessForm.statusChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      if (this.addProcessForm.valid && this.showEmailWarning()) {
        this.showEmailWarning.set(false);
        this.cdRef.markForCheck();
      }
    });
  }

  ngOnInit() {
    this.loadJobs();
    this.addProcessForm
      .get('testLink')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.updateEmailBody());

    this.addProcessForm
      .get('emailBody')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((newValue) => {
        if (newValue !== this.lastEmailUpdate && this.addProcessForm.get('emailBody')?.dirty) {
          this.isEmailEditedManually.set(true);
        }
      });
  }

  private lastEmailUpdate: string = '';

  loadJobs() {
    this.jobsService
      .getJobsManager()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: JobsResponse) => {
          if (response.success && Array.isArray(response.data)) {
            this.jobs.set(response.data.map((j) => ({ id: j.id || '', title: j.title || '' })));
            this.cdRef.markForCheck();
          }
        },
      });
  }

  onJobChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const jobId = selectElement.value;
    const jobTitle = selectElement.options[selectElement.selectedIndex].text;

    this.selectedJobId.set(jobId);
    this.selectedJobTitle.set(jobTitle);

    this.candidatesArray.clear({ emitEvent: false });
    this.applicants.set([]);
    this.isEmailEditedManually.set(false);

    this.updateEmailBody();

    this.processService
      .getApplicantsByJob(jobId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: ApplicantsResponse) => {
          const applicants = response.data || [];
          this.applicants.set(applicants);
          applicants.forEach(() => {
            this.candidatesArray.push(new FormControl(false), { emitEvent: false });
          });
          this.candidatesArray.setValidators([atLeastOneSelected]);
          this.candidatesArray.updateValueAndValidity({ emitEvent: true });
          this.candidatesArray.markAsPristine({ emitEvent: false });
          this.candidatesArray.markAsUntouched({ emitEvent: false });

          this.cdRef.markForCheck();
        },
      });
  }

  onCandidateChange() {
    this.candidatesArray.updateValueAndValidity({ emitEvent: false });
    this.cdRef.markForCheck();
  }

  updateEmailBody(forceReset: boolean = false) {
    if (this.isEmailEditedManually() && !forceReset) return;

    let body = forceReset
      ? this.defaultEmailTemplate
      : this.addProcessForm.get('emailBody')?.value || '';
    const newJobTitle = this.selectedJobTitle();
    const newLink = this.addProcessForm.get('testLink')?.value || '{{testLink}}';

    const jobTarget = forceReset ? '{{jobTitle}}' : this.lastJobTitleValue;
    body = body.split(jobTarget).join(newJobTitle);

    const linkTarget = forceReset ? '{{testLink}}' : this.lastTestLinkValue;
    body = body.split(linkTarget).join(newLink);

    this.lastJobTitleValue = newJobTitle;
    this.lastTestLinkValue = newLink;
    this.lastEmailUpdate = body;

    this.addProcessForm.patchValue({ emailBody: body }, { emitEvent: false });

    if (forceReset) this.isEmailEditedManually.set(false);
    this.cdRef.markForCheck();
  }

  resetToTemplate() {
    this.confirmationService.confirm({
      message: `<i class="pi pi-exclamation-triangle" style="font-size:1.2rem;"></i>  Are you sure you want to reset the email content to the default template?<br><br>
                    <strong>Tip:</strong><br>
                    If you want to keep your current edits, please copy the content before resetting.<br>
                    All manual changes will be permanently deleted.
                  `,
      header: 'Confirm Reset',
      // icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.updateEmailBody(true);
        this.showToast('success', 'Success', 'Email template has been reset successfully');
      },
      reject: () => {
        // Do nothing
      },
    });
  }

  viewApplication(id: string) {
    const details = this.applicants().find((a) => a.id === id);
    if (details) {
      this.selectedApplication.set(details);
      this.isApplicationModalOpen.set(true);
      this.cdRef.markForCheck();
    }
  }

  closeApplicationModal() {
    this.isApplicationModalOpen.set(false);
    this.selectedApplication.set(null);
    this.cdRef.markForCheck();
  }

  createProcess() {
    if (this.addProcessForm.invalid) {
      this.addProcessForm.markAllAsTouched();
      this.showToast('warn', 'Form Invalid', 'Please check all required fields.');
      return;
    }

    this.isLoading.set(true);
    const selectedIds = this.applicants()
      .filter((_, i) => this.candidatesArray.at(i).value === true)
      .map((a) => a.id);

    const payload: CreateProcessPayload = {
      jobId: this.addProcessForm.value.jobId!,
      candidateIds: selectedIds,
      testLink: this.addProcessForm.value.testLink!,
      emailBody: this.addProcessForm.value.emailBody!,
    };

    this.processService.createHiringProcess(payload).subscribe({
      next: (res: ProcessResponse) => {
        if (res.success) {
          this.showToast('success', 'Success', 'Process created successfully');
          this.router.navigate(['/manager/dashboard']);
        } else {
          this.showToast('error', 'Error', res.message || 'Failed');
          this.isLoading.set(false);
        }
        this.cdRef.markForCheck();
      },
      error: () => {
        this.isLoading.set(false);
        this.cdRef.markForCheck();
      },
    });
  }

  get candidatesArray() {
    return this.addProcessForm.get('candidates') as FormArray;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.addProcessForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  private showToast(severity: string, summary: string, detail: string) {
    this.messageService.add({ severity, summary, detail, life: 5000 });
  }
}
