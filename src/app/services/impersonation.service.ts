import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ImpersonationService {
  private readonly ORIGINAL_TOKEN_KEY = 'original_access_token';
  private readonly ORIGINAL_REFRESH_KEY = 'original_refresh_token';
  private readonly ORIGINAL_USER_KEY = 'original_loggedUser';
  private readonly IMPERSONATING_KEY = 'is_impersonating';

  constructor(private http: HttpClient) {}

  isImpersonating(): boolean {
    return sessionStorage.getItem(this.IMPERSONATING_KEY) === 'true';
  }

  getImpersonatedUser(): any {
    if (!this.isImpersonating()) return null;
    const user = localStorage.getItem('loggedUser');
    return user ? JSON.parse(user) : null;
  }

  getOriginalAdminUser(): any {
    const user = sessionStorage.getItem(this.ORIGINAL_USER_KEY);
    return user ? JSON.parse(user) : null;
  }

  /** Get all users from Identity API (admin-only) */
  getAllUsers(): Observable<any[]> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
    return this.http.get<any[]>(`${environment.identityApiUrl}/api/User/GetAll`, { headers });
  }

  /** Request an impersonation token from Identity API */
  impersonate(targetUserId: string): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    return this.http.post(`${environment.identityApiUrl}/api/Auth/Impersonate`, {
      targetUserId,
      appId: 1
    }, { headers });
  }

  /** Save current admin session and switch to impersonated session */
  startImpersonation(response: any): void {
    // Save original admin tokens
    sessionStorage.setItem(this.ORIGINAL_TOKEN_KEY, localStorage.getItem('access_token')!);
    sessionStorage.setItem(this.ORIGINAL_REFRESH_KEY, localStorage.getItem('refresh_token') || '');
    sessionStorage.setItem(this.ORIGINAL_USER_KEY, localStorage.getItem('loggedUser')!);
    sessionStorage.setItem(this.IMPERSONATING_KEY, 'true');

    // Replace with impersonated tokens
    localStorage.setItem('access_token', response.access_token);
    if (response.User || response.user) {
      localStorage.setItem('loggedUser', JSON.stringify(response.User || response.user));
    }
    // Remove refresh token — impersonation sessions don't have one
    localStorage.removeItem('refresh_token');
  }

  /** Restore original admin session */
  stopImpersonation(): void {
    const originalToken = sessionStorage.getItem(this.ORIGINAL_TOKEN_KEY);
    const originalRefresh = sessionStorage.getItem(this.ORIGINAL_REFRESH_KEY);
    const originalUser = sessionStorage.getItem(this.ORIGINAL_USER_KEY);

    if (originalToken) {
      localStorage.setItem('access_token', originalToken);
    }
    if (originalRefresh) {
      localStorage.setItem('refresh_token', originalRefresh);
    }
    if (originalUser) {
      localStorage.setItem('loggedUser', originalUser);
    }

    sessionStorage.removeItem(this.ORIGINAL_TOKEN_KEY);
    sessionStorage.removeItem(this.ORIGINAL_REFRESH_KEY);
    sessionStorage.removeItem(this.ORIGINAL_USER_KEY);
    sessionStorage.removeItem(this.IMPERSONATING_KEY);
  }
}
