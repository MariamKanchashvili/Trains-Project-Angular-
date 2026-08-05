import { Component, inject, Injector, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from "@angular/router";
import { AuthState } from '../../services/auth-state';
import { AuthService } from '../../../features/auth/services/auth.service';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-header',
  imports: [RouterLink,RouterLinkActive,TranslatePipe],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  public authState=inject(AuthState);
  private authService=inject(AuthService);
  private router=inject(Router);
  private translateService =inject(TranslateService);
  
 public selectedLanguage:string='en';


 constructor(){
  this.translateService.setFallbackLang('en')
  this.translateService.use('en')
 }
 switchLanguage(language:string){
  this.translateService.use(language);
  this.selectedLanguage = language;
 }





  //  ბურგერ-მენიუს მდგომარეობა — ღიაა თუ დახურული
  public isMenuOpen = signal(false);

  toggleMenu(): void {
    this.isMenuOpen.update(open => !open);
  }

   closeMenu(): void {
    this.isMenuOpen.set(false);
  }
  logout(): void {
    this.authService.logout();
    this.closeMenu();
    this.router.navigate(['/login']);
  }
}
