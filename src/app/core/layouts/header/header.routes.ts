import { Routes } from "@angular/router";
import { Login } from "../../../features/auth/pages/login/login";
import { Register } from "../../../features/auth/pages/register/register";
import { HomeComponent } from "../../../features/home-component/home-component";
import { Trains } from "../../../features/trains/pages/trains/trains";
import { Profile } from "../../../features/users/pages/profile/profile";

export const  headerRouts :Routes=[
  {
        path:'',
        component:HomeComponent
    },

    {
        path:'login',
        component:Login,
    },
    {
        path:'register',
        component:Register
    },
  {
    path:'trains',
    component:Trains
  },
  {
    path:'profile',
    component:Profile
  }
 

]