import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomDomainService } from '../../services/custom-domain.service';
import { NotificationService } from '../../services/notification.service';
import { MercadoPagoService } from '../../services/mercado-pago.service.service';
import { StripeService } from '../../services/stripe.service';
import { MatDialog } from '@angular/material/dialog';
import { PagoDialogComponent } from '../../component/pago-dialog/pago-dialog.component';
import { environment } from '../../../environments/environment';

@Component({
    selector: 'app-dominio',
    templateUrl: './dominio.component.html',
    styleUrls: ['./dominio.component.css'],
    standalone: false
})
export class DominioComponent implements OnInit {
  eventId = '';
  eventName = '';
  userEmail = '';
  selectedOption: number = 0;
  domainValue = '';
  domainError = '';
  checking = false;
  availabilityResult: any = null;
  creating = false;
  existingDomain: any = null;
  loadingExisting = true;
  baseDomain: string;
  baseUrl: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private domainService: CustomDomainService,
    private notificationService: NotificationService,
    private mercadoPago: MercadoPagoService,
    private stripeService: StripeService,
    private dialog: MatDialog
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
    }

    this.route.queryParams.subscribe(params => {
      this.eventId = params['eventId'] || '';
      this.eventName = params['eventName'] || '';
      if (this.eventId) {
        this.loadExisting();
      } else {
        this.loadingExisting = false;
      }
    });
  }

  loadExisting() {
    this.loadingExisting = true;
    this.domainService.getByEventId(this.eventId).subscribe({
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
  }

  /** Sanitize input: strip invalid chars in real-time */
  onDomainInput() {
    this.domainError = '';
    const raw = this.domainValue;
    // Option 2 (custom domain) allows dots; options 1 & 3 do not
    const pattern = this.selectedOption === 2
      ? /[^a-zA-Z0-9\-\.]/g   // letters, numbers, hyphens, dots
      : /[^a-zA-Z0-9\-]/g;    // letters, numbers, hyphens only
    const sanitized = raw.replace(pattern, '');
    if (sanitized !== raw) {
      this.domainValue = sanitized;
      this.domainError = 'Solo se permiten letras, números y guiones' + (this.selectedOption === 2 ? ' y puntos' : '') + '.';
    }
  }

  /** Validate domain value before submitting */
  private isDomainValid(): boolean {
    const val = this.domainValue.trim().toLowerCase();
    if (!val) {
      this.domainError = 'Ingresa un valor para tu URL.';
      return false;
    }
    if (val.startsWith('-') || val.endsWith('-')) {
      this.domainError = 'No puede comenzar ni terminar con guión.';
      return false;
    }
    if (val.length < 3) {
      this.domainError = 'Debe tener al menos 3 caracteres.';
      return false;
    }
    if (val.length > 63) {
      this.domainError = 'Máximo 63 caracteres.';
      return false;
    }
    const urlPattern = this.selectedOption === 2
      ? /^[a-z0-9][a-z0-9\-]*[a-z0-9]\.[a-z]{2,}$/
      : /^[a-z0-9][a-z0-9\-]*[a-z0-9]$/;
    // Allow 2-char values that pass the basic checks (no hyphens at edges)
    if (val.length >= 3 && !urlPattern.test(val)) {
      this.domainError = this.selectedOption === 2
        ? 'Formato inválido. Ejemplo: mi-evento.com'
        : 'Formato inválido. Ejemplo: mi-evento';
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
      next: (res) => {
        this.availabilityResult = res;
        this.checking = false;
      },
      error: () => {
        this.notificationService.show('error', 'Error al verificar disponibilidad');
        this.checking = false;
      }
    });
  }

  onConfirm() {
    if (this.selectedOption === 2) {
      // Option 2 requires payment
      this.openPaymentDialog();
    } else {
      // Options 1 and 3 are free
      this.createDomain();
    }
  }

  openPaymentDialog() {
    const price = this.availabilityResult?.finalPrice || 499;

    const dialogRef = this.dialog.open(PagoDialogComponent, {
      width: '500px',
      data: {
        evento: {
          id: this.eventId,
          nombre: `Dominio personalizado: ${this.domainValue}`,
          costo: price,
          estatus: 'Pendiente'
        },
        isCustomDomain: true
      }
    });

    dialogRef.afterClosed().subscribe((metodo: string | null) => {
      if (!metodo) return;

      const callbackUrl = `${window.location.origin}/dominio?eventId=${this.eventId}&eventName=${encodeURIComponent(this.eventName)}&domain_paid=true&domain_val=${encodeURIComponent(this.domainValue)}&domain_tipo=${this.selectedOption}`;

      const pagoEvento = {
        id: this.eventId,
        nombre: `Dominio: ${this.domainValue}`,
        costo: price,
        callbackUrl: callbackUrl,
        externalReference: "Dominio Personalizado"
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
      eventId: this.eventId,
      tipoOpcion: this.selectedOption,
      dominioValor: this.domainValue.trim().toLowerCase(),
      eventName: this.eventName,
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
      error: () => {
        this.creating = false;
        this.notificationService.show('error', 'Error al registrar dominio');
      }
    });
  }

  // Handle payment callback
  ngAfterViewInit() {
    this.route.queryParams.subscribe(params => {
      if (params['domain_paid'] === 'true' && params['status'] === 'approved') {
        const val = params['domain_val'] || this.domainValue;
        const tipo = parseInt(params['domain_tipo'] || '2');
        if (val) {
          this.domainValue = val;
          this.selectedOption = tipo;
          this.createDomain();
        }
      }
    });
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }
}
