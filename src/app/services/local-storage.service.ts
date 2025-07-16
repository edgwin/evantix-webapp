import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {
  private showInvitacionesSubject = new BehaviorSubject<boolean>(
    localStorage.getItem('showInvitaciones') !== 'false'
  );

  showInvitaciones$ = this.showInvitacionesSubject.asObservable();

  setShowInvitaciones(value: boolean) {
    localStorage.setItem('showInvitaciones', value.toString());
    this.showInvitacionesSubject.next(value);
  }

  getShowInvitaciones(): boolean {
    return this.showInvitacionesSubject.value;
  }
}
