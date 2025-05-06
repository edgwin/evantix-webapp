import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type MessageType = 'info' | 'success' | 'warning' | 'error';

export interface Message {
  type: MessageType;
  text: string;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private messageSubject = new BehaviorSubject<Message | null>(null);
  message$ = this.messageSubject.asObservable();

  show(type: MessageType, text: string) {
    this.messageSubject.next({ type, text });

    // Optionally auto-hide after 5s
    setTimeout(() => this.clear(), type === 'error'?10000:5000);
  }

  clear() {
    this.messageSubject.next(null);
  }
}
