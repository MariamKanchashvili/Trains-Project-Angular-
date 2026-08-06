import { Routes } from "@angular/router";
import { Trains } from "./pages/trains/trains";
import { TrainDetails } from "./pages/train-details/train-details";
import { Booking } from "./components/booking/booking";
import { Profile } from "../users/pages/profile/profile";

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
        component:Booking
    },
    {
        path:'profile',
        component:Profile
    }
]

