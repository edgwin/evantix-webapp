import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ColDef } from 'ag-grid-community';
import { EventService } from './../../services/event.service';
import { AccionesCellRendererComponent } from './acciones-cell-renderer.component';
import { NotificationService } from '../../services/notification.service';
import { MercadoPagoService } from '../../services/mercado-pago.service.service';
import { ActivatedRoute } from '@angular/router';

interface Evento {
  nombre: string;
  fecha: string;
  lugar: string;
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
  //implements OnInit 
  {  
  loggedUser: any;
  constructor(private eventService: EventService, private notificationService: NotificationService, private mercadoPago: MercadoPagoService, private route: ActivatedRoute)
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
        console.log(this.rowData);       
      },
      error: err => {
        this.notificationService.show('error',`Hubo un error al obtener los eventos del usuario ${err.message}`);
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
      { headerName: 'Lugar', field: 'lugar', type: 'text' },
      { headerName: 'Plan', field: 'plan', type: 'text' },
      { headerName: 'Estatus', field: 'estatus', type: 'status' }
  ] ;

  rowData:any = [];

  onActionHandler(event: { type: string, row: Evento }) {
    if (event.type === 'edit') {
      this.onEdit(event.row);
    } else if (event.type === 'delete') {
      this.onDelete(event.row);
    } else if (event.type === 'pay') {
      this.onPay(event.row);
    }
  }
  onEdit(evento: any) {
    console.log('Editar', evento);
  }

  onDelete(evento: any) {
    console.log('Eliminar', evento);
  }

  onPay(event: any) {
    this.mercadoPago.createPreference(event).subscribe({
      next: (res:any ) => {
        window.open(res.init_point, '_blank');
      },
      error: err => console.error('Error creando preferencia', err)
    });
  }
}
