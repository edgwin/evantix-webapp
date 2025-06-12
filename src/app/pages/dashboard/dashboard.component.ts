import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ColDef } from 'ag-grid-community';
import { EventService } from './../../services/event.service';
import { AccionesCellRendererComponent } from './acciones-cell-renderer.component';
import { NotificationService } from '../../services/notification.service';
import { MercadoPagoService } from '../../services/mercado-pago.service.service';
import { ActivatedRoute } from '@angular/router';
import {
  ModuleRegistry,
  themeAlpine,
  themeBalham,
  themeMaterial,
  themeQuartz,
} from "ag-grid-community";
import { myTheme } from '../../helpers/ag-grid-theme-builder'

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

export class DashboardComponent implements OnInit {  
  loggedUser: any;
  constructor(private eventService: EventService, private notificationService: NotificationService, private mercadoPago: MercadoPagoService, private route: ActivatedRoute)
  {
    const localUser = localStorage.getItem('loggedUser');
    if(localUser != null) {
      this.loggedUser = JSON.parse(localUser);
    }
  }
  
  theme = themeQuartz;

  ngOnInit(): void {
    const userId = this.loggedUser.userId; 
    this.eventService.getEventsByUserId(userId).subscribe({
      next: (res) => {
        this.rowData = res;       
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

  columnDefs: ColDef<Evento>[] = [
    { headerName: 'Nombre del Evento', field: 'nombre', flex: 2,
      cellRenderer: (params: any) => {
          const nombre = params.value;
          const imagen = params.data?.imagen;

          return `
            <div style="display: flex; align-items: center;">
              <img src="${imagen}" alt="imagen" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover; margin-right: 10px;" />
              <span style="font-weight: 500;">${nombre}</span>
            </div>
          `;
        }
    },
    { headerName: 'Fecha', field: 'fecha', flex: 1 },
    { headerName: 'Lugar', field: 'lugar', flex: 1 },
    { headerName: 'Plan', field: 'plan',  flex: 1 },
    { headerName: 'Estatus', field: 'estatus',  flex: 1,
      tooltipValueGetter: (params) => {
        const val = params.value?.toUpperCase();
        return params.data?.estatusDescripcion
      },
      cellRenderer: (params: { value: any; }) => {
        const status = params.value;
        let color = '#ccc';
        let bg = '#eee';
        if (status.toUpperCase() === 'CREADO') {
          color = '#c7A317'; bg = '#fdd017';
        } else if (status.toUpperCase() === 'PAGO CREADO') {
          color = '#000000'; bg = '#00FF00';
        } else if (status.toUpperCase() === 'PAGADO') {
          color = '#1B3925'; bg = '#00FF00';
        } else if (status.toUpperCase() === 'EN PROCESO') {
          color = '#ff9800'; bg = '#ffff00';
        }else if (status.toUpperCase() === 'PAGO CANCELADO') {
          color = '#c62828'; bg = '#ffcdd2';
        } else if (status.toUpperCase() === 'PAGO RECHAZADO') {
          color = '#FF0000'; bg = '#930001';
        } else if (status.toUpperCase() === 'PAGO PENDIENTE') {
          color = '#ff9800'; bg = '#fff3e0';
        }
        return `
          <span style="
            background-color: ${bg};
            color: ${color};
            padding: 4px 10px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 500;
          ">${status.charAt(0).toUpperCase() + status.slice(1)}</span>
        `;
      }
     },    
    {
      headerName: 'Acciones',
      cellRenderer: AccionesCellRendererComponent,
      width: 160,
      suppressSizeToFit: true, cellClass: 'ag-center-cols-container',
      cellRendererParams: {
        onEdit: this.onEdit.bind(this),
        onDelete: this.onDelete.bind(this),
        onPay: this.onPay.bind(this)
      },
    }
  ];

  rowData:any = [];

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
