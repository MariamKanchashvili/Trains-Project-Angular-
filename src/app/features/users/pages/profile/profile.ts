import { Component, inject, OnInit, signal } from '@angular/core';
import { AbstractControl, FormControl, FormControlName, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../auth/services/auth.service';
import { UserService, UpdateUserRequest } from '../../services/user.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UserResponse } from '../../interfaces/user';
import { Booking } from '../../interfaces/booking-interface';
import { DatePipe } from '@angular/common';
import { StateMessage } from '../../../../shared/components/state-message/state-message';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-profile',
  imports: [ReactiveFormsModule, DatePipe,StateMessage,TranslatePipe],
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
  // Profile setting ,password change form
  // ===========================================
 public passwordForm:FormGroup=new FormGroup({
   currentPassword:new FormControl('',Validators.required),
   newPassword:new FormControl('',[Validators.required,Validators.minLength(6)]),
   confirmPassword:new FormControl('',Validators.required)
 })


  // ============================================
  // Bookings — Lazy Loaded, ფილტრი და დეტალები
  // ============================================
  public bookings = signal<Booking[]>([]);
  public isLoadingBookings = signal<boolean>(false);
  public bookingsError = signal<string>('');
  private bookingsLoaded = false;
  // ფილტრაცისთვის
public filteredBookings = signal<Booking[]>([]);
// =============================================
// Bookings -პაგინაცია 
// =============================================
public currentPage=signal<number>(1);
public totalPages=signal<number>(1);
public pageSize=5;

  public bookingFilterForm: FormGroup = new FormGroup({
    from: new FormControl(''),
    to: new FormControl(''),
  },
{
     validators: this.dateRangeValidator

  
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
   private dateRangeValidator(group: AbstractControl) {

    const from = group.get('from')?.value;
    const to = group.get('to')?.value;

    if (!from || !to) {
      return null;
    }

    if (from>to) {
      return { invalidRange: true };
    }

    return null;
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
          dob: userData.details.dob ? userData.details.dob.substring(0, 10): '',
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
      dateOfBirth: formValue.dob
        ? new Date(formValue.dob).toISOString()
        : '',
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

    this.userService.getFilteredBookings(this.currentPage(), this.pageSize, from || undefined, to || undefined).subscribe({
      next: (response) => {
        this.bookings.set(response.data.items);
          this.filteredBookings.set(response.data.items);
          this.totalPages.set(response.data.totalPages)
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
goTopage(page:number):void{
  if(page<1 || page>this.totalPages()) return
  this.currentPage.set(page);
  this.loadBookings();
}
  applyBookingFilter(): void {
  console.log('FILTER BUTTON CLICKED');

  console.log('ALL BOOKINGS:', this.bookings());

  const from = this.bookingFilterForm.value.from;
  const to = this.bookingFilterForm.value.to;
console.log({ from,to});


  let filtered = this.bookings();
console.log(filtered);

  if (from) {

    filtered = filtered.filter(booking =>
     booking.travelDate.split('T')[0] >= from
    );

  }

  if (to) {

    filtered = filtered.filter(booking =>
       booking.travelDate.split('T')[0] <= to
    );

  }

  this.filteredBookings.set(filtered);
this.currentPage.set(1);
this.loadBookings();


}

  clearBookingFilter(): void {
   this.bookingFilterForm.reset();
   this.currentPage.set(1)
   this.loadBookings()
  // this.filteredBookings.set(this.bookings());
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
         this.filteredBookings.update(list => list.filter(b => b.id !== id));
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
// ========================================
  // Settings- change password
// =======================================

setNewPassword():void{

  if(this.passwordForm.invalid){
    this.passwordForm.markAllAsTouched();
    return
  }
  const formValue=this.passwordForm.value;
  console.log('password form',formValue)

if(formValue.newPassword!==formValue.confirmPassword){

      alert('New password and confirm password do not match.');
       return
      }


  const playload={
    currentPassword:formValue.currentPassword,
    newPassword:formValue.newPassword
  }
  

  this.userService.changePassword(playload).subscribe({

    next: (response)=>{
      console.log('Password changed sucessfully',response);
      alert('Password changed successfully! Please log in again.');

      // წარმატების შემდეგ ფორმა უნდა გასუფთავდეს:

      this.passwordForm.reset();
      setTimeout(()=>{
        this.authService.logout();
        this.router.navigate(['/login'])
      },2000);
        
      
      
    },
    error:(err)=>{
      console.log('Change password error:', err);
      const message=err?.error?.detail ||'Failed to change password';
      alert(message)
    }
  })
}
// =====================================
// Delete account
// =====================================

deleteAccount():void{
  const confirmDelete=confirm('Are you sure you want to delete your account? This action cannot be undone')

  if(confirmDelete){
    return
  }

  this.userService.deleteAccount().subscribe({
    next:()=>{
      alert('Your account has been deleted successfully.');
      setTimeout(()=>{
          this.authService.logout();

        this.router.navigate(['/login']);
      })
    },
    error:(err)=>{

      console.log('Delete profile error:', err);

        alert(err?.error?.detail ||  'Failed to delete account');
    }
    })
}
}