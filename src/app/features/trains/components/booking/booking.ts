import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ServicesTrainsService } from '../../services/services.trains.service';

@Component({
  selector: 'app-booking',
  imports: [RouterLink],
  templateUrl: './booking.html',
  styleUrl: './booking.scss',
})
export class Booking  implements OnInit{
  private trainsService=inject(ServicesTrainsService);
  private route= inject (ActivatedRoute);
public train = signal<any>(null);
  public schedule = signal<any>(null);
  public isLoading = signal<boolean>(true);
  public errorMessage = signal<string>('');


   // 🔧 Wizard-ის მდგომარეობა — რომელ სტეპზე ვართ ახლა (1-4)
  public currentStep = signal<number>(1);

  // 🔧 Step 1-ის არჩევანი — რომელი coach-ია მონიშნული
  public selectedCoachId = signal<number | null>(null);

  public steps=[
    { number: 1, label: 'COACH' },
    { number: 2, label: 'DATE' },
    { number: 3, label: 'SEATS' },
    { number: 4, label: 'CONFIRM' }
  ]
public progressPercent=computed(()=>{
  return ((this.currentStep()-1)/(this.steps.length-1)*100);
})

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const trainId = params.get('trainId');
      const scheduleId = params.get('scheduleId');

      if (!trainId || !scheduleId) {
        this.errorMessage.set('Invalid booking link.');
        this.isLoading.set(false);
        return;
      }

      this.loadTrain(+trainId, +scheduleId);
    });
  }

  private loadTrain(trainId: number, scheduleId: number): void {
    this.isLoading.set(true);

    this.trainsService.getTrainById(trainId).subscribe({
      next: (response: any) => {
        const trainData = response.data;
        this.train.set(trainData);

        // 🔧 კონკრეტული schedule-ის მოძებნა train-ის schedules მასივში
        const matchedSchedule = trainData.schedules.find((s: any) => s.id === scheduleId);
        this.schedule.set(matchedSchedule ?? null);

        this.isLoading.set(false);
      },
      error: (err) => {
        console.log(err);
        this.errorMessage.set('Failed to load booking details.');
        this.isLoading.set(false);
      }
    });
  }

  // 🔧 Coach-ის არჩევა — single-select პატერნი
  selectCoach(coachId: number): void {
    this.selectedCoachId.set(coachId);
  }

  goToNextStep(): void {
    if (!this.selectedCoachId()) return; // დაცვა — coach არჩეული უნდა იყოს
    this.currentStep.update(step => step + 1);
  
  }
   selectCoachAndContinue(coachId:number):void{
    this.selectedCoachId.set(coachId);
    this.goToNextStep();
   }

   goToStep(stepNumber:number):void{
    if(stepNumber<=this.currentStep()){
      this.currentStep.set(stepNumber)
    }
   }
   onWheelScroll(event: WheelEvent): void {
  event.preventDefault(); // 🔧 აჩერებს ბრაუზერის default ვერტიკალურ სქროლს
  const container = event.currentTarget as HTMLElement;
  container.scrollBy({
    left: event.deltaY,
    behavior: 'smooth' //  გლუვი ანიმაცია, მყისიერი "ხტუნვის" ნაცვლად
  });
}
}
