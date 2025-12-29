import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { delay, Observable, of, throwError } from 'rxjs';
import { ChangePassword, UserProfile } from '../models/MyProfileData';

@Injectable({ providedIn: 'root' })
export class Profile {
  // private apiUrl = 'your-api-url/profile';

  // getProfile(): Observable<UserProfile> {
  //   return this.http.get<UserProfile>(this.apiUrl);
  // }

  // updateProfile(data: UserProfile): Observable<any> {
  //   return this.http.put(`${this.apiUrl}/update`, data);
  // }

  // changePassword(data: ChangePassword): Observable<any> {
  //   return this.http.post(`${this.apiUrl}/change-password`, data);
  // }

  // constructor(private http: HttpClient) {}

  private mockUser: UserProfile = {
    name: 'Youssef Arafa',
    email: 'rfhy300@example.com',
  };

  getProfile(): Observable<UserProfile> {
    return of(this.mockUser).pipe(delay(1500));
  }
  updateProfile(data: UserProfile): Observable<any> {
    console.log('Mock Update Profile API called with:', data);
    this.mockUser = { ...data };

    return of({ success: true, message: 'Profile updated successfully' }).pipe(delay(1000));
  }

  changePassword(data: ChangePassword): Observable<any> {
    console.log('Mock Change Password API called with:', data);

    // return of({ success: true }).pipe(delay(1200));

    return throwError(() => new Error('Current password is incorrect')).pipe(delay(1200));

  }

  constructor() {
    console.warn('Using Mock Profile Service - No Real HTTP Calls');
  }
}
