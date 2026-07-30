import { Component, inject, Input } from '@angular/core';
import { Router } from '@angular/router';


@Component({
  selector: 'app-train-card',
  imports: [],
  templateUrl: './train-card.html',
  styleUrl: './train-card.scss',
})
export class TrainCard  {

@Input() items:any[]=[];

private router=inject(Router);

goToDetails(id:number){
  this.router.navigate(['/trains',id]);
}
  

}
