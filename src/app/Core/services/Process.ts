import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApplicantJoinData, ApplicantsResponse, CreateProcessPayload } from '../models/ProcessData';
import { environment } from '../../Shared/environment';
import { Observable, of, delay } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class Process {
  //   private readonly API_URL = environment.apiUrl;
  //   private http = inject(HttpClient);

  // getApplicantsByJob(jobId: string): Observable<ApplicantsResponse> {
  //   return this.http.get<ApplicantsResponse>(`${this.API_URL}/api/applicants/${jobId}`);
  // }

  // createHiringProcess(payload: CreateProcessPayload): Observable<ProcessResponse> {
  //   return this.http.post<ProcessResponse>(`${this.API_URL}/api/process/create`, payload);
  // }

  // ==========================================
  // 2. Mock API Methods
  // ==========================================
  private mockApplicants = signal<ApplicantJoinData[]>([
    {
      id: 'app-101',
      fullName: 'Ahmed Mohamed Ali',
      email: 'ahmed.m@example.com',
      phone: '+20123456789',
      birthDate: '1996-05-15',
      university: 'Cairo University',
      faculty: 'Engineering',
      department: 'Computer Science',
      graduationYear: 2018,
      cvFile: 'cv-ahmed.pdf',
      hasInternalReference: true,
      internalReferees: [{ name: 'Eng. Youssef', email: 'khaled@company.com' }],
      workExperience: [
        {
          jobTitle: 'Frontend Developer',
          companyName: 'Tech Solutions',
          startDate: '2019-01-01',
          endDate: '2021-12-31',
          achievements: 'Developed 10+ dashboard components.\nImproved site performance by 20%.',
        },
      ],
    },
    {
      id: 'app-102',
      fullName: 'Sara youssef',
      email: 'sara.i@example.com',
      phone: '+20111222333',
      birthDate: '1998-09-20',
      university: 'Ain Shams University',
      faculty: 'Computer & IT',
      department: 'Software Engineering',
      graduationYear: 2020,
      cvFile: 'cv-sara.pdf',
      hasInternalReference: false,
      internalReferees: [],
      workExperience: [
        {
          jobTitle: 'Junior Developer',
          companyName: 'Startup X',
          startDate: '2021-03-01',
          endDate: '', // Present
          achievements: 'Integrated RESTful APIs.\nCollaborated with UX/UI designers.',
        },
      ],
    },
  ]);

  getApplicantsByJob(jobId: string): Observable<ApplicantsResponse> {
    console.log(`Mock: Fetching applicants for job ID: ${jobId}`);

    const mockResponse: ApplicantsResponse = {
      success: true,
      message: 'Applicants loaded successfully from Mock API',
      data: this.mockApplicants(),
    };

    return of(mockResponse).pipe(delay(1000));
  }

  createHiringProcess(payload: CreateProcessPayload): Observable<any> {
    console.log('Mock: Submitting Hiring Process with Payload:', payload);

    const mockResponse = {
      success: true,
      message: 'Hiring process created successfully and emails sent to candidates.',
      data: {
        processId: 'proc-' + Math.random().toString(36).substr(2, 9),
        createdAt: new Date(),
      },
    };

    return of(mockResponse).pipe(delay(1500));
  }
}
