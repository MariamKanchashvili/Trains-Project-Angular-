import { Component } from "@angular/core";
import { Register } from "../auth/pages/register/register";
import { Trains } from "../trains/pages/trains/trains";
import { TrainDetails } from "../trains/pages/train-details/train-details";

export const homeRoutes=[
    {
        path:'register',
        component:Register
    },

    {
        path:'trainDetails',
        component:TrainDetails
    }

]

