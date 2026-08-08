import { Component, inject, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { AuthState } from '../../../core/services/auth-state';
import { UserService } from '../../../features/users/services/user.service';
import { ServicesTrainsService } from '../../../features/trains/services/services.trains.service'; // 🔧 დაარეგულირე path
import { environment } from '../../../../environments/environment';
import { forkJoin, Observable } from 'rxjs';

interface ChatMessage {
  text: string;
  type: 'user' | 'ai';
}

interface ApiMessage {
  role: 'user' | 'assistant';
  content: string;
}

@Component({
  selector: 'app-chat-widget',
  imports: [],
  templateUrl: './chat-widget.html',
  styleUrl: './chat-widget.scss',
})
export class ChatWidget implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);
  private userService = inject(UserService);
  private trainsService = inject(ServicesTrainsService);
  public authState = inject(AuthState);

  public isChatOpen = signal<boolean>(false);
  public hasNewNotification = signal<boolean>(true);

  public messages = signal<ChatMessage[]>([
    {
      text: 'გამარჯობა! 👋 მე ვარ STEP TRAINS-ის AI ასისტენტი. შემიძლია დაგეხმარო მატარებლების ძებნასა და დაჯავშნაში.',
      type: 'ai'
    }
  ]);
  public inputValue = signal<string>('');
  public isSending = signal<boolean>(false);
  public isThinking = signal<boolean>(false);

  // 🔧 history — მაქსიმუმ ბოლო 5 შეტყობინება
  private conversationHistory: ApiMessage[] = [];
  private readonly MAX_HISTORY = 5;

  // 🔧 მატარებლების მარტივი მონაცემი, prompt-ისთვის
  private trainsOverview: any[] = [];
  private trainsLoaded = false;

  ngOnInit(): void {
    this.loadTrainsOverview();
  }

  // 🔧 ჯავშნისთვის საჭირო "ლანდშაფტის" ჩატვირთვა — ერთხელ, გვერდის გახსნისას
