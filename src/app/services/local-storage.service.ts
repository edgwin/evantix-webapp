import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {
  private showInvitadosSubject = new BehaviorSubject<boolean>(
    localStorage.getItem('showInvitados') !== 'false'
  );

  showInvitados$ = this.showInvitadosSubject.asObservable();

  setShowInvitaciones(value: boolean) {
    localStorage.setItem('showInvitaciones', value.toString());
    this.showInvitadosSubject.next(value);
  }

  getShowInvitaciones(): boolean {
    return this.showInvitadosSubject.value;
  }
}
