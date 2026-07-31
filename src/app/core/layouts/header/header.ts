import { Component, inject, Injector, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from "@angular/router";
import { AuthState } from '../../services/auth-state';
import { AuthService } from '../../../features/auth/services/auth.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink,RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  public authState=inject(AuthState);
  private authService=inject(AuthService);
  private router=inject(Router);

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
