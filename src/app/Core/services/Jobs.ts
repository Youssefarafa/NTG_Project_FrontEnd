import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { Job, JobsResponse } from '../models/JobsData';
import { ApplyJobRequest } from '../models/MyApplicationData';
import { environment } from '../../Shared/environment';

@Injectable({ providedIn: 'root' })
export class Jobs {
  // ==========================================
  // 1. Real API Methods
  // ==========================================
  // private readonly API_URL = environment.apiUrl;
  // private http = inject(HttpClient);

  // getJobsCandidate(): Observable<JobsResponse> {
  //   return this.http.get<JobsResponse>(`${this.API_URL}/api/jobsCandidate`);
  // }

  // getJobById(id: string): Observable<JobsResponse> {
  //   return this.http.get<JobsResponse>(`${this.API_URL}/api/job/${id}`);
  // }

  // addJob(jobData: Omit<Job, 'id' | 'isApplied'>): Observable<JobsResponse> {
  //   const payload = {
  //     ...jobData,
  //     expiresAt: jobData.expiresAt ? new Date(jobData.expiresAt).toISOString() : undefined,
  //   };
  //   return this.http.post<JobsResponse>(`${this.API_URL}/api/job`, payload);
  // }

  // updateJob(id: string, jobData: Partial<Job>): Observable<JobsResponse> {
  //   const payload = {
  //     ...jobData,
  //     expiresAt: jobData.expiresAt ? new Date(jobData.expiresAt).toISOString() : undefined,
  //   };
  //   return this.http.put<JobsResponse>(`${this.API_URL}/api/job/${id}`, payload);
  // }

  // getJobsManager(): Observable<JobsResponse> {
  //   return this.http.get<JobsResponse>(`${this.API_URL}/api/jobsManager`);
  // }

  // deleteJob(id: string): Observable<JobsResponse> {
  //   return this.http.delete<JobsResponse>(`${this.API_URL}/api/job/${id}`);
  // }

  // applyToJob(data: ApplyJobRequest): Observable<JobsResponse> {
  //   return this.http.post<JobsResponse>(`${this.API_URL}/api/job/apply`, data);
  // }

  // withdrawJob(jobId: string): Observable<JobsResponse> {
  //   return this.http.delete<JobsResponse>(`${this.API_URL}/api/job/withdraw/${jobId}`);
  // }

  // ==========================================
  // 2. Mock API Methods
  // ==========================================

  // --- Mock Data Storage ---
  private jobs = signal<Job[]>([
    {
      id: '1',
      title: 'Frontend Developer',
      reportsTo: 'CTO',
      experience: 2,
      responsibilities: ['Develop UI components', 'Integrate APIs', 'Maintain codebase'],
      requiredSkills: ['Angular', 'Tailwind CSS', 'TypeScript'],
      isApplied: false,
    },
    {
      id: '2',
      title: 'Backend Developer',
      reportsTo: 'CTO',
      experience: 3,
      responsibilities: ['Develop REST APIs', 'Database management', 'Unit testing'],
      requiredSkills: ['Node.js', 'Express', 'MongoDB'],
      isApplied: false,
    },
    {
      id: '3',
      title: 'UI/UX Designer',
      reportsTo: 'Design Lead',
      experience: 1,
      responsibilities: ['Design wireframe', 'Prototypes', 'Collaborate with devs'],
      requiredSkills: ['Figma', 'Adobe XD', 'User Research'],
      isApplied: false,
    },
  ]);

  private mockJobs = signal<Job[]>([
    {
      id: '1',
      title: 'Senior Angular Developer',
      reportsTo: 'Engineering Manager',
      experience: 5,
      responsibilities: ['Architecting UI', 'Mentoring juniors'],
      requiredSkills: ['Angular', 'RxJS', 'TypeScript'],
      isApplied: false,
      expiresAt: '2026-12-31T00:00:00.000Z',
    },
    {
      id: '2',
      title: 'Frontend Lead',
      reportsTo: 'CTO',
      experience: 7,
      responsibilities: ['Leading team', 'Code Review'],
      requiredSkills: ['Angular', 'Unit Testing'],
      isApplied: false,
      expiresAt: '2025-01-01T00:00:00.000Z', 
    },
  ]);

  getJobsManager(): Observable<JobsResponse> {
    const response: JobsResponse = {
      success: true,
      data: this.mockJobs(), 
      message: 'Jobs fetched successfully'
    };
    return of(response).pipe(delay(800)); 
  }

  deleteJob(id: string): Observable<JobsResponse> {
    const currentJobs = this.mockJobs();
    const filteredJobs = currentJobs.filter(j => j.id !== id);
    this.mockJobs.set(filteredJobs);

    const response: JobsResponse = {
      success: true,
      message: 'Job deleted successfully from Mock API'
    };

    return of(response).pipe(delay(500));
  }

  getJobsCandidate(): Observable<JobsResponse> {
    const mockResponse: JobsResponse = {
      success: true,
      data: this.jobs(),
    };

    return of(mockResponse).pipe(delay(500));
  }

  getJobById(id: string): Observable<JobsResponse> {
    const job = this.jobs().find((j) => j.id === id);

    if (!job) {
      const errorResponse: JobsResponse = {
        success: false,
        message: 'Job not found',
        data: undefined,
      };
      return of(errorResponse).pipe(delay(300));
    }
    const successResponse: JobsResponse = {
      success: true,
      message: 'Job fetched successfully',
      data: job,
    };

    return of(successResponse).pipe(delay(300));
  }

  addJob(jobData: Omit<Job, 'id' | 'isApplied'>): Observable<any> {
    const newJob: Job = {
      ...jobData,
      id: Math.random().toString(36).substr(2, 9),
      isApplied: false,
    };
    this.jobs.set([...this.jobs(), newJob]);
    return of({ success: true }).pipe(delay(800));
  }

  updateJob(id: string, jobData: any): Observable<any> {
    const currentJobs = this.jobs();
    const index = currentJobs.findIndex((j) => j.id === id);
    if (index === -1) {
      return throwError(() => new Error('Job not found'));
    }
    const updatedJobs = [...currentJobs];
    updatedJobs[index] = {
      ...updatedJobs[index],
      ...jobData,
    };
    this.jobs.set(updatedJobs);
    return of({ success: true }).pipe(delay(800));
  }

  applyToJob(data: any): Observable<any> {
    console.log('Sending Payload to Server:', data);
    return of({ success: true, message: 'Application Received' }).pipe(delay(2000));
  }

  withdrawJob(jobId: string): Observable<any> {
    const jobIndex = this.jobs().findIndex((j) => j.id === jobId);
    if (jobIndex === -1) return throwError(() => new Error('Job not found'));

    const updated = [...this.jobs()];
    updated[jobIndex] = { ...updated[jobIndex], isApplied: false };
    this.jobs.set(updated);
    return of({ success: true }).pipe(delay(400));
  }
}
