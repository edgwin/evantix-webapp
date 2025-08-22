import { Component } from '@angular/core';
import { PortadaComponent } from '../../component/invitacion/portada/portada.component'
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-invitacion',
  standalone: true,
  templateUrl: './invitacion.component.html',
  styleUrl: './invitacion.component.css',
  imports: [PortadaComponent],  
})

export class InvitacionComponent {
  constructor(private route: ActivatedRoute)
  {}
  eventId : any;
  ngOnInit(): void {          
      this.eventId = this.route.snapshot.paramMap.get('idEvent');
      if (this.eventId === null || this.eventId === undefined) return     
    }
}
