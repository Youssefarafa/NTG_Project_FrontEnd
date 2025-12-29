import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { JobApplication } from '../models/MyApplication';

@Injectable({ providedIn: 'root' })
export class MyApplication {
  // // ==========================================
  // // 1. Real API Methods
  // // ==========================================
  // private http = inject(HttpClient);
  // private readonly apiUrl = 'https://api.yourdomain.com/application';

  // getMyApplication(): Observable<JobApplication | null> {
  //   return this.http.get<JobApplication | null>(`${this.apiUrl}/me`);
  // }

  // addMyApplication(data: JobApplication): Observable<any> {
  //   return this.http.post(this.apiUrl, data);
  // }

  // updateMyApplication(data: JobApplication): Observable<any> {
  //   return this.http.put(`${this.apiUrl}/update`, data);
  // }

  // ==========================================
  // 2. Mock API Methods
  // ==========================================
  // --- Mock Data Storage ---
  private userApplication = signal<JobApplication | null>(null);

  getMyApplication(): Observable<JobApplication | null> {
    return of(this.userApplication()).pipe(delay(400));
  }

  addMyApplication(data: JobApplication): Observable<any> {
    this.userApplication.set(data);
    return of({ success: true, message: 'Created Mock' }).pipe(delay(500));
  }

  updateMyApplication(data: JobApplication): Observable<any> {
    this.userApplication.set(data);
    return of({ success: true, message: 'Updated Mock' }).pipe(delay(500));
  }
}
