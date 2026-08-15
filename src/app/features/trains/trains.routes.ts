import { Routes } from "@angular/router";
import { Trains } from "./pages/trains/trains";
import { TrainDetails } from "./pages/train-details/train-details";
import { Booking } from "./components/booking/booking";
import { Profile } from "../users/pages/profile/profile";
import { authGuard } from "../../core/guards/auth.guards/auth-guard";


export const trainsRoutes:Routes=[
    {
        path:'trains',
        component:Trains
    },
    {
        path:'trains/:id',
        component:TrainDetails
    },
    {
        path:'booking/:trainId/:scheduleId',
        component:Booking,
         canActivate: [authGuard]
    },
    {
        path:'profile',
        component:Profile,
        canActivate: [authGuard]
    }
]

