import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { Job } from '../models/JobsData';
import { ApplyJobRequest } from '../models/MyApplicationData';

@Injectable({ providedIn: 'root' })
export class Jobs {
  // ==========================================
  // 1. Real API Methods
  // ==========================================
  // private http = inject(HttpClient);
  // private readonly apiUrl = 'https://api.yourdomain.com/jobs';

  // getJobs(): Observable<Partial<Job>[]> {
  //   return this.http.get<Partial<Job>[]>(this.apiUrl);
  // }

  // getJobById(id: string): Observable<Partial<Job>> {
  //   return this.http.get<Partial<Job>>(`${this.apiUrl}/${id}`);
  // }

  // addJob(jobData: Omit<Job, 'id' | 'isApplied'>): Observable<Job> {
  //   const payload = {
  //     ...jobData,
  //     expiresAt: new Date(jobData.expiresAt).toISOString(),
  //   };
  //   return this.http.post<Job>(this.apiUrl, payload);
  // }

  // updateJob(id: string, jobData: any): Observable<any> {
  //   return this.http.put(`${this.apiUrl}/${id}`, jobData);
  // }

  // deleteJob(id: string): Observable<any> {
  //   return this.http.delete(`${this.apiUrl}/${id}`);
  // }

  // applyToJob(data: ApplyJobRequest): Observable<any> {
  //   return this.http.post(`${this.apiUrl}/apply`, data);
  // }

  // withdrawJob(jobId: string): Observable<any> {
  //   return this.http.delete(`${this.apiUrl}/withdraw/${jobId}`);
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

  getJobs(): Observable<Job[]> {
    return of(this.jobs()).pipe(delay(500));
  }

  getJobById(id: string): Observable<Job> {
    const job = this.jobs().find((j) => j.id === id);
    if (!job) {
      return throwError(() => new Error('Job not found'));
    }
    return of(job).pipe(delay(300));
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

  deleteJob(id: string): Observable<any> {
    const currentJobs = this.jobs();
    const updated = currentJobs.filter((j) => j.id !== id);
    if (currentJobs.length === updated.length) {
      return throwError(() => new Error('Job not found'));
    }
    this.jobs.set(updated);
    return of({ success: true }).pipe(delay(300));
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
