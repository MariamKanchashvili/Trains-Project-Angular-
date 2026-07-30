import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { API_URL } from '../../../core/config/api.config';

@Service()
export class ServicesTrainsService {
    private http=inject(HttpClient)
    
    getAllTrains(){
        

        return this.http.get(`${API_URL}/trains`)
    }

    getTrainsById(id:number){}
    searchTrains(){}
    filterTrains(
  origin: string,
  destination: string,
  page: number,
  take: number
    ){
    const params = {
    origin,
    destination,
    Page: page,
    Take: take     
    };
    return this.http.get(`${API_URL}/trains/filter`,{params})
}
}
