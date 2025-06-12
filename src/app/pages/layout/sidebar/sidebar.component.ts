import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router, Event } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent implements OnInit  {
  submenuInvitacionesOpen = false;
  submenuConfirmacionesOpen = false;
  selectedRoute : string = '';

  constructor(private router: Router) {}
  
  ngOnInit(): void {
    this.selectedRoute = this.router.url;
    this.router.events.pipe(
      filter((event: Event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.selectedRoute = event.urlAfterRedirects;
    });
  }
  toggleInvitacionesSubmenu() {
    this.submenuInvitacionesOpen = !this.submenuInvitacionesOpen;
  }

  toggleConfirmacionesSubmenu() {
    this.submenuConfirmacionesOpen = !this.submenuConfirmacionesOpen;
  }

  selectRoute(route: string) {
    this.selectedRoute = route;
  }
}
