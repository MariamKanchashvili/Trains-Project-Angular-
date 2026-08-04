import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { API_URL } from '../../../core/config/api.config';

@Service()
export class ServicesTrainsService {
    private http=inject(HttpClient)
    
    getAllTrains(){
 return this.http.get(`${API_URL}/trains`)
    }

    getTrainsByQuery(query:string,page:number,take:number){
        const params={
       query:query,
       Take:take,
       Page:page,
        }
        return this.http.get(`${API_URL}/trains/search`,{params});
    }
    
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
getTrainById(id:number){
return this.http.get(`${API_URL}/trains/${id}`)
}

getSeatsAvailability(scheduleId:number,coachId:number,travelDate:string){
    const params={scheduleId,coachId,travelDate}
    return this.http.get(`${API_URL}/seats/availability`,{params})
}
}
