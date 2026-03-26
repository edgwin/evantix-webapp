import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'Evantix';

  constructor(private router: Router) {}

  ngOnInit(): void {
    const hostname = window.location.hostname;
    const homeUrl = new URL(environment.homeUrl);
    const baseDomain = homeUrl.hostname;

    // Known hosts that should NOT trigger domain resolution
    const knownHosts = [baseDomain, 'localhost', '127.0.0.1'];
    const isKnown = knownHosts.includes(hostname);

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
