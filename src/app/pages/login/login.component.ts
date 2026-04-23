import { Component, AfterViewInit, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService, UserCreateRequest, UserLoginRequest, ForgotPassRequest } from '../../services/user.service';
import { NotificationService } from '../../services/notification.service';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute } from '@angular/router';
import { PasswordHelper } from '../../helpers/email'

import { environment } from '../../../environments/environment';

declare const google: any;
declare const FB: any;
declare const grecaptcha: any;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: false
})
export class LoginComponent implements AfterViewInit, OnInit {
  isLoading = false;
  loadingMessage = 'Iniciando sesión...';
  errorMessage = '';
  signUpForm!: FormGroup;
  signInForm!: FormGroup;

  isSignDivVisiable: boolean = false;
  isForgotVisible: boolean = false;
  loginObj: LoginModel = new LoginModel();
  private facebookLoginInProgress = false;

  // reCAPTCHA
  failedAttempts = 0;
  showCaptcha = false;
  captchaToken: string | null = null;
  private captchaWidgetId: number | null = null;

  // Password visibility toggles
  showSignInPassword = false;
  showSignUpPassword = false;
  showSignUpPassword2 = false;

  constructor(private fb: FormBuilder, private router: Router, private userService: UserService, private notificationService: NotificationService,
    private http: HttpClient, private route: ActivatedRoute, private passwordHelper: PasswordHelper, private authService: AuthService) {
    this.createSignUpForm();
    this.createSignInForm();
  }

  ngAfterViewInit(): void {
    try {
      google.accounts.id.initialize({
        client_id: environment.googleClientId,
        callback: (res: any) => {
          this.loadingMessage = 'Iniciando sesión...';
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
        this.notificationService.show('info', 'Usuario confirmado exitosamente, ahora puede ingresar a su nueva cuenta');
      }
    });
  }

  facebookLogin() {
    this.loadingMessage = 'Iniciando sesión...';
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
    this.http.post(`${environment.identityApiUrl}/api/User/${provider === 'facebook' ? 'facebook' : 'google'}`, { appId: environment.appId, role: 'User', token }).subscribe({
      next: (res: any) => {
        localStorage.setItem('access_token', res.access_token);
        if (res.refresh_token) localStorage.setItem('refresh_token', res.refresh_token);
        localStorage.setItem('loggedUser', JSON.stringify(res.user));
        this.isLoading = false;
        this.facebookLoginInProgress = false;
        this.redirectAfterLogin();
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
      if (!this.passwordHelper.passwordMatchValidator(this.signUpForm)) {
        this.notificationService.show('error', 'Las contraseñas no coinciden');
      } else {
        this.loadingMessage = 'Creando usuario...';
        this.isLoading = true;
        this.errorMessage = '';

        let userData: UserCreateRequest = this.signUpForm.value;
        userData.AppId = environment.appId;
        userData.IsEnabled = true;
        userData.Role = 'User';

        this.userService.createUser(userData).subscribe({
          next: (res) => {
            this.isLoading = false;
            this.notificationService.show('info', 'Usuario creado exitosamente, verifica tu email para continuar con el registro');
            this.signUpForm.reset();
          },
          error: (err) => {
            this.isLoading = false;
            this.notificationService.show('error', `${err.error}`);
          }
        });
      }
    }
  }


  onLogin() {
    if (this.signInForm.status == 'VALID') {
      // Validate captcha if required
      if (this.showCaptcha && !this.captchaToken) {
        this.notificationService.show('error', 'Por favor completa el captcha');
        return;
      }
      this.errorMessage = '';
      this.loadingMessage = 'Iniciando sesión...';
      this.isLoading = true;
      let userData: UserLoginRequest = this.signInForm.value;
      userData.AppId = environment.appId;

      this.userService.loginUser(userData).subscribe({
        next: (res: any) => {
          localStorage.setItem('access_token', res.access_token);
          if (res.refresh_token) localStorage.setItem('refresh_token', res.refresh_token);
          localStorage.setItem('loggedUser', JSON.stringify(res.user));
          this.failedAttempts = 0;
          this.showCaptcha = false;
          this.redirectAfterLogin();
          this.isLoading = false;
        },
        error: err => {
          this.notificationService.show('error', err.error);
          this.isLoading = false;
          this.failedAttempts++;
          if (this.failedAttempts >= 2 && !this.showCaptcha) {
            this.showCaptcha = true;
            this.renderCaptcha();
          }
          // Reset captcha after each failed attempt
          if (this.showCaptcha) {
            this.captchaToken = null;
            this.resetCaptcha();
          }
        }
      });
    }
  }

  onCaptchaResolved(token: string) {
    this.captchaToken = token;
  }

  private renderCaptcha(): void {
    // Wait for grecaptcha to load and DOM element to exist
    setTimeout(() => {
      if (typeof grecaptcha !== 'undefined' && document.getElementById('recaptcha-container')) {
        this.captchaWidgetId = grecaptcha.render('recaptcha-container', {
          sitekey: environment.recaptchaSiteKey,
          callback: (token: string) => this.onCaptchaResolved(token),
          'expired-callback': () => { this.captchaToken = null; }
        });
      } else {
        // Retry if not ready yet
        setTimeout(() => this.renderCaptcha(), 500);
      }
    }, 100);
  }

  private resetCaptcha(): void {
    if (typeof grecaptcha !== 'undefined' && this.captchaWidgetId !== null) {
      try { grecaptcha.reset(this.captchaWidgetId); } catch (e) { }
    }
  }

  onForgotClick() {
    this.isForgotVisible = !this.isForgotVisible;
  }

  forgotPassword() {
    const forgotEmail = document.getElementById('forgotEmail') as HTMLInputElement;
    if (!this.isValidEmail(forgotEmail.value)) {
      this.notificationService.show('error', `El Email no es valido`);
      document.getElementById('forgotEmail')?.focus()
      return
    }
    this.loadingMessage = 'Enviando email...';
    this.isLoading = true;
    this.errorMessage = '';

    let userData: ForgotPassRequest = {
      Email: forgotEmail.value,
      AppId: environment.appId
    };

    this.userService.forgotPass(userData).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.notificationService.show('info', `Se envio un email a ${userData.Email} con informacion para cambiar su contraseña`);
        (document.getElementById('forgotEmail') as HTMLInputElement).value = "";
        this.isForgotVisible = false;
      },
      error: err => this.notificationService.show('error', err.error)
    });
  }

  isValidEmail(email: string) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  private redirectAfterLogin(): void {
    const loggedUser = JSON.parse(localStorage.getItem('loggedUser') || '{}');
    const userId = loggedUser.userId || '';
    const storageKey = `evantix_has_logged_in_${userId}`;
    const hasLoggedBefore = localStorage.getItem(storageKey);
    localStorage.setItem(storageKey, 'true');
    if (!hasLoggedBefore) {
      this.router.navigateByUrl('/nuevoEvento');
    } else {
      this.router.navigateByUrl('/dashboard');
    }
  }
}

export class SignUpModel {
  email: string;
  name: string;
  lastName: string;
  password: string;

  constructor() {
    this.email = "";
    this.name = "";
    this.lastName = "";
    this.password = ""
  }
}

export class LoginModel {
  email: string;
  password: string;

  constructor() {
    this.email = "";
    this.password = ""
  }
}
