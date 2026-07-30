import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ServicesTrainsService } from '../../services/services.trains.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-train-filter',
  imports: [ReactiveFormsModule],
  templateUrl: './train-filter.html',
  styleUrl: './train-filter.scss',
})
export class TrainFilter {
  private trainService=inject(ServicesTrainsService)
  public stations:any[] = [];
   // სიგნალები alert ებისთვის
  public showError = signal<boolean>(false);
  public errorMessage = signal<string>('');
  public sucessMessage = signal<string>('');
  public isSuccess = signal<boolean>(false);
  public searchByIdForm = new FormGroup({

    trainNumber: new FormControl('', Validators.required)

  });

  public searchForm = new FormGroup({

    from: new FormControl('', Validators.required),

    to: new FormControl('', Validators.required)

  });

  searchTrainId(){

  }

  search(){
if (this.searchForm.invalid) {
      this.searchForm.markAllAsTouched();
      return;
    }

    
    // საწყისი მნიშვნელობა მივნიჭეთ რომ ყოველ დამატებით ღილაკზე თავიდან ეწერებოდეს შეტყობინება
    this.showError.set(false);

const from = this.searchForm.get('from')?.value ?? '';
const to = this.searchForm.get('to')?.value ?? '';


    this.trainService.filterTrains(from,to,1,10).subscribe({
      next: (response: any) => {
        console.log("search result:", response);
        const stations = response.data?.items;

        // 1. მატარებლები არ მოიძებნა:
        if (!stations || stations.length === 0) {
          this.isSuccess.set(false);
          this.errorMessage.set("No trains found for this route. Please choose another destination.");
          
          // ხანმოკლე ტაიმ-აუტი ანგულარმა რომ მოასწროს შეტტობინების გადაცვლა
          setTimeout(() => {
            this.showError.set(true); 
          }, 10);
          return;
        }

        // 2. მატარებლები მოიძებნა
        this.isSuccess.set(true);
        //  ${} ასე წერს კიდეც რამდენი მატარებელი დადის ამ მარშრუტზე
        this.sucessMessage.set(`Found ${stations.length} trains! Redirecting...`);

        setTimeout(() => {
          this.showError.set(true); 
        }, 10);

        // 2 წამის შემდეგ გადავდივართ  მატარებლების გვერდზე
        setTimeout(() => {
          this.showError.set(false); 
         
        }, 2000);
      },
      error: (err) => {
        console.log(err);
        // 3. სერვერის შეცდმა: 
        this.isSuccess.set(false);
        this.errorMessage.set("Something went wrong. Please try again later.");
        
        setTimeout(() => {
          this.showError.set(true);
        }, 10);
      }
    });
  }
  }

