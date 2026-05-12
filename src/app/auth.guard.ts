import { Inject, Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private auth: AuthService,
    @Inject(Router) private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const url = state.url;

    // ✅ Permitir rutas públicas de invitación y resolución de dominios
    if (url.startsWith('/invitacion') || 
        url.startsWith('/resolve-domain') || 
        url.startsWith('/i/')) {
      return true;
    }

    // 🚫 Bloquear el resto si no está logueado
    if (this.auth.isLoggedIn()) {
      return true;
    } else {
      this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
      return false;
    }
  }
}
