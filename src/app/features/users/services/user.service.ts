import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Service } from '@angular/core';
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
        const token = this.storageService.get('accessToken') || '';
        console.log('Storage-დან ამოღებული ტოკენი:', token);
        if (!token) {
      console.warn('ტოკენი SessionStorage-ში ვერ მოიძებნა!');
    }
        const params = {accessToken:token}
    return this.http.get<{ data: UserResponse }>(`${API_URL}/users/me`, { params });
        
    }

    getUserBookings(page: number, take: number) {
        const params = { Page: page, Take: take };
        return this.http.get<{ data: PaginatedResponse<Booking> }>(`${API_URL}/bookings`, { params });
    }
    updateUser(playload: UpdateUserRequest){
        return this.http.put<{data: UserResponse}>(`${API_URL}/users`,playload)
    }
}