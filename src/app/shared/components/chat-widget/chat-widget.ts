import { Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { AuthState } from '../../../core/services/auth-state';
import { environment } from '../../../../environments/environment';


interface ChatMessage {
  text: string;
  type: 'user' | 'ai';
}

@Component({
  selector: 'app-chat-widget',
  imports: [RouterLink],
  templateUrl: './chat-widget.html',
  styleUrl: './chat-widget.scss',
})
export class ChatWidget {
  private http = inject(HttpClient);
  private router = inject(Router);
  public authState = inject(AuthState);

  // ============================================
  // ჩატის ღია/დახურული მდგომარეობა
  // ============================================
  public isChatOpen = signal<boolean>(false);
  public hasNewNotification = signal<boolean>(true);

  // ============================================
  // შეტყობინებები და input
  // ============================================
  public messages = signal<ChatMessage[]>([
    {
      text: 'გამარჯობა! 👋 მე ვარ STEP TRAINS-ის AI ასისტენტი. შემიძლია დაგეხმარო მატარებლების, მარშრუტების და განრიგების ძებნაში.',
      type: 'ai'
    }
  ]);
  public inputValue = signal<string>('');
  public isSending = signal<boolean>(false);
  public isThinking = signal<boolean>(false);

  toggleChat(): void {
    this.isChatOpen.update(open => !open);
    if (this.isChatOpen()) {
      this.hasNewNotification.set(false);
    }
  }

  sendMessage(): void {
    const value = this.inputValue().trim();
    if (!value || this.isSending()) return;

    // 🔧 მომხმარებლის შეტყობინების დამატება
    this.messages.update(msgs => [...msgs, { text: value, type: 'user' }]);
    this.inputValue.set('');
    this.isSending.set(true);
    this.isThinking.set(true);

    const prompt = this.buildPrompt(value);

    this.http.post<any>('https://api.anthropic.com/v1/messages', {
      model: 'claude-sonnet-4-6',
      max_tokens: 400, // 🔧 შენს მითითებას თანახმად, უცვლელია
      messages: [{ role: 'user', content: prompt }]
    }).subscribe({
      next: (response) => {
        const responseText = response.content?.[0]?.text ?? 'ვერ მივიღე პასუხი.';
        this.messages.update(msgs => [...msgs, { text: responseText, type: 'ai' }]);
        this.isThinking.set(false);
        this.isSending.set(false);
      },
      error: (err) => {
        console.log(err);
        this.messages.update(msgs => [...msgs, { text: 'შეცდომა დაფიქსირდა. სცადეთ ხელახლა.', type: 'ai' }]);
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

წესები:
1. უპასუხე ქართულად
2. თუ მომხმარებელი ჯავშნის გაკეთებას ითხოვს და არაავტორიზებულია, უთხარი, jერ უნდა შევიდეს სისტემაში

მომხმარებლის მოთხოვნა: "${userMessage}"
    `;
  }

  goToLogin(): void {
    this.isChatOpen.set(false);
    this.router.navigate(['/login']);
  }
}