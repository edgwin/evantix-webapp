import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LocalStorageService } from '../../services/local-storage.service';
import { NotificationService } from '../../services/notification.service';
import { InvitationService } from '../../services/invitation.service';

@Component({
  selector: 'app-invitacion',
  templateUrl: './invitacion.component.html',
  styleUrl: './invitacion.component.css'
})
export class InvitacionComponent {
  loading : boolean = false;
  data: any = null;
  constructor(private invitationService: InvitationService, private notificationService: NotificationService, 
                private route: ActivatedRoute)
    {
    }
    
    ngOnInit(): void {
      this.loading = true;
      const eventId = this.route.snapshot.paramMap.get('idEvent');
      if (eventId === null || eventId === undefined) return
      const idInvitado = this.route.snapshot.paramMap.get('idInvitado');
      this.invitationService.getInvitacion(eventId).subscribe({
        next: (res) => {
          this.data = res;
          this.loading = false;          
        },
        error: err => {
          this.notificationService.show('error',`Hubo un error al obtener los eventos del usuario ${err.message}`);
          this.loading = false;
        }
      });
    }
  
}
