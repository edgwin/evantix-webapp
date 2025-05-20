import { Component } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  submenuInvitacionesOpen = false;
  submenuConfirmacionesOpen = false;

  toggleInvitacionesSubmenu() {
    this.submenuInvitacionesOpen = !this.submenuInvitacionesOpen;
  }

  toggleConfirmacionesSubmenu() {
    this.submenuConfirmacionesOpen = !this.submenuConfirmacionesOpen;
  }
}
