// auth.interceptor.ts
import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, EMPTY } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { NotificationService } from '../services/notification.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private router: Router, private notificationService: NotificationService) {}

  // Public endpoints that don't use auth — 403 here means a business error, not expired session
  private readonly publicPaths = ['/CheckIn/', '/Invitacion/'];

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((err: HttpErrorResponse) => {
        if (err.status === 401 || err.status === 403) {
          const isPublic = this.publicPaths.some(p => req.url.includes(p));
          if (!isPublic) {
            this.notificationService.show('info','Tu sesión ha expirado, por favor inicia sesión nuevamente.');
            localStorage.removeItem('access_token');
            localStorage.removeItem('loggedUser');
            this.router.navigate(['/login']);
            return EMPTY;
          }
        }
        return throwError(() => err);
      })
    );
  }
}

