import { Component, inject, OnInit } from '@angular/core';
import { TrainFilter } from '../../components/train-filter/train-filter';
import { TrainCard } from '../../components/train-card/train-card';
import { ServicesTrainsService } from '../../services/services.trains.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-trains',
  imports: [TrainFilter,TrainCard],
  templateUrl: './trains.html',
  styleUrl: './trains.scss',
})
export class Trains implements OnInit {
  private trainsService=inject(ServicesTrainsService)
  public trains:any[]=[];
ngOnInit(): void {
  this.trainsService.getAllTrains().subscribe(
    (res:any)=>{
      console.log(res)
      this.trains=res.data.items
    }
  )
}
}
