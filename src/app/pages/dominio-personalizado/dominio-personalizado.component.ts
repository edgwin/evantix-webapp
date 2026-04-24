import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CustomDomainService } from '../../services/custom-domain.service';
import { NotificationService } from '../../services/notification.service';
import { MercadoPagoService } from '../../services/mercado-pago.service.service';
import { StripeService } from '../../services/stripe.service';
import { MatDialog } from '@angular/material/dialog';
import { PagoDialogComponent } from '../../component/pago-dialog/pago-dialog.component';
import { InvitadoService } from '../../services/invitado.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-dominio-personalizado',
  templateUrl: './dominio-personalizado.component.html',
  styleUrls: ['./dominio-personalizado.component.css'],
  standalone: false
})
export class DominioPersonalizadoComponent implements OnInit {

  // Event selector
  paidEvents: any[] = [];
  selectedEventId: string = '';
  selectedEventName: string = '';
  loadingEvents: boolean = true;
  isAdmin: boolean = false;
  userEmail: string = '';

  // Domain functionality (mirrors DominioComponent)
  selectedOption: number = 0;
  domainValue: string = '';
  domainError: string = '';
  checking: boolean = false;
  availabilityResult: any = null;
  creating: boolean = false;
  existingDomain: any = null;
  loadingExisting: boolean = false;
  baseDomain: string;
  baseUrl: string;

  constructor(
    private router: Router,
    private domainService: CustomDomainService,
    private notificationService: NotificationService,
    private mercadoPago: MercadoPagoService,
    private stripeService: StripeService,
    private dialog: MatDialog,
    private invitadoService: InvitadoService
  ) {
    const url = new URL(environment.homeUrl);
    this.baseDomain = url.hostname;
    this.baseUrl = environment.homeUrl.replace(/\/$/, '');
  }

  ngOnInit(): void {
    const localUser = localStorage.getItem('loggedUser');
    if (localUser) {
      const user = JSON.parse(localUser);
      this.userEmail = user.email || '';
      this.isAdmin = user?.role?.toUpperCase() === 'ADMIN';
      this.loadPaidEvents(user.userId);
    }

    // Handle payment callback (after redirect from MercadoPago/Stripe)
    const params = new URLSearchParams(window.location.search);
    if (params.get('domain_paid') === 'true' && params.get('status') === 'approved') {
      const val = params.get('domain_val') || '';
      const tipo = parseInt(params.get('domain_tipo') || '2');
      const evId = params.get('eventId') || '';
      const evName = params.get('eventName') || '';
      if (val && evId) {
        this.selectedEventId = evId;
        this.selectedEventName = evName;
        this.domainValue = val;
        this.selectedOption = tipo;
        this.createDomain();
      }
    }
  }

  loadPaidEvents(userId: string) {
    this.loadingEvents = true;
    const obs = this.isAdmin
      ? this.invitadoService.getAllPaidEvents()
      : this.invitadoService.getPaidEvents(userId);

    obs.subscribe({
      next: (events: any[]) => {
        this.paidEvents = events;
        this.loadingEvents = false;
        if (events.length === 1) {
          this.selectedEventId = events[0].id;
          this.selectedEventName = events[0].nombre;
          this.loadExisting();
        }
      },
      error: () => {
        this.notificationService.show('error', 'Error al cargar eventos pagados');
        this.loadingEvents = false;
      }
    });
  }

  onEventChange() {
    const evt = this.paidEvents.find(e => e.id === this.selectedEventId);
    this.selectedEventName = evt?.nombre || '';
    // Reset domain state when event changes
    this.selectedOption = 0;
    this.domainValue = '';
    this.domainError = '';
    this.availabilityResult = null;
    this.existingDomain = null;
    if (this.selectedEventId) {
      this.loadExisting();
    }
  }

  loadExisting() {
    this.loadingExisting = true;
    this.domainService.getByEventId(this.selectedEventId).subscribe({
      next: (domain) => {
        this.existingDomain = domain || null;
        this.loadingExisting = false;
      },
      error: () => {
        this.existingDomain = null;
        this.loadingExisting = false;
      }
    });
  }

