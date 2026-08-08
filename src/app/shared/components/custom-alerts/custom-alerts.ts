import { Component, inject } from '@angular/core';
import { AlertService } from '../../services/alert.service';
import { TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-custom-alerts',
  imports: [TitleCasePipe],
    standalone: true,
  templateUrl: './custom-alerts.html',
  styleUrl: './custom-alerts.scss',
})
export class CustomAlerts {
  alertService = inject(AlertService)
}
