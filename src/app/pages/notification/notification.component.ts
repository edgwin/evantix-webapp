// notification.component.ts
import { Component } from '@angular/core';
import { NotificationService, Message } from '../../services/notification.service';

@Component({
    selector: 'app-notification',
    templateUrl: './notification.component.html',
    styleUrls: ['./notification.component.css'],
    standalone: false
})
export class NotificationComponent {
  message: Message | null = null;

  constructor(private notificationService: NotificationService) {
    this.notificationService.message$.subscribe(msg => this.message = msg);
  }

  clearNotification() {
    this.notificationService.clear();
  }
}
