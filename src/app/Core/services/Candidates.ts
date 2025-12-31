import { inject, Injectable, signal } from '@angular/core';
import { delay, Observable, of, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Candidate } from '../models/CandidateData';

@Injectable({
  providedIn: 'root'
})
export class Candidates {
  private http = inject(HttpClient);


  // (Mock Data)
  private candidatesList = signal<Candidate[]>([
    { id: 'C001', name: 'Ahmed Ali', email: 'ahmed.ali@example.com', registrationDate: new Date('2023-10-01') },
    { id: 'C002', name: 'Sara Hassan', email: 'sara.h@example.com', registrationDate: new Date('2023-11-15') },
    { id: 'C003', name: 'John Doe', email: 'john.d@tech.com', registrationDate: new Date('2024-01-20') },
  ]);

  getCandidates(): Observable<Candidate[]> {
    return of(this.candidatesList()).pipe(delay(600));
  }

  searchCandidates(query: string): Observable<Candidate[]> {
    const filtered = this.candidatesList().filter(c =>
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.email.toLowerCase().includes(query.toLowerCase())
    );
    return of(filtered).pipe(delay(300));
  }
}
