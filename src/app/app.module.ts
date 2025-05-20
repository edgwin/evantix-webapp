import { NgModule } from '@angular/core';
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
    CondicionesComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule
  ],
  providers: [
    provideAnimationsAsync()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
