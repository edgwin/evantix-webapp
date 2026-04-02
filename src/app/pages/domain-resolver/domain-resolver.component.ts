import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomDomainService } from '../../services/custom-domain.service';
import { environment } from '../../../environments/environment';


@Component({
    selector: 'app-domain-resolver',
    imports: [],
    template: `
    @if (loading) {
      <div class="resolver-container">
        <div class="spinner"></div>
        <p>Cargando invitación...</p>
      </div>
    }
    @if (error) {
      <div class="resolver-container error">
        <h2>😕 No encontramos una invitación aquí</h2>
        <p>{{ error }}</p>
        <a href="/">Ir al inicio</a>
      </div>
    }
    `,
    styles: [`
    .resolver-container {
      display: flex; flex-direction: column; align-items: center;
      justify-content: center; height: 100vh; font-family: 'Inter', sans-serif;
      color: #666;
    }
    .spinner {
      width: 48px; height: 48px; border: 4px solid #eee;
      border-top-color: #338da2; border-radius: 50%;
      animation: spin 0.7s linear infinite; margin-bottom: 20px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .error h2 { color: #1a1a2e; }
    .error a {
      margin-top: 16px; padding: 12px 32px; background: #338da2;
      color: #fff; text-decoration: none; border-radius: 10px;
    }
  `]
})
export class DomainResolverComponent implements OnInit {
  loading = true;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private domainService: CustomDomainService
  ) {}

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug');
    // idInvitado can come from route param (vanity: /i/:slug/:idInvitado)
    // or from query param (subdomain/domain: ?inv=VSSD)
    const idInvitado = this.route.snapshot.paramMap.get('idInvitado')
      || this.route.snapshot.queryParamMap.get('inv')
      || null;

    if (slug) {
      // Vanity URL: /i/:slug or /i/:slug/:idInvitado
      this.resolveSlug(slug, idInvitado);
    } else {
      // Custom domain/subdomain detection
      this.resolveHostname(idInvitado);
    }
  }

  private resolveSlug(slug: string, idInvitado: string | null) {
    this.domainService.resolveSlug(slug).subscribe({
      next: (res: any) => {
        this.redirectToInvitation(res, idInvitado);
      },
      error: () => {
        this.loading = false;
        this.error = 'La URL no está asociada a ninguna invitación activa.';
      }
    });
  }

  private resolveHostname(idInvitado: string | null) {
    const hostname = window.location.hostname;
    const homeUrl = new URL(environment.homeUrl);
    const baseDomain = homeUrl.hostname;

    // Check if we're on the normal domain — if so, nothing to resolve
    if (hostname === baseDomain || hostname === 'localhost') {
      this.loading = false;
      this.error = 'No se encontró una invitación en este dominio.';
      return;
    }

    // Check if it's a subdomain of baseDomain (option 1)
    // e.g. boda.evantix.com → subdomain = "boda"
    if (hostname.endsWith('.' + baseDomain)) {
      const subdomain = hostname.replace('.' + baseDomain, '');
      this.domainService.resolveDomain(subdomain).subscribe({
        next: (res: any) => this.redirectToInvitation(res, idInvitado),
        error: () => {
          this.loading = false;
          this.error = `El subdominio "${subdomain}" no tiene una invitación configurada.`;
        }
      });
      return;
    }

    // Otherwise it's a full custom domain (option 2)
    this.domainService.resolveDomain(hostname).subscribe({
      next: (res: any) => this.redirectToInvitation(res, idInvitado),
      error: () => {
        this.loading = false;
        this.error = `El dominio "${hostname}" no tiene una invitación configurada.`;
      }
    });
  }

  private redirectToInvitation(res: any, idInvitado: string | null) {
    const name = this.replaceNameForUrl(res.eventName);
    if (idInvitado) {
      // With guest ID: navigate to personalized invitation
      this.router.navigate(['/invitacion', name, res.eventId, idInvitado]);
    } else {
      // Without guest ID: navigate to invitation
      this.router.navigate(['/invitacion', name, res.eventId]);
    }
  }

  private replaceNameForUrl(name: string): string {
    return name.replace(/\s+/g, '_');
  }
}
