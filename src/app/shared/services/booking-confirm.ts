import { Injectable, Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Service()
export class BookingConfirm {

  private http = inject(HttpClient);

  private webhookUrl =
    'http://localhost:5678/webhook/booking-confirmed';

  sendBookingConfirmation(data: {
    userEmail: string;
    trainNumber: string;
    from: string;
    to: string;
    travelDate: string;
    seatNumber: string;
  }): Observable<any> {

    return this.http.post(this.webhookUrl, data);
  }
}