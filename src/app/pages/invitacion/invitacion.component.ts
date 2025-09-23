import { Component } from '@angular/core';
import { PortadaComponent } from '../../component/invitacion/portada/portada.component'
import { FestejadosComponent } from '../../component/invitacion/festejados/festejados.component'
import { IndicacionesComponent } from '../../component/invitacion/indicaciones/indicaciones.component'
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DondeCuandoComponent } from '../../component/invitacion/donde-cuando/donde-cuando.component';
import { InvitationService } from '../../services/invitation.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-invitacion',
  standalone: true,
  templateUrl: './invitacion.component.html',
  styleUrl: './invitacion.component.css',
  imports: [PortadaComponent, CommonModule, FestejadosComponent, DondeCuandoComponent, IndicacionesComponent],  
})

export class InvitacionComponent {
  constructor(private route: ActivatedRoute, private invitationService: InvitationService, private notificationService: NotificationService)
  {}  
  eventId : any;
  loading:boolean = true;
  data: any;
  ngOnInit(): void {          
      this.eventId = this.route.snapshot.paramMap.get('idEvent');
      if (this.eventId === null || this.eventId === undefined) return
      
      this.loading = true;
      if (!this.eventId) return;

      this.invitationService.getInvitacion(this.eventId).subscribe({
        next: (res) => {
          this.data = res;
          this.loading = false;
        },
        error: (err) => {
          this.notificationService.show(
            'error',
            `Hubo un error favor intentar más tarde ${err.message}`
          );
          this.loading = false;
        }
      });
    }
}
