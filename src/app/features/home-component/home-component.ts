import { Component, inject, OnChanges, OnInit, signal, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HomeService } from './service/home-service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-home-component',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './home-component.html',
  styleUrl: './home-component.scss',
})
export class HomeComponent  implements OnInit{
   private homeService = inject(HomeService);
  public router = inject(Router);
  public stations: any[] = [];

  // სიგნალები alert ებისთვის
  public showError = signal<boolean>(false);
  public errorMessage = signal<string>('');
  public sucessMessage = signal<string>('');
  public isSuccess = signal<boolean>(false);
//  ფორმა 
  public searchForm: FormGroup = new FormGroup({
    from: new FormControl('', [Validators.required]),
    to: new FormControl('', Validators.required)
  });

  ngOnInit(): void {

      console.log("Before request:", this.stations);
    this.homeService.getStations().subscribe((res: any) => {
      console.log("stations: ", res);
      this.stations = res.data;
       console.log("After assign:", this.stations);
    });
  }

 search() {
    if (this.searchForm.invalid) {
      this.searchForm.markAllAsTouched();
      return;
    }

    
    // საწყისი მნიშვნელობა მივნიჭეთ რომ ყოველ დამატებით ღილაკზე თავიდან ეწერებოდეს შეტყობინება
    this.showError.set(false);

    const { from, to } = this.searchForm.value;

    this.homeService.searchTrains(from, to, 1, 10).subscribe({
      next: (response: any) => {
        console.log("search result:", response);
        const trains = response.data?.items;

        // 1. მატარებლები არ მოიძებნა:
        if (!trains || trains.length === 0) {
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
        this.sucessMessage.set(`Found ${trains.length} trains! Redirecting...`);

        setTimeout(() => {
          this.showError.set(true); 
        }, 10);

        // 2 წამის შემდეგ გადავდივართ  მატარებლების გვერდზე
        setTimeout(() => {
          this.showError.set(false); 
          this.router.navigate(['/trainsPage']);
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
  


 