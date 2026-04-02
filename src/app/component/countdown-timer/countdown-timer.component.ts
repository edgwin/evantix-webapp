
import { Component, Input, OnDestroy, OnInit } from '@angular/core';

@Component({
    selector: 'app-countdown-timer',
    templateUrl: './countdown-timer.component.html',
    styleUrls: ['./countdown-timer.component.css'],
    imports: []
})
export class CountdownTimerComponent implements OnInit, OnDestroy {

  @Input() targetDate!: string | Date;
  @Input() showLabels: boolean = true;

  days: number = 0;
  hours: number = 0;
  minutes: number = 0;
  seconds: number = 0;

  private intervalId: any;

  ngOnInit(): void {
    if (this.targetDate) {
      this.startCountdown();
    }
  }

  ngOnChanges(): void {
    if (this.targetDate) {
      this.startCountdown();
    }
  }

  private startCountdown(): void {
    this.updateCountdown();
    this.intervalId = setInterval(() => this.updateCountdown(), 1000);
  }

  private updateCountdown(): void {
    const now = new Date().getTime();
    const target = new Date(this.targetDate).getTime();
    const diff = target - now;

    if (diff <= 0) {
      this.days = this.hours = this.minutes = this.seconds = 0;
      clearInterval(this.intervalId);
      return;
    }

    this.days = Math.floor(diff / (1000 * 60 * 60 * 24));
    this.hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    this.minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    this.seconds = Math.floor((diff % (1000 * 60)) / 1000);
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}

