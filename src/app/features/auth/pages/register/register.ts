import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router, RouterLink } from "@angular/router";
import { TranslatePipe } from '@ngx-translate/core';


@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink,TranslatePipe],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  private service = inject(AuthService)
  public router = inject(Router);
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
      Validators.minLength(8),
    ]),
  });

  register() {

    if (this.formInfo.invalid) {
      this.formInfo.markAllAsTouched();
      return;
    }

    const email = this.formInfo.value.email;

    this.service.signup(this.formInfo.value).subscribe((data: any) => {

      console.log("register ფუნქცია ", data)
      alert("Your account has been created")

      this.router.navigate(['/resend-email'], {
        queryParams: { email }
      });
    })

  }

}