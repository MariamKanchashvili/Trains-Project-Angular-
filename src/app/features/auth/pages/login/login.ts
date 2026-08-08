import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { StorageService } from '../../../../core/services/storage.service';
import { email } from '@angular/forms/signals';
import { AlertService } from '../../../../shared/services/alert.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink,TranslatePipe],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login implements OnInit {
  private service=inject(AuthService);
  public router=inject(Router);
  private storage=inject(StorageService);
  private alert=inject(AlertService);
  
  public loginFormInfo:FormGroup=new FormGroup({
    email:new FormControl('',[
      Validators.required,
      Validators.email
    ]),
    password:new FormControl('',[
      Validators.required
    ]),
  });

ngOnInit(): void {

  const savedEmail = this.storage.get('loginEmail');
  const savedPass = this.storage.get('loginPass');

  this.loginFormInfo.patchValue({
    email: savedEmail ?? '',
    password: savedPass ?? ''
  });

}

  login(){
    const formData=this.loginFormInfo.value;
    this.storage.set('loginEmail',formData.email);
    this.storage.set('loginPass',formData.password);



    this.service.signin(formData).subscribe((data:any)=>{
      console.log("login ფუნქცია ",data);
      this.alert.success('Logged in SucessFully!')
      this.router.navigate(["/home"])
    })
    }
}
