import { Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../auth/services/auth.service';
import { UserService, UpdateUserRequest } from '../../services/user.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UserResponse } from '../../interfaces/user';
import { Booking } from '../../interfaces/booking-interface';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-profile',
  imports: [ReactiveFormsModule, DatePipe],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile implements OnInit {
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  // ============================================
  // მენიუს მდგომარეობა
  // ============================================
  public activeTab = signal<'profile' | 'bookings' | 'settings'>('profile');

  // ============================================
  // User-ის მონაცემები
  // ============================================
  public user = signal<UserResponse | null>(null);
  public isLoading = signal<boolean>(true);
  public errorMessage = signal<string>('');

  // ============================================
  // Profile-ის ფორმა და შენახვის state
  // ============================================
  public isSaving = signal<boolean>(false);
  public saveMessage = signal<string>('');

  public profileForm: FormGroup = new FormGroup({
    firstName: new FormControl('', Validators.required),
    lastName: new FormControl('', Validators.required),
    phoneNumber: new FormControl(''),
    address: new FormControl(''),
    dob: new FormControl(''),
  });

  // ============================================
  // Bookings — Lazy Loaded, ფილტრი და დეტალები
  // ============================================
  public bookings = signal<Booking[]>([]);
  public isLoadingBookings = signal<boolean>(false);
  public bookingsError = signal<string>('');
  private bookingsLoaded = false;

  public bookingFilterForm: FormGroup = new FormGroup({
    from: new FormControl(''),
    to: new FormControl(''),
  });

  public selectedBooking = signal<Booking | null>(null);
  public isDeletingBooking = signal<boolean>(false);
  public deleteError = signal<string>('');

  ngOnInit(): void {
    this.loadUser();

   this.route.queryParams.subscribe(params => {

  if (params['tab'] === 'bookings') {

    this.activeTab.set('bookings');

    if (!this.bookingsLoaded) {
      this.loadBookings();
    }

  }

});
  }

  private loadUser(): void {
    this.isLoading.set(true);

    this.userService.getCurrentUser().subscribe({
      next: (response) => {
        const userData = response.data;
        this.user.set(userData);

        this.profileForm.patchValue({
          firstName: userData.firstName,
          lastName: userData.lastName,
          phoneNumber: userData.details.phoneNumber ?? '',
          address: userData.details.address ?? '',
          dob: userData.details.dob ?? '',
        });

        this.isLoading.set(false);
      },
      error: (err) => {
        console.log(err);
        const message = err?.error?.detail || 'Failed to load profile.';
        this.errorMessage.set(message);
        this.isLoading.set(false);
      }
    });
  }

  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    this.saveMessage.set('');

    const formValue = this.profileForm.value;

    const payload: UpdateUserRequest = {
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      email: this.user()!.email,
      phoneNumber: formValue.phoneNumber ?? '',
      address: formValue.address ?? '',
      pictureUrl: this.user()?.details.pictureUrl ?? '',
      dateOfBirth: formValue.dob || null,
    };

    this.userService.updateUser(payload).subscribe({
      next: (response) => {
        console.log(response);
        this.user.set(response.data);
        this.isSaving.set(false);
        this.saveMessage.set('Profile updated successfully!');
      },
      error: (err) => {
        console.log(err);
        const message = err?.error?.detail || 'Failed to update profile.';
        this.isSaving.set(false);
        this.saveMessage.set(message);
      }
    });
  }

  // ============================================
  // Bookings — ჩატვირთვა (ფილტრის მხარდაჭერით)
  // ============================================
  private loadBookings(): void {
    this.isLoadingBookings.set(true);
    this.bookingsError.set('');

    const { from, to } = this.bookingFilterForm.value;

    this.userService.getUserBookings(1, 10, from || undefined, to || undefined).subscribe({
      next: (response) => {
        this.bookings.set(response.data.items);
        this.isLoadingBookings.set(false);
        this.bookingsLoaded = true;
      },
      error: (err) => {
        console.log(err);
        const message = err?.error?.detail || 'Failed to load bookings';
        this.bookingsError.set(message);
        this.isLoadingBookings.set(false);
      }
    });
  }

  applyBookingFilter(): void {
    this.loadBookings();
  }

  clearBookingFilter(): void {
    this.bookingFilterForm.reset();
    this.loadBookings();
  }

  viewBookingDetails(booking: Booking): void {
    this.selectedBooking.set(booking);
  }

  closeBookingDetails(): void {
    this.selectedBooking.set(null);
  }

  deleteBooking(id: number): void {
    this.isDeletingBooking.set(true);
    this.deleteError.set('');

    this.userService.deleteBooking(id).subscribe({
      next: () => {
        this.bookings.update(list => list.filter(b => b.id !== id));
        this.selectedBooking.set(null);
        this.isDeletingBooking.set(false);
      },
      error: (err) => {
        console.log(err);
        const message = err?.error?.detail || 'Failed to delete booking.';
        this.deleteError.set(message);
        this.isDeletingBooking.set(false);
      }
    });
  }

  // ============================================
  // ტაბის გადართვა
  // ============================================
  setActiveTab(tab: 'profile' | 'bookings' | 'settings'): void {
    this.activeTab.set(tab);

    if (tab === 'bookings' && !this.bookingsLoaded) {
      this.loadBookings();
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}