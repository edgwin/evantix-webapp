import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { EventService } from './../../services/event.service';
import { NotificationService } from '../../services/notification.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-nuevo-evento',
  templateUrl: './nuevo-evento.component.html',
  styleUrls: ['./nuevo-evento.component.css']
})
export class NuevoEventoComponent implements AfterViewInit, OnInit {
  @ViewChild('swiperRef', { static: false }) swiperRef!: ElementRef;
  
  loggedUser: any;

  evento = {
    nombre: '',
    fecha: '',
    hora: '',
    lugar: '',
    codigoPais: '+52',
    whatsapp: '',
    email: '',
    plan: '',
    imagen: null,
    costo: 0
  };

  codigosPais = [
    { name: 'México', dialCode: '+52' },
    { name: 'Estados Unidos', dialCode: '+1' },
    { name: 'Colombia', dialCode: '+57' },
    { name: 'Argentina', dialCode: '+54' },
    { name: 'España', dialCode: '+34' },
    { name: 'Chile', dialCode: '+56' },
    { name: 'Perú', dialCode: '+51' },
    { name: 'Ecuador', dialCode: '+593' },
    // agrega los que necesites
  ];
  planes = [
    { nombre: 'basic', imagen: 'assets/PlanBasico.jpg' },
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
  
  terminosHtml = "";
  terminosId = "";
  ngOnInit(): void {
    const userId = this.loggedUser.userId; 
    this.eventService.getTermsAndCoditions().subscribe({
      next: (res:any) => {
        this.terminosHtml = res.text;
        localStorage.setItem('terms_id', res.id);
        localStorage.setItem('terms_text', res.text);
      },
      error: err => {
        
      }
    });
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

  getLocalDateTimeString(fecha: Date): string {
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    const hours = String(fecha.getHours()).padStart(2, '0');
    const minutes = String(fecha.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  onSubmit() {
    if (!this.evento.plan) {
      alert('Por favor selecciona un plan.');
      return;
    }
    const fecha = new Date(this.evento.fecha);
    const [hora, minutos] = this.evento.hora.split(':');
    fecha.setHours(+hora);
    fecha.setMinutes(+minutos);
    const formData = new FormData();
    formData.append('UserId', this.loggedUser.userId);
    formData.append('Nombre', this.evento.nombre);
    formData.append('Fecha', this.getLocalDateTimeString(fecha));
    formData.append('Lugar', this.evento.lugar); //
    formData.append('WhatsApp', this.evento.whatsapp);
    formData.append('Email', this.evento.email);
    formData.append('Plan', this.evento.plan);
    let costo = 0;
    switch (this.evento.plan) {
      case 'basic': { costo = 1699; break; }
      case 'pro': { costo = 2299; break; }
      case 'gold': { costo = 3499; break; }
      case 'black': { costo = 4499; break; }
    }
    formData.append('Costo', costo.toString());
    if (this.evento.imagen) {
      formData.append('Imagen', this.evento.imagen);
    }

    this.terminosId = localStorage.getItem('terms_id') ?? "";
    formData.append('TermsAndConditionsId', this.terminosId)
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
      hora: '',
      lugar: '',
      whatsapp: '',
      email: '',
      plan: '',
      imagen: null,
      costo: 0,      
      codigoPais: '+52'
    };
    this.router.navigateByUrl('/dashboard');
  }
  
  showPopup = false;
  disabledSaveBtn = true;

  openPopup() {
    this.showPopup = true;
  }

  checkBoxClick(){
    this.disabledSaveBtn = !this.disabledSaveBtn
  }
}
