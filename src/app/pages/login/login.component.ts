import { Component, AfterViewInit, OnInit  } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService, UserCreateRequest, UserLoginRequest, ForgotPassRequest } from '../../services/user.service';
import { NotificationService } from '../../services/notification.service';
import { ActivatedRoute } from '@angular/router';
import { PasswordHelper } from '../../helpers/email'

import { environment } from '../../../environments/environment';

declare const google: any;
declare const FB: any;

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css'],
    standalone: false
})
export class LoginComponent implements AfterViewInit, OnInit {
  isLoading = false;
  errorMessage = '';
  signUpForm!: FormGroup;
  signInForm!: FormGroup;

  isSignDivVisiable: boolean  = false;
  isForgotVisible: boolean = false;
  loginObj: LoginModel  = new LoginModel();
  private facebookLoginInProgress = false;

  constructor(private fb: FormBuilder, private router: Router, private userService: UserService, private notificationService: NotificationService, 
              private http: HttpClient, private route: ActivatedRoute, private passwordHelper: PasswordHelper){
    this.createSignUpForm();
    this.createSignInForm();
  }
  
  ngAfterViewInit(): void {
    try {
      google.accounts.id.initialize({
        client_id: environment.googleClientId,
        callback: (res: any) => {
          this.isLoading = true;
          this.sendToBackend('google', res.credential);
        },
      });
      google.accounts.id.renderButton(document.getElementById('googleBtn1'), {
        theme: 'outline',
        size: 'medium'
      });
      google.accounts.id.renderButton(document.getElementById('googleBtn2'), {
        theme: 'outline',
        size: 'medium'
      });
    } catch (err) {
      console.warn('Google Identity Services no disponible', err);
    }
  }
  
  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const signIn = params['signIn'];
      const confirmed = params['confirmed'];
      if (signIn !== undefined) {
        this.isSignDivVisiable = !(signIn === 'true');
      }
      if (confirmed === "true") {
        this.notificationService.show('info','Usuario confirmado exitosamente, ahora puede ingresar a su nueva cuenta');
      }
    });
  }  

  facebookLogin() {
    this.isLoading = true;
    if (typeof FB === 'undefined') {
      this.isLoading = false;
      this.notificationService.show('error', 'Facebook SDK no disponible. Intente de nuevo.');
      return;
    }
    FB.login((response: any) => {
      if (response.authResponse) {
        this.facebookLoginInProgress = true;
        this.sendToBackend('facebook', response.authResponse.accessToken);
      } else {
        this.isLoading = false;
      }
    }, { scope: 'email,public_profile' });
  }
  
  sendToBackend(provider: 'google' | 'facebook', token: string) {
    this.isLoading = true;
    this.http.post(`${environment.identityApiUrl}/api/User/${provider==='facebook'?'facebook':'google'}`, { appId: environment.appId, role: 'User', token }).subscribe({
      next: (res: any) => {
        localStorage.setItem('access_token', res.access_token);    
        localStorage.setItem('loggedUser', JSON.stringify(res.user));
        this.isLoading = false;
        this.facebookLoginInProgress = false;
        this.router.navigateByUrl('/dashboard');  
      },
      error: err => {
        console.error('Error de login', err);
        this.isLoading = false;
        this.facebookLoginInProgress = false;
        this.notificationService.show('error', 'Error al iniciar sesión. Intente de nuevo.');
      }
    });
  }


  private createSignUpForm() {
    this.signUpForm = this.fb.group({
      Email: ['', [Validators.required, Validators.email]],
      FirstName: ['', [Validators.required, Validators.minLength(2)]],
      LastName: ['', [Validators.required]],
      Password: ['', [Validators.required, Validators.minLength(8)]],
      Password2: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  private createSignInForm() {
    this.signInForm = this.fb.group({
      UserName: ['', [Validators.required, Validators.email]],      
      Password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  onRegister() {
    if (this.signUpForm.status == 'VALID') {
      if (!this.passwordHelper.passwordMatchValidator(this.signUpForm)){
        this.notificationService.show('error','Las contraseñas no coinciden');
      }else{
        this.isLoading = true;
        this.errorMessage = '';

        let userData: UserCreateRequest = this.signUpForm.value;
        userData.AppId = environment.appId;
        userData.IsEnabled = true;
        userData.Role = 'User';

        this.userService.createUser(userData).subscribe({
          next: (res) => {
            this.isLoading = false;
            this.notificationService.show('info','Usuario creado exitosamente, verifica tu email para continuar con el registro');
            this.signUpForm.reset();
          },
          error: (err) => {
            this.isLoading = false;
            this.notificationService.show('error',`${err.error}`);
          }
        });
      }
    }
  }


  onLogin() {    
    if (this.signInForm.status == 'VALID') {
      this.errorMessage = '';
      this.isLoading = true;
      let userData: UserLoginRequest = this.signInForm.value;
      userData.AppId = environment.appId;
      
      this.userService.loginUser(userData).subscribe({
        next: (res: any) => {          
          localStorage.setItem('access_token', res.access_token);    
          localStorage.setItem('loggedUser', JSON.stringify(res.user));
          this.router.navigateByUrl('/dashboard');
          this.isLoading = false;
        },
        error: err => {
          this.notificationService.show('error',err.error)
          this.isLoading = false;
        }
      });
    }
  }

  onForgotClick(){
    this.isForgotVisible = !this.isForgotVisible;
  }

  forgotPassword(){        
    const forgotEmail = document.getElementById('forgotEmail') as HTMLInputElement;
    if (!this.isValidEmail(forgotEmail.value)){
      this.notificationService.show('error',`El Email no es valido`);
      document.getElementById('forgotEmail')?.focus()
      return
    }
    this.isLoading = true;
    this.errorMessage = '';

    let userData: ForgotPassRequest = {
      Email: forgotEmail.value,
      AppId: environment.appId
    };
    
    this.userService.forgotPass(userData).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.notificationService.show('info',`Se envio un email a ${userData.Email} con informacion para cambiar su contraseña`);
        (document.getElementById('forgotEmail') as HTMLInputElement).value = "";
        this.isForgotVisible = false;
      },        
      error: err => this.notificationService.show('error',err.error)
    });
  }

  isValidEmail(email:string) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

}

export class SignUpModel  {
  email: string;
  name: string; 
  lastName: string; 
  password: string;

  constructor() {
    this.email = "";
    this.name = "";
    this.lastName = "";
    this.password= ""
  }
}

export class LoginModel  { 
  email: string;
  password: string;

  constructor() {
    this.email = ""; 
    this.password= ""
  }
}
