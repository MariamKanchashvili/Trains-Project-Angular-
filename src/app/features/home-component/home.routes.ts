import { Component } from "@angular/core";
import { Register } from "../auth/pages/register/register";
import { Trains } from "../trains/pages/trains/trains";

export const homeRoutes=[
    {
        path:'register',
        Component:Register
    },
    {
        path:'trains',
        Component:Trains
    }

]

