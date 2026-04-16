// auth.interceptor.ts
import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, EMPTY } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { NotificationService } from '../services/notification.service';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private router: Router,
    private notificationService: NotificationService,
    private authService: AuthService
  ) {}

  // Endpoints where 403 means a business error, not an expired session
  private readonly publicPaths = ['/CheckIn/', '/Invitacion/', '/Ai/'];
  // Endpoints that should NOT trigger a refresh (to avoid infinite loops)
  private readonly noRefreshPaths = ['/Auth/RefreshToken', '/Auth/Authentication', '/Auth/RevokeToken'];

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((err: HttpErrorResponse) => {
        const isPublic = this.publicPaths.some(p => req.url.includes(p));
        const isAuthEndpoint = this.noRefreshPaths.some(p => req.url.includes(p));

        if (err.status === 401 && !isPublic && !isAuthEndpoint) {
          // Token expired — attempt silent refresh
          return this.authService.handleTokenRefresh().pipe(
            switchMap(() => {
              // Retry the original request with the new token
              const newToken = this.authService.getToken();
              const clonedReq = req.clone({
                setHeaders: { Authorization: `Bearer ${newToken}` }
              });
              return next.handle(clonedReq);
            }),
            catchError(refreshErr => {
              // Refresh failed — redirect to login
              this.notificationService.show('info', 'Tu sesión ha expirado, por favor inicia sesión nuevamente.');
              this.authService.logout();
              this.router.navigate(['/login']);
              return EMPTY;
            })
          );
        }

        if (err.status === 403 && !isPublic) {
          this.notificationService.show('info', 'Tu sesión ha expirado, por favor inicia sesión nuevamente.');
          this.authService.logout();
          this.router.navigate(['/login']);
          return EMPTY;
        }

        return throwError(() => err);
      })
    );
  }
}
