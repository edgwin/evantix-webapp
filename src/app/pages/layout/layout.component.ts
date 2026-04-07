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

  ngOnInit(): void {
    this.checkScreenSize();
    // Prevent body from scrolling — only .main-content should scroll
    document.body.style.overflow = 'hidden';
  }

  ngOnDestroy(): void {
    // Restore body scroll for pages outside the layout (login, landing, etc.)
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
    } else {
      this.sidenavOpen = true;
    }
  }

  onMenuItemClicked() {
    if (this.isMobile) {
      this.sidenavOpen = false;
    }
  }
}
