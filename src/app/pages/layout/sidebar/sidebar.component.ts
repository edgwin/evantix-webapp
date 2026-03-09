import { Component, EventEmitter, OnInit, OnDestroy, Output } from '@angular/core';
import { NavigationEnd, Router, Event } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { LocalStorageService } from '../../../services/local-storage.service'

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit, OnDestroy {
  submenuInvitacionesOpen = false;
  submenuConfirmacionesOpen = false;
  selectedRoute: string = '';
  showInvitados: boolean = false;

  @Output() menuItemClicked = new EventEmitter<void>();

  private sub: Subscription = new Subscription();

  constructor(private router: Router, private storageService: LocalStorageService) { }

  ngOnInit(): void {
    this.sub.add(
      this.storageService.showInvitados$.subscribe(value => {
        this.showInvitados = value;
      })
    );

    this.selectedRoute = this.router.url;
    this.sub.add(
      this.router.events.pipe(
        filter((event: Event): event is NavigationEnd => event instanceof NavigationEnd)
      ).subscribe((event: NavigationEnd) => {
        this.selectedRoute = event.urlAfterRedirects;
      })
    );
  }

  toggleInvitacionesSubmenu() {
    this.submenuInvitacionesOpen = !this.submenuInvitacionesOpen;
  }

  toggleConfirmacionesSubmenu() {
    this.submenuConfirmacionesOpen = !this.submenuConfirmacionesOpen;
  }

  selectRoute(route: string) {
    if (route === '/invitados') {
      this.menuItemClicked.emit();
      return;
    }
    this.selectedRoute = route;
    this.menuItemClicked.emit();
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
