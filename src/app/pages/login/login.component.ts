import { Component, AfterViewInit, OnInit  } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService, UserCreateRequest, UserLoginRequest, ForgotPassRequest } from '../../services/user.service';
import { NotificationService } from '../../services/notification.service';
import { ActivatedRoute } from '@angular/router';
import { PasswordHelper } from '../../helpers/email'

declare const google: any;
declare const FB: any;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements AfterViewInit, OnInit {
  isLoading = false;
  errorMessage = '';
  signUpForm!: FormGroup;
  signInForm!: FormGroup;

  isSignDivVisiable: boolean  = false;
  isForgotVisible: boolean = false;
  loginObj: LoginModel  = new LoginModel();

  constructor(private fb: FormBuilder, private router: Router, private userService: UserService, private notificationService: NotificationService, 
              private http: HttpClient, private route: ActivatedRoute, private passwordHelper: PasswordHelper){
    this.createSignUpForm();
    this.createSignInForm();
  }
  
  ngAfterViewInit(): void {
    google.accounts.id.initialize({
      client_id: '579973959669-m41nol7osd3i1rvdb1fhhm5p4alnh71o.apps.googleusercontent.com',
      callback: (res: any) => this.sendToBackend('google', res.credential),
    });
    google.accounts.id.renderButton(document.getElementById('googleBtn1'), {
      theme: 'outline',
      size: 'medium'
    });
    google.accounts.id.renderButton(document.getElementById('googleBtn2'), {
      theme: 'outline',
      size: 'medium'
    });
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
    // this.loadFacebookSDK();
  }
  
  //loadFacebookSDK(): Promise<void> {
    // return new Promise((resolve) => {
    //   // Si ya está inicializado (FB y FB.init), salimos
    //   if (typeof FB !== 'undefined' && FB.init) {
    //     resolve();
    //     return;
    //   }
  
    //   // Si el script ya está en el DOM, solo espera a que esté listo
    //   if (document.getElementById('facebook-jssdk')) {
    //     const interval = setInterval(() => {
    //       if (typeof FB !== 'undefined') {
    //         clearInterval(interval);
    //         resolve();
    //       }
    //     }, 100);
    //     return;
    //   }
  
    //   // fbAsyncInit solo se define una vez
    //   (window as any).fbAsyncInit = () => {
    //     FB.init({
    //       appId: '616411058067807',
    //       cookie: true,
    //       xfbml: true,
    //       version: 'v22.0'
    //     });
    //     resolve();
    //   };
  
    //   // Cargar el script si no existe
    //   const script = document.createElement('script');
    //   script.id = 'facebook-jssdk';
    //   script.src = 'https://connect.facebook.net/en_US/sdk.js';
    //   script.async = true;
    //   script.defer = true;
    //   document.body.appendChild(script);
    // });
  //}

  facebookLogin() {
    // this.loadFacebookSDK().then(() => {
    //   FB.login((res: any) => {
    //     if (res.authResponse) {
    //       console.log('Access Token:', res.authResponse.accessToken);
    //       this.sendToBackend('facebook', res.authResponse.accessToken);
    //     }
    //   }, { scope: 'email,public_profile' });
    // });
  }
  
  sendToBackend(provider: 'google' | 'facebook', token: string) {
    this.http.post(`http://localhost:53056/api/User/${provider==='facebook'?'facebook':'google'}`, { appId: 1605, role: 'Comerciante',  token }).subscribe({
      next: (res: any) => {
        localStorage.setItem('access_token', res.access_token);    
        localStorage.setItem('loggedUser', JSON.stringify(res.user));
        this.router.navigateByUrl('/dashboard');
      },
      error: err => console.error('Error de login', err)
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
        userData.AppId = 1605;
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
      userData.AppId = 1605;
      
      this.userService.loginUser(userData).subscribe({
        next: (res: any) => {          
          localStorage.setItem('access_token', res.access_token);    
          localStorage.setItem('loggedUser', JSON.stringify(res.user));
          this.router.navigateByUrl('/dashboard');          
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
      AppId: 1605
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
