import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
declare const FB: any;


@Component({
    selector: 'app-topbar',
    templateUrl: './topbar.component.html',
    styleUrl: './topbar.component.css',
    standalone: false
})
export class TopbarComponent {
  svgImage: SafeHtml | null = null;
  loggedUser: any;

  @Input() showMenuButton = false;
  @Output() toggleSidenav = new EventEmitter<void>();

  constructor(private router: Router, private authService: AuthService, private sanitizer: DomSanitizer) {
    const localUser = localStorage.getItem('loggedUser');
    if (localUser != null) {
      this.loggedUser = JSON.parse(localUser);
    }
  }

  ngOnInit() {
    const picture = this.loggedUser?.picture || '';
    
    // Verificamos si es una URL (empieza con http) o un SVG (multiavatar)
    if (picture.startsWith('http')) {
      // Es una imagen externa (Google, Facebook, etc.)
      const dynamicTag = `<img src="${picture}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;" />`;
      this.svgImage = this.sanitizer.bypassSecurityTrustHtml(dynamicTag);
    } else {
      // Es el SVG generado por multiavatar para cuentas locales
      this.svgImage = this.sanitizer.bypassSecurityTrustHtml(picture);
    }
  }

  onLogoff() {
    localStorage.removeItem('loggedUser');
    this.authService.logout();
    // Sign out from Facebook if SDK is loaded
    try { if (typeof FB !== 'undefined') FB.logout(); } catch(e) {}
    this.router.navigateByUrl('/login')
  }

  onToggleSidenav() {
    this.toggleSidenav.emit();
  }
}
