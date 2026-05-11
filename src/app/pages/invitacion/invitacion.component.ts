import { Component, ElementRef, OnDestroy, ViewChild, ViewChildren, QueryList } from '@angular/core';
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
import { RedesSocialesComponent } from '../../component/invitacion/redes-sociales/redes-sociales.component';
import { MusicaComponent } from '../../component/invitacion/musica/musica.component';
import { MuroFotosComponent } from '../../component/invitacion/muro-fotos/muro-fotos.component';
import { TemplateService, Template } from '../../services/template.service';
import { TemplateSelectorComponent } from '../../component/invitacion/template-selector/template-selector.component';
import { PricingService, EventCostResponse } from '../../services/pricing.service';
import { CostBarComponent } from '../../component/invitacion/cost-bar/cost-bar.component';
import { SectionToggleComponent } from '../../component/invitacion/section-toggle/section-toggle.component';
import { Subscription } from 'rxjs';
import { TourService } from '../../services/tour.service';
import { TourOverlayComponent } from '../../component/tour-overlay/tour-overlay.component';
import { InvitadoService } from '../../services/invitado.service';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { EditLockService } from '../../services/edit-lock.service';

@Component({
  selector: 'app-invitacion',
  templateUrl: './invitacion.component.html',
  styleUrl: './invitacion.component.css',
  imports: [PortadaComponent, CommonModule, FestejadosComponent, DondeCuandoComponent, IntinerarioComponent, IndicacionesComponent,
    MesaRegalosComponent, PersonasFavoritasComponent, HistoriaComponent, GaleriaComponent, HospedajeComponent, RedesSocialesComponent,
    MusicaComponent, MuroFotosComponent, TemplateSelectorComponent, CostBarComponent, SectionToggleComponent, FormsModule, TourOverlayComponent]
})

export class InvitacionComponent implements OnDestroy {
  constructor(private route: ActivatedRoute, private invitationService: InvitationService,
    private notificationService: NotificationService, public templateService: TemplateService,
    private router: Router, private pricingService: PricingService, private invitadoService: InvitadoService,
    private tourService: TourService, private editLockService: EditLockService) { }
  eventId: any;
  loading: boolean = true;
  data: any;
  isReadOnly: boolean = false;
  isGuestView: boolean = false;
  isOwnerPreview: boolean = false;
  isAdmin: boolean = false;
  eventStatus: string = '';
  homeUrl: string = environment.homeUrl;
  canSendToReview: boolean = false;
  sendingToReview: boolean = false;
  // Edit-lock banner
  editLockedBy: string | null = null;  // non-null = blocked by this email
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
  showQrModal: boolean = false;

  // Secciones opcionales habilitadas/deshabilitadas
  sections: { [key: string]: { isEnabled: boolean, enableCost: number, sectionName: string, maxItems: number } } = {};

  // Track ID actual
  currentTrackId: string = '';

  // Welcome screen for guests
  showWelcome: boolean = false;

  @ViewChild('invScroll') invScrollRef!: ElementRef<HTMLElement>;
  @ViewChildren(MusicaComponent) musicaComponents!: QueryList<MusicaComponent>;

  closeWelcome(): void {
    this.showWelcome = false;
    // Permitir scroll después de cerrar
    document.body.style.overflow = 'auto';

    // Desbloquear audio en móviles
    if (this.musicaComponents) {
      this.musicaComponents.forEach(m => m.unlockAudio());
    }
  }

