import { Component } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.css'
})
export class TopbarComponent {
  svgImage: SafeHtml | null = null;
  isSocial:boolean = false;

  loggedUser: any;
  
  constructor(private router: Router, private authService: AuthService, private sanitizer: DomSanitizer) {
    const localUser = localStorage.getItem('loggedUser');
    if(localUser != null) {
      this.loggedUser = JSON.parse(localUser);
    }
  }

  ngOnInit() {
    const rawSvg = this.loggedUser?.picture;
    if (!this.loggedUser.isSocial){
      this.svgImage = this.sanitizer.bypassSecurityTrustHtml(rawSvg || '');
    }else{
      const dynamicTag = `<img src="${this.loggedUser?.picture}" style="width:32px; height:32px; border-radius:50%; object-fit:cover;" />`;
      this.svgImage = this.sanitizer.bypassSecurityTrustHtml(dynamicTag || '');
    }
  }

  onLogoff() {
    localStorage.removeItem('loggedUser');
    this.authService.logout();
    this.router.navigateByUrl('/login')
  }
}
