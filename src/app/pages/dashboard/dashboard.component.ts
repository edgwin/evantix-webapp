import { Component, ViewEncapsulation } from '@angular/core';
import { EventService } from './../../services/event.service';
import { NotificationService } from '../../services/notification.service';
import { MercadoPagoService } from '../../services/mercado-pago.service.service';
import { StripeService } from '../../services/stripe.service';
import { ActivatedRoute, Router } from '@angular/router';
import { LocalStorageService } from '../../services/local-storage.service';
import { MatDialog } from '@angular/material/dialog';
import { PagoDialogComponent } from '../../component/pago-dialog/pago-dialog.component';
import { TourService } from '../../services/tour.service';
import { TourOverlayComponent } from '../../component/tour-overlay/tour-overlay.component';
import { environment } from '../../../environments/environment';

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
    encapsulation: ViewEncapsulation.None,
    standalone: false
})

export class DashboardComponent {
  loggedUser: any;
  loading: boolean = true;
  deleting: boolean = false;
  showPopup: boolean = false;
  noDataMsg: boolean = false;
  terminosHtml = "";

  // All data from API
  rowData: any = [];

  // Filtered + sorted subset
  filteredRows: any[] = [];

  // Current page slice
  visibleRows: any[] = [];

  // Pagination
  currentPage = 1;
  readonly PAGE_SIZE = environment.pageSize;
  totalPages = 0;
  pages: number[] = [];

  // Search / Filter
  searchName = '';
  searchEstatus = '';
  searchFecha = '';

  // Sort
  sortField: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  // Unique statuses for filter dropdown
  uniqueStatuses: string[] = [];

  copiedPin: string | null = null;

  private callbackEventId: string | null = null;
  private callbackStatus: string | null = null;

  constructor(private eventService: EventService, private notificationService: NotificationService, private mercadoPago: MercadoPagoService,
    private stripeService: StripeService, private route: ActivatedRoute, private localStorageService: LocalStorageService, private router: Router, private dialog: MatDialog, private tourService: TourService) {
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

        this.callbackEventId = eventId;
        this.callbackStatus = status;
      }
      this.loadData();
    });
  }

  onRefresh() {
    this.router.navigate(['/dashboard']).then(() => {
      this.callbackEventId = null;
      this.callbackStatus = null;
      this.loadData();
    });
  }

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
          this.callbackEventId = null;
          this.callbackStatus = null;
        }

        this.loading = false;
        const showInvitations = this.rowData.find((item: any) => item.showInvitation === true)?.showInvitation ?? false;
        this.localStorageService.setShowInvitaciones(!!showInvitations);

        // Extract unique statuses for dropdown
        this.uniqueStatuses = [...new Set(this.rowData.map((e: any) => e.estatus).filter(Boolean))] as string[];

        // Apply filters & pagination
        this.applyFilters();

        setTimeout(() => this.tourService.startIfNeeded('dashboard'), 800);
      },
      error: err => {
        this.notificationService.show('error', `Hubo un error al obtener los eventos del usuario ${err.message}`);
        this.loading = false;
      }
    });
  }

  // ===== Search & Filter =====

  applyFilters(): void {
    let data = [...this.rowData];

    // Filter by name
    if (this.searchName.trim()) {
      const term = this.searchName.toLowerCase().trim();
      data = data.filter((e: any) => e.nombre?.toLowerCase().includes(term));
    }

    // Filter by status
    if (this.searchEstatus) {
      data = data.filter((e: any) => e.estatus === this.searchEstatus);
    }

    // Filter by date
    if (this.searchFecha) {
      data = data.filter((e: any) => e.fecha?.includes(this.searchFecha));
    }

    // Apply sort
    if (this.sortField) {
      data.sort((a: any, b: any) => {
        let valA = a[this.sortField] || '';
        let valB = b[this.sortField] || '';
        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();
        const cmp = valA < valB ? -1 : valA > valB ? 1 : 0;
        return this.sortDirection === 'asc' ? cmp : -cmp;
      });
    }

    this.filteredRows = data;
    this.totalPages = Math.max(1, Math.ceil(this.filteredRows.length / this.PAGE_SIZE));

    // Reset to page 1 if current page exceeds total
    if (this.currentPage > this.totalPages) {
      this.currentPage = 1;
    }

    this.updatePages();
    this.updateVisibleRows();
  }

  onSearchChange(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchName = '';
    this.searchEstatus = '';
    this.searchFecha = '';
    this.currentPage = 1;
    this.applyFilters();
  }

  // ===== Sort =====

  onSort(field: string): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.applyFilters();
  }

  getSortIcon(field: string): string {
    if (this.sortField !== field) return '↕';
    return this.sortDirection === 'asc' ? '↑' : '↓';
  }

  // ===== Pagination =====

  private updatePages(): void {
    this.pages = [];
    for (let i = 1; i <= this.totalPages; i++) {
      this.pages.push(i);
    }
  }

  private updateVisibleRows(): void {
    const start = (this.currentPage - 1) * this.PAGE_SIZE;
    const end = start + this.PAGE_SIZE;
    this.visibleRows = this.filteredRows.slice(start, end);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updateVisibleRows();
  }

  // ===== Helpers =====

  columns = [
    { headerName: 'Nombre del Evento', field: 'nombre', type: 'image+text', imageField: 'imagen' },
    { headerName: 'Fecha', field: 'fecha', type: 'text' },
    { headerName: 'Estatus', field: 'estatus', type: 'status' }
  ];

  copyPin(pin: string) {
    navigator.clipboard.writeText(pin).then(() => {
      this.copiedPin = pin;
      setTimeout(() => this.copiedPin = null, 2000);
    });
  }

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
    } else if (event.type === 'dominio') {
      this.onDominio(event.row);
    }
  }

  onInvitacion(evento: any) {
    this.router.navigateByUrl(`/invitaciones?id=${evento.id}`);
  }

  onVerInvitacion(evento: any) {
    const url = this.router.serializeUrl(
      this.router.createUrlTree(['/invitacion', `${this.replaceNameForUrl(evento.nombre)}`, `${evento.id}`])
    );
    window.open(url, '_blank');
  }

  onDominio(evento: any) {
    this.router.navigate(['/dominio'], {
      queryParams: { eventId: evento.id, eventName: evento.nombre }
    });
  }

  replaceNameForUrl(name: string) {
    return name.replace(/\s+/g, '_');
  }

  onDelete(evento: any) {
    this.deleting = true;
    this.eventService.DeleteEvent(evento.id).subscribe({
      next: () => {
        this.deleting = false;
        this.notificationService.show('info', `Evento eliminado con exito`);
        this.loadData();
      },
      error: () => {
        this.deleting = false;
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
      if (metodoPago === '__FREE_CLAIMED__') {
        this.notificationService.show('info', '🎉 ¡Evento obtenido exitosamente!');
        this.loadData();
      } else if (metodoPago !== null && metodoPago.toLowerCase() === 'mercado pago') {
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
