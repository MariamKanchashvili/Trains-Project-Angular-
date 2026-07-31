import { Component, EventEmitter, inject, OnInit, Output, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ServicesTrainsService } from '../../services/services.trains.service';
import { HomeService } from '../../../home-component/service/home-service';

@Component({
  selector: 'app-train-filter',
  imports: [ReactiveFormsModule],
  templateUrl: './train-filter.html',
  styleUrl: './train-filter.scss',
})
export class TrainFilter implements OnInit {
  private trainService = inject(ServicesTrainsService);
  private homeService = inject(HomeService);

  public stations = signal<any[]>([]);          // 🔧 signal
  public trainResult = signal<any[]>([]);         // 🔧 signal

  // Alert-ის სიგნალები — HomeComponent-თან თანმიმდევრული სახელები
  public showAlert = signal<boolean>(false);       // 🔧 showError → showAlert
  public errorMessage = signal<string>('');
  public successMessage = signal<string>('');      // 🔧 ორთოგრაფია გასწორებული
  public isSuccess = signal<boolean>(false);

  @Output() trainsFound = new EventEmitter<any[]>();
  @Output() filtersCleared=new EventEmitter<void>();
  // შეცდომის ტექსტი უნდა გადაეცეს მობელს trains:
  @Output() searchError=new EventEmitter<string>();

  public searchByIdForm = new FormGroup({
    trainNumber: new FormControl('', Validators.required)
  });

  public searchForm = new FormGroup({
    from: new FormControl('', Validators.required),
    to: new FormControl('', Validators.required)
  });

  ngOnInit(): void {
    this.homeService.getStations().subscribe((res: any) => {
      console.log("TrainFilter stations:", res);
      this.stations.set(res.data);
    });
  }

  searchTrainQuery() {
    console.log('SEARCH CLICKED');

    if (this.searchByIdForm.invalid) {
      this.searchByIdForm.markAllAsTouched();
      return;
    }

    const number = this.searchByIdForm.value.trainNumber;

    this.trainService.getTrainsByQuery(number!, 1, 10).subscribe({
      next: (res: any) => {
        console.log("Train by query", res);
        this.trainResult.set(res.data.items);
        this.trainsFound.emit(this.trainResult());

        if (this.trainResult().length === 0) {
          console.log("Train not found", this.trainResult());
          this.searchError.emit('Trains not found');
        }
      },
      error: (err) => {
        console.log(err);
      }
    });
  }

  search() {
    if (this.searchForm.invalid) {
      this.searchForm.markAllAsTouched();
      return;
    }

    this.showAlert.set(false);

    const from = this.searchForm.get('from')?.value ?? '';
    const to = this.searchForm.get('to')?.value ?? '';

    this.trainService.filterTrains(from, to, 1, 10).subscribe({
      next: (response: any) => {
        console.log("search result:", response);
        const stations = response.data?.items;

        if (!stations || stations.length === 0) {
           this.searchError.emit("No trains found for this route. Please choose another destination.");
          return;
        }

        this.isSuccess.set(true);
        this.successMessage.set(`Found ${stations.length} trains!`);
        this.showAlert.set(true);

        this.trainsFound.emit(stations); //  დამატებული — filter-ის შედეგიც გავცემთ მშობელს

        setTimeout(() => {
          this.showAlert.set(false);
        }, 2000);
      },
      error: (err) => {
        console.log(err);
       this.searchError.emit("Something went wrong. Please try again later.");

      }
    });
  }

  clearFilters(): void {
    this.searchForm.reset();     // 🔧 select-ების დაცარიელება
    this.searchByIdForm.reset(); // 🔧 (სურვილისამებრ) ნომრით ძებნის ფორმაც გაიწმინდოს
    this.showAlert.set(false);   // 🔧 alert-ის დამალვა, თუ ღიაა

    this.filtersCleared.emit();  // 🔧 უბრალოდ "ვატყობინებ, გასუფთავდა" — მონაცემის გარეშე
  }
}