private loadTrainsOverview(): void {
  this.trainsService.getAllTrains().subscribe({
    next: (response: any) => {
      const trainsList = response.data.items ?? response.data;

      if (!trainsList || trainsList.length === 0) {
        this.trainsLoaded = true;
        return;
      }

      // 🔧 თითოეული მატარებლის დეტალების ცალკე request, მასივში
        const detailRequests: Observable<any>[] = trainsList.map((t: any) =>
        this.trainsService.getTrainById(t.id)
      );

      // 🔧 ველოდებით ყველა request-ის ერთდროულ დასრულებას
      forkJoin(detailRequests).subscribe({
        next: (detailedTrains: any[]) => {
          this.trainsOverview = detailedTrains.map((res: any) => {
            const train = res.data;
            return {
              trainId: train.id,
              name: train.name,
              number: train.number,
              schedules: (train.schedules ?? []).map((s: any) => ({
                scheduleId: s.id,
                origin: s.origin,
                destination: s.destination,
                departureTime: s.departureTime
              })),
              coaches: (train.coaches ?? []).map((c: any) => ({
                coachId: c.id,
                class: c.class,
                price: c.price
              }))
            };
          });

          console.log('CHAT TRAINS OVERVIEW (with schedules/coaches):', JSON.stringify(this.trainsOverview, null, 2));
          this.trainsLoaded = true;
        },
        error: (err) => {
          console.log('Failed to load train details for chat:', err);
          this.trainsLoaded = true; // 🔧 მაინც "დასრულებულად" ვნიშნავთ, ცარიელი მონაცემით მაინც გავაგრძელოთ
        }
      });
    },
    error: (err) => {
      console.log('Failed to preload trains for chat:', err);
      this.trainsLoaded = true;
    }
  });
}

  toggleChat(): void {
    this.isChatOpen.update(open => !open);
    if (this.isChatOpen()) this.hasNewNotification.set(false);
  }

  sendMessage(): void {
    const value = this.inputValue().trim();
    if (!value || this.isSending()) return;

    this.messages.update(msgs => [...msgs, { text: value, type: 'user' }]);
    this.inputValue.set('');

    const messageContent = this.conversationHistory.length === 0
      ? this.buildPrompt(value)
      : value;

    this.pushToHistory({ role: 'user', content: messageContent });
    this.callClaude();
  }

  // 🔧 გატანილია ცალკე მეთოდად — რადგან ორ ადგილას გვჭირდება გამოძახება
  //    (ჩვეულებრივი შეტყობინებისას, და მარკერების დამუშავების შემდეგაც)
  private callClaude(): void {
    this.isSending.set(true);
    this.isThinking.set(true);

    this.http.post<any>('https://api.anthropic.com/v1/messages', {
      model: 'claude-sonnet-4-6',
      max_tokens: 400,
      messages: this.conversationHistory
    }).subscribe({
      next: (response) => {
        const responseText = response.content?.[0]?.text ?? 'ვერ მივიღე პასუხი.';
        this.pushToHistory({ role: 'assistant', content: responseText });
        this.handleClaudeResponse(responseText);
      },
      error: (err) => {
        console.log(err);
        this.messages.update(msgs => [...msgs, { text: 'შეცდომა დაფიქსირდა. სცადეთ ხელახლა.', type: 'ai' }]);
        this.isThinking.set(false);
        this.isSending.set(false);
      }
    });
  }

  // 🔧 ისტორიაში დამატება, ბოლო 5-მდე შეზღუდვით
  private pushToHistory(msg: ApiMessage): void {
    this.conversationHistory.push(msg);
    if (this.conversationHistory.length > this.MAX_HISTORY) {
      this.conversationHistory = this.conversationHistory.slice(-this.MAX_HISTORY);
    }
  }

  // 🔧 Claude-ის პასუხის "დაშიფვრა" — მარკერების ძებნა
  private handleClaudeResponse(responseText: string): void {

    // === 1) სეატების მოთხოვნა ===
    if (responseText.includes('SEATS_REQUEST:')) {
      const [visibleText, jsonPart] = responseText.split('SEATS_REQUEST:');

      if (visibleText.trim()) {
        this.messages.update(msgs => [...msgs, { text: visibleText.trim(), type: 'ai' }]);
      }

      try {
        const request = JSON.parse(jsonPart.trim());
        this.fetchSeatsAndContinue(request);
      } catch {
        this.isThinking.set(false);
        this.isSending.set(false);
      }
      return;
    }

    // === 2) ჯავშნის დადასტურება ===
    if (responseText.includes('BOOKING_ACTION:')) {
      const [visibleText, jsonPart] = responseText.split('BOOKING_ACTION:');

      if (visibleText.trim()) {
        this.messages.update(msgs => [...msgs, { text: visibleText.trim(), type: 'ai' }]);
      }

      try {
        const action = JSON.parse(jsonPart.trim());
        this.executeBooking(action);
      } catch {
        this.isThinking.set(false);
        this.isSending.set(false);
      }
      return;
    }

    // === 3) ჩვეულებრივი ტექსტური პასუხი ===
    this.messages.update(msgs => [...msgs, { text: responseText, type: 'ai' }]);
    this.isThinking.set(false);
    this.isSending.set(false);
  }

  // 🔧 რეალური სეატების წამოღება, backend-იდან
  private fetchSeatsAndContinue(request: { scheduleId: number; coachId: number; travelDate: string }): void {
    this.trainsService.getSeatsAvailability(request.scheduleId, request.coachId, request.travelDate).subscribe({
      next: (response: any) => {
        const availableSeats = response.data
          .filter((s: any) => s.isAvailable)
          .map((s: any) => ({ seatId: s.id, number: s.number }));

        // 🔧 ეს მონაცემი "ვუბრუნებთ" Claude-ს, როგორც ახალ user-შეტყობინებას
        const dataMessage = `[SYSTEM DATA] Available seats: ${JSON.stringify(availableSeats)}. Ask the user to pick one, using the exact seatId when you write BOOKING_ACTION later.`;

        this.pushToHistory({ role: 'user', content: dataMessage });
        this.callClaude(); // 🔧 ხელახლა ვეკითხებით Claude-ს, ახლა სეატების მონაცემით
      },
      error: (err) => {
        console.log(err);
        this.messages.update(msgs => [...msgs, { text: 'ვერ მოხერხდა ადგილების შემოწმება.', type: 'ai' }]);
        this.isThinking.set(false);
        this.isSending.set(false);
      }
    });
  }

  // 🔧 რეალური ჯავშნის შექმნა
  private executeBooking(action: { scheduleId: number; seatId: number; travelDate: string }): void {
    this.userService.createBooking({
      scheduleId: action.scheduleId,
      seatId: [action.seatId],
      travelDate: action.travelDate
    }).subscribe({
      next: () => {
        this.messages.update(msgs => [...msgs, { text: '✅ ჯავშანი წარმატებით შესრულდა! დეტალები ნახეთ თქვენს პროფილში.', type: 'ai' }]);
        this.isThinking.set(false);
        this.isSending.set(false);
      },
      error: (err) => {
        console.log(err);
        const message = err?.error?.detail || 'ჯავშნის შექმნა ვერ მოხერხდა.';
        this.messages.update(msgs => [...msgs, { text: `❌ ${message}`, type: 'ai' }]);
        this.isThinking.set(false);
        this.isSending.set(false);
      }
    });
  }

  private buildPrompt(userMessage: string): string {
    const isLoggedIn = this.authState.isLoggedIn();

    return `
შენ ხარ STEP TRAINS-ის AI Assistant.
მომხმარებელს შეუძლია ქართულად ან ინგლისურად დაწეროს.

მომხმარებლის სტატუსი: ${isLoggedIn ? 'ავტორიზებული' : 'არა-ავტორიზებული'}

ხელმისაწვდომი მატარებლები/მარშრუტები/ვაგონები:
${JSON.stringify(this.trainsOverview, null, 2)}

წესები:
1. უპასუხე ქართულად
2. თუ მომხმარებელი ჯავშნის გაკეთებას ითხოვს და არაავტორიზებულია, უთხარი, jერ უნდა შევიდეს სისტემაში, და აღარ განაგრძო
3. არასდროს გამოიგონო scheduleId/coachId — გამოიყენე მხოლოდ ზემოთ მოცემული სია
4. თუ იცი კონკრეტული schedule, coach და თარიღი, მაგრამ ჯერ არ იცი კონკრეტული ადგილი (seat), დაწერე ცალკე ხაზზე:
   SEATS_REQUEST: {"scheduleId": <რიცხვი>, "coachId": <რიცხვი>, "travelDate": "<YYYY-MM-DD>"}
5. მას შემდეგ, რაც მიიღებ ხელმისაწვდომ სეატებს (SYSTEM DATA-ს სახით) და მომხმარებელი აირჩევს კონკრეტულს, დაწერე:
   BOOKING_ACTION: {"scheduleId": <რიცხვი>, "coachId": <რიცხვი>, "seatId": <რიცხვი>, "travelDate": "<YYYY-MM-DD>"}
6. არასდროს გამოიყენო markdown ფორმატირება (** # -)

მომხმარებლის მოთხოვნა: "${userMessage}"
    `;
  }

  goToLogin(): void {
    this.isChatOpen.set(false);
    this.router.navigate(['/login']);
  }
}