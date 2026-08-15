import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router, RouterLink } from "@angular/router";
import { TranslatePipe } from '@ngx-translate/core';
import { AlertService } from '../../../../shared/services/alert.service';
import { PasswordField } from '../../../../shared/components/password-field/password-field';


@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink,TranslatePipe,PasswordField],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  private service = inject(AuthService)
  public router = inject(Router);
 public  alert=inject(AlertService);
public passwordValue='';

  public formInfo: FormGroup = new FormGroup({
    firstName: new FormControl('', [
      Validators.required,
      Validators.minLength(2)
    ]),
    lastName: new FormControl(''),
    email: new FormControl('', [
      Validators.required,
      Validators.email
    ]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
    ]),
  });

  register() {

    if (this.formInfo.invalid) {
      this.formInfo.markAllAsTouched();
      return;
    }

    const email = this.formInfo.value.email;

    this.service.signup(this.formInfo.value).subscribe({
      next: (data: any) => {

      console.log("register ფუნქცია ", data)
      this.alert.success("Your account has been created")

      this.router.navigate(['/resend-email'], {
        queryParams: { email }
      
      });
    },
    error:(err)=>{
      this.alert.error(err?.error?.detail ||'Failed to register.Try again later')
    }
    })

  }
onPasswordChange(password: string): void {
  this.passwordValue = password;

  this.formInfo.get('password')?.setValue(password);
}
}