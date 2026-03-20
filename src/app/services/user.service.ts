import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface UserCreateRequest {
  Email: string;
  FirstName: string;
  LastName: string;
  IsEnabled: boolean;
  Password: string;
  Role: string;
  AppId: number;
}

export interface UserLoginRequest {
  UserName: string;
  Password: string;
  AppId: Number;  
}

export interface ForgotPassRequest {
  Email: string;
  AppId: Number;  
}

export interface ResetPassRequest {
  Code: string;
  Email: string;
  Password: string;
  ConfirmPassword: Number;  
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.identityApiUrl}/api/User`;
  private loginApiUrl = `${environment.identityApiUrl}/api/Auth`;

  constructor(private http: HttpClient) { }

  createUser(userData: UserCreateRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/Create`, userData);
  }

  loginUser(userData: UserLoginRequest): Observable<any> {
    return this.http.post(`${this.loginApiUrl}/Authentication`, userData);
  }

  forgotPass(userData: ForgotPassRequest): Observable<any>{
    return this.http.post(`${this.apiUrl}/forgotpassword`, userData)
  }

  resetPass(userData: ResetPassRequest): Observable<any>{
    return this.http.post(`${this.apiUrl}/resetpassword`, userData)
  }
}