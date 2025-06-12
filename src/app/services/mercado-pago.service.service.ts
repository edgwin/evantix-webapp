import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

declare var MercadoPago: any;

@Injectable({ providedIn: 'root' })
export class MercadoPagoService {
  private mp = new MercadoPago('APP_USR-9704cb72-d38e-4478-b0a5-13ee7cf26554', { locale: 'es-MX' });

  constructor(private http: HttpClient) {}
  apiUrl = 'https://localhost:7282/api/Event/';
  createReferenceEndpoint = 'CreatePaymentReference';
  createPreference(event: any) {
    const token = localStorage.getItem('access_token');
    
        const headers = new HttpHeaders({
          Authorization: `Bearer ${token}`
        });
    
    return this.http.post<{ id: string }>(`${this.apiUrl}${this.createReferenceEndpoint}`, {
      title: event.nombre,
      description: `Pago del plan ${event.plan} del event ID: ${event.id}`,
      quantity: 1,
      unitPrice: event.costo,
      eventId: event.id      
    }, { headers });
  }

  openCheckout(preferenceId: string) {
    this.mp.checkout({
      preference: {
        id: preferenceId
      },
      autoOpen: true
    });
  }
}
