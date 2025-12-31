import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { delay, Observable, of, throwError } from 'rxjs';
// import { JobApplication } from '../models/MyApplication';

@Injectable({ providedIn: 'root' })
export class Process {
  /**
   * -------------------------------------------------------
   * REAL API IMPLEMENTATION (للاستخدام المستقبلي)
   * -------------------------------------------------------
   */
  // private http = inject(HttpClient);
  // private apiUrl = 'https://your-api-url.com/api';

  /**
   * -------------------------------------------------------
   * MOCK DATA (البيانات الوهمية الحالية)
   * -------------------------------------------------------
   */

  // قائمة المتقدمين لكل وظيفة
  private mockApplicantsByJob: Record<string, any[]> = {
    '1': [
      { id: 'app_101', name: 'Ahmed Mansour', email: 'ahmed.m@example.com' },
      { id: 'app_102', name: 'Sara Selim', email: 'sara.s@example.com' },
    ],
    '2': [
      { id: 'proc_002', name: 'Mohamed Ali', email: 'm.ali@example.com' }
    ],
  };

  // تفاصيل طلبات التوظيف (يجب أن تتطابق المفاتيح مع الـ IDs)
  private mockApplicationDetails: Record<string, any> = {
    // البيانات الجديدة الخاصة بـ proc_002
    'proc_002': {
      jobId: '2',
      applicantName: 'Mohamed Ali',
      phone: '01122334455',
      age: 30,
      university: 'Mansoura University',
      faculty: 'Computers and Information',
      department: 'Information Systems',
      graduationYear: 2016,
      workExperience: [
        {
          jobTitle: 'Senior Full Stack Developer',
          companyName: 'Tech Solutions',
          startDate: '2019-01-01',
          endDate: '2023-12-01',
          achievements: 'Led the development of a cloud-based ERP system using Angular and NestJS.',
        },
        {
          jobTitle: 'Junior Web Developer',
          companyName: 'Digital Wave',
          startDate: '2016-08-01',
          endDate: '2018-12-31',
          achievements: 'Built 20+ responsive landing pages and integrated REST APIs.',
        }
      ],
      hasInternalReference: true,
      internalReferees: [
        { name: 'Dr. Ibrahim Hassan', email: 'ibrahim.h@company.com' }
      ],
      cvFile: 'mohamed_ali_resume.pdf',
    },

    // البيانات السابقة
    'app_101': {
      jobId: '1',
      applicantName: 'Ahmed Mansour',
      phone: '01012345678',
      age: 28,
      university: 'Cairo University',
      faculty: 'Engineering',
      department: 'Computer Science',
      graduationYear: 2019,
      workExperience: [
        {
          jobTitle: 'Senior Frontend Developer',
          companyName: 'Global Tech',
          startDate: '2021-01-01',
          endDate: '2024-05-01',
          achievements: 'Led a team of 4 developers to rebuild the core product using Angular 17.',
        }
      ],
      hasInternalReference: true,
      internalReferees: [{ name: 'Eng. Khaled Ali', email: 'khaled.ali@company.com' }],
      cvFile: 'cv_ahmed_mansour.pdf',
    },

    'app_102': {
      jobId: '1',
      applicantName: 'Sara Selim',
      phone: '01298765432',
      age: 24,
      university: 'Alexandria University',
      faculty: 'Commerce',
      department: 'Accounting',
      graduationYear: 2022,
      workExperience: [],
      hasInternalReference: false,
      internalReferees: [],
      cvFile: 'sara_resume.pdf',
    }
  };

  /**
   * جلب قائمة المتقدمين بناءً على رقم الوظيفة
   */
  getApplicantsByJob(jobId: string): Observable<any[]> {
    const applicants = this.mockApplicantsByJob[jobId] || [];
    return of(applicants).pipe(delay(600));
  }

  /**
   * جلب تفاصيل طلب التوظيف بناءً على الـ ID
   */
  getApplicationDetails(id: string): Observable<any> {
    const details = this.mockApplicationDetails[id];
    if (details) {
      return of(details).pipe(delay(400));
    } else {
      // استخدام throwError بدلاً من throw لضمان توافق RxJS
      return throwError(() => new Error(`Application with ID ${id} not found`));
    }
  }

  /**
   * إنشاء عملية توظيف جديدة
   */
  createHiringProcess(payload: any): Observable<any> {
    console.log('Final Payload sent to Server:', payload);
    return of({ success: true, message: 'Process created successfully' }).pipe(delay(1000));
  }
}
