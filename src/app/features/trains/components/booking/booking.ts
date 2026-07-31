import { Component, inject, OnInit, signal } from '@angular/core';
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
}
