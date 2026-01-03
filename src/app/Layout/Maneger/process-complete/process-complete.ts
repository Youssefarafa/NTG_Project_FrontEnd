import { Component, inject, OnInit, signal } from '@angular/core';
// import { JobApplication } from '../../../Core/models/MyApplication';
import { Process } from '../../../Core/services/Process';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { DatePipe, CommonModule } from '@angular/common';

@Component({
  selector: 'app-process-complete',
  standalone: true,
  // imports: [DatePipe, CommonModule, RouterModule],
  templateUrl: './process-complete.html',
  styleUrl: './process-complete.css',
})
export class ProcessComplete {
  private route = inject(ActivatedRoute);
  private processService = inject(Process);

  // processId = signal<string | null>(null);
  // candidatesList = signal<any[]>([]); // قائمة المتقدمين في هذه العملية
  // selectedApplication = signal<any | null>(null);
  // isLoading = signal<boolean>(false);
  // error = signal<string | null>(null);

  // ngOnInit() {
  //   const id = this.route.snapshot.paramMap.get('id');
  //   if (id) {
  //     this.processId.set(id);
  //     this.loadAllData(id);
  //   }
  // }

  // async loadAllData(id: string) {
  //   this.isLoading.set(true);

  //   // 1. جلب قائمة المتقدمين أولاً (نفترض أن jobId هو 2 كمثال أو نمرره ديناميكياً)
  //   // هنا نستخدم الـ ID القادم من الراوتر لجلب المتقدمين التابعين له
  //   this.processService.getApplicantsByJob('2').subscribe({
  //     next: (candidates) => {
  //       this.candidatesList.set(candidates);

  //       // 2. تحميل تفاصيل أول متقدم تلقائياً إذا وجدت القائمة
  //       if (candidates.length > 0) {
  //         this.loadApplicationData(candidates[0].id);
  //       } else {
  //         // إذا لم نجد قائمة، نحاول تحميل الـ ID المباشر من الرابط
  //         this.loadApplicationData(id);
  //       }
  //     },
  //     error: () => this.isLoading.set(false)
  //   });
  // }

  // loadApplicationData(candidateId: string) {
  //   this.processService.getApplicationDetails(candidateId).subscribe({
  //     next: (data) => {
  //       this.selectedApplication.set(data);
  //       this.isLoading.set(false);
  //     },
  //     error: (err) => {
  //       this.error.set('Candidate details not found.');
  //       this.isLoading.set(false);
  //     },
  //   });
  // }

  // selectCandidate(id: string) {
  //   this.isLoading.set(true);
  //   this.loadApplicationData(id);
  // }
}
