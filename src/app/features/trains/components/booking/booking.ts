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

// step2 (თარიღი)
public selectedDate=signal<string |null>(null);

//  Step 3 (ადგილები)
  public seats = signal<any[]>([]);
  public isLoadingSeats = signal<boolean>(false);
  public seatsError = signal<string>('');
  public selectedSeatId = signal<number | null>(null);

  public today=computed(()=>{
    const now=new Date();
    return now.toISOString().split('T')[0];
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
// თარიღის არჩევ და შემდეგ ადგილების გვერდზე გადასვლა :
selectDateAndContinue(date:string):void{
  this.selectedDate.set(date);
  this.goToNextStep();
  this.isLoadingSeats();
}
 private loadSeats(): void {
    const scheduleId = this.schedule()?.id;
    const coachId = this.selectedCoachId();
    const travelDate = this.selectedDate();

    if (!scheduleId || !coachId || !travelDate) {
      this.seatsError.set('Missing booking information.');
      return;
    }

    this.isLoadingSeats.set(true);
    this.seatsError.set('');
    this.selectedSeatId.set(null);

    this.trainsService.getSeatsAvailability(scheduleId, coachId, travelDate).subscribe({
      next: (response: any) => {
        this.seats.set(response.data);
        this.isLoadingSeats.set(false);
      },
      error: (err) => {
        console.log(err);
        this.seatsError.set('Failed to load seat availability.');
        this.isLoadingSeats.set(false);
      }
    });
  }
   // ადგილის  არჩევა (მხოლოდ თუ isAvailable === true)
  selectSeat(seat: any): void {
    if (!seat.isAvailable) return;
    this.selectedSeatId.set(seat.id);
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
