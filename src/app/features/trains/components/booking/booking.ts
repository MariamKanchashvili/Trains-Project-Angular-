import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ServicesTrainsService } from '../../services/services.trains.service';
import { TranslatePipe } from '@ngx-translate/core';
import { AlertService } from '../../../../shared/services/alert.service';
import jsPDF from 'jspdf';
import { BookingConfirm } from '../../../../shared/services/booking-confirm';
import { UserService } from '../../../users/services/user.service';

@Component({
  selector: 'app-booking',
  imports: [RouterLink,TranslatePipe],
  templateUrl: './booking.html',
  styleUrl: './booking.scss',
})
export class Booking implements OnInit {
  private trainsService = inject(ServicesTrainsService);
  private route = inject(ActivatedRoute);
  private router=inject(Router);
  private alert=inject(AlertService);
  private bookingConfirmService=inject(BookingConfirm);
  private userService = inject(UserService);

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

  //  პროგრესის ხაზის შევსების პროცენტი, currentStep-ზე დამოკიდებული
  public progressPercent = computed(() => {
    return ((this.currentStep() - 1) / (this.steps.length - 1)) * 100;
  });

  //  წინა სტეპის ლეიბლი — "Back to Date" ტიპის ტექსტისთვის
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
  // STEP 3 — ადგილების არჩევა
  // ============================================
  public seats = signal<any[]>([]);
  public isLoadingSeats = signal<boolean>(false);
  public seatsError = signal<string>('');

  //  მასივი, არა ერთი მნიშვნელობა — მომხმარებელს შეუძლია ერთზე მეტი ადგილის არჩევა
  public selectedSeatIds = signal<number[]>([]);

