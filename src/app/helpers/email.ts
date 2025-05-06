import { AbstractControl } from "@angular/forms";
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class PasswordHelper{
  passwordMatchValidator(form: AbstractControl) {
    const password = form.value.Password;
    const confirmPassword = form.value.Password2;
    return password === confirmPassword;
  }
}