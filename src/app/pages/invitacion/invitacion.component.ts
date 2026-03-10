import { Component, OnDestroy } from '@angular/core';
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
import { MuroFotosComponent } from '../../component/invitacion/muro-fotos/muro-fotos.component';
import { TemplateService, Template } from '../../services/template.service';
import { TemplateSelectorComponent } from '../../component/invitacion/template-selector/template-selector.component';
import { PricingService, EventCostResponse } from '../../services/pricing.service';
import { CostBarComponent } from '../../component/invitacion/cost-bar/cost-bar.component';
import { SectionToggleComponent } from '../../component/invitacion/section-toggle/section-toggle.component';
import { Subscription } from 'rxjs';
import { InvitadoService } from '../../services/invitado.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-invitacion',
  standalone: true,
  templateUrl: './invitacion.component.html',
  styleUrl: './invitacion.component.css',
  imports: [PortadaComponent, CommonModule, FestejadosComponent, DondeCuandoComponent, IntinerarioComponent, IndicacionesComponent,
    MesaRegalosComponent, PersonasFavoritasComponent, HistoriaComponent, GaleriaComponent, HospedajeComponent,
    PhotoUploaderComponent, MusicaComponent, MuroFotosComponent, TemplateSelectorComponent, CostBarComponent, SectionToggleComponent, FormsModule],
})

export class InvitacionComponent implements OnDestroy {
  constructor(private route: ActivatedRoute, private invitationService: InvitationService,
    private notificationService: NotificationService, public templateService: TemplateService,
    private router: Router, private pricingService: PricingService, private invitadoService: InvitadoService) { }
  eventId: any;
  loading: boolean = true;
  data: any;
  isReadOnly: boolean = false;
  isGuestView: boolean = false;
  isAdmin: boolean = false;
  eventStatus: string = '';
  canSendToReview: boolean = false;
  sendingToReview: boolean = false;
  togglingSection: string = '';
  pricingLoading: boolean = true;
  private mutationSub: Subscription | null = null;
  private pricingLoadingSub: Subscription | null = null;

  // RSVP data
  idInvitacion: string | null = null;
  guestGroup: any = null;
  rsvpSubmitted: boolean = false;
  rsvpSubmitting: boolean = false;
  rsvpFormSubmitted: boolean = false;

  // Secciones opcionales habilitadas/deshabilitadas
  sections: { [key: string]: { isEnabled: boolean, enableCost: number, sectionName: string, maxItems: number } } = {};

  toggleReadOnly(): void {
    if (this.eventStatus === 'Creado' || this.isAdmin) {
      this.isReadOnly = !this.isReadOnly;
      // Refrescar costo al volver a modo edición o al ver previo
      if (!this.isReadOnly) {
        this.loadPricing();
      }
    }
  }

