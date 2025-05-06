import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { LayoutComponent } from './pages/layout/layout.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { PrivacidadComponent } from './pages/privacidad/privacidad.component';
import { AuthGuard } from './auth.guard';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component'

const routes: Routes = [
  {
    path:'',
    redirectTo : 'login',
    pathMatch:'full'
  },
  {
    path:'login',
    component: LoginComponent
  },
  {
    path:'privacidad',
    component: PrivacidadComponent
  },
  {
    path:'forgotPassword',
    component: ForgotPasswordComponent
  },
  {
    path:'',
    component: LayoutComponent,
    children: [
      {
        path:'dashboard',
        component:DashboardComponent,
        canActivate: [AuthGuard]
      }
    ]
  },
  { path: '**', redirectTo: 'login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
