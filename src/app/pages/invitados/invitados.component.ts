import { Component, OnInit, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { InvitadoService } from '../../services/invitado.service';
import { NotificationService } from '../../services/notification.service';
import { PricingService } from '../../services/pricing.service';

@Component({
  selector: 'app-invitados',
  templateUrl: './invitados.component.html',
  styleUrls: ['./invitados.component.css']
})
export class InvitadosComponent implements OnInit {
  paidEvents: any[] = [];
  selectedEventId: string = '';
  selectedEventName: string = '';
  selectedEventMensaje: string = '';
  grupos: any[] = [];
  loading = false;
  expandedRows: Set<string> = new Set();

  // Form state
  showForm = false;
  editingGrupoId: string | null = null;
  tipoInvitacion: 'Familiar' | 'Individual' = 'Familiar';
  nombreFamilia = '';
  whatsApp = '';
  email = '';
  invitados: { nombre: string }[] = [{ nombre: '' }];
  formSubmitted = false;
  confirmacionEnabled = false;

  @ViewChildren('invitadoInput') invitadoInputs!: QueryList<ElementRef>;

  constructor(
    private invitadoService: InvitadoService,
    private notificationService: NotificationService,
    private pricingService: PricingService
  ) { }

  ngOnInit(): void {
    const localUser = localStorage.getItem('loggedUser');
    if (localUser) {
      const user = JSON.parse(localUser);
      this.loadPaidEvents(user.userId);
    }
  }

  loadPaidEvents(userId: string) {
    this.invitadoService.getPaidEvents(userId).subscribe({
      next: (events) => {
        this.paidEvents = events;
        if (events.length > 0) {
          this.selectedEventId = events[0].id;
          this.selectedEventName = events[0].nombre;
          this.selectedEventMensaje = events[0].mensajeInvitacion || '';
          this.loadGrupos();
          this.loadConfirmacionState();
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
      },
      error: (err) => {
        this.notificationService.show('error', 'Error al cargar invitados');
        this.loading = false;
      }
    });
  }

  onEventChange() {
    this.closeForm();
    const ev = this.paidEvents.find((e: any) => e.id === this.selectedEventId);
    this.selectedEventName = ev?.nombre || '';
    this.selectedEventMensaje = ev?.mensajeInvitacion || '';
    this.loadGrupos();
    this.loadConfirmacionState();
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
    this.email = '';
    this.invitados = [{ nombre: '' }];
  }

  closeForm() {
    this.showForm = false;
    this.editingGrupoId = null;
    this.formSubmitted = false;
  }

  switchTipo(tipo: 'Familiar' | 'Individual') {
    this.tipoInvitacion = tipo;
    if (tipo === 'Individual') {
      this.nombreFamilia = '';
      // Max 2 for individual
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

    // Auto-focus en el nuevo input
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
    return `Invitado ${index + 1}`;
  }

  saveGrupo() {
    this.formSubmitted = true;

    // Validations
    if (!this.whatsApp?.trim()) return;
    if (this.tipoInvitacion === 'Familiar' && !this.nombreFamilia?.trim()) return;

    const invitadosToSave = this.invitados.map((inv, i) => ({
      nombre: inv.nombre.trim() || this.getDefaultName(i)
    }));

    const grupo: any = {
      eventId: this.selectedEventId,
      tipoInvitacion: this.tipoInvitacion,
      nombreFamilia: this.tipoInvitacion === 'Familiar' ? this.nombreFamilia : null,
      whatsApp: this.whatsApp,
      email: this.email,
      invitados: invitadosToSave
    };

    if (this.editingGrupoId) {
      this.invitadoService.updateGrupo(this.editingGrupoId, grupo).subscribe({
        next: () => {
          this.notificationService.show('success', 'Invitados actualizados');
          this.closeForm();
          this.loadGrupos();
        },
        error: () => this.notificationService.show('error', 'Error al actualizar')
      });
    } else {
      this.invitadoService.createGrupo(grupo).subscribe({
        next: () => {
          this.notificationService.show('success', 'Invitados registrados');
          this.closeForm();
          this.loadGrupos();
        },
        error: () => this.notificationService.show('error', 'Error al registrar')
      });
    }
  }

  editGrupo(grupo: any) {
    this.showForm = true;
    this.editingGrupoId = grupo.id;
    this.tipoInvitacion = grupo.tipoInvitacion;
    this.nombreFamilia = grupo.nombreFamilia || '';
    this.whatsApp = grupo.whatsApp || '';
    this.email = grupo.email || '';
    this.invitados = grupo.invitados.map((i: any) => ({ nombre: i.nombre }));
    if (this.invitados.length === 0) this.invitados = [{ nombre: '' }];
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

  getInvitationUrl(grupo: any): string {
    const name = this.selectedEventName.replace(/\s+/g, '-');
    const base = `${window.location.origin}/invitacion/${encodeURIComponent(name)}/${this.selectedEventId}`;
    // Only include idInvitacion if ConfirmacionInvitados section is enabled
    if (this.pricingService.isSectionEnabled('ConfirmacionInvitados')) {
      return `${base}/${grupo.idInvitacion}`;
    }
    return base;
  }

  sendWhatsApp(grupo: any) {
    const url = this.getInvitationUrl(grupo);
    const message = `${this.selectedEventMensaje}\n\n${url}`;
    const phone = grupo.whatsApp?.replace(/\D/g, '') || '';
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
  }

  sendEmail(grupo: any) {
    const url = this.getInvitationUrl(grupo);
    const body = `${this.selectedEventMensaje}\n\n${url}`;
    const subject = `Invitación - ${this.selectedEventName}`;
    window.open(`mailto:${grupo.email || ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  }

  exportCsv() {
    const statusLabel = (s: number) => s === 1 ? 'Confirmado' : s === 2 ? 'Rechazado' : 'Pendiente';
    const lines: string[] = [];
    lines.push('Grupo,Tipo,Nombre Invitado,Email,WhatsApp,Estatus,Confirmado Por,Mesa');

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
          inv.mesaNumero || ''
        ].join(','));
      }
    }

    const csv = lines.join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Invitados_${this.selectedEventName.replace(/\s+/g, '_')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
