import { Component } from '@angular/core';
import { PortadaComponent } from '../../component/invitacion/portada/portada.component'
import { FestejadosComponent } from '../../component/invitacion/festejados/festejados.component'
import { IndicacionesComponent } from '../../component/invitacion/indicaciones/indicaciones.component'
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DondeCuandoComponent } from '../../component/invitacion/donde-cuando/donde-cuando.component';
import { InvitationService } from '../../services/invitation.service';
import { NotificationService } from '../../services/notification.service';
import { MesaRegalosComponent } from '../../component/invitacion/mesa-regalos/mesa-regalos.component';
import { PersonasFavoritasComponent } from '../../component/invitacion/personas-favoritas/personas-favoritas.component';
import { HistoriaComponent } from '../../component/invitacion/historia/historia.component';
import { IntinerarioComponent } from '../../component/invitacion/intinerario/intinerario.component';
import { GaleriaComponent } from '../../component/invitacion/galeria/galeria.component';
import { HospedajeComponent } from '../../component/invitacion/hospedaje/hospedaje.component';
import { PhotoUploaderComponent } from '../../component/invitacion/photo-uploader/photo-uploader.component';
import { MusicaComponent } from '../../component/invitacion/musica/musica.component';
import { TemplateService, Template } from '../../services/template.service';
import { TemplateSelectorComponent } from '../../component/invitacion/template-selector/template-selector.component';

@Component({
  selector: 'app-invitacion',
  standalone: true,
  templateUrl: './invitacion.component.html',
  styleUrl: './invitacion.component.css',
  imports: [PortadaComponent, CommonModule, FestejadosComponent, DondeCuandoComponent, IntinerarioComponent, IndicacionesComponent,
    MesaRegalosComponent, PersonasFavoritasComponent, HistoriaComponent, GaleriaComponent, HospedajeComponent,
    PhotoUploaderComponent, MusicaComponent, TemplateSelectorComponent],
})

export class InvitacionComponent {
  constructor(private route: ActivatedRoute, private invitationService: InvitationService,
    private notificationService: NotificationService, public templateService: TemplateService,
    private router: Router) { }
  eventId: any;
  loading: boolean = true;
  data: any;
  isReadOnly: boolean = false;
  eventStatus: string = '';
  canSendToReview: boolean = false;
  sendingToReview: boolean = false;

  toggleReadOnly(): void {
    // AC1: Solo permitir toggle si el estatus es "Creado"
    if (this.eventStatus === 'Creado') {
      this.isReadOnly = !this.isReadOnly;
    }
  }

  ngOnInit(): void {
    this.eventId = this.route.snapshot.paramMap.get('idEvent');
    if (this.eventId === null || this.eventId === undefined) return

    this.loading = true;
    if (!this.eventId) return;

    this.invitationService.getInvitacion(this.eventId).subscribe({
      next: (res: any) => {
        this.data = res;
        this.eventStatus = res.eventStatus || 'Creado';

        // AC1: Si "Creado" -> isReadOnly = false (editable)
        // AC3: Cualquier otro estatus -> isReadOnly = true (solo lectura)
        if (this.eventStatus === 'Creado') {
          this.isReadOnly = false;
          this.canSendToReview = true;
        } else {
          this.isReadOnly = true;
          this.canSendToReview = false;
        }

        if (res.template) {
          this.templateService.applyTemplateFromData(res.template);
        }

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

  onTemplateSelected(template: Template): void {
    this.notificationService.show('success', `Plantilla "${template.name}" aplicada correctamente`);
  }

  onSendToReview(): void {
    if (this.sendingToReview) return;
    this.sendingToReview = true;

    this.invitationService.putInReview(this.eventId).subscribe({
      next: () => {
        this.notificationService.show('success', 'La invitación fue enviada a revisión exitosamente');
        this.eventStatus = 'En Revision';
        this.isReadOnly = true;
        this.canSendToReview = false;
        this.sendingToReview = false;
        // Redirigir al dashboard después de enviar a revisión
        this.router.navigateByUrl('/dashboard');
      },
      error: (err) => {
        this.notificationService.show('error', `Hubo un error al enviar a revisión: ${err.message}`);
        this.sendingToReview = false;
      }
    });
  }
}
