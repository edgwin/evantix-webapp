import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { EventService } from './../../services/event.service';
import { NotificationService } from '../../services/notification.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
    selector: 'app-nuevo-evento',
    templateUrl: './nuevo-evento.component.html',
    styleUrls: ['./nuevo-evento.component.css'],
    standalone: false
})
export class NuevoEventoComponent implements OnInit {
  @ViewChild('swiperRef', { static: false }) swiperRef!: ElementRef;

  loggedUser: any;
  loading = false;
  isEditMode = false;
  editEventId: string | null = null;
  minDate = new Date();

  evento = {
    nombre: '',
    fecha: '',
    tipoEvento: '',
    codigoPais: '+52',
    whatsapp: '',
    email: '',
    mensajeInvitacion: '',
    imagen: null,
  };

  codigosPais = [
    { name: 'México', dialCode: '+52' },
    { name: 'Estados Unidos', dialCode: '+1' },
    { name: 'Canadá', dialCode: '+1' },
    { name: 'Guatemala', dialCode: '+502' },
    { name: 'Belice', dialCode: '+501' },
    { name: 'Honduras', dialCode: '+504' },
    { name: 'El Salvador', dialCode: '+503' },
    { name: 'Nicaragua', dialCode: '+505' },
    { name: 'Costa Rica', dialCode: '+506' },
    { name: 'Panamá', dialCode: '+507' },
    { name: 'Colombia', dialCode: '+57' },
    { name: 'Venezuela', dialCode: '+58' },
    { name: 'Ecuador', dialCode: '+593' },
    { name: 'Perú', dialCode: '+51' },
    { name: 'Bolivia', dialCode: '+591' },
    { name: 'Brasil', dialCode: '+55' },
    { name: 'Chile', dialCode: '+56' },
    { name: 'Argentina', dialCode: '+54' },
    { name: 'Uruguay', dialCode: '+598' },
    { name: 'Paraguay', dialCode: '+595' },
    { name: 'Cuba', dialCode: '+53' },
    { name: 'República Dominicana', dialCode: '+1-809' },
    { name: 'Puerto Rico', dialCode: '+1-787' },
    { name: 'Haití', dialCode: '+509' },
    { name: 'Jamaica', dialCode: '+1-876' },
    { name: 'Trinidad y Tobago', dialCode: '+1-868' },
    { name: 'Guyana', dialCode: '+592' },
    { name: 'Surinam', dialCode: '+597' },
    { name: 'España', dialCode: '+34' },
  ];

  tipoEventoTxtHidden: boolean = true;
  tipoEventoTxt = "";
  tipoEvento = [
    { name: 'Boda' }, { name: 'XV Años' }, { name: 'Graduacion' }, { name: 'Cumpleaños' }, { name: 'Bautizo' },
    { name: 'Primera Comunion' }, { name: 'Confirmacion' }, { name: 'Bodas de Oro' }, { name: 'Bodas de Plata' },
    { name: 'Bodas de Bronce' }, { name: 'Otro' }
  ]

  constructor(
    private eventService: EventService,
    private notificationService: NotificationService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    const localUser = localStorage.getItem('loggedUser');
    if (localUser != null) {
      this.loggedUser = JSON.parse(localUser);
      // Pre-llenar email con el email registrado del usuario
      if (this.loggedUser.email) {
        this.evento.email = this.loggedUser.email;
      }
    }
  }

  terminosHtml = "";
  terminosId = "";

  ngOnInit(): void {
    this.eventService.getTermsAndCoditions().subscribe({
      next: (res: any) => {
        this.terminosHtml = res.text;
        localStorage.setItem('terms_id', res.id);
        localStorage.setItem('terms_text', res.text);
      },
      error: () => {
        this.notificationService.show('error', `Hubo un error favor de comunicarse a soporte`);
      }
    });

    // Check if editing
    this.route.queryParams.subscribe(params => {
      const eventId = params['id'];
      if (eventId) {
        this.isEditMode = true;
        this.editEventId = eventId;
        this.loadEventData(eventId);
      }
    });
  }

  loadEventData(eventId: string) {
    this.loading = true;
    this.eventService.getEventsById(eventId).subscribe({
      next: (res: any) => {
        this.evento.nombre = res.nombre || '';
        this.evento.fecha = res.fechaISO ? new Date(res.fechaISO) as any : '';
        this.evento.email = res.email || '';
        this.evento.whatsapp = res.whatsApp || '';
        this.evento.mensajeInvitacion = res.mensajeInvitacion || '';

        // Handle tipoEvento
        this.evento.tipoEvento = res.tipoEvento || '';
        const matchingTipo = this.tipoEvento.find(t => t.name === res.tipoEvento);
        if (!matchingTipo && res.tipoEvento) {
          this.tipoEventoTxtHidden = false;
        }
        this.aceptaTerminos = true; // Already accepted when created
        this.loading = false;
      },
      error: (err) => {
        this.notificationService.show('error', `Error al cargar evento: ${err.message}`);
        this.loading = false;
      }
    });
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.evento.imagen = file;
    }
  }

  onSubmit() {
    this.loading = true;
    const fechaISO = new Date(this.evento.fecha).toISOString();
    const formData = new FormData();
    formData.append('UserId', this.loggedUser.userId);
    formData.append('Nombre', this.evento.nombre);
    formData.append('TipoEvento', this.evento.tipoEvento);
    formData.append('Fecha', fechaISO);
    const codigoLimpio = this.evento.codigoPais.replace(/[^\d]/g, '');
    const fullWhatsApp = this.isEditMode
      ? this.evento.whatsapp
      : codigoLimpio + this.evento.whatsapp;
    formData.append('WhatsApp', fullWhatsApp);
    formData.append('Email', this.evento.email);
    formData.append('MensajeInvitacion', this.evento.mensajeInvitacion);

    this.terminosId = localStorage.getItem('terms_id') ?? "";
    formData.append('TermsAndConditionsId', this.terminosId);

    if (this.isEditMode && this.editEventId) {
      this.eventService.updateEvent(this.editEventId, formData).subscribe({
        next: () => {
          this.notificationService.show('info', `Evento ${this.evento.nombre} actualizado`);
          this.loading = false;
          this.router.navigateByUrl('/dashboard');
        },
        error: (err) => {
          this.notificationService.show('error', `Error al actualizar: ${err.error}`);
          this.loading = false;
        }
      });
    } else {
      this.eventService.crearEvento(formData).subscribe({
        next: (res: any) => {
          this.notificationService.show('info', `Evento ${this.evento.nombre} creado`);
          this.loading = false;
          // Redirigir a la invitación recién creada en modo vista previa
          const eventName = encodeURIComponent(this.evento.nombre);
          this.router.navigateByUrl(`/invitacion/${eventName}/${res.eventId}?preview=true`);
        },
        error: (err) => {
          this.notificationService.show('error', `Hubo un error al crear el evento ${this.evento.nombre}. \n ${err.error}`);
          this.loading = false;
        }
      });
    }
  }

  cancelar() {
    this.evento = {
      nombre: '',
      fecha: '',
      tipoEvento: '',
      whatsapp: '',
      email: '',
      mensajeInvitacion: '',
      imagen: null,
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
      this.evento.mensajeInvitacion.trim() !== '' &&
      (this.isEditMode || this.aceptaTerminos)
    );
  }

  tipoEventoChange(event: any) {
    if (event.value.toLowerCase() === "otro") {
      this.tipoEventoTxtHidden = false;
      this.evento.tipoEvento = "";
      return;
    }
    this.evento.tipoEvento = event.value;
  }
}
