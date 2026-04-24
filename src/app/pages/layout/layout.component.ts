import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';

@Component({
    selector: 'app-layout',
    templateUrl: './layout.component.html',
    styleUrl: './layout.component.css',
    standalone: false
})
export class LayoutComponent implements OnInit, OnDestroy {
  sidenavOpen = true;
  isMobile = false;
  showMobileBanner = false;

  ngOnInit(): void {
    this.checkScreenSize();
    document.body.style.overflow = 'hidden';
  }

  ngOnDestroy(): void {
    document.body.style.overflow = '';
  }

  @HostListener('window:resize')
  onResize() {
    this.checkScreenSize();
  }

  private checkScreenSize() {
    this.isMobile = window.innerWidth <= 768;
    if (this.isMobile) {
      this.sidenavOpen = false;
      // Mostrar banner a menos que el usuario ya lo descartó esta sesión
      const dismissed = sessionStorage.getItem('mobileBannerDismissed');
      this.showMobileBanner = !dismissed;
    } else {
      this.sidenavOpen = true;
      this.showMobileBanner = false;
    }
  }

  dismissMobileBanner() {
    sessionStorage.setItem('mobileBannerDismissed', '1');
    this.showMobileBanner = false;
  }

  onMenuItemClicked() {
    if (this.isMobile) {
      this.sidenavOpen = false;
    }
  }
}
