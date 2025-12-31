import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { delay, Observable, of } from 'rxjs';
import { HiringProcess } from '../models/ProcessData'; 

@Injectable({ providedIn: 'root' })
export class DashboardService {
  // private http = inject(HttpClient);
  // private apiUrl = 'https://your-api-url.com/api';
  private mockProcesses: HiringProcess[] = [
    {
      id: 'proc_001',
      jobTitle: 'Frontend Developer',
      status: 'active',
      candidates: [
        { id: 'app_101', name: 'Ahmed Mansour', email: 'ahmed.m@example.com' },
        { id: 'app_102', name: 'Sara Selim', email: 'sara.s@example.com' }
      ]
    },
    {
      id: 'proc_002',
      jobTitle: 'Backend Engineer',
      status: 'completed',
      completedAt: new Date('2025-11-20'),
      candidates: [
        { id: 'app_103', name: 'Mohamed Ali', email: 'm.ali@example.com' }
      ]
    }
  ];

  /*
  getDashboardStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/dashboard/stats`);
  }
  */
  getDashboardStats(): Observable<any> {
    return of({
      totalJobs: 15,
      totalCandidates: 120,
      ongoingProcesses: this.mockProcesses.filter(p => p.status === 'active').length
    }).pipe(delay(500));
  }

  /*
  getAllHiringProcesses(): Observable<HiringProcess[]> {
    return this.http.get<HiringProcess[]>(`${this.apiUrl}/hiring-processes`);
  }
  */
  getAllHiringProcesses(): Observable<HiringProcess[]> {
    return of(this.mockProcesses).pipe(delay(800));
  }
}
