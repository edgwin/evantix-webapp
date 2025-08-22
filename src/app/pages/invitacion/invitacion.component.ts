import { Component } from '@angular/core';
import { PortadaComponent } from '../../component/invitacion/portada/portada.component'
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-invitacion',
  standalone: true,
  templateUrl: './invitacion.component.html',
  styleUrl: './invitacion.component.css',
  imports: [PortadaComponent, CommonModule],  
})

export class InvitacionComponent {
  constructor(private route: ActivatedRoute)
  {}
  eventId : any;
  loadingAll:boolean = true;
  ngOnInit(): void {          
      this.eventId = this.route.snapshot.paramMap.get('idEvent');
      if (this.eventId === null || this.eventId === undefined) return     
    }
}
