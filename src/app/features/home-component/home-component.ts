import { Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HomeService } from './service/home-service';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-home-component',
  imports: [ReactiveFormsModule, RouterLink,TranslatePipe],
  templateUrl: './home-component.html',
  styleUrl: './home-component.scss',
})
export class HomeComponent implements OnInit {
  private homeService = inject(HomeService);
  public router = inject(Router);

  // 🔧 signal-ად გადაყვანილი — ავტომატურად ააქტიურებს change detection-ს
  public stations = signal<any[]>([]);

  // Alert-ის სიგნალები
  public showAlert = signal<boolean>(false); // 🔧 გადარქმეული showError → showAlert, რადგან success-ზეც გამოიყენება
  public errorMessage = signal<string>('');
  public successMessage = signal<string>(''); // 🔧 sucessMessage → successMessage (ორთოგრაფიული შესწორება)
  public isSuccess = signal<boolean>(false);

  public searchForm: FormGroup = new FormGroup({
    from: new FormControl('', [Validators.required]),
    to: new FormControl('', Validators.required)
  });

  ngOnInit(): void {
    this.homeService.getStations().subscribe((res: any) => {
      console.log("stations: ", res);
      this.stations.set(res.data); // 🔧 .set() signal-ის განახლებისთვის
    });
  }

 search() {
  if (this.searchForm.invalid) {
    this.searchForm.markAllAsTouched();
    return;
  }

  this.showAlert.set(false);

  const { from, to } = this.searchForm.value;

  this.homeService.searchTrains(from, to, 1, 10).subscribe({
    next: (response: any) => {
      console.log("search result:", response);
      const trains = response.data?.items;

      // 1. მატარებლები არ მოიძებნა
      if (!trains || trains.length === 0) {
        this.isSuccess.set(false);
        this.errorMessage.set("No trains found for this route. Please choose another destination.");
        this.showAlert.set(true);
        return;
      }

      // 2. მატარებელი(ები) მოიძებნა — ვიღებთ პირველს და პირდაპირ მისი details-ზე გადავდივართ
      const firstTrain = trains[0];

      this.isSuccess.set(true);
      this.successMessage.set(`Found ${trains.length} train${trains.length > 1 ? 's' : ''}! Redirecting...`);
      this.showAlert.set(true);

      setTimeout(() => {
        this.showAlert.set(false);
        this.router.navigate(['/trains', firstTrain.id]); // პირდაპირ /trains/:id-ზე
      }, 2000);
    },
    error: (err) => {
      console.log(err);
      this.isSuccess.set(false);
      this.errorMessage.set("Something went wrong. Please try again later.");
      this.showAlert.set(true);
    }
  });
}
}

 