  // ადგილები, 4-ეულებად დაჯგუფებული ვიზუალური "მწკრივებისთვის" (2 მარცხნივ + გასასვლელი + 2 მარჯვნივ)
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

// ===============================================
// STEP 4- CONFIRM
// =============================================== 
 public showTicketModal = signal<boolean>(false);

private toggleModalScrollLock(isOpen: boolean): void {
  document.body.style.overflow = isOpen ? 'hidden' : '';
}

public selectedSeatNumbers = computed(() => {

  return this.seats()
    .filter(seat => this.selectedSeatIds().includes(seat.id))
    .map(seat => seat.number)
    .join(', ');

});

public totalPrice = computed(() => {

  return (this.selectedCoach()?.price ?? 0) *
         this.selectedSeatIds().length;

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

  // ადგილის მონიშვნა/მოხსნა — toggle-ლოგიკა, დაჯავშნილზე დაცვით
  toggleSeat(seat: any): void {
    if (!seat.isAvailable) return;

    this.selectedSeatIds.update(ids => {
      const alreadySelected = ids.includes(seat.id);
      return alreadySelected
        ? ids.filter(id => id !== seat.id)   //  თუ უკვე არჩეულია — მოხსნა
        : [...ids, seat.id];                  // თუ არ არის — დამატება
    });
  }
  //===================================================
  // STEP 4 ის მოქმედებები 
  // =================================================
  public confirmedSeatNumbers = signal<string>('');
public confirmedTotalPrice = signal<number>(0);

  confirmBooking(): void {
  const scheduleId = this.schedule()?.id;
  const seatIds = this.selectedSeatIds();
  const travelDate = this.selectedDate();
const seatNumbers = this.selectedSeatNumbers();

  if (!scheduleId) {
    this.alert.error('Schedule not found.');
    return;
  }
  if (!travelDate) {
    this.alert.warning('Please select travel date.');
    return;
  }
  if (seatIds.length === 0) {
    this.alert.warning('Please select at least one seat.');
    return;
  }
 this.confirmedTotalPrice.set(this.totalPrice());

  this.trainsService
    .postNewBookig(scheduleId, seatIds, travelDate)
    .subscribe({
      next: (response) => {
        console.log('Booking created successfully', response);
        this.alert.success('Booking completed successfully!');

        this.userService.getCurrentUser().subscribe({
  next: (userResponse) => {

    const userEmail = userResponse.data.email;

    const bookingData = {
      userEmail,
      trainNumber: this.train()?.number?.toString() ?? '',
      from: this.schedule()?.origin ?? '',
      to: this.schedule()?.destination ?? '',
      travelDate: travelDate,
      seatNumber: this.selectedSeatNumbers()
    };
console.log('📧 SENDING TO N8N:', bookingData);

    this.bookingConfirmService
      .sendBookingConfirmation(bookingData)
      .subscribe({
        next: () => {
          console.log('Booking confirmation email sent');
        },
        error: (err) => {
          console.error('Failed to send confirmation email', err);
        }
      });
  },

  error: (err) => {
    console.error('Failed to get current user:', err);
  }
});
        // popup-ისთვის ვინახავთ ადგილის  ნომრებს, სანამ selectedSeatIds გასუფთავდება
        this.confirmedSeatNumbers.set(this.selectedSeatNumbers());

        this.loadSeats();
        this.selectedSeatIds.set([]);
       this.showTicketModal.set(true);
       this.toggleModalScrollLock(true);
      },
      error: (err) => {
        console.log(err);
        if (err.status === 409) {
          this.alert.error('This seat has already been booked.');
          return;
        }
        this.alert.error('Booking failed. Please try again.');
      }
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

goToBookings(): void {

 this.toggleModalScrollLock(false); 

  this.router.navigate(['/profile'], {
    queryParams: {
      tab: 'bookings'
    }
  });

}
  // ============================================
  // UI დამხმარეები
  // ============================================
  onWheelScroll(event: WheelEvent): void {
    event.preventDefault();
    const container = event.currentTarget as HTMLElement;
    container.scrollLeft += event.deltaY;
  }
  // ===================================================
// DOWNLOAD TICKET AS PDF
// ===================================================

downloadTicket(): void {

  const doc = new jsPDF();

  // ---------------------------------------------
  // Booking-ის მონაცემები
  // ---------------------------------------------

  const trainName = this.train()?.name ?? 'Train';
  const trainNumber = this.train()?.number ?? '-';

  const origin = this.schedule()?.origin ?? '-';
  const destination = this.schedule()?.destination ?? '-';

  const departureTime =
    this.schedule()?.departureTime ?? '-';

  const travelDate =
    this.selectedDate() ?? '-';

  const coachNumber =
    this.selectedCoach()?.number ?? '-';

  const coachClass =
    this.selectedCoach()?.class ?? '-';

  const seats =
    this.confirmedSeatNumbers() || '-';

  
const totalPrice = this.confirmedTotalPrice();


  // ---------------------------------------------
  // PDF Header
  // ---------------------------------------------

  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');

  doc.text('TRAIN TICKET', 20, 25);


  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');

  doc.text('BOOKING CONFIRMED', 20, 34);


  // ---------------------------------------------
  // Divider
  // ---------------------------------------------

  doc.line(20, 42, 190, 42);


  // ---------------------------------------------
  // Train information
  // ---------------------------------------------

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');

  doc.text(trainName, 20, 55);


  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');

  doc.text(`Train number: #${trainNumber}`, 20, 63);


  // ---------------------------------------------
  // Route
  // ---------------------------------------------

  doc.setFont('helvetica', 'bold');

  doc.text('ROUTE', 20, 78);

  doc.setFont('helvetica', 'normal');

  doc.text(
    `${origin}  →  ${destination}`,
    20,
    87
  );


  // ---------------------------------------------
  // Journey information
  // ---------------------------------------------

  doc.setFont('helvetica', 'bold');

  doc.text('JOURNEY DETAILS', 20, 105);

  doc.setFont('helvetica', 'normal');

  doc.text(`Date: ${travelDate}`, 20, 115);

  doc.text(
    `Departure: ${departureTime}`,
    20,
    123
  );

  doc.text(
    `Coach: ${coachNumber} (${coachClass})`,
    20,
    131
  );

  doc.text(
    `Seat: ${seats}`,
    20,
    139
  );


  // ---------------------------------------------
  // Total price
  // ---------------------------------------------

  doc.line(20, 150, 190, 150);

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');

  doc.text(
    `TOTAL: $${totalPrice}`,
    20,
    164
  );


  // ---------------------------------------------
  // Footer
  // ---------------------------------------------

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  doc.text(
    'Thank you for travelling with us!',
    20,
    185
  );

  doc.text(
    'Please keep this ticket for your journey.',
    20,
    192
  );


  // ---------------------------------------------
  // Download
  // ---------------------------------------------

doc.save('train-ticket.pdf');
}
}