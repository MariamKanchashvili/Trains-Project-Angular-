import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './core/layouts/header/header';
import { Footer } from "./core/layouts/footer/footer";
import { ChatWidget } from "./shared/components/chat-widget/chat-widget";
import { CustomAlerts } from './shared/components/custom-alerts/custom-alerts';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer, ChatWidget,CustomAlerts],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('TrainsProject');
}
