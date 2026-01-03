import { inject, Injectable, signal } from '@angular/core';
import { catchError, delay, map, Observable, of, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Candidate, CandidateResponse } from '../models/CandidateData';
import { environment } from '../../Shared/environment';

@Injectable({
  providedIn: 'root',
})
export class Candidates {
  private readonly API_URL = environment.apiUrl;
  private http = inject(HttpClient);
  // getCandidates(): Observable<Candidate[]> {
  //   return this.http.get<CandidateResponse>(`${this.API_URL}/candidates`).pipe(
  //     map((response) => {
  //       if (response.success && response.data) {
  //         return response.data;
  //       }
  //       if (response.success && !response.data) {
  //         return [];
  //       }
  //       throw new Error(response.message || 'Failed to fetch data');
  //     }),
  //     catchError((error) => {
  //       const errorMessage = error.error?.message || error.message || 'Something went wrong';
  //       return throwError(() => new Error(errorMessage));
  //     })
  //   );
  // }
  // (Mock Data)
  private candidatesList = signal<Candidate[]>([
    {
      id: 'C001',
      name: 'Ahmed Ali',
      email: 'ahmed.ali@example.com',
      phoneNumber: '01012345678',
      birthDate: '1998-05-20',
      university: 'Cairo University',
      faculty: 'Engineering',
      department: 'Computer Science',
      graduationYear: 2021,
    },
    {
      id: 'C002',
      name: 'Sara Hassan',
      email: 'sara.h@example.com',
      phoneNumber: '01298765432',
      birthDate: '2000-02-15',
      university: 'Ain Shams University',
      faculty: 'Commerce',
      department: 'Accounting',
      graduationYear: 2022,
    },
  ]);

  getCandidates(): Observable<Candidate[]> {
    return of(this.candidatesList()).pipe(delay(600));
  }

  searchCandidates(query: string): Observable<Candidate[]> {
    const filtered = this.candidatesList().filter(
      (c) =>
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.email.toLowerCase().includes(query.toLowerCase())
    );
    return of(filtered).pipe(delay(300));
  }
}
