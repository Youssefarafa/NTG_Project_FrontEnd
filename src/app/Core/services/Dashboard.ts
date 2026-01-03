import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { delay, Observable, of } from 'rxjs';
import { DashboardResponse } from '../models/DashboardData';
import { environment } from '../../Shared/environment';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  // private http = inject(HttpClient);
  // private readonly API_URL = environment.apiUrl;
  // getDashboardData(): Observable<DashboardResponse> {
  //   return this.http.get<DashboardResponse>(`${this.API_URL}/api/dashboard/summary`);
  // }

  // searchHistory(query: string): Observable<DashboardResponse> {
  //   return this.http.get<DashboardResponse>(`${this.API_URL}/api/dashboard/history/search`, {
  //     params: { q: query },
  //   });
  // }

  // ==========================================
  // 2. Mock API Methods
  // ==========================================
  private mockSummary: DashboardResponse = {
    success: true,
    data: {
      totalJobs: 12,
      totalCandidates: 150,
      ongoingProcessesCount: 5,
      activePipelines: [
        {
          id: 'p1',
          jobTitle: 'Frontend Developer',
          candidates: [
            { id: 'c1', name: 'Ahmed Hassan', email: 'ahmed@example.com' } as any,
            { id: 'c2', name: 'Sara Ali', email: 'sara@example.com' } as any,
          ],
        },
      ],
      recentHistory: [
        {
          id: 'p3',
          jobTitle: 'UI Designer',
          completedAt: '2025-12-01',
          candidates: [{ id: 'c10', name: 'Mona Zaki', email: 'mona@test.com' }] as any,
        },
        {
          id: 'p4',
          jobTitle: 'Project Manager',
          completedAt: '2025-11-15',
          candidates: [{ id: 'c11', name: 'John Doe', email: 'john@company.com' }] as any,
        },
      ],
    },
  };

  getDashboardData(): Observable<DashboardResponse> {
    return of(this.mockSummary).pipe(delay(1000));
  }

  searchHistory(query: string): Observable<DashboardResponse> {
    const q = query.toLowerCase();

    const filtered = this.mockSummary.data.recentHistory.filter((item) => {
      const matchJob = item.jobTitle.toLowerCase().includes(q);

      const matchCandidate = item.candidates.some(
        (c) => c.name.toLowerCase().includes(q) || (c as any).email?.toLowerCase().includes(q)
      );

      return matchJob || matchCandidate;
    });

    const searchResponse: DashboardResponse = {
      success: true,
      data: filtered as any,
    };

    return of(searchResponse).pipe(delay(800));
  }
}
