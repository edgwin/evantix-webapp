import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { EventService } from './../../services/event.service';
import { NotificationService } from '../../services/notification.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-nuevo-evento',
  templateUrl: './nuevo-evento.component.html',
  styleUrls: ['./nuevo-evento.component.css']
})
export class NuevoEventoComponent implements OnInit {
  @ViewChild('swiperRef', { static: false }) swiperRef!: ElementRef;
  
  loggedUser: any;
  loading = false;
  titlecase:string = 'Sin selecciona';
  evento = {
    nombre: '',
    fecha: '',
    tipoEvento: '',
    codigoPais: '+52',
    whatsapp: '',
    email: '',
    //plan: '',
    imagen: null,
    //costo: 0
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

  tipoEventoTxtHidden :boolean = true;
  tipoEventoTxt = "";
  tipoEvento = [
    {name: 'Boda'}, {name:'XV Años'}, {name: 'Graduacion'}, {name:'Cumpleaños'}, {name:'Bautizo'},
    {name:'Primera Comunion'}, {name:'Confirmacion'}, {name:'Bodas de Oro'}, {name:'Bodas de Plata'}, 
    {name:'Bodas de Bronce'}, {name:'Otro'}
  ]
  
  //plans: any = [];

  constructor(private eventService: EventService, private notificationService: NotificationService, private router: Router) {
    const localUser = localStorage.getItem('loggedUser');
    if(localUser != null) {
      this.loggedUser = JSON.parse(localUser);
    }
   }
  
  terminosHtml = "";
  terminosId = "";
  ngOnInit(): void {
    this.eventService.getTermsAndCoditions().subscribe({
      next: (res:any) => {
        this.terminosHtml = res.text;
        localStorage.setItem('terms_id', res.id);
        localStorage.setItem('terms_text', res.text);
      },
      error: () => {
        this.notificationService.show('error',`Hubo un error favor de comunicarse a soporte`);
      }
    });
    //
    // this.eventService.getPlans().subscribe({
    //   next: (res:any) => {
    //     this.plans = res;
    //   },
    //   error: () => {
    //     this.notificationService.show('error',`Hubo un error favor de comunicarse a soporte`);
    //   }
    // });
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.evento.imagen = file;
    }
  }

  // seleccionarPlan(plan: any) {
  //   this.evento.plan = plan.title;
  //   this.evento.costo = plan.price;
  // }

  onSubmit() {    
    // if (!this.evento.plan) {
    //   alert('Por favor selecciona un plan.');
    //   return;
    // }    
    this.loading = true;
    const fechaISO = new Date(this.evento.fecha).toISOString();
    const formData = new FormData();
    formData.append('UserId', this.loggedUser.userId);
    formData.append('Nombre', this.evento.nombre);
    formData.append('TipoEvento', this.evento.tipoEvento);
    formData.append('Fecha', fechaISO);
    formData.append('WhatsApp', this.evento.whatsapp);
    formData.append('Email', this.evento.email);
    // formData.append('Plan', this.evento.plan);    
    // formData.append('Costo', this.evento.costo.toString());
    // if (this.evento.imagen) {
    //   formData.append('Imagen', this.evento.imagen);
    // }

    this.terminosId = localStorage.getItem('terms_id') ?? "";
    formData.append('TermsAndConditionsId', this.terminosId)
    this.eventService.crearEvento(formData).subscribe({
      next: () => {
        this.notificationService.show('info',`Evento ${this.evento.nombre} creado`);        
        this.loading = false;
        this.cancelar();
        this.router.navigateByUrl('/dashboard');        
      },
      error: (err) => {        
        this.notificationService.show('error',`Hubo un error al crear el evento ${this.evento.nombre}. \n ${err.error}`);
        this.loading = false;
      }
    });
  }

  cancelar() {
    this.evento = {
      nombre: '',
      fecha: '',
      tipoEvento: '',
      whatsapp: '',
      email: '',
      //plan: '',
      imagen: null,
      //costo: 0,      
      codigoPais: '+52'
    };
    this.router.navigateByUrl('/dashboard');
  }
  
  showPopup = false;

  openPopup() {
    this.showPopup = true;
  }
  
  checkBoxClick() {
    this.aceptaTerminos = !this.aceptaTerminos;
  }

  aceptaTerminos = false;
  get isFormValid(): boolean {
    return (
      this.evento.nombre.trim() !== '' &&
      this.evento.fecha !== '' &&
      this.evento.whatsapp.trim() !== '' &&
      this.evento.email.trim() !== '' &&
      this.evento.tipoEvento.trim() !== '' &&
      this.aceptaTerminos
    );
  }

  tipoEventoChange(event:any){    
    if (event.value.toLowerCase() === "otro"){
      this.tipoEventoTxtHidden = false;
      this.evento.tipoEvento = "";
      return
    }
    this.evento.tipoEvento = event.value;
  }
}
