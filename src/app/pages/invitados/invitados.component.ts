import { Component, OnInit } from '@angular/core';
import { InvitadoService } from '../../services/invitado.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-invitados',
  templateUrl: './invitados.component.html',
  styleUrls: ['./invitados.component.css']
})
export class InvitadosComponent implements OnInit {
  paidEvents: any[] = [];
  selectedEventId: string = '';
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

  constructor(
    private invitadoService: InvitadoService,
    private notificationService: NotificationService
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
          this.loadGrupos();
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
    this.loadGrupos();
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
}
