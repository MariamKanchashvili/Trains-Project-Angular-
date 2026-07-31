import { Component, inject, OnInit, signal } from '@angular/core';
import { TrainFilter } from '../../components/train-filter/train-filter';
import { TrainCard } from '../../components/train-card/train-card';
import { ServicesTrainsService } from '../../services/services.trains.service';
import { StateMessage } from '../../../../shared/components/state-message/state-message';

@Component({
  selector: 'app-trains',
  imports: [TrainFilter, TrainCard,StateMessage],
  templateUrl: './trains.html',
  styleUrl: './trains.scss',
})
export class Trains implements OnInit {
private trainsService = inject(ServicesTrainsService);
  public trains = signal<any[]>([]);
 public errorMessage=signal<string>('');
  ngOnInit(): void {
    this.loadAllTrains(); // 🔧 გავიტანე ცალკე მეთოდად, რომ ხელახლა გამოვიძახოთ
  }

  private loadAllTrains(): void {
    this.trainsService.getAllTrains().subscribe(
      (res: any) => {
        console.log("All Trains response:", res);
        this.trains.set(res.data.items);
        this.errorMessage.set(''); //ყოველი წარმატებული ჩატვირთვისას ვასუფთავებთ ძველ error-ს
      }
    );
  }

  updateTrains(data: any[]) {
    this.trains.set(data);
    this.errorMessage.set('');
  }
 onSearchError(message:string){
  this.trains.set([]);
  this.errorMessage.set(message);
 }
  // 🔧 ახალი — filtersCleared-ის მიმღები
  onFiltersCleared(): void {
    this.loadAllTrains();
    this.errorMessage.set('');
  }
}