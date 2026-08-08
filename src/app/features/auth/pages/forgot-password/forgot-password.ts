import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { AlertService } from '../../../../shared/services/alert.service';


@Component({
  selector: 'app-forgot-password',
  imports: [ReactiveFormsModule, RouterLink,TranslatePipe],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.scss',
})
export class ForgotPassword {
  private service=inject(AuthService);
  public router=inject(Router)
  private alert=inject(AlertService);
public forgotPassFormInfo:FormGroup=new FormGroup({
  email:new FormControl('',[
    Validators.required,
    Validators.email
  ]),
})
  resetPass(){
    const email = this.forgotPassFormInfo.get('email')?.value;
    console.log('გასაგზავნი მეილი:', email);




  this.service.forgotPass(email).subscribe({

    next: (data:any) => {
      console.log(data);
       
    this.alert.success("Reset Link Sent Sucessfully!")
    this.router.navigate(['login'])
    
    },

    error: (err) => {
      console.log(err);
     

      this.alert.error("Something went wrong!");
    }
  })

   
  
  }

}
