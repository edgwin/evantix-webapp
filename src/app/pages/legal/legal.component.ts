import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EventService } from '../../services/event.service';

@Component({
  selector: 'app-legal',
  templateUrl: './legal.component.html',
  styleUrls: ['./legal.component.css'],
  standalone: false
})
export class LegalComponent implements OnInit {
  title: string = '';
  content: string = '';
  loading: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private eventService: EventService
  ) {}

  ngOnInit(): void {
    this.route.url.subscribe(url => {
      const path = url[0].path;
      if (path === 'terminos') {
        this.title = 'Términos y Condiciones';
        this.loadTerms();
      } else if (path === 'privacidad') {
        this.title = 'Aviso de Privacidad';
        this.loadPrivacy();
      } else if (path === 'eliminacion-datos') {
        this.title = 'Eliminación de Datos';
        this.content = `
          <div class="legal-custom-content">
            <p>En Evantix, respetamos tu privacidad y tu derecho a controlar tus datos personales.</p>
            <h3>Cómo solicitar la eliminación de tus datos:</h3>
            <p>Si deseas eliminar tu cuenta y todos los datos asociados de nuestra plataforma, por favor sigue estos pasos:</p>
            <ul>
              <li>Envía un correo electrónico a <strong>soporte@evantix.mx</strong></li>
              <li>Usa el asunto: "Solicitud de eliminación de datos - [Tu nombre de usuario]"</li>
              <li>Incluye el correo electrónico asociado a tu cuenta.</li>
            </ul>
            <p>Nuestro equipo procesará tu solicitud en un plazo máximo de 72 horas hábiles. Una vez eliminada la cuenta, esta acción no se puede deshacer.</p>
          </div>
        `;
        this.loading = false;
      }
    });
  }

  loadTerms(): void {
    this.eventService.getTermsAndCoditions().subscribe({
      next: (res: any) => {
        this.content = res.text;
        this.loading = false;
      },
      error: () => {
        this.content = '<p>Error al cargar los términos y condiciones.</p>';
        this.loading = false;
      }
    });
  }

  loadPrivacy(): void {
    this.eventService.getPrivacyPolicy().subscribe({
      next: (res: any) => {
        this.content = res.text;
        this.loading = false;
      },
      error: () => {
        this.content = '<p>Error al cargar el aviso de privacidad.</p>';
        this.loading = false;
      }
    });
  }
}
