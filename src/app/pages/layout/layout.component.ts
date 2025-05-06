import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service'

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})
export class LayoutComponent {

  loggedUser: any;
  constructor(private router: Router, private authService: AuthService) {
    const localUser = localStorage.getItem('loggedUser');
    if(localUser != null) {
      this.loggedUser = JSON.parse(localUser);
    }
  }

  onLogoff() {
    localStorage.removeItem('loggedUser');
    this.authService.logout();
    this.router.navigateByUrl('/login')
  }
}