  selectOption(opt: number) {
    this.selectedOption = opt;
    this.domainValue = '';
    this.domainError = '';
    this.availabilityResult = null;
    setTimeout(() => {
      const el = document.getElementById('dp-config-form');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
  }

  onDomainInput() {
    this.domainError = '';
    const raw = this.domainValue;
    const pattern = this.selectedOption === 2
      ? /[^a-zA-Z0-9\-\.]/g
      : /[^a-zA-Z0-9\-]/g;
    const sanitized = raw.replace(pattern, '');
    if (sanitized !== raw) {
      this.domainValue = sanitized;
      this.domainError = 'Solo se permiten letras, números y guiones' + (this.selectedOption === 2 ? ' y puntos' : '') + '.';
    }
  }

  private isDomainValid(): boolean {
    const val = this.domainValue.trim().toLowerCase();
    if (!val) { this.domainError = 'Ingresa un valor para tu URL.'; return false; }
    if (val.startsWith('-') || val.endsWith('-')) { this.domainError = 'No puede comenzar ni terminar con guión.'; return false; }
    if (val.length < 3) { this.domainError = 'Debe tener al menos 3 caracteres.'; return false; }
    if (val.length > 63) { this.domainError = 'Máximo 63 caracteres.'; return false; }
    const urlPattern = this.selectedOption === 2
      ? /^[a-z0-9][a-z0-9\-]*[a-z0-9]\.[a-z]{2,}$/
      : /^[a-z0-9][a-z0-9\-]*[a-z0-9]$/;
    if (val.length >= 3 && !urlPattern.test(val)) {
      this.domainError = this.selectedOption === 2 ? 'Formato inválido. Ejemplo: mi-evento.com' : 'Formato inválido. Ejemplo: mi-evento';
      return false;
    }
    this.domainError = '';
    return true;
  }

  getPreviewUrl(): string {
    const val = this.domainValue.trim().toLowerCase();
    if (!val) return '';
    switch (this.selectedOption) {
      case 1: return `https://${val}.${this.baseDomain}`;
      case 2: return `https://www.${val}`;
      case 3: return `${this.baseUrl}/i/${val}`;
      default: return '';
    }
  }

  getOptionLabel(tipo: number): string {
    switch (tipo) {
      case 1: return 'Subdominio';
      case 2: return 'Dominio Personalizado';
      case 3: return 'Vanity URL';
      default: return '';
    }
  }

  getExistingUrl(): string {
    if (!this.existingDomain) return '';
    switch (this.existingDomain.tipoOpcion) {
      case 1: return `https://${this.existingDomain.dominioValor}.${this.baseDomain}`;
      case 2: return `https://www.${this.existingDomain.dominioValor}`;
      case 3: return `${this.baseUrl}/i/${this.existingDomain.dominioValor}`;
      default: return '';
    }
  }

  checkAvailability() {
    if (!this.isDomainValid()) return;
    this.checking = true;
    this.availabilityResult = null;
    this.domainService.checkAvailability(this.selectedOption, this.domainValue.trim()).subscribe({
      next: (res) => { this.availabilityResult = res; this.checking = false; },
      error: () => { this.notificationService.show('error', 'Error al verificar disponibilidad'); this.checking = false; }
    });
  }

  onConfirm() {
    if (this.selectedOption === 2) {
      this.openPaymentDialog();
    } else {
      this.createDomain();
    }
  }

  openPaymentDialog() {
    const price = this.availabilityResult?.finalPrice || 499;
    const dialogRef = this.dialog.open(PagoDialogComponent, {
      width: '500px',
      maxWidth: '95vw',
      data: {
        evento: { id: this.selectedEventId, nombre: `Dominio personalizado: ${this.domainValue}`, costo: price, estatus: 'Pendiente' },
        isCustomDomain: true
      }
    });

    dialogRef.afterClosed().subscribe((metodo: string | null) => {
      if (!metodo) return;
      const callbackUrl = `${window.location.origin}/dominio-personalizado?eventId=${this.selectedEventId}&eventName=${encodeURIComponent(this.selectedEventName)}&domain_paid=true&domain_val=${encodeURIComponent(this.domainValue)}&domain_tipo=${this.selectedOption}`;
      const pagoEvento = {
        id: this.selectedEventId,
        nombre: `Dominio: ${this.domainValue}`,
        description: `Dominio: ${this.domainValue}`,
        externalRef: `dom_${this.selectedEventId}`,
        costo: price,
        callbackUrl,
        externalReference: 'Dominio Personalizado'
      };

      if (metodo.toLowerCase() === 'mercado pago') {
        this.notificationService.show('info', 'Redirigiendo a MercadoPago...');
        this.mercadoPago.createPreference(pagoEvento, false).subscribe({
          next: (res: any) => window.open(res.init_point, '_self'),
          error: () => this.notificationService.show('error', 'Error al crear preferencia de pago')
        });
      } else if (metodo.toLowerCase() === 'stripe') {
        this.notificationService.show('info', 'Redirigiendo a Stripe...');
        this.stripeService.createSession(pagoEvento, false).subscribe({
          next: (res: any) => window.open(res.sessionUrl, '_self'),
          error: () => this.notificationService.show('error', 'Error al crear sesión de pago')
        });
      }
    });
  }

  createDomain() {
    this.creating = true;
    this.domainService.create({
      eventId: this.selectedEventId,
      tipoOpcion: this.selectedOption,
      dominioValor: this.domainValue.trim().toLowerCase(),
      eventName: this.selectedEventName,
      userEmail: this.userEmail
    }).subscribe({
      next: (res) => {
        this.creating = false;
        this.existingDomain = res;
        this.selectedOption = 0;
        const msg = res.estatus === 'Activo'
          ? '🎉 ¡Tu URL personalizada está activa!'
          : '⏳ Tu dominio está siendo configurado. Recibirás una notificación cuando esté listo.';
        this.notificationService.show('info', msg);
      },
      error: () => { this.creating = false; this.notificationService.show('error', 'Error al registrar dominio'); }
    });
  }
}
