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

  private autoHideTimeout: any = null;

  show(type: MessageType, text: string, persistent: boolean = false) {
    if (this.autoHideTimeout) {
      clearTimeout(this.autoHideTimeout);
      this.autoHideTimeout = null;
    }
    this.messageSubject.next({ type, text });

    if (!persistent) {
      this.autoHideTimeout = setTimeout(() => this.clear(), type === 'error' ? 10000 : 5000);
    }
  }

  clear() {
    this.messageSubject.next(null);
  }
}
