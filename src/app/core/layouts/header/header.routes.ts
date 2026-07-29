import { Routes } from "@angular/router";
import { Login } from "../../../features/auth/pages/login/login";
import { Register } from "../../../features/auth/pages/register/register";
import { HomeComponent } from "../../../features/home-component/home-component";

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
  
   

]