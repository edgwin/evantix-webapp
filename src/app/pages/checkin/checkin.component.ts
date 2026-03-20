import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface CheckInInvitado {
  id: string;
  nombre: string;
  invitacionConfirmada: number; // 0=Pendiente, 1=Confirmado, 2=Rechazado, 3=Asistió
  mesa: string | null;
  marking?: boolean;
}

interface CheckInData {
  grupoId: string;
  tipoInvitacion: string;
  nombreFamilia: string | null;
  eventoNombre: string;
  eventoFecha: string;
  invitados: CheckInInvitado[];
}

@Component({
  selector: 'app-checkin',
  templateUrl: './checkin.component.html',
  styleUrls: ['./checkin.component.css']
})
export class CheckinComponent implements OnInit {
  data: CheckInData | null = null;
  loading = true;
  error = false;
  errorMsg = '';

  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit(): void {
    const grupoId = this.route.snapshot.paramMap.get('grupoId');
    if (!grupoId) {
      this.error = true;
      this.errorMsg = 'No se proporcionó un código válido.';
      this.loading = false;
      return;
    }

    this.http.get<CheckInData>(`${environment.coreApiUrl}/api/Invitado/CheckIn/${grupoId}`)
      .subscribe({
        next: (res) => {
          this.data = res;
          this.loading = false;
        },
        error: (err) => {
          this.error = true;
          this.errorMsg = err.status === 404
            ? 'No se encontró la invitación.'
            : 'Error al cargar la información.';
          this.loading = false;
        }
      });
  }

  getStatusText(status: number): string {
    switch (status) {
      case 1: return 'Confirmado ✅';
      case 2: return 'Rechazado ❌';
      case 3: return 'Asistió 🎉';
      default: return 'Pendiente ⏳';
    }
  }

  getStatusClass(status: number): string {
    switch (status) {
      case 1: return 'status-confirmed';
      case 2: return 'status-declined';
      case 3: return 'status-attended';
      default: return 'status-pending';
    }
  }

  getMesaDisplay(): string {
    const mesas = this.data?.invitados
      .map(i => i.mesa)
      .filter((m): m is string => !!m);
    const unique = [...new Set(mesas)];
    return unique.length > 0 ? unique.join(', ') : 'Sin mesa asignada';
  }

  allPending(): boolean {
    return this.data?.invitados.every(i => i.invitacionConfirmada === 0) ?? false;
  }

  markAttendance(inv: CheckInInvitado): void {
    if (inv.marking) return;
    inv.marking = true;
    this.http.put(`${environment.coreApiUrl}/api/Invitado/CheckIn/Attendance/${inv.id}`, {})
      .subscribe({
        next: () => {
          inv.invitacionConfirmada = 3;
          inv.marking = false;
        },
        error: () => {
          inv.marking = false;
          alert('Error al registrar asistencia');
        }
      });
  }
}
