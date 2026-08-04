import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router, RouterLink } from '@angular/router';


@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private service=inject(AuthService);
  public router=inject(Router);
  public loginFormInfo:FormGroup=new FormGroup({
    email:new FormControl('',[
      Validators.required,
      Validators.email
    ]),
    password:new FormControl('',[
      Validators.required
    ]),
  });


  login(){
    this.service.signin(this.loginFormInfo.value).subscribe((data:any)=>{
      console.log("login ფუნქცია ",data);
      alert('Logged in SucessFully!')
      this.router.navigate(["/home"])
    })
    }
}
