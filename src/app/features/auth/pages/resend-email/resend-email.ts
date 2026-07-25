import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { RouterLink } from '@angular/router';
import { AuthLayout } from "../../auth-layout/auth-layout";

@Component({
  selector: 'app-resend-email',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './resend-email.html',
  styleUrl: './resend-email.scss',
})
export class ResendEmail {
  private service=inject(AuthService);

  public verifyInfo:FormGroup=new FormGroup({
    code:new FormControl('',[
      Validators.required,
      Validators.minLength(6)
    ]),
  })

  ResendVerifyEmail(){
const code=this.verifyInfo.get('code')?.value;


this.service.resendVerify(code).subscribe({

      next: (data: any) => {

        console.log(data);
      
        alert("Verification Email Sent!");
      
        
      },

     
      error: (err) => {

        console.log(err);

        alert("Something went wrong!");

      }
})
  }
}
