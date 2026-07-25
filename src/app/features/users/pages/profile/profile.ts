import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-profile',
  imports: [],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile implements OnInit{
   public userInfo = '';
   private service=inject(AuthService);
ngOnInit(): void {
  this.service.getUser().subscribe((data:any)=>{
      console.log(data);

      if (!data) {
        this.userInfo = 'User';
        return;
      }

      this.userInfo = data.firstName || data.user?.firstName || 'User';
    });
}
}
