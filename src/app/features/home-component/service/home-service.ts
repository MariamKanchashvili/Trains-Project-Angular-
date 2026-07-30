import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { API_URL } from '../../../core/config/api.config';

@Service()
export class HomeService {
    private http=inject(HttpClient);
     
     searchTrains(
    origin:string,
    destination: string,
    page: number,
    take: number
     ){
    const params={
        origin:origin,
        destination:destination,
        Page:page,
        Take:take
        
    }
        return this.http.get(`${API_URL}/trains/filter`,{params})

     }

     getStations(){
        return this.http.get(`${API_URL}/stations`)
     }

}
