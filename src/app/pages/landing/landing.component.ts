import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';

@Component({
    selector: 'app-landing',
    templateUrl: './landing.component.html',
    styleUrls: ['./landing.component.css'],
    standalone: false
})
export class LandingComponent {

  constructor(private router: Router, private meta: Meta, private title: Title) {
    // SEO
    this.title.setTitle('Evantix — Crea Invitaciones Digitales para tus Eventos en Minutos');
    this.meta.updateTag({ name: 'description', content: 'Evantix te permite crear invitaciones digitales personalizadas para bodas, XV años, bautizos y más. Diseños elegantes, IA integrada y gestión de invitados desde $999 MXN.' });
    this.meta.updateTag({ name: 'keywords', content: 'invitaciones digitales, invitaciones boda, invitaciones XV años, eventos, RSVP digital, mesa de invitados, Evantix' });
    this.meta.updateTag({ property: 'og:title', content: 'Evantix — Invitaciones Digitales Inteligentes' });
    this.meta.updateTag({ property: 'og:description', content: 'Crea invitaciones digitales personalizadas para todos tus eventos. Desde $999 MXN. Si no te enamoras de tu invitación, no pagas.' });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ name: 'robots', content: 'index, follow' });
  }

  goToLogin() {
    this.router.navigate(['/login'], { queryParams: { signIn: 'true' } });
  }

  goToRegister() {
    this.router.navigate(['/login'], { queryParams: { signIn: 'false' } });
  }

  scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }
}
