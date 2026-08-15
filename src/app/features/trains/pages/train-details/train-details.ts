import { Component, inject, OnInit, signal } from '@angular/core';
import { ServicesTrainsService } from '../../services/services.trains.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Location } from '@angular/common';
import { AuthState } from '../../../../core/services/auth-state';
import { TranslatePipe } from '@ngx-translate/core';
@Component({
  selector: 'app-train-details',
  imports: [TranslatePipe],
  templateUrl: './train-details.html',
  styleUrl: './train-details.scss',
})
export class TrainDetails  implements OnInit{
private trainsService = inject(ServicesTrainsService);
private route = inject(ActivatedRoute);
private location=inject(Location);

 private router = inject(Router); //  ახალი — booking-გვერდზე navigate-ისთვის

  public authState = inject(AuthState); //  ახალი — public, რომ HTML-მა პირდაპირ წაიკითხოს

  //  signal() 
  public train = signal<any>(null);
  public isLoading = signal<boolean>(true);
  public errorMessage = signal<string>('');
// აქტიური ტაბის სიგნალი:
public activeTab=signal<'schedules'|'coaches'>('schedules');


// მეთოდი რითაც იცვლება ტაბები:
setActiveTab(tab:'schedules'|'coaches'):void{
  this.activeTab.set(tab);
}
  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (!id) {
        this.errorMessage.set('Train ID not found in URL');
        this.isLoading.set(false);
        return;
      }
      this.loadTrain(+id);
    });
  }

  private loadTrain(id: number): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.trainsService.getTrainById(id).subscribe({
      next: (response: any) => {
        console.log('train details:', response);
        this.train.set(response.data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.log(err);
        this.errorMessage.set('Failed to load train details. Please try again.');
        this.isLoading.set(false);
      }
    });
  }

  goBack(): void {
    this.location.back();
  }
  goToBooking(scheduleId:number):void{
     console.log('FULL TRAIN OBJECT:', this.train());
    const trainId=this.train().id;
    console.log('trainId:', trainId, 'scheduleId:', scheduleId);
    this.router.navigate(['/booking',trainId,scheduleId])
  }
 goToLogin():void{
this.router.navigate(['/login'],{
  queryParams:{
    returnUrl:this.router.url
  }
})
 }

}
