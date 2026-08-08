import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './core/layouts/header/header';
import { Footer } from "./core/layouts/footer/footer";
import { ChatWidget } from "./shared/components/chat-widget/chat-widget";


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer, ChatWidget],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('TrainsProject');
}
