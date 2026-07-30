import { Routes } from "@angular/router";
import { Trains } from "./pages/trains/trains";
import { TrainDetails } from "./pages/train-details/train-details";

export const trainsRoutes:Routes=[
    {
        path:'trains',
        component:Trains
    },
    {
        path:'trains/:id',
        component:TrainDetails
    }
]

