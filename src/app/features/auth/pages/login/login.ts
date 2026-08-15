import { Component, inject, Injector, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
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
  private route=inject(ActivatedRoute);

  public returnUrl='/home';
  public loginFormInfo:FormGroup=new FormGroup({
    email:new FormControl('',[
      Validators.required,
      Validators.email
    ]),
    password:new FormControl('',[
      Validators.required
    ]),
    checkRemember:new FormControl(false)
  });

ngOnInit(): void {
 this.route.queryParamMap.subscribe(params => {

    const returnUrl = params.get('returnUrl');

    this.returnUrl = returnUrl || '/home';

  });
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



    this.service.signin(formData).subscribe({
      next:(data:any)=>{
      console.log("login ფუნქცია ",data);
      this.alert.success('Logged in SucessFully!')
    this.router.navigateByUrl(this.returnUrl);
    },
     error:(err)=>{
      this.alert.error(err?.error?.detail || 'Failed to login. Please try again ')
     }
    })
    }
}
