import { Component, inject, OnInit, signal } from '@angular/core';
import { TrainFilter } from '../../components/train-filter/train-filter';
import { TrainCard } from '../../components/train-card/train-card';
import { ServicesTrainsService } from '../../services/services.trains.service';

@Component({
  selector: 'app-trains',
  imports: [TrainFilter, TrainCard],
  templateUrl: './trains.html',
  styleUrl: './trains.scss',
})
export class Trains implements OnInit {
private trainsService = inject(ServicesTrainsService);
  public trains = signal<any[]>([]);

  ngOnInit(): void {
    this.loadAllTrains(); // 🔧 გავიტანე ცალკე მეთოდად, რომ ხელახლა გამოვიძახოთ
  }

  private loadAllTrains(): void {
    this.trainsService.getAllTrains().subscribe(
      (res: any) => {
        console.log("All Trains response:", res);
        this.trains.set(res.data.items);
      }
    );
  }

  updateTrains(data: any[]) {
    this.trains.set(data);
  }

  // 🔧 ახალი — filtersCleared-ის მიმღები
  onFiltersCleared(): void {
    this.loadAllTrains();
  }
}