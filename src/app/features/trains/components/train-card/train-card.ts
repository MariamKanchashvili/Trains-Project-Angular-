import { Component, Input,  OnInit } from '@angular/core';
import { TrainFilter } from '../train-filter/train-filter';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-train-card',
  imports: [],
  templateUrl: './train-card.html',
  styleUrl: './train-card.scss',
})
export class TrainCard  {

@Input() items:any[]=[];


  

}
