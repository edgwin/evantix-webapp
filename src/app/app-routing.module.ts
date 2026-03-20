import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { LayoutComponent } from './pages/layout/layout.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { PrivacidadComponent } from './pages/privacidad/privacidad.component';
import { AuthGuard } from './auth.guard';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { CondicionesComponent } from './pages/condiciones/condiciones.component';
import { InvitacionesComponent } from './pages/invitaciones/invitaciones.component';
import { InvitadosComponent } from './pages/invitados/invitados.component';
import { MesasComponent } from './pages/mesas/mesas.component';
import { NuevoEventoComponent } from './pages/nuevo-evento/nuevo-evento.component';
import { InvitacionComponent } from './pages/invitacion/invitacion.component';
import { DescuentosComponent } from './pages/descuentos/descuentos.component';
import { CheckinComponent } from './pages/checkin/checkin.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'privacidad',
    component: PrivacidadComponent
  },
  {
    path: 'condiciones',
    component: CondicionesComponent
  },
  {
    path: 'forgotPassword',
    component: ForgotPasswordComponent
  },
  { path: 'invitacion/:name/:idEvent', component: InvitacionComponent },
  { path: 'invitacion/:name/:idEvent/:idInvitado', component: InvitacionComponent },
  { path: 'checkin/:grupoId', component: CheckinComponent },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard], // opcional: proteger todo
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'invitaciones', component: InvitacionesComponent },
      { path: 'invitados', component: InvitadosComponent },
      { path: 'mesas', component: MesasComponent },
      { path: 'nuevoEvento', component: NuevoEventoComponent },
      { path: 'descuentos', component: DescuentosComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
