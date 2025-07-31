import { Component, ViewEncapsulation } from '@angular/core';
import { EventService } from './../../services/event.service';
import { NotificationService } from '../../services/notification.service';
import { MercadoPagoService } from '../../services/mercado-pago.service.service';
import { ActivatedRoute, Router } from '@angular/router';
import { LocalStorageService } from '../../services/local-storage.service';
import { MatDialog } from '@angular/material/dialog';
import { PagoDialogComponent } from '../../component/pago-dialog/pago-dialog.component';

interface Evento {
  nombre: string;
  fecha: string;
  estatus: string;
  plan: string;
  estatusDescripcion: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  encapsulation: ViewEncapsulation.None
})

export class DashboardComponent
  {  
  loggedUser: any;
  loading: boolean = true;
  showPopup: boolean = false;
  noDataMsg: boolean = false;
  terminosHtml = "";
  constructor(private eventService: EventService, private notificationService: NotificationService, private mercadoPago: MercadoPagoService, 
                private route: ActivatedRoute, private localStorageService: LocalStorageService, private router: Router, private dialog: MatDialog)
  {
    const localUser = localStorage.getItem('loggedUser');
    if(localUser != null) {
      this.loggedUser = JSON.parse(localUser);
    }
  }
  
  ngOnInit(): void {
    const userId = this.loggedUser.userId; 
    this.eventService.getEventsByUserId(userId).subscribe({
      next: (res) => {
        this.rowData = res;
        this.loading = false;
        const showInvitations = this.rowData.find((item: any) => item.showInvitation === true).showInvitation;
        this.localStorageService.setShowInvitaciones(!!showInvitations);
      },
      error: err => {
        this.notificationService.show('error',`Hubo un error al obtener los eventos del usuario ${err.message}`);
        this.loading = false;
      }
    });
    this.route.queryParams.subscribe(params => {
      const status = params['status'];
      const paymentId = params['payment_id'];
      const eventId = params['external_reference'];
      if (status !== undefined && paymentId !== undefined && eventId !== undefined){
        this.eventService.getEventsById(eventId).subscribe({
          next: (res:any) => {
            this.notificationService.show('info',`Pago del evento ${res.nombre} fue ${status}. Id del Pago: ${paymentId}`);
          },
          error: err => {
            this.notificationService.show('error',`Hubo un error al obtener la informacion del evento ${err.message}`);
          }
        });
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
      { headerName: 'Plan', field: 'plan', type: 'text' },
      { headerName: 'Estatus', field: 'estatus', type: 'status' }
  ] ;

  rowData:any = [];

  onActionHandler(event: { type: string, row: Evento }) {
    if (event.type === 'invitacion') {
      this.onInvitacion(event.row);
    } else if (event.type === 'delete') {
      this.onDelete(event.row);
    } else if (event.type === 'pay') {
      this.onPay(event.row);
    }
  }
  onInvitacion(evento: any) {
    this.router.navigateByUrl(`/invitaciones?id=${evento.id}`);
  }

  onDelete(evento: any) {
    console.log('Eliminar', evento);
  }

  onPay(event: any) {
    // this.mercadoPago.createPreference(event).subscribe({
    //       next: (res: any) => {
    //         window.open(res.init_point, '_blank');
    //       },
    //       error: err => console.error('Error creando preferencia', err)
    //     });
    const dialogRef = this.dialog.open(PagoDialogComponent, {
       width: '500px',
       data: { evento: event }
    });

    dialogRef.afterClosed().subscribe((metodoPago: string | null) => {
       if (metodoPago !== null && metodoPago.toLowerCase() === 'mercado pago') {
          this.notificationService.show('info',`Redirigiendo a mercadopago, espere un momento`);
          this.mercadoPago.createPreference(event).subscribe({
            next: (res: any) => {
              window.open(res.init_point, '_blank');
            },
            error: err => console.error('Error creando preferencia', err)
          });
       }
    });
  }
}
