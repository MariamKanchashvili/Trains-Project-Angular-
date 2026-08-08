import { Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { TranslatePipe } from '@ngx-translate/core';
import { AlertService } from '../../../../shared/services/alert.service';

@Component({
  selector: 'app-resend-email',
  imports: [ReactiveFormsModule, RouterLink,TranslatePipe],
  templateUrl: './resend-email.html',
  styleUrl: './resend-email.scss',
})
export class ResendEmail implements OnInit {
  private service = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private alert=inject(AlertService);
  public email = signal<string | null>(null);

  public errorMessage = signal<string>('');
  public isLoading = signal<boolean>(false);
  public isResending = signal<boolean>(false);

  public verifyInfo: FormGroup = new FormGroup({
    code: new FormControl('', [
      Validators.required,
      Validators.minLength(6)
    ]),
  });

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      const emailFromUrl = params.get('email');
      this.email.set(emailFromUrl);
    });
  }

  verifyEmailCode(): void {
    if (this.verifyInfo.invalid) {
      this.verifyInfo.markAllAsTouched();
      return;
    }

    const email = this.email();
    if (!email) {
      this.errorMessage.set('Email not found. Please register again.');
      return;
    }

    const code = this.verifyInfo.get('code')?.value;
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.service.verifyEmail(email, code).subscribe({
      next: (data: any) => {
        console.log(data);
        this.isLoading.set(false);
        this.alert.success("Email Verified Successfully!");
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.log(err);
        this.isLoading.set(false);
        this.errorMessage.set('Invalid or expired code. Please try again.');
      }
    });
  }

 resendCode(): void {
  const email = this.email();

  if (!email) {
    this.errorMessage.set('Email not found. Please register again.');
    return;
  }

  this.isResending.set(true);
  this.errorMessage.set('');

  this.service.resendVerify(email).subscribe({
    next: (data: any) => {
      console.log(data);
      this.isResending.set(false);
      this.alert.success("Verification Email Sent!");
    },
    error: (err) => {
      console.log(err);
      this.isResending.set(false);

      // 🔧 backend-ის კონკრეტული შეტყობინების ამოღება, თუ არსებობს
      const message = err?.error?.detail || 'Failed to resend code. Please try again.';
      this.alert.error(message); // 🔧 პოპაპით ვაჩვენებთ, როგორც ითხოვე
      this.errorMessage.set(message);

      
if (err?.error?.detail?.includes('already verified')) {
    this.router.navigate(['/login']);
  }
      
    }
  });
}
}