import { Component, OnInit } from '@angular/core';
import { MesaService } from '../../services/mesa.service';
import { InvitadoService } from '../../services/invitado.service';
import { NotificationService } from '../../services/notification.service';

@Component({
    selector: 'app-mesas',
    templateUrl: './mesas.component.html',
    styleUrl: './mesas.component.css',
    standalone: false
})
export class MesasComponent implements OnInit {
  paidEvents: any[] = [];
  selectedEventId: string = '';
  mesas: any[] = [];
  allInvitados: any[] = []; // flat list of all invitados across groups
  loading = false;
  isAdmin = false;
  hasInvitados = false;

  // Form
  showForm = false;
  editingMesaId: string | null = null;
  mesaNombre: string = '';
  mesaCantidad: number = 8;
  mesaOrden: number = 1;
  formSubmitted = false;
  saving = false;

  constructor(
    private mesaService: MesaService,
    private invitadoService: InvitadoService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    const localUser = localStorage.getItem('loggedUser');
    if (localUser) {
      const user = JSON.parse(localUser);
      this.isAdmin = user.role?.toUpperCase() === 'ADMIN';
      this.loadPaidEvents(user.userId);
    }
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
          this.loadData();
        }
      },
      error: () => this.notificationService.show('error', 'Error al cargar eventos')
    });
  }

  onEventChange() {
    this.closeForm();
    this.loadData();
  }

  loadData() {
    if (!this.selectedEventId) return;
    this.loading = true;

    // Load invitados first, then mesas
    this.invitadoService.getGruposByEvent(this.selectedEventId).subscribe({
      next: (grupos) => {
        // Build flat invitado list: { id, nombre, grupoNombre, mesaId }
        this.allInvitados = [];
        for (const grupo of grupos) {
          const grupoName = grupo.nombreFamilia || grupo.invitados?.[0]?.nombre || 'Sin nombre';
          for (const inv of (grupo.invitados || [])) {
            this.allInvitados.push({
              id: inv.id,
              nombre: inv.nombre,
              grupoNombre: grupoName,
              mesaId: inv.mesaId || null,
              displayName: `${grupoName} - ${inv.nombre}`
            });
          }
        }
        this.hasInvitados = this.allInvitados.length > 0;
        this.loadMesas();
      },
      error: () => {
        this.notificationService.show('error', 'Error al cargar invitados');
        this.loading = false;
      }
    });
  }

  loadMesas() {
    this.mesaService.getMesasByEvent(this.selectedEventId).subscribe({
      next: (mesas) => {
        this.mesas = mesas;
        this.loading = false;
      },
      error: () => {
        this.notificationService.show('error', 'Error al cargar mesas');
        this.loading = false;
      }
    });
  }

  // --- Form ---
  openForm() {
    this.showForm = true;
    this.editingMesaId = null;
    this.mesaNombre = '';
    this.mesaCantidad = 8;
    this.mesaOrden = this.mesas.length + 1;
    this.formSubmitted = false;
  }

  editMesa(mesa: any) {
    this.showForm = true;
    this.editingMesaId = mesa.id;
    this.mesaNombre = mesa.nombre;
    this.mesaCantidad = mesa.cantidadLugares;
    this.mesaOrden = mesa.orden;
    this.formSubmitted = false;
  }

  closeForm() {
    this.showForm = false;
    this.editingMesaId = null;
    this.formSubmitted = false;
  }

  isFormValid(): boolean {
    return !!this.mesaNombre?.trim() && this.mesaCantidad > 0 && this.mesaOrden > 0;
  }

  saveMesa() {
    this.formSubmitted = true;
    if (!this.isFormValid()) return;
    this.saving = true;

    const payload = {
      eventId: this.selectedEventId,
      nombre: this.mesaNombre.trim(),
      cantidadLugares: this.mesaCantidad,
      orden: this.mesaOrden
    };

    const req = this.editingMesaId
      ? this.mesaService.updateMesa(this.editingMesaId, payload)
      : this.mesaService.createMesa(payload);

    req.subscribe({
      next: () => {
        this.notificationService.show('success', this.editingMesaId ? 'Mesa actualizada' : 'Mesa creada exitosamente');
        this.closeForm();
        this.saving = false;
        this.loadMesas();
      },
      error: (err) => {
        this.notificationService.show('error', `Error: ${err.error || err.message}`);
        this.saving = false;
      }
    });
  }

  deleteMesa(mesa: any) {
    if (!confirm(`¿Estás seguro de eliminar la mesa "${mesa.nombre}"?`)) return;
    this.mesaService.deleteMesa(mesa.id).subscribe({
      next: () => {
        this.notificationService.show('success', 'Mesa eliminada');
        this.loadData();
      },
      error: (err) => this.notificationService.show('error', `Error: ${err.error || err.message}`)
    });
  }

  // --- Assign/Remove ---
  getAvailableInvitados(mesa: any): any[] {
    const assignedIds = new Set(
      this.mesas.flatMap((m: any) => (m.invitados || []).map((i: any) => i.id))
    );
    return this.allInvitados.filter(inv => !assignedIds.has(inv.id));
  }

  isMesaFull(mesa: any): boolean {
    return (mesa.invitados?.length || 0) >= mesa.cantidadLugares;
  }

  assignInvitado(mesa: any, invitadoId: string) {
    if (!invitadoId || this.isMesaFull(mesa)) return;
    this.mesaService.assignInvitado(mesa.id, invitadoId).subscribe({
      next: () => this.loadData(),
      error: (err) => this.notificationService.show('error', `Error: ${err.error || err.message}`)
    });
  }

  removeInvitado(invitadoId: string) {
    this.mesaService.removeInvitado(invitadoId).subscribe({
      next: () => this.loadData(),
      error: (err) => this.notificationService.show('error', `Error: ${err.error || err.message}`)
    });
  }

  getInvitadoDisplayName(inv: any): string {
    const grupoName = inv.grupo?.nombreFamilia || inv.nombre;
    return `${grupoName} - ${inv.nombre}`;
  }
}