  ngOnInit(): void {
    this.eventId = this.route.snapshot.paramMap.get('idEvent');
    this.idInvitacion = this.route.snapshot.paramMap.get('idInvitado');
    if (this.eventId === null || this.eventId === undefined) return;

    this.loading = true;
    if (!this.eventId) return;

    // If guest view, set flags and load guest group
    if (this.idInvitacion) {
      this.isGuestView = true;
      this.isReadOnly = true;
      this.loadGuestGroup();
    }

    this.invitationService.getInvitacion(this.eventId).subscribe({
      next: (res: any) => {
        this.data = res;
        this.eventStatus = res.eventStatus || 'Creado';

        // Detect admin from query param
        this.isAdmin = this.route.snapshot.queryParamMap.get('admin') === 'true';

        const isPaid = ['Pagado', 'Pago Creado'].includes(this.eventStatus);

        if (this.isAdmin) {
          this.isReadOnly = false;
          this.canSendToReview = false; // Admin uses "Revisado" button instead
        } else if (isPaid) {
          this.isReadOnly = true;
          this.canSendToReview = false;
        } else if (this.eventStatus === 'Creado') {
          this.isReadOnly = false;
          this.canSendToReview = true;
        } else {
          this.isReadOnly = true;
          this.canSendToReview = false;
        }

        if (res.template) {
          this.templateService.applyTemplateFromData(res.template);
        }

        // Cargar precios y secciones habilitadas
        if ((this.eventStatus === 'Creado' || this.isAdmin) && !isPaid) {
          this.loadPricing();
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

    // Suscribirse a mutaciones de los componentes hijos para refrescar costo
    this.mutationSub = this.invitationService.mutationOccurred$.subscribe(eventId => {
      if (eventId === this.eventId) {
        this.loadPricing();
      }
    });

    // Suscribirse al estado de carga de precios
    this.pricingLoadingSub = this.pricingService.loading$.subscribe(loading => {
      this.pricingLoading = loading;
    });
  }

  ngOnDestroy(): void {
    this.mutationSub?.unsubscribe();
    this.pricingLoadingSub?.unsubscribe();
  }

  loadPricing(): void {
    this.pricingService.getEventCost(this.eventId).subscribe({
      next: (cost: EventCostResponse) => {
        cost.sections.forEach(s => {
          this.sections[s.sectionKey] = {
            isEnabled: s.isEnabled,
            enableCost: s.enableCost,
            sectionName: s.sectionName,
            maxItems: s.maxItems
          };
        });
      },
      error: (err) => {
        console.error('Error loading pricing', err);
      }
    });
  }

  private getEnableCostFromDetail(section: any): number {
    return section.enableCost || 0;
  }

  isSectionEnabled(sectionKey: string): boolean {
    if (this.isReadOnly) return true; // En readonly, mostrar todo lo que tenga datos
    const section = this.sections[sectionKey];
    return section?.isEnabled ?? false;
  }

  getSectionEnableCost(sectionKey: string): number {
    return this.sections[sectionKey]?.enableCost ?? 0;
  }

  getSectionName(sectionKey: string): string {
    return this.sections[sectionKey]?.sectionName ?? sectionKey;
  }

  getSectionMaxItems(sectionKey: string): number {
    return this.sections[sectionKey]?.maxItems ?? 99;
  }

  onEnableSection(sectionKey: string): void {
    this.togglingSection = sectionKey;
    this.pricingService.toggleSection(this.eventId, sectionKey, true).subscribe({
      next: (cost) => {
        this.sections[sectionKey] = {
          ...this.sections[sectionKey],
          isEnabled: true
        };
        this.togglingSection = '';
        this.notificationService.show('success', `${this.getSectionName(sectionKey)} habilitada`);
      },
      error: (err) => {
        this.togglingSection = '';
        this.notificationService.show('error', `Error al habilitar sección: ${err.message}`);
      }
    });
  }

  onRemoveSection(sectionKey: string): void {
    this.togglingSection = sectionKey;
    this.pricingService.toggleSection(this.eventId, sectionKey, false).subscribe({
      next: (cost) => {
        this.sections[sectionKey] = {
          ...this.sections[sectionKey],
          isEnabled: false
        };
        this.togglingSection = '';
        this.notificationService.show('success', `${this.getSectionName(sectionKey)} deshabilitada`);
      },
      error: (err) => {
        this.togglingSection = '';
        this.notificationService.show('error', `Error al deshabilitar sección: ${err.message}`);
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
        this.router.navigateByUrl('/dashboard');
      },
      error: (err) => {
        this.notificationService.show('error', `Hubo un error al enviar a revisión: ${err.message}`);
        this.sendingToReview = false;
      }
    });
  }

  onSetToRevisado(): void {
    if (this.sendingToReview) return;
    this.sendingToReview = true;

    this.invitationService.setToRevisado(this.eventId).subscribe({
      next: () => {
        this.notificationService.show('success', 'La invitación fue marcada como Revisada exitosamente');
        this.eventStatus = 'Revisado';
        this.sendingToReview = false;
        this.router.navigateByUrl('/dashboard');
      },
      error: (err) => {
        this.notificationService.show('error', `Hubo un error al marcar como revisado: ${err.message}`);
        this.sendingToReview = false;
      }
    });
  }

  // === RSVP Methods ===
  loadGuestGroup(): void {
    if (!this.eventId || !this.idInvitacion) return;
    this.invitadoService.getGrupoByInvitacion(this.eventId, this.idInvitacion).subscribe({
      next: (group: any) => {
        // Set invitacionConfirmada to null for pending guests (state 0)
        group.invitados?.forEach((inv: any) => {
          if (inv.invitacionConfirmada === 0) {
            inv.invitacionConfirmada = null;
          }
        });
        this.guestGroup = group;
        this.rsvpSubmitted = group.invitados?.every((i: any) => i.confirmadoPor) || false;
      },
      error: (err) => {
        console.error('Error loading guest group', err);
      }
    });
  }

  submitRsvp(): void {
    this.rsvpFormSubmitted = true;
    // Validate all names filled and all have a selection
    const hasEmpty = this.guestGroup.invitados.some((inv: any) => !inv.nombre?.trim());
    const hasNoSelection = this.guestGroup.invitados.some((inv: any) => inv.invitacionConfirmada === null || inv.invitacionConfirmada === 0);
    if (hasEmpty || hasNoSelection) return;

    this.rsvpSubmitting = true;
    const confirmaciones = this.guestGroup.invitados.map((inv: any) => ({
      id: inv.id,
      nombre: inv.nombre,
      invitacionConfirmada: inv.invitacionConfirmada
    }));

    this.invitadoService.confirmInvitacion(this.eventId, this.idInvitacion!, confirmaciones).subscribe({
      next: () => {
        this.rsvpSubmitted = true;
        this.rsvpSubmitting = false;
      },
      error: (err) => {
        this.rsvpSubmitting = false;
        console.error('Error confirming RSVP', err);
      }
    });
  }
}
