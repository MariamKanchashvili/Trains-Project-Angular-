import { Component, inject, OnInit, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

import { AuthService } from '../../services/auth.service';
import { AlertService } from '../../../../shared/services/alert.service';
import { PasswordField } from '../../../../shared/components/password-field/password-field';

@Component({
  selector: 'app-reset-password',
  imports: [
    ReactiveFormsModule,
    TranslatePipe,PasswordField
  ],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.scss',
})
export class ResetPassword implements OnInit {

  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private alert = inject(AlertService);
public passwordValue = '';
  // URL-დან მიღებული reset token
  private resetToken = '';

  public isLoading = signal(false);

  public resetPasswordForm = new FormGroup({

    password: new FormControl('', [
      Validators.required,
      Validators.minLength(6)
    ]),

    confirmPassword: new FormControl('', [
      Validators.required
    ])

  });


  ngOnInit(): void {

    /*
      აქ ვკითხულობთ token-ს URL-დან.

      მაგალითად თუ მომხმარებელი გახსნა:

      /reset-password?token=123456

      მაშინ:

      token = "123456"
    */

   this.route.queryParamMap.subscribe(params => {

    const token = params.get('token');

    console.log('TOKEN FROM URL:', token);

    // თუ token არ არსებობს, reset password-ს ვერ გავაგრძელებთ
    if (!token) {
      this.alert.error(
        'Reset password token is missing or invalid.'
      );

      return;
    }

    // თუ token არსებობს, ვინახავთ კომპონენტის ცვლადში
    // და შემდეგ resetPassword() ფუნქციაში გამოვიყენებთ
    this.resetToken = token;

    console.log('SAVED RESET TOKEN:', this.resetToken);

    });

  }


  resetPassword(): void {

    // ვამოწმებთ ფორმის ვალიდურობას
    if (this.resetPasswordForm.invalid) {

      this.resetPasswordForm.markAllAsTouched();

      return;
    }


    const password =
      this.resetPasswordForm.get('password')?.value;

    const confirmPassword =
      this.resetPasswordForm.get('confirmPassword')?.value;


    // ვამოწმებთ ემთხვევა თუ არა პაროლები
    if (password !== confirmPassword) {

      this.alert.error(
        'Password and confirm password do not match.'
      );

      return;
    }


    // თუ token საერთოდ არ გვაქვს, API-ს ტყუილად არ ვუგზავნით request-ს
    if (!this.resetToken) {

      this.alert.error(
        'Invalid or expired reset password link.'
      );

      return;
    }


    /*
      Backend-ს სჭირდება ზუსტად ასეთი body:

      {
        "token": "...",
        "password": "..."
      }
    */

    const payload = {
      token: this.resetToken,
      password: password
    };

  console.log('RESET PAYLOAD:', payload);

    this.isLoading.set(true);


    this.authService.resetPassword(payload).subscribe({

      next: (response) => {

        console.log('Password reset successfully:', response);

        this.isLoading.set(false);

        this.alert.success(
          'Password reset successfully! Please log in.'
        );


        /*
          პაროლის წარმატებით შეცვლის შემდეგ
          მომხმარებელი გადაგვყავს Login გვერდზე.
        */

        setTimeout(() => {

          this.router.navigate(['/login']);

        }, 1500);

      },


      error: (err) => {

        console.log('Reset password error:', err);

        this.isLoading.set(false);

        const message =
          err?.error?.detail ||
          'Failed to reset password. The link may be expired or invalid.';

        this.alert.error(message);

      }

    });

  }
onPasswordChange(password: string): void {
  this.passwordValue = password;

  this.resetPasswordForm
    .get('password')
    ?.setValue(password);
}
}