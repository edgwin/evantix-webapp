import { Component, ViewEncapsulation } from '@angular/core';
import { EventService } from './../../services/event.service';
import { NotificationService } from '../../services/notification.service';
import { MercadoPagoService } from '../../services/mercado-pago.service.service';
import { StripeService } from '../../services/stripe.service';
import { ActivatedRoute, Router } from '@angular/router';
import { LocalStorageService } from '../../services/local-storage.service';
import { MatDialog } from '@angular/material/dialog';
import { PagoDialogComponent } from '../../component/pago-dialog/pago-dialog.component';

interface Evento {
  nombre: string;
  fecha: string;
  estatus: string;
  estatusDescripcion: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  encapsulation: ViewEncapsulation.None
})

export class DashboardComponent {
  loggedUser: any;
  loading: boolean = true;
  showPopup: boolean = false;
  noDataMsg: boolean = false;
  terminosHtml = "";
  constructor(private eventService: EventService, private notificationService: NotificationService, private mercadoPago: MercadoPagoService,
    private stripeService: StripeService, private route: ActivatedRoute, private localStorageService: LocalStorageService, private router: Router, private dialog: MatDialog) {
    const localUser = localStorage.getItem('loggedUser');
    if (localUser != null) {
      this.loggedUser = JSON.parse(localUser);
    }
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const status = params['status'];
      const paymentId = params['payment_id'];
      const eventId = params['external_reference'];
      if (status !== undefined && eventId !== undefined) {
        const statusMsg = status === 'approved' ? 'aprobado ✅' : status === 'rejected' ? 'rechazado ❌' : status;
        const paymentSource = paymentId ? 'MercadoPago' : 'Stripe';
        const idMsg = paymentId ? `Id del Pago: ${paymentId}` : '';
        this.notificationService.show('info', `Pago fue ${statusMsg} (${paymentSource}). ${idMsg}`.trim());

        // Guardar info del callback para aplicar override visual después de loadData
        this.callbackEventId = eventId;
        this.callbackStatus = status;
      }
      this.loadData();
    });
  }

  onRefresh() {
    // Navegar sin query params para limpiar la URL
    this.router.navigate(['/dashboard']).then(() => {
      this.callbackEventId = null;
      this.callbackStatus = null;
      this.loadData();
    });
  }

  private callbackEventId: string | null = null;
  private callbackStatus: string | null = null;

  private translateMercadoPagoStatus(status: string): string {
    const map: any = {
      'approved': 'Pagado',
      'rejected': 'Pago Rechazado',
      'pending': 'Pago Pendiente',
      'in_process': 'En Proceso',
      'cancelled': 'Pago Cancelado'
    };
    return map[status] || status;
  }

  loadData() {
    this.loading = true;
    const userId = this.loggedUser.userId;
    const isAdmin = this.loggedUser.role.toUpperCase() === 'ADMIN';
    const events$ = isAdmin
      ? this.eventService.getAllEvents()
      : this.eventService.getEventsByUserId(userId);

    events$.subscribe({
      next: (res) => {
        this.rowData = res;

        // AC1: Si hay callback de MercadoPago y el evento aún tiene estatus "Revisado" en la BD,
        // mostrar temporalmente el estatus del callback con tooltip "Parcialmente <status>"
        if (this.callbackEventId && this.callbackStatus) {
          const evento = this.rowData.find((e: any) => e.id === this.callbackEventId);
          if (evento && evento.estatus?.toUpperCase() === 'REVISADO') {
            const translated = this.translateMercadoPagoStatus(this.callbackStatus);
            const isCancelled = this.callbackStatus === 'cancelled';
            evento.estatus = isCancelled ? 'Revisado' : translated;
            evento.estatusDescripcion = isCancelled ? 'Pago cancelado, puede reintentar' : `Parcialmente ${translated}`;
            evento.showPayment = isCancelled;
            evento.showDelete = isCancelled;
          }
          // Limpiar para que en un refresh normal (AC2) muestre lo de la BD
          this.callbackEventId = null;
          this.callbackStatus = null;
        }

        this.loading = false;
        const showInvitations = this.rowData.find((item: any) => item.showInvitation === true)?.showInvitation ?? false;
        this.localStorageService.setShowInvitaciones(!!showInvitations);
      },
      error: err => {
        this.notificationService.show('error', `Hubo un error al obtener los eventos del usuario ${err.message}`);
        this.loading = false;
      }
    });
  }

  columns = [
    {
      headerName: 'Nombre del Evento',
      field: 'nombre',
      type: 'image+text',
      imageField: 'imagen'
    },
    { headerName: 'Fecha', field: 'fecha', type: 'text' },
    { headerName: 'Estatus', field: 'estatus', type: 'status' }
  ];

  rowData: any = [];

  onActionHandler(event: { type: string, row: Evento }) {
    if (event.type === 'edit') {
      this.router.navigate(['/nuevoEvento'], { queryParams: { id: (event.row as any).id } });
    } else if (event.type === 'invitacion') {
      this.onInvitacion(event.row);
    } else if (event.type === 'delete') {
      this.onDelete(event.row);
    } else if (event.type === 'pay') {
      this.onPay(event.row);
    } else if (event.type === 'verInvitacion') {
      this.onVerInvitacion(event.row);
    }
  }

  onInvitacion(evento: any) {
    this.router.navigateByUrl(`/invitaciones?id=${evento.id}`);
  }

  onVerInvitacion(evento: any) {
    const isAdmin = this.loggedUser.role.toUpperCase() === 'ADMIN';
    const queryParams: any = {};
    if (isAdmin) queryParams.admin = 'true';

    const url = this.router.serializeUrl(
      this.router.createUrlTree(['/invitacion', `${this.replaceNameForUrl(evento.nombre)}`, `${evento.id}`],
        Object.keys(queryParams).length > 0 ? { queryParams } : {})
    );

    window.open(url, isAdmin ? '_self' : '_blank');
  }

  replaceNameForUrl(name: string) {
    return name.replace(/\s+/g, '_');
  }

  onDelete(evento: any) {
    this.eventService.DeleteEvent(evento.id).subscribe({
      next: () => {
        this.notificationService.show('info', `Evento eliminado con exito`);
        this.loadData();
      },
      error: () => {
        this.notificationService.show('error', `Hubo un error al intentar eliminar el Evento, favor de contactar a soporte`);
      }
    });
  }

  onPay(event: any) {
    const dialogRef = this.dialog.open(PagoDialogComponent, {
      width: '500px',
      data: { evento: event }
    });

    dialogRef.afterClosed().subscribe((metodoPago: string | null) => {
      if (metodoPago !== null && metodoPago.toLowerCase() === 'mercado pago') {
        this.notificationService.show('info', `Redirigiendo a MercadoPago, espere un momento`);
        this.mercadoPago.createPreference(event).subscribe({
          next: (res: any) => {
            window.open(res.init_point, '_self');
          },
          error: err => console.error('Error creando preferencia', err)
        });
      } else if (metodoPago !== null && metodoPago.toLowerCase() === 'stripe') {
        this.notificationService.show('info', `Redirigiendo a Stripe, espere un momento`);
        this.stripeService.createSession(event).subscribe({
          next: (res: any) => {
            window.open(res.sessionUrl, '_self');
          },
          error: err => console.error('Error creando sesión de Stripe', err)
        });
      }
    });
  }
}
