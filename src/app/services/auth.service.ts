import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError, BehaviorSubject } from 'rxjs';
import { tap, switchMap, catchError, filter, take } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private refreshTokenInProgress = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(private http: HttpClient) {}

  isLoggedIn(): boolean {
    return !!localStorage.getItem('access_token');
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  logout(): void {
    const refreshToken = this.getRefreshToken();
    // Revoke refresh token on server if available
    if (refreshToken) {
      this.http.post(`${environment.identityApiUrl}/api/Auth/RevokeToken`, { token: refreshToken })
        .subscribe({ error: () => {} }); // fire-and-forget
    }
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('loggedUser');
  }

  storeTokens(response: any): void {
    if (response.access_token) {
      localStorage.setItem('access_token', response.access_token);
    }
    if (response.refresh_token) {
      localStorage.setItem('refresh_token', response.refresh_token);
    }
    if (response.User || response.user) {
      localStorage.setItem('loggedUser', JSON.stringify(response.User || response.user));
    }
  }

  /**
   * Attempt to refresh the access token using the stored refresh token.
   * Returns an observable that emits the new token response or errors.
   */
  refreshAccessToken(): Observable<any> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http.post(`${environment.identityApiUrl}/api/Auth/RefreshToken`, { token: refreshToken })
      .pipe(
        tap((response: any) => {
          this.storeTokens(response);
        }),
        catchError(err => {
          this.logout();
          return throwError(() => err);
        })
      );
  }

  /**
   * Handles concurrent refresh requests by queuing them behind a single refresh call.
   * Returns an observable that resolves when the refresh is complete.
   */
  handleTokenRefresh(): Observable<any> {
    if (this.refreshTokenInProgress) {
      // Wait for the ongoing refresh to complete
      return this.refreshTokenSubject.pipe(
        filter(result => result !== null),
        take(1)
      );
    }

    this.refreshTokenInProgress = true;
    this.refreshTokenSubject.next(null);

    return this.refreshAccessToken().pipe(
      tap(result => {
        this.refreshTokenInProgress = false;
        this.refreshTokenSubject.next(result);
      }),
      catchError(err => {
        this.refreshTokenInProgress = false;
        this.refreshTokenSubject.next(null);
        return throwError(() => err);
      })
    );
  }
}
