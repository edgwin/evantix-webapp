import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './pages/login/login.component';
import { LayoutComponent } from './pages/layout/layout.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NotificationComponent } from './pages/notification/notification.component';
import { PrivacidadComponent } from './pages/privacidad/privacidad.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { TopbarComponent } from './pages/layout/topbar/topbar.component';
import { SidebarComponent } from './pages/layout/sidebar/sidebar.component';
import { MatIconModule } from '@angular/material/icon';
import { CondicionesComponent } from './pages/condiciones/condiciones.component';
import { FacebookLoginProvider, SocialAuthServiceConfig, SocialLoginModule } from '@abacritt/angularx-social-login';
import { InvitacionesComponent } from './pages/invitaciones/invitaciones.component';
import { InvitadosComponent } from './pages/invitados/invitados.component';
import { MesasComponent } from './pages/mesas/mesas.component';
import { AgGridModule } from 'ag-grid-angular';
import { AccionesCellRendererComponent } from './pages/dashboard/acciones-cell-renderer.component';
import { NuevoEventoComponent } from './pages/nuevo-evento/nuevo-evento.component';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { RouterModule } from '@angular/router';
import { EdgwinGridComponent } from './component/edgwin-grid/edgwin-grid.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { PagoDialogComponent } from './component/pago-dialog/pago-dialog.component';
import { PopupHtmlComponent } from './component/popup-html/popup-html.component';
import { UploadImagesComponent } from './component/upload-images/upload-images.component';
import { PlanCardComponent } from './component/plan-card/plan-card.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MapaModalComponent } from './component/mapa-modal/mapa-modal.component';
import { GoogleMapsModule } from '@angular/google-maps';
import { CommonModule } from '@angular/common';
import { DescuentosComponent } from './pages/descuentos/descuentos.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    LayoutComponent,
    DashboardComponent,
    NotificationComponent,
    PrivacidadComponent,
    ForgotPasswordComponent,
    TopbarComponent,
    SidebarComponent,
    CondicionesComponent,
    InvitacionesComponent,
    InvitadosComponent,
    MesasComponent,
    AccionesCellRendererComponent,
    NuevoEventoComponent,
    EdgwinGridComponent,
    PagoDialogComponent,
    UploadImagesComponent,
    PlanCardComponent,
    MapaModalComponent,
    DescuentosComponent
  ],
  imports: [
    RouterModule,
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    SocialLoginModule,
    AgGridModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    GoogleMapsModule,
    MatDialogModule,
    MatButtonModule,
    PopupHtmlComponent,
    DragDropModule,
    BrowserAnimationsModule,
    CommonModule,
  ],
  exports: [UploadImagesComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [
    {
      provide: 'SocialAuthServiceConfig',
      useValue: {
        autoLogin: false,
        lang: 'en',
        providers: [
          {
            id: FacebookLoginProvider.PROVIDER_ID,
            provider: new FacebookLoginProvider('616411058067807')
          }
        ],
        onError: (err) => {
          console.error(err);
        }
      } as SocialAuthServiceConfig,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    provideAnimationsAsync()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