  toggleReadOnly(): void {
    if (this.eventStatus === 'Creado' || this.isAdmin) {
      if (this.isReadOnly) {
        // Entering edit mode → try to acquire lock
        this.editLockService.acquire(this.eventId).subscribe(res => {
          if (res.acquired) {
            this.isReadOnly = false;
            this.editLockedBy = null;
            this.editLockService.startHeartbeat(this.eventId);
            this.loadPricing();
            setTimeout(() => this.tourService.startIfNeeded(), 800);
          } else {
            this.editLockedBy = res.holderEmail || 'otra sesión';
            this.notificationService.show('error',
              `La invitación está siendo editada por ${this.editLockedBy}. Intenta en unos minutos.`);
          }
        });
      } else {
        // Exiting edit mode → release lock
        this.editLockService.stopAndRelease();
        this.editLockedBy = null;
        this.isReadOnly = true;
        const el = this.invScrollRef?.nativeElement;
        if (el) el.scrollTo({ top: 0, behavior: 'smooth' });
        else window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }

  ngOnInit(): void {
    // Asegura que el body sea scrollable (el Layout lo pone en 'hidden')
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';

    this.eventId = this.route.snapshot.paramMap.get('idEvent');
    this.idInvitacion = this.route.snapshot.paramMap.get('idInvitado');
    if (this.eventId === null || this.eventId === undefined) return;

    this.loading = true;
    if (!this.eventId) return;

    if (this.idInvitacion) {
      this.isGuestView = true;
      this.isReadOnly = true;
      this.loadGuestGroup();
    }

    this.invitationService.getInvitacion(this.eventId).subscribe({
      next: (res: any) => {
        this.data = res;
        this.eventStatus = res.eventStatus || 'Creado';

        const isPaid = ['Pagado', 'Pago Creado'].includes(this.eventStatus);

        const localUser = localStorage.getItem('loggedUser');
        if (localUser) {
          const parsed = JSON.parse(localUser);
          this.isAdmin = parsed?.role?.toUpperCase() === 'ADMIN';
        }

        this.applyViewMode(isPaid);
        this.finishInit(res);
      },
      error: (err) => {
        this.notificationService.show('error', `Hubo un error favor intentar más tarde ${err.message}`);
        this.loading = false;
      }
    });

    this.mutationSub = this.invitationService.mutationOccurred$.subscribe(eventId => {
      if (eventId === this.eventId) {
        this.loadPricing();
      }
    });

    this.pricingLoadingSub = this.pricingService.loading$.subscribe(loading => {
      this.pricingLoading = loading;
    });
  }

  ngOnDestroy(): void {
    this.mutationSub?.unsubscribe();
    this.pricingLoadingSub?.unsubscribe();
    // Liberar el lock si el usuario navega fuera sin salir del modo edición
    if (!this.isReadOnly) {
      this.editLockService.stopAndRelease();
    }
    // Asegurar que el scroll se restaure
    document.body.style.overflow = 'auto';
  }

  goToDashboard(): void {
    this.router.navigateByUrl('/dashboard');
  }

  scrollToTop(): void {
    // El contenedor real del scroll en la invitación (evita el problema de html/body height:100%)
    const el = this.invScrollRef?.nativeElement;
    if (el) {
      el.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    // Fallback para cualquier caso borde
    const scrollEl = document.scrollingElement || document.documentElement || document.body;
    try {
      scrollEl.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      scrollEl.scrollTop = 0;
    }
  }

  private applyViewMode(isPaid: boolean): void {
    if (this.isGuestView) {
      this.isReadOnly = true;
      this.canSendToReview = false;
    } else if (this.eventStatus === 'Revisado') {
      this.isReadOnly = true;
      this.canSendToReview = false;
    } else if (isPaid) {
      this.isReadOnly = true;
      this.canSendToReview = false;
      this.isOwnerPreview = true;
    } else if (this.isAdmin && this.eventStatus === 'Creado') {
      this.isReadOnly = false;
      this.canSendToReview = false;
    } else if (this.eventStatus === 'Creado') {
      this.isReadOnly = true;
      this.canSendToReview = true;
    } else {
      this.isReadOnly = true;
      this.canSendToReview = false;
    }
  }

  private finishInit(res: any): void {
    if (res.template) {
      this.templateService.applyTemplateFromData(res.template);
    }

    this.currentTrackId = res.portada?.trackId || '';

    if (res.enabledSections) {
      for (const [key, isEnabled] of Object.entries(res.enabledSections)) {
        this.sections[key] = {
          ...this.sections[key],
          isEnabled: isEnabled as boolean,
          enableCost: this.sections[key]?.enableCost ?? 0,
          sectionName: this.sections[key]?.sectionName ?? key,
          maxItems: this.sections[key]?.maxItems ?? 0
        };
      }
    }

    if (!this.isGuestView) {
      this.loadPricing();
    }

    this.loading = false;

    if (this.isReadOnly) {
      this.showWelcome = true;
      document.body.style.overflow = 'hidden';
    }

    if (!this.isReadOnly && !this.isGuestView) {
      setTimeout(() => this.tourService.startIfNeeded(), 1200);
    }
  }

  onTrackChanged(trackId: string): void {
    this.currentTrackId = trackId;
    this.data.portada.trackId = trackId;
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
    const section = this.sections[sectionKey];
    if (section !== undefined) {
      return section.isEnabled;
    }
    return false;
  }

  getSectionEnableCost(sectionKey: string): number {
    return this.sections[sectionKey]?.enableCost ?? 0;
  }

  getSectionName(sectionKey: string): string {
    return this.sections[sectionKey]?.sectionName ?? sectionKey;
  }

  getSectionMaxItems(sectionKey: string): number {
    const defaults: { [key: string]: number } = {
      'RedesSociales': 5
    };
    return this.sections[sectionKey]?.maxItems ?? defaults[sectionKey] ?? 99;
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
    if (sectionKey === 'AISuggestions') {
      this.togglingSection = sectionKey;
      this.invitationService.getAiUsageCount(this.eventId).subscribe({
        next: (res) => {
          if (res.usedCount > 0) {
            this.togglingSection = '';
            this.notificationService.show(
              'info',
              `No es posible desactivar "Sugerencias con IA" porque ya utilizaste ${res.usedCount} sugerencia(s).`
            );
            return;
          }
          this.doRemoveSection(sectionKey);
        },
        error: () => {
          this.doRemoveSection(sectionKey);
        }
      });
      return;
    }

    this.doRemoveSection(sectionKey);
  }

  private doRemoveSection(sectionKey: string): void {
    this.togglingSection = sectionKey;
    this.pricingService.toggleSection(this.eventId, sectionKey, false).subscribe({
      next: (cost) => {
        this.sections[sectionKey] = {
          ...this.sections[sectionKey],
          isEnabled: false
        };
        this.togglingSection = '';
        this.notificationService.show('success', `${this.getSectionName(sectionKey)} deshabilitada`);

        if (sectionKey === 'Musica') {
          const defaultTrackId = '1271187';
          this.invitationService.addTrack(this.eventId, defaultTrackId).subscribe();
          this.data.portada.trackId = defaultTrackId;
          this.currentTrackId = defaultTrackId;
        }
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
        group.invitados?.forEach((inv: any, index: number) => {
          // Estado 0 → null para que los botones no queden marcados
          if (inv.invitacionConfirmada === 0) {
            inv.invitacionConfirmada = null;
          }
          // Limpiar si el nombre está vacío, solo espacios,
          // o es el placeholder autogenerado "Nombre de Invitado N"
          const nombreTrimmed = inv.nombre?.trim() ?? '';
          const isAutoGenerated = /^Nombre de Invitado \d+$/i.test(nombreTrimmed);
          if (!nombreTrimmed || isAutoGenerated) {
            inv.nombre = '';
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
    const hasEmpty = this.guestGroup.invitados.some((inv: any) => !inv.nombre?.trim());
    const hasNoSelection = this.guestGroup.invitados.some((inv: any) => inv.invitacionConfirmada === null || inv.invitacionConfirmada === 0);
    if (hasEmpty || hasNoSelection) return;

    this.rsvpSubmitting = true;
    const confirmaciones = this.guestGroup.invitados.map((inv: any) => ({
      id: inv.id,
      nombre: inv.nombre,
      invitacionConfirmada: inv.invitacionConfirmada,
      notaEspecial: inv.notaEspecial || null
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

  // AC1 & AC2 logic
  get hasAcceptedGuests(): boolean {
    if (!this.guestGroup || !this.guestGroup.invitados) return false;
    return this.guestGroup.invitados.some((inv: any) => inv.invitacionConfirmada === 1);
  }

  // AC3 logic
  openQrModal(): void {
    console.log('Abriendo modal de QR...');
    alert('Abriendo modal de QR...');
    this.showQrModal = true;
    document.body.style.overflow = 'hidden';
  }

  closeQrModal(): void {
    this.showQrModal = false;
    document.body.style.overflow = 'auto';
  }

  get checkinQrUrl(): string {
    if (!this.guestGroup) return '';
    const baseUrl = window.location.origin;
    const checkinUrl = `${baseUrl}/checkin/${this.guestGroup.grupoId}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(checkinUrl)}`;
  }

  get isBeforeEvent(): boolean {
    const fecha = this.data?.portada?.fecha;

    // Si no hay fecha, asumimos que es antes del evento para no habilitar funciones prematuramente
    if (!fecha) return true;

    const eventTime = new Date(fecha).getTime();
    const now = new Date().getTime();

    // Es "antes del evento" si los milisegundos exactos aún no han llegado
    return now < eventTime;
  }

  get canUploadPhotos(): boolean {
    const fecha = this.data?.portada?.fecha;

    // Si no hay fecha, no se pueden subir fotos
    if (!fecha) return false;

    const eventTime = new Date(fecha).getTime();
    const now = new Date().getTime();

    // 30 días en milisegundos
    const oneMonthMs = 30 * 24 * 60 * 60 * 1000;

    // Permitir si la fecha exacta ya llegó (o pasó) y no ha pasado más de 30 días
    return now >= eventTime && now <= (eventTime + oneMonthMs);
  }

  currentYear() {
    return new Date().getFullYear();
  }
}
