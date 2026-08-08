import { Service, signal } from '@angular/core';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

export interface AlertData {
  type: AlertType;
  message: string;
}


@Service()
export class AlertService {


      alert = signal<AlertData | null>(null);
      closing = signal(false);

private timeoutId?:ReturnType<typeof setTimeout>;
 private closeTimeoutId?: ReturnType<typeof setTimeout>;

  show(type: AlertType, message: string): void {
        if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
       
  this.closing.set(false);

    this.alert.set({
      type,
      message,
    });

     this.timeoutId = setTimeout(() => {

    this.closing.set(true);

    setTimeout(() => {
      this.alert.set(null);
      this.closing.set(false);
    }, 350);

  }, 2000);

  }

  success(message: string): void {
    this.show('success', message);
  }

  error(message: string): void {
    this.show('error', message);
  }

  warning(message: string): void {
    this.show('warning', message);
  }

  info(message: string): void {
    this.show('info', message);
  }

  close(): void {
    this.alert.set(null);
     if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = undefined;
    }
  }

}
