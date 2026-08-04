import { Component, Input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-state-message',
  imports: [],
  templateUrl: './state-message.html',
  styleUrl: './state-message.scss',
})
export class StateMessage {
  @Input() type:'error'|'empty'='empty';
  @Input () title:string='';
  @Input () message:string='';
  
}
