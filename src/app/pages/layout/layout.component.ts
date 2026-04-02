import { Component, HostListener, OnInit } from '@angular/core';

@Component({
    selector: 'app-layout',
    templateUrl: './layout.component.html',
    styleUrl: './layout.component.css',
    standalone: false
})
export class LayoutComponent implements OnInit {
  sidenavOpen = true;
  isMobile = false;

  ngOnInit(): void {
    this.checkScreenSize();
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
