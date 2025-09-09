import { Injectable } from "@angular/core";

@Injectable({
  providedIn: 'root'
})
export class FechasHelper {
  formatearFechaHora(fechaISO: string | Date) {
    const meses = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    let fecha: Date;
    
    if (typeof fechaISO === "string" && /^\d{4}-\d{2}-\d{2}$/.test(fechaISO)) {
      const [anio, mes, dia] = fechaISO.split("-").map(Number);
      fecha = new Date(anio, mes - 1, dia); // <-- local sin timezone shift
    } else {
      fecha = new Date(fechaISO);
    }

    const dia = fecha.getDate();
    const mes = meses[fecha.getMonth()];
    const anio = fecha.getFullYear();

    return `${dia} de ${mes} del ${anio}`;
  }
}