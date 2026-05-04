import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HTTP_INTERCEPTORS, HttpClient, HttpErrorResponse } from '@angular/common/http';
import { AuthInterceptor } from './auth.interceptor';
import { Router } from '@angular/router';
import { NotificationService } from '../services/notification.service';
import { AuthService } from '../services/auth.service';
import { of, throwError } from 'rxjs';

describe('AuthInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockNotificationService: jasmine.SpyObj<NotificationService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockNotificationService = jasmine.createSpyObj('NotificationService', ['show']);
    mockAuthService = jasmine.createSpyObj('AuthService', ['handleTokenRefresh', 'getToken', 'logout']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
        { provide: Router, useValue: mockRouter },
        { provide: NotificationService, useValue: mockNotificationService },
        { provide: AuthService, useValue: mockAuthService }
      ]
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should pass through successful requests', () => {
    httpClient.get('/api/test').subscribe(data => {
      expect(data).toBeTruthy();
    });

    const req = httpMock.expectOne('/api/test');
    req.flush({ success: true });
  });

  it('should not intercept 401 on public paths', () => {
    httpClient.get('/api/Invitacion/test').subscribe({
      error: (err) => {
        expect(err.status).toBe(401);
      }
    });

    const req = httpMock.expectOne('/api/Invitacion/test');
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
  });

  it('should redirect to login on 403 for non-public paths', () => {
    httpClient.get('/api/Event/test').subscribe({
      error: () => {},
      complete: () => {}
    });

    const req = httpMock.expectOne('/api/Event/test');
    req.flush('Forbidden', { status: 403, statusText: 'Forbidden' });

    expect(mockNotificationService.show).toHaveBeenCalled();
    expect(mockAuthService.logout).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should not redirect on 403 for public paths', () => {
    httpClient.get('/api/CheckIn/test').subscribe({
      error: (err) => {
        expect(err.status).toBe(403);
      }
    });

    const req = httpMock.expectOne('/api/CheckIn/test');
    req.flush('Forbidden', { status: 403, statusText: 'Forbidden' });

    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });
});
