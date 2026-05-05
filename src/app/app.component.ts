import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../environments/environment';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrl: './app.component.css',
    standalone: false
})
export class AppComponent implements OnInit {
  title = 'Evantix';
  whatsappExpanded = false;

  toggleWhatsapp(event: Event) {
    // On mobile, tap toggles; on desktop hover handles it via CSS
    event.preventDefault();
    this.whatsappExpanded = !this.whatsappExpanded;
    // If expanded, navigate after a short delay so the button is visible
    if (this.whatsappExpanded) {
      setTimeout(() => {
        window.open('https://wa.me/523314942022?text=Hola%20Evantix%2C%20necesito%20ayuda', '_blank', 'noopener,noreferrer');
        this.whatsappExpanded = false;
      }, 400);
    }
  }

  constructor(private router: Router) {}

  ngOnInit(): void {
    const hostname = window.location.hostname;
    const homeUrl = new URL(environment.homeUrl);
    const baseDomain = homeUrl.hostname;

    // Helper: true for RFC-1918 private/LAN IPs — these are never custom domains
    const isPrivateIp = (host: string): boolean =>
      /^127\./.test(host) ||               // 127.x.x.x loopback
      /^10\./.test(host) ||                // 10.0.0.0/8
      /^192\.168\./.test(host) ||          // 192.168.0.0/16
      /^172\.(1[6-9]|2\d|3[01])\./.test(host); // 172.16.0.0/12

    // Known hosts that should NOT trigger domain resolution
    const knownHosts = [baseDomain, 'localhost', '127.0.0.1'];

    // Tunnel services used for local development (localtunnel, ngrok, cloudflare)
    const isKnownTunnel = (host: string): boolean =>
      host.endsWith('.loca.lt') ||
      host.endsWith('.ngrok-free.app') ||
      host.endsWith('.ngrok.io') ||
      host.endsWith('.ngrok.app') ||
      host.endsWith('.trycloudflare.com');

    const isKnown = knownHosts.includes(hostname) || isPrivateIp(hostname) || isKnownTunnel(hostname);
    console.log('AppComponent: hostname=', hostname, 'isKnown=', isKnown);

    if (!isKnown) {
      // If URL already has a valid route (e.g. /invitacion/...), let Angular handle it
      const path = window.location.pathname;
      if (path.startsWith('/invitacion/') || path.startsWith('/i/')) {
        return; // Angular routing will handle it
      }
      // Capture path segment as potential idInvitacion (e.g. /VSSD → VSSD)
      const pathSegment = path.replace(/^\/+/, '').replace(/\/+$/, '');
      const queryParams: any = {};
      if (pathSegment) {
        queryParams.inv = pathSegment;
      }
      this.router.navigate(['/resolve-domain'], { queryParams });
    }
  }
}
