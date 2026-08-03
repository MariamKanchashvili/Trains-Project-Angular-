import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ServicesTrainsService } from '../../services/services.trains.service';

@Component({
  selector: 'app-booking',
  imports: [RouterLink],
  templateUrl: './booking.html',
  styleUrl: './booking.scss',
})
export class Booking implements OnInit {
  private trainsService = inject(ServicesTrainsService);
  private route = inject(ActivatedRoute);

  // ============================================
  // საწყისი მონაცემები — მატარებელი და schedule
  // ============================================
  public train = signal<any>(null);
  public schedule = signal<any>(null);
  public isLoading = signal<boolean>(true);
  public errorMessage = signal<string>('');

  // ============================================
  // WIZARD-ის ზოგადი მდგომარეობა
  // ============================================
  public currentStep = signal<number>(1);

  public steps = [
    { number: 1, label: 'COACH' },
    { number: 2, label: 'DATE' },
    { number: 3, label: 'SEATS' },
    { number: 4, label: 'CONFIRM' },
  ];

  // 🔧 პროგრესის ხაზის შევსების პროცენტი, currentStep-ზე დამოკიდებული
  public progressPercent = computed(() => {
    return ((this.currentStep() - 1) / (this.steps.length - 1)) * 100;
  });

  // 🔧 წინა სტეპის ლეიბლი — "Back to Date" ტიპის ტექსტისთვის
  public previousStepLabel = computed(() => {
    const prevStep = this.steps.find(s => s.number === this.currentStep() - 1);
    return prevStep ? prevStep.label.toLowerCase() : null;
  });

  // ============================================
  // STEP 1 — Coach-ის არჩევა
  // ============================================
  public selectedCoachId = signal<number | null>(null);

  // 🔧 არჩეული coach-ის სრული ობიექტი (class, price და ა.შ.) — header-ებში საჩვენებლად
  public selectedCoach = computed(() => {
    return this.train()?.coaches.find((c: any) => c.id === this.selectedCoachId()) ?? null;
  });

  // ============================================
  // STEP 2 — თარიღის არჩევა
  // ============================================
  public selectedDate = signal<string | null>(null);

  // 🔧 დღევანდელი თარიღი, calendar-ის "min"-ისთვის — წარსული თარიღი არჩევადი არ იყოს
  public today = computed(() => {
    const now = new Date();
    return now.toISOString().split('T')[0];
  });

  // ============================================
  // STEP 3 — სეატების არჩევა
  // ============================================
  public seats = signal<any[]>([]);
  public isLoadingSeats = signal<boolean>(false);
  public seatsError = signal<string>('');

  // 🔧 მასივი, არა ერთი მნიშვნელობა — მომხმარებელს შეუძლია ერთზე მეტი სეატის არჩევა
  public selectedSeatIds = signal<number[]>([]);

  // 🔧 სეატები, 4-ეულებად დაჯგუფებული ვიზუალური "მწკრივებისთვის" (2 მარცხნივ + გასასვლელი + 2 მარჯვნივ)
  public seatRows = computed(() => {
    const allSeats = this.seats();
    const rows: { left: any[]; right: any[] }[] = [];

    for (let i = 0; i < allSeats.length; i += 4) {
      rows.push({
        left: allSeats.slice(i, i + 2),
        right: allSeats.slice(i + 2, i + 4),
      });
    }
    return rows;
  });

  // ============================================
  // ინიციალიზაცია
  // ============================================
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

  // ============================================
  // STEP 1 — მოქმედებები
  // ============================================
  selectCoachAndContinue(coachId: number): void {
    this.selectedCoachId.set(coachId);
    this.goToNextStep();
  }

  // ============================================
  // STEP 2 — მოქმედებები
  // ============================================
  selectDateAndContinue(date: string): void {
    this.selectedDate.set(date);
    this.goToNextStep();
    this.loadSeats();
  }

  // ============================================
  // STEP 3 — მოქმედებები
  // ============================================
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
    this.selectedSeatIds.set([]);

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

  // 🔧 სეატის მონიშვნა/მოხსნა — toggle-ლოგიკა, დაჯავშნილზე დაცვით
  toggleSeat(seat: any): void {
    if (!seat.isAvailable) return;

    this.selectedSeatIds.update(ids => {
      const alreadySelected = ids.includes(seat.id);
      return alreadySelected
        ? ids.filter(id => id !== seat.id)   // 🔧 თუ უკვე არჩეულია — მოვხსნათ
        : [...ids, seat.id];                  // 🔧 თუ არ არის — დავამატოთ
    });
  }

  // ============================================
  // WIZARD-ის ნავიგაცია
  // ============================================
  goToNextStep(): void {
    this.currentStep.update(step => step + 1);
  }

  goToStep(stepNumber: number): void {
    if (stepNumber <= this.currentStep()) {
      this.currentStep.set(stepNumber);
    }
  }

  // ============================================
  // UI დამხმარეები
  // ============================================
  onWheelScroll(event: WheelEvent): void {
    event.preventDefault();
    const container = event.currentTarget as HTMLElement;
    container.scrollLeft += event.deltaY;
  }
}