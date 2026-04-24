import { Component, HostListener, OnInit, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { InvitadoService } from '../../services/invitado.service';
import { NotificationService } from '../../services/notification.service';
import { PricingService } from '../../services/pricing.service';
import { WhatsAppMasivoService } from '../../services/whatsapp-masivo.service';
import { MercadoPagoService } from '../../services/mercado-pago.service.service';
import { StripeService } from '../../services/stripe.service';
import { MatDialog } from '@angular/material/dialog';
import { WhatsAppPaqueteDialogComponent } from '../../component/whatsapp-paquete-dialog/whatsapp-paquete-dialog.component';
import { PagoDialogComponent } from '../../component/pago-dialog/pago-dialog.component';
import { CustomDomainService } from '../../services/custom-domain.service';
import { environment } from '../../../environments/environment';
import { TourService } from '../../services/tour.service';

@Component({
  selector: 'app-invitados',
  templateUrl: './invitados.component.html',
  styleUrls: ['./invitados.component.css'],
  standalone: false
})
export class InvitadosComponent implements OnInit {
  paidEvents: any[] = [];
  selectedEventId: string = '';
  selectedEventName: string = '';
  selectedEventMensaje: string = '';
  loggedUserId: string = '';
  grupos: any[] = [];
  loading = false;
  isAdmin = false;
  expandedRows: Set<string> = new Set();
  customDomainUrl: string | null = null;

  // Pagination, Search, Sort
  filteredGrupos: any[] = [];
  visibleGrupos: any[] = [];
  currentPage = 1;
  readonly PAGE_SIZE = environment.pageSize;
  totalPages = 0;
  pages: number[] = [];

  searchName = '';
  searchEstatus = '';
  sortField: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  // Form state
  showForm = false;
  editingGrupoId: string | null = null;
  tipoInvitacion: 'Familiar' | 'Individual' = 'Familiar';
  nombreFamilia = '';
  whatsApp = '';
  codigoPaisInvitado = '+52';
  codigosPaisInvitado = [
    { name: 'México', dialCode: '+52' },
    { name: 'Estados Unidos', dialCode: '+1' },
    { name: 'Canadá', dialCode: '+1' },
    { name: 'Guatemala', dialCode: '+502' },
    { name: 'Belice', dialCode: '+501' },
    { name: 'Honduras', dialCode: '+504' },
    { name: 'El Salvador', dialCode: '+503' },
    { name: 'Nicaragua', dialCode: '+505' },
    { name: 'Costa Rica', dialCode: '+506' },
    { name: 'Panamá', dialCode: '+507' },
    { name: 'Colombia', dialCode: '+57' },
    { name: 'Venezuela', dialCode: '+58' },
    { name: 'Ecuador', dialCode: '+593' },
    { name: 'Perú', dialCode: '+51' },
    { name: 'Bolivia', dialCode: '+591' },
    { name: 'Brasil', dialCode: '+55' },
    { name: 'Chile', dialCode: '+56' },
    { name: 'Argentina', dialCode: '+54' },
    { name: 'Uruguay', dialCode: '+598' },
    { name: 'Paraguay', dialCode: '+595' },
    { name: 'Cuba', dialCode: '+53' },
    { name: 'República Dominicana', dialCode: '+1-809' },
    { name: 'Puerto Rico', dialCode: '+1-787' },
    { name: 'Haití', dialCode: '+509' },
    { name: 'Jamaica', dialCode: '+1-876' },
    { name: 'Trinidad y Tobago', dialCode: '+1-868' },
    { name: 'Guyana', dialCode: '+592' },
    { name: 'Surinam', dialCode: '+597' },
    { name: 'España', dialCode: '+34' },
  ];
  email = '';
  invitados: { nombre: string }[] = [{ nombre: '' }];
  formSubmitted = false;
  saving = false;
  confirmacionEnabled = false;

  // WhatsApp masivo
  waCreditsTotales = 0;
  waCreditsDisponibles = 0;
  waSending = false;
  waEnvios: any[] = [];
  waInfoExpanded = false;

  @ViewChildren('invitadoInput') invitadoInputs!: QueryList<ElementRef>;

  constructor(
    private invitadoService: InvitadoService,
    private notificationService: NotificationService,
    private pricingService: PricingService,
    private waService: WhatsAppMasivoService,
    private mercadoPago: MercadoPagoService,
    private stripeService: StripeService,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private router: Router,
    private customDomainService: CustomDomainService,
    private tourService: TourService
  ) { }

  ngOnInit(): void {
    const localUser = localStorage.getItem('loggedUser');
    if (localUser) {
      const user = JSON.parse(localUser);
      this.loggedUserId = user.userId;
      this.isAdmin = user.role?.toUpperCase() === 'ADMIN';
      this.loadPaidEvents(user.userId);
    }

    // Handle payment callback
    this.route.queryParams.subscribe(params => {
      const status = params['status'];
      const waPkg = params['wa_pkg'];
      const eventId = params['external_reference'];

      if (status && waPkg && eventId) {
        if (status === 'approved') {
          this.waService.buyPackage(this.loggedUserId, parseInt(waPkg)).subscribe({
            next: (res: any) => {
              this.notificationService.show('info', `✅ Paquete de ${res.mensajesTotales} mensajes comprado exitosamente`);
              this.loadWaCredits();
            },
            error: () => this.notificationService.show('error', 'Error al registrar paquete')
          });
        } else {
          this.notificationService.show('error', `Pago ${status === 'cancelled' ? 'cancelado' : 'no aprobado'}`);
        }
        this.router.navigate(['/invitados'], { replaceUrl: true });
      }
    });
  }

  loadPaidEvents(userId: string) {
    const events$ = this.isAdmin
      ? this.invitadoService.getAllPaidEvents()
      : this.invitadoService.getPaidEvents(userId);

    events$.subscribe({
      next: (events) => {
        this.paidEvents = events;
        if (events.length > 0) {
          this.selectedEventId = events[0].id;
          this.selectedEventName = events[0].nombre;
          this.selectedEventMensaje = events[0].mensajeInvitacion || '';
          this.loadGrupos();
          this.loadConfirmacionState();
          this.loadCustomDomainUrl();
        }
      },
      error: (err) => this.notificationService.show('error', 'Error al cargar eventos pagados')
    });
  }

  loadGrupos() {
    if (!this.selectedEventId) return;
    this.loading = true;
    this.invitadoService.getGruposByEvent(this.selectedEventId).subscribe({
      next: (grupos) => {
        this.grupos = grupos;
        this.loading = false;
        this.loadWaCredits();
        this.loadWaEnvios();

        setTimeout(() => this.tourService.startIfNeeded('invitados'), 800);

        // Apply filters & pagination
        this.applyFilters();
      },
      error: (err) => {
        this.notificationService.show('error', 'Error al cargar invitados');
        this.loading = false;
      }
    });
  }

  // ===== Search & Filter =====

  applyFilters(): void {
    let data = [...this.grupos];

    // Filter by name (search in grupo name and invitado names)
    if (this.searchName.trim()) {
      const term = this.searchName.toLowerCase().trim();
      data = data.filter((g: any) => {
        const groupName = this.getDisplayName(g).toLowerCase();
        const invNames = (g.invitados || []).some((inv: any) => inv.nombre?.toLowerCase().includes(term));
        return groupName.includes(term) || invNames;
      });
    }

    // Filter by estatus (confirmation status)
    if (this.searchEstatus) {
      data = data.filter((g: any) => {
        const invitados = g.invitados || [];
        if (this.searchEstatus === 'confirmado') return invitados.some((inv: any) => inv.invitacionConfirmada === 1);
        if (this.searchEstatus === 'rechazado') return invitados.some((inv: any) => inv.invitacionConfirmada === 2);
        if (this.searchEstatus === 'asistio') return invitados.some((inv: any) => inv.invitacionConfirmada === 3);
        if (this.searchEstatus === 'pendiente') return invitados.some((inv: any) => inv.invitacionConfirmada === 0);
        return true;
      });
    }

    // Apply sort
    if (this.sortField) {
      data.sort((a: any, b: any) => {
        let valA: string, valB: string;
        if (this.sortField === 'nombre') {
          valA = this.getDisplayName(a).toLowerCase();
          valB = this.getDisplayName(b).toLowerCase();
        } else if (this.sortField === 'email') {
          valA = (a.email || '').toLowerCase();
          valB = (b.email || '').toLowerCase();
        } else if (this.sortField === 'tipo') {
          valA = (a.tipoInvitacion || '').toLowerCase();
          valB = (b.tipoInvitacion || '').toLowerCase();
        } else {
          valA = '';
          valB = '';
        }
        const cmp = valA < valB ? -1 : valA > valB ? 1 : 0;
        return this.sortDirection === 'asc' ? cmp : -cmp;
      });
    }

    this.filteredGrupos = data;
    this.totalPages = Math.max(1, Math.ceil(this.filteredGrupos.length / this.PAGE_SIZE));

    if (this.currentPage > this.totalPages) {
      this.currentPage = 1;
    }

    this.updatePages();
    this.updateVisibleGrupos();
  }

  onSearchChange(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchName = '';
    this.searchEstatus = '';
    this.currentPage = 1;
    this.applyFilters();
  }

  // ===== Sort =====

  onSort(field: string): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.applyFilters();
  }

  getSortIcon(field: string): string {
    if (this.sortField !== field) return '↕';
    return this.sortDirection === 'asc' ? '↑' : '↓';
  }

  // ===== Pagination =====

  private updatePages(): void {
    this.pages = [];
    for (let i = 1; i <= this.totalPages; i++) {
      this.pages.push(i);
    }
  }

  private updateVisibleGrupos(): void {
    const start = (this.currentPage - 1) * this.PAGE_SIZE;
    const end = start + this.PAGE_SIZE;
    this.visibleGrupos = this.filteredGrupos.slice(start, end);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updateVisibleGrupos();
  }

  onEventChange() {
    this.closeForm();
    const ev = this.paidEvents.find((e: any) => e.id === this.selectedEventId);
    this.selectedEventName = ev?.nombre || '';
    this.selectedEventMensaje = ev?.mensajeInvitacion || '';
    this.loadGrupos();
    this.loadConfirmacionState();
    this.loadCustomDomainUrl();
    this.loadWaCredits();
    this.loadWaEnvios();
  }

  private loadCustomDomainUrl(): void {
    this.customDomainUrl = null;
    if (!this.selectedEventId) return;
    this.customDomainService.getByEventId(this.selectedEventId).subscribe({
      next: (domain: any) => {
        console.log('[CustomDomain] Response for event', this.selectedEventId, ':', domain);
        if (domain && domain.estatus === 'Activo') {
          const homeUrl = new URL(environment.homeUrl);
          const baseDomain = homeUrl.hostname;
          const baseUrl = environment.homeUrl.replace(/\/$/, '');
          switch (domain.tipoOpcion) {
            case 1: this.customDomainUrl = `https://${domain.dominioValor}.${baseDomain}`; break;
            case 2: this.customDomainUrl = `https://www.${domain.dominioValor}`; break;
            case 3: this.customDomainUrl = `${baseUrl}/i/${domain.dominioValor}`; break;
          }
          console.log('[CustomDomain] URL set to:', this.customDomainUrl);
        } else {
          console.log('[CustomDomain] No active domain found');
        }
      },
      error: (err) => { console.log('[CustomDomain] Error:', err); }
    });
  }

  private loadConfirmacionState(): void {
    this.pricingService.getEventCost(this.selectedEventId).subscribe({
      next: (cost: any) => {
        const section = cost.sections?.find((s: any) => s.sectionKey === 'ConfirmacionInvitados');
        this.confirmacionEnabled = section?.isEnabled ?? false;
      },
      error: () => this.confirmacionEnabled = false
    });
  }

  // --- Form ---
  openForm() {
    this.showForm = true;
    this.editingGrupoId = null;
    this.tipoInvitacion = 'Familiar';
    this.nombreFamilia = '';
    this.whatsApp = '';
    this.codigoPaisInvitado = '+52';
    this.email = '';
    this.invitados = [{ nombre: '' }];
  }

  closeForm() {
    this.showForm = false;
    this.editingGrupoId = null;
    this.formSubmitted = false;
    this.saving = false;
  }

  switchTipo(tipo: 'Familiar' | 'Individual') {
    this.tipoInvitacion = tipo;
    if (tipo === 'Individual') {
      this.nombreFamilia = '';
      if (this.invitados.length > 2) {
        this.invitados = this.invitados.slice(0, 2);
      }
    }
  }

  addInvitado() {
    if (this.tipoInvitacion === 'Individual' && this.invitados.length >= 2) {
      this.notificationService.show('info', 'Invitación individual permite máximo 2 invitados');
      return;
    }
    const num = this.invitados.length + 1;
    this.invitados.push({ nombre: '' });

    setTimeout(() => {
      const inputs = this.invitadoInputs?.toArray();
      if (inputs && inputs.length > 0) {
        inputs[inputs.length - 1].nativeElement.focus();
      }
    });
  }

  removeInvitado(index: number) {
    if (this.invitados.length > 1) {
      this.invitados.splice(index, 1);
    }
  }

  getDefaultName(index: number): string {
    return `Nombre de Invitado ${index + 1}`;
  }

  saveGrupo() {
    this.formSubmitted = true;
    if (this.saving) return;

    if (!this.whatsApp?.trim()) return;
    if (this.tipoInvitacion === 'Familiar' && !this.nombreFamilia?.trim()) return;

    this.saving = true;

    const invitadosToSave = this.invitados.map((inv, i) => ({
      nombre: inv.nombre.trim() || this.getDefaultName(i)
    }));

    const codigoLimpio = this.codigoPaisInvitado.replace(/[^\d]/g, '');
    const grupo: any = {
      eventId: this.selectedEventId,
      tipoInvitacion: this.tipoInvitacion,
      nombreFamilia: this.tipoInvitacion === 'Familiar' ? this.nombreFamilia : null,
      whatsApp: codigoLimpio + this.whatsApp,
      email: this.email,
      invitados: invitadosToSave
    };
    console.log('saveGrupo -> whatsApp enviado:', grupo.whatsApp, '| codigoLimpio:', codigoLimpio, '| raw:', this.whatsApp);

    if (this.editingGrupoId) {
      this.invitadoService.updateGrupo(this.editingGrupoId, grupo).subscribe({
        next: () => {
          this.saving = false;
          this.notificationService.show('success', 'Invitados actualizados');
          this.closeForm();
          this.loadGrupos();
        },
        error: () => {
          this.saving = false;
          this.notificationService.show('error', 'Error al actualizar');
        }
      });
    } else {
      this.invitadoService.createGrupo(grupo).subscribe({
        next: () => {
          this.saving = false;
          this.notificationService.show('success', 'Invitados registrados');
          this.closeForm();
          this.loadGrupos();
        },
        error: () => {
          this.saving = false;
          this.notificationService.show('error', 'Error al registrar');
        }
      });
    }
  }

  editGrupo(grupo: any) {
    this.showForm = true;
    this.editingGrupoId = grupo.id;
    this.tipoInvitacion = grupo.tipoInvitacion;
    this.nombreFamilia = grupo.nombreFamilia || '';
    this.email = grupo.email || '';
    this.invitados = grupo.invitados.map((i: any) => ({ nombre: i.nombre }));
    if (this.invitados.length === 0) this.invitados = [{ nombre: '' }];

    const fullNumber = grupo.whatsApp || '';
    const codes = this.codigosPaisInvitado
      .map(p => p.dialCode.replace(/[^\d]/g, ''))
      .filter((v, i, a) => a.indexOf(v) === i)
      .sort((a, b) => b.length - a.length);

    const matched = codes.find(code => fullNumber.startsWith(code));
    if (matched) {
      const dialCode = this.codigosPaisInvitado.find(p => p.dialCode.replace(/[^\d]/g, '') === matched);
      this.codigoPaisInvitado = dialCode ? dialCode.dialCode : '+52';
      this.whatsApp = fullNumber.substring(matched.length);
    } else {
      this.codigoPaisInvitado = '+52';
      this.whatsApp = fullNumber;
    }

    // En mobile: scroll hacia el formulario una vez que Angular lo renderiza
    if (window.innerWidth <= 768) {
      setTimeout(() => {
        const formEl = document.getElementById('invitados-form-panel');
        formEl?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }

  deleteGrupo(grupo: any) {
    if (!confirm('¿Estás seguro de eliminar este grupo de invitados?')) return;
    this.invitadoService.deleteGrupo(grupo.id).subscribe({
      next: () => {
        this.notificationService.show('success', 'Invitados eliminados');
        this.loadGrupos();
      },
      error: () => this.notificationService.show('error', 'Error al eliminar')
    });
  }

  // --- Grid expand ---
  toggleExpand(grupoId: string) {
    if (this.expandedRows.has(grupoId)) {
      this.expandedRows.delete(grupoId);
    } else {
      this.expandedRows.add(grupoId);
    }
  }

  isExpanded(grupoId: string): boolean {
    return this.expandedRows.has(grupoId);
  }

  getDisplayName(grupo: any): string {
    if (grupo.tipoInvitacion === 'Familiar') {
      return grupo.nombreFamilia || 'Sin nombre de familia';
    }
    return grupo.invitados?.[0]?.nombre || 'Sin nombre';
  }

  getTotalInvitados(): number {
    return this.grupos.reduce((sum, g) => sum + (g.invitados?.length || 0), 0);
  }

  allRespondidos(grupo: any): boolean {
    const invitados = grupo.invitados;
    if (!invitados || invitados.length === 0) return false;
    return invitados.every((inv: any) => inv.invitacionConfirmada === 1 || inv.invitacionConfirmada === 2 || inv.invitacionConfirmada === 3);
  }

  getInvitationUrl(grupo: any): string {
    if (this.customDomainUrl) {
      return `${this.customDomainUrl}/${grupo.idInvitacion}`;
    }
    const name = this.selectedEventName.replace(/\s+/g, '-');
    const base = `${window.location.origin}/invitacion/${encodeURIComponent(name)}/${this.selectedEventId}`;
    if (this.pricingService.isSectionEnabled('ConfirmacionInvitados')) {
      return `${base}/${grupo.idInvitacion}`;
    }
    return base;
  }

  private buildInvitationMessage(grupo: any): string {
    const eventName = this.selectedEventName;
    const displayName = this.getDisplayName(grupo);
    const guestName = displayName;
    const mensaje = this.selectedEventMensaje;
    const url = this.getInvitationUrl(grupo);
    const home = environment.homeUrl;

    return `Invitacion a Evento: ${eventName}\n` +
      `Hola! ${guestName}\n` +
      `${mensaje}\n` +
      `${url}\n` +
      `En caso de no poder asistir, notifícalo en la misma invitación.\n` +
      `Gracias!\n` +
      `Enviado desde ${home}`;
  }

  sendWhatsApp(grupo: any) {
    const message = this.buildInvitationMessage(grupo);
    const phone = grupo.whatsApp?.replace(/\D/g, '') || '';
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
  }

  sendEmail(grupo: any) {
    const body = this.buildInvitationMessage(grupo);
    const subject = `Invitación a Evento de ${this.selectedEventName}`;
    window.open(`mailto:${grupo.email || ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  }

  exportCsv() {
    const statusLabel = (s: number) => s === 1 ? 'Confirmado' : s === 2 ? 'Rechazado' : s === 3 ? 'Asistió' : 'Pendiente';
    const lines: string[] = [];
    lines.push('Grupo,Tipo,Nombre Invitado,Email,WhatsApp,Estatus,Confirmado Por,Mesa,Nota Especial');

    for (const grupo of this.grupos) {
      const grupoName = grupo.nombreFamilia || grupo.invitados?.[0]?.nombre || 'Sin nombre';
      for (const inv of (grupo.invitados || [])) {
        lines.push([
          `"${grupoName}"`,
          grupo.tipoInvitacion,
          `"${inv.nombre || ''}"`,
          grupo.email || '',
          grupo.whatsApp || '',
          statusLabel(inv.invitacionConfirmada),
          inv.confirmadoPor || '',
          inv.mesa?.nombre || '',
          `"${(inv.notaEspecial || '').replace(/"/g, '""')}"`
        ].join(','));
      }
    }

    const csv = lines.join('\r\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Invitados_${this.selectedEventName.replace(/\s+/g, '_')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 100);
  }

  // ===== WhatsApp Masivo =====

  loadWaCredits() {
    if (!this.loggedUserId) return;
    this.waService.getCredits(this.loggedUserId).subscribe({
      next: (res: any) => {
        this.waCreditsTotales = res.totalCreditos;
        this.waCreditsDisponibles = res.disponibles;
      },
      error: () => { }
    });
  }

  loadWaEnvios() {
    if (!this.selectedEventId) return;
    this.waService.getEnvios(this.selectedEventId).subscribe({
      next: (envios) => this.waEnvios = envios,
      error: () => { }
    });
  }

  openBuyPackage() {
    const dialogRef = this.dialog.open(WhatsAppPaqueteDialogComponent, {
      width: '560px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      data: { eventId: this.selectedEventId }
    });

    dialogRef.afterClosed().subscribe((paquete: any) => {
      if (!paquete) return;

      const ev = this.paidEvents.find((e: any) => e.id === this.selectedEventId);
      const pagoRef = this.dialog.open(PagoDialogComponent, {
        width: '500px',
        maxWidth: '95vw',
        data: {
          evento: {
            id: this.selectedEventId,
            nombre: `Paquete WhatsApp – ${paquete.mensajes} mensajes`,
            fecha: ev?.fecha || '',
            estatus: 'Pendiente',
            costo: paquete.precio
          },
          isWhatsAppPackage: true
        }
      });

      pagoRef.afterClosed().subscribe((metodo: string) => {
        if (!metodo) return;

        const callbackBase = `${window.location.origin}/invitados`;
        const callbackUrl = `${callbackBase}?wa_pkg=${paquete.mensajes}`;

        const pagoEvento = {
          id: this.selectedEventId,
          nombre: `Paquete WhatsApp – ${paquete.mensajes} mensajes`,
          description: `Paquete WhatsApp – ${paquete.mensajes} mensajes`,
          externalRef: `wa_${this.selectedEventId}`,
          costo: paquete.precio,
          callbackUrl: callbackUrl,
          externalReference: "Paquete WhatsApp"
        };

        if (metodo.toLowerCase() === 'mercado pago') {
          this.notificationService.show('info', 'Redirigiendo a MercadoPago, espere un momento');
          this.mercadoPago.createPreference(pagoEvento, false).subscribe({
            next: (res: any) => window.open(res.init_point, '_self'),
            error: () => this.notificationService.show('error', 'Error al crear preferencia de pago')
          });
        } else if (metodo.toLowerCase() === 'stripe') {
          this.notificationService.show('info', 'Redirigiendo a Stripe, espere un momento');
          this.stripeService.createSession(pagoEvento, false).subscribe({
            next: (res: any) => window.open(res.sessionUrl, '_self'),
            error: () => this.notificationService.show('error', 'Error al crear sesión de pago')
          });
        }
      });
    });
  }

  massSendAll() {
    if (this.waSending) return;
    const template = `${this.selectedEventMensaje}\n\n👉 Confirma tu asistencia aquí: {link}`;
    this.waSending = true;

    this.waService.sendAll(this.selectedEventId, template).subscribe({
      next: (res: any) => {
        this.waSending = false;
        this.notificationService.show('info', `📤 ${res.enviados} invitaciones enviadas por WhatsApp`);
        this.loadWaCredits();
        this.loadWaEnvios();
      },
      error: (err: any) => {
        this.waSending = false;
        this.notificationService.show('error', err.error || 'Error al enviar');
      }
    });
  }

  massResendUnconfirmed() {
    if (this.waSending) return;
    const template = `${this.selectedEventMensaje}\n\n👉 Confirma tu asistencia aquí: {link}`;
    this.waSending = true;

    this.waService.resendUnconfirmed(this.selectedEventId, template).subscribe({
      next: (res: any) => {
        this.waSending = false;
        this.notificationService.show('info', `🔄 ${res.enviados} recordatorios enviados`);
        this.loadWaCredits();
        this.loadWaEnvios();
      },
      error: (err: any) => {
        this.waSending = false;
        this.notificationService.show('error', err.error || 'Error al reenviar');
      }
    });
  }

  getWaStatusLabel(grupo: any): string {
    const envio = this.waEnvios.find(e => e.invitadoGrupoId === grupo.id);
    if (!envio) return '—';
    switch (envio.estatus) {
      case 'Enviado': return '✅ Enviado';
      case 'Entregado': return '📬 Entregado';
      case 'Leído': return '👁️ Leído';
      case 'Error': return '❌ Error';
      default: return envio.estatus;
    }
  }

  getWaStatusClass(grupo: any): string {
    const envio = this.waEnvios.find(e => e.invitadoGrupoId === grupo.id);
    if (!envio) return '';
    return `wa-status-${envio.estatus.toLowerCase()}`;
  }
}
