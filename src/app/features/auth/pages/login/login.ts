import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { StorageService } from '../../../../core/services/storage.service';
import { AlertService } from '../../../../shared/services/alert.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, TranslatePipe],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login implements OnInit {
  private service = inject(AuthService);
  public router = inject(Router);
  private storage = inject(StorageService);
  private alert = inject(AlertService);
  private route = inject(ActivatedRoute);
  public showPassword = false;


  public returnUrl = '/home';
  public loginFormInfo: FormGroup = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
    checkRemember: new FormControl(false)
  });

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      const returnUrl = params.get('returnUrl');
      this.returnUrl = returnUrl || '/home';
    });

    //  დამახსოვრებული email, persistent (localStorage) storage-იდან
    const savedEmail = this.storage.get('loginEmail', true);

    if (savedEmail) {
      this.loginFormInfo.patchValue({
        email: savedEmail,
        checkRemember: true
      });
    }
  }

  login(): void {
    const formData = this.loginFormInfo.value;

    //  Remember Me-ის მიხედვით, ან ვინახავთ, ან ვშლით
    if (formData.checkRemember) {
      this.storage.set('loginEmail', formData.email, true);
    } else {
      this.storage.remove('loginEmail', true);
    }

    this.service.signin(formData).subscribe({
      next: (data: any) => {
        console.log("login ფუნქცია ", data);
        this.alert.success('Logged in Successfully!');
        this.router.navigateByUrl(this.returnUrl);
      },
      error: (err) => {
        this.alert.error(err?.error?.detail || 'Failed to login. Please try again');
      }
    });
  }
  togglePassword(): void {
  this.showPassword = !this.showPassword;
}
}