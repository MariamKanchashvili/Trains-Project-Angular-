import { HttpClient, HttpParams } from '@angular/common/http';
import { APP_ID, inject, Service } from '@angular/core';
import { API_URL } from '../../../core/config/api.config';
import { UserResponse } from '../interfaces/user';
import { PaginatedResponse } from '../interfaces/paginated-response.interface';
import { Booking } from '../interfaces/booking-interface';
import { TokenService } from '../../../core/services/token.service';
import { StorageService } from '../../../core/services/storage.service';

export interface UpdateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address: string;
  pictureUrl: string;
  dateOfBirth: string;
}

@Service()
export class UserService {
    private http = inject(HttpClient);
    private storageService = inject(StorageService);

    getCurrentUser() {
 
    
    return this.http.get<{ data: UserResponse }>(`${API_URL}/users/me`);
        
    }

    getUserBookings(page: number, take: number,from?:string,to?:string) {
        const params:any={ Page: page, Take: take };
        if(from) params.from=from;
        if(to)params.to=to;

        return this.http.get<{ data: PaginatedResponse<Booking> }>(`${API_URL}/bookings`, { params });
    }
    updateUser(playload: UpdateUserRequest){
        return this.http.put<{data: UserResponse}>(`${API_URL}/users`,playload)
    }
    deleteBooking(id:number){
        return this.http.delete(`${API_URL}/bookings/${id}`);
    }


    
    getFilteredBookings(
  page: number,
  take: number,
  from?: string,
  to?: string
) {

  const params: any = {
    Page: page,
    Take: take
  };

  if (from) {
    params.from = from;
  }

  if (to) {
    params.to = to;
  }

  return this.http.get<{data: PaginatedResponse<Booking>}>(
    `${API_URL}/bookings/filter`,
    { params }
  );
}
changePassword(playload:{currentPassword:string,newPassword:string}){

  console.log('CHANGE PASSWORD CLICKED');
  return this.http.put(`${API_URL}/users/change-password`,playload)
}

deleteAccount(){
  return this.http.delete(`${API_URL}/users/delete-profile`)
}
}