import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { EventService } from './../../services/event.service';
import { NotificationService } from '../../services/notification.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-nuevo-evento',
  templateUrl: './nuevo-evento.component.html',
  styleUrls: ['./nuevo-evento.component.css']
})
export class NuevoEventoComponent implements AfterViewInit {
  @ViewChild('swiperRef', { static: false }) swiperRef!: ElementRef;
  
  loggedUser: any;

  evento = {
    nombre: '',
    fecha: '',
    lugar: '',
    whatsapp: '',
    email: '',
    plan: '',
    imagen: null,
    costo: 0
  };

  planes = [
    { nombre: 'basico', imagen: 'assets/PlanBasico.jpg' },
    { nombre: 'pro', imagen: 'assets/PlanPro.jpg' },
    { nombre: 'gold', imagen: 'assets/PlanGold.jpg' },
    { nombre: 'black', imagen: 'assets/PlanBlack.jpg' }
  ];

  constructor(private eventService: EventService, private notificationService: NotificationService, private router: Router) {
    const localUser = localStorage.getItem('loggedUser');
    if(localUser != null) {
      this.loggedUser = JSON.parse(localUser);
    }
  }

  ngAfterViewInit() {
    const swiperEl = this.swiperRef.nativeElement;

    // Escuchar evento personalizado
    swiperEl.addEventListener('slidechange', (event: any) => {
      const activeIndex = swiperEl.swiper?.activeIndex || 0;
      const selectedPlan = this.planes[activeIndex % this.planes.length];
      this.evento.plan = selectedPlan.nombre;
    });
  }

  seleccionarPlan(plan: any) {
    this.evento.plan = plan.nombre;
  }
  
  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.evento.imagen = file;
    }
  }

  onSubmit() {
    if (!this.evento.plan) {
      alert('Por favor selecciona un plan.');
      return;
    }
    const formData = new FormData();
    formData.append('UserId', this.loggedUser.userId);
    formData.append('Nombre', this.evento.nombre);
    formData.append('Fecha', this.evento.fecha);
    formData.append('Lugar', this.evento.lugar); //
    formData.append('WhatsApp', this.evento.whatsapp);
    formData.append('Email', this.evento.email);
    formData.append('Plan', this.evento.plan);
    let costo = 0;
    switch (this.evento.plan) {
      case 'basico': { costo = 1699; break; }
      case 'pro': { costo = 2299; break; }
      case 'gold': { costo = 3499; break; }
      case 'black': { costo = 4499; break; }
    }
    formData.append('Costo', costo.toString());
    if (this.evento.imagen) {
      formData.append('Imagen', this.evento.imagen);
    }

    this.eventService.crearEvento(formData).subscribe({
      next: () => {
        this.notificationService.show('info',`Evento ${this.evento.nombre} creado`);        
        this.cancelar();
        this.router.navigateByUrl('/dashboard');
      },
      error: err => {
        console.error('Error al crear evento', err);
        this.notificationService.show('error',`Hubo un error al crear el evento ${this.evento.nombre}`);         
      }
    });
  }

  cancelar() {
    this.evento = {
      nombre: '',
      fecha: '',
      lugar: '',
      whatsapp: '',
      email: '',
      plan: '',
      imagen: null,
      costo: 0
    };
  }
}
