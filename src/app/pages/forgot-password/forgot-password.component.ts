import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PasswordHelper } from '../../helpers/email';
import { NotificationService } from '../../services/notification.service';
import { ResetPassRequest, UserService } from '../../services/user.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
    selector: 'app-forgot-password',
    templateUrl: './forgot-password.component.html',
    styleUrl: './forgot-password.component.css',
    standalone: false
})
export class ForgotPasswordComponent {
  resetForm!: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(private fb: FormBuilder, private passwordHelper: PasswordHelper, private notificationService: NotificationService,
                private route: ActivatedRoute, private userService: UserService, private router: Router){
      this.createResetForm();
  }

  private createResetForm() {
      this.resetForm = this.fb.group({
        Password:  ['', [Validators.required, Validators.email, Validators.minLength(8)]],
        Password2: ['', [Validators.required, Validators.email, Validators.minLength(8)]], //TODO checar con el back el tamaño requerido en todos los campos de password
      });
  }

  onReset(){
    if (!(this.resetForm.status == 'VALID' && this.passwordHelper.passwordMatchValidator(this.resetForm))) {
      this.notificationService.show('error','Las contraseñas no coinciden');
      document.getElementById('Password')?.focus()
      return
    }
    this.isLoading = true;
    this.errorMessage = '';

    let email:string = "";
    let code: string = "";
    this.route.queryParams.subscribe(params => {
      email = params['email'];
      code = decodeURIComponent(params['code']);
    });

    let userData: ResetPassRequest = {
      Code: code,
      Email: email,
      Password: this.resetForm.value.Password,
      ConfirmPassword: this.resetForm.value.Password2
    };
    
    this.userService.resetPass(userData).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.notificationService.show('info',`Contraseña reestablecida con exito ... redirigiendose a pagina inicial`);
        setTimeout(() => {
          this.router.navigateByUrl('/login');
        }, 1000);        
      },        
      error: err => this.notificationService.show('error',err.error)
    });
  }
}
