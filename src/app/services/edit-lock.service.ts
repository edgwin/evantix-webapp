import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class EditLockService implements OnDestroy {
  private apiUrl = `${environment.coreApiUrl}/api/Event`;
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;
  private currentEventId: string | null = null;

  /** UUID único por instancia (por pestaña/dispositivo). Persiste mientras la pestaña está abierta. */
  private readonly sessionId: string = this.newSessionId();

  /** Listener de beforeunload para liberar el lock al cerrar la pestaña. */
  private readonly beforeUnloadListener = () => this.beaconRelease();

  constructor(private http: HttpClient) {
    window.addEventListener('beforeunload', this.beforeUnloadListener);
  }

  private newSessionId(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    return `sess_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  private headers(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'X-Edit-Session-Id': this.sessionId
    });
  }

  /** Tries to acquire the edit lock. Returns {acquired, holderEmail}. */
  acquire(eventId: string): Observable<{ acquired: boolean; holderEmail?: string }> {
    return this.http
      .post<{ acquired: boolean; holderEmail?: string }>(
        `${this.apiUrl}/AcquireEditLock/${eventId}`,
        {},
        { headers: this.headers() }
      )
      .pipe(
        catchError(err => {
          // Solo bloquear cuando el backend confirma un conflicto real (409)
          if (err.status === 409 && err.error?.acquired === false) {
            return of(err.error as { acquired: boolean; holderEmail?: string });
          }
          // Cualquier otro error (404, 500, red) → fail-open: permitir edición
          console.warn('[EditLock] acquire failed with status', err.status, '— allowing edit (fail-open)');
          return of({ acquired: true });
        })
      );
  }

  /** Releases the lock using a normal HTTP request (for normal navigation). */
  release(eventId: string): Observable<void> {
    return this.http
      .post<void>(
        `${this.apiUrl}/ReleaseEditLock/${eventId}?sid=${encodeURIComponent(this.sessionId)}`,
        {},
        { headers: this.headers() }
      )
      .pipe(catchError(() => of(undefined as any)));
  }

  /**
   * Libera el lock usando navigator.sendBeacon — garantizado por el browser
   * incluso si la pestaña se está cerrando. sendBeacon no admite headers personalizados
   * por eso el sessionId va como query param.
   */
  private beaconRelease(): void {
    if (!this.currentEventId) return;
    const url = `${this.apiUrl}/ReleaseEditLock/${this.currentEventId}?sid=${encodeURIComponent(this.sessionId)}`;
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      navigator.sendBeacon(url);
    }
  }

  /** Starts sending heartbeats every 12 seconds to keep the lock alive (TTL = 30s). */
  startHeartbeat(eventId: string): void {
    this.stopHeartbeat();
    this.currentEventId = eventId;
    this.heartbeatInterval = setInterval(() => {
      this.http
        .post(`${this.apiUrl}/HeartbeatEditLock/${eventId}`, {}, { headers: this.headers() })
        .pipe(catchError(() => of(null)))
        .subscribe();
    }, 12_000);
  }

  /** Stops the heartbeat timer but does NOT release the lock. */
  stopHeartbeat(): void {
    if (this.heartbeatInterval !== null) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /** Stops heartbeat AND releases the lock via HTTP. */
  stopAndRelease(): void {
    this.stopHeartbeat();
    if (this.currentEventId) {
      this.release(this.currentEventId).subscribe();
      this.currentEventId = null;
    }
  }

  ngOnDestroy(): void {
    window.removeEventListener('beforeunload', this.beforeUnloadListener);
    this.stopAndRelease();
  }
}
