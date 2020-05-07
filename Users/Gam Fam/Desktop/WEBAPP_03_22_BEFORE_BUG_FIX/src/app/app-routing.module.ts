import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/*---------------------- Guard ----------------------*/
import { CanDeactivateGuard } from '../providers/guard-service/can-deactivate-guard.service';
import { AuthGuard } from '../providers/guard-service/auth-guard.service';

/*---------------------- component ----------------------*/
import { LoginComponent } from '../pages/auth-module/login/login.component';
import { ForgotPasswordComponent } from '../pages/auth-module/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from '../pages/auth-module/reset-password/reset-password.component';
import { CreateQuoteComponent } from '../pages/create-quote/create-quote.component';
import { HomeComponent } from '../pages/home/home.component';
import { SaveQuoteComponent } from '../pages/save-quote/save-quote.component';
import { DraftQuoteComponent } from '../pages/draft-quote/draft-quote.component';
import { ControllerSensorSelection } from '../pages/controller-sensor-selection/controller-sensor-selection.component';
import { DashboardComponent } from '../pages/dashboard/dashboard.component';
import { ControllerSeriesComponent } from '../pages/controller-series/controller-series.component';
import { panelOptions } from '../pages/panel-options/panel-options.component';
import { flowDirection } from '../pages/flow-direction/flow-direction.component';
import { MyProfileComponent } from '../pages/my-profile/my-profile.component';
import { AccessoriesComponent } from '../pages/accessories/accessories.component';
import { ConfiguredQuoteComponent } from '../pages/configured-quote/configured-quote.component';
import { ManageOrganizationUsers } from "../pages/manage-organization-users/manage-organization-users";
import { ViewQuotesComponent } from '../pages/view-quotes/view-quotes.component';

const routes: Routes = [
    {
        pathMatch: 'full',
        path: '',
        component: LoginComponent
    },
    {
        pathMatch: 'full',
        path: 'forgot-password',
        component: ForgotPasswordComponent
    },
    {
        pathMatch: 'full',
        path: 'reset-password',
        component: ResetPasswordComponent
    },
    {
        pathMatch: 'full',
        path: 'home',
        component: HomeComponent,
        canActivate: [AuthGuard]
    },
    {
        pathMatch: 'full',
        path: 'createQuote',
        component: CreateQuoteComponent,
        canActivate: [AuthGuard]
    },
    {
        pathMatch: 'full',
        path: 'saveQuote',
        data: {
            breadcrumb: 'saveQuote'
        },
        component: SaveQuoteComponent,
        canActivate: [AuthGuard]
    },
    {
        pathMatch: 'full',
        path: 'draftQuote',
        data: {
            breadcrumb: 'draftQuote'
        },
        component: DraftQuoteComponent,
        canActivate: [AuthGuard]
    },
    {
        pathMatch: 'full',
        path: 'dashboard',
        component: DashboardComponent,
        canActivate: [AuthGuard]
    },
    {
        pathMatch: 'full',
        path: 'controllerSeries',
        component: ControllerSeriesComponent,
        canActivate: [AuthGuard]
    },
    {
        pathMatch: 'full',
        path: 'controllerSensorSelection',
        component: ControllerSensorSelection,
        canActivate: [AuthGuard],
        canDeactivate: [CanDeactivateGuard]
    },
    {
        pathMatch: 'full',
        path: 'panelOptions',
        component: panelOptions,
        canActivate: [AuthGuard],
        canDeactivate: [CanDeactivateGuard]
    },
    {
        pathMatch: 'full',
        path: 'flowDirection',
        component: flowDirection,
        canActivate: [AuthGuard],
        canDeactivate: [CanDeactivateGuard]
    },
    {
        pathMatch: 'full',
        path: 'myProfile',
        component: MyProfileComponent,
        canActivate: [AuthGuard]
    },
    {
        pathMatch: 'full',
        path: 'accessories',
        component: AccessoriesComponent,
        canActivate: [AuthGuard],
        canDeactivate: [CanDeactivateGuard]
    },
{
    pathMatch: 'full',
    path: 'accessories/:tag',
    component: AccessoriesComponent,
    canActivate: [AuthGuard],
    canDeactivate: [CanDeactivateGuard]
},
    {
        pathMatch: 'full',
        path: 'configuredQuote',
        component: ConfiguredQuoteComponent,
        canActivate: [AuthGuard],
        canDeactivate: [CanDeactivateGuard]
    },
    {
        pathMatch: 'full',
        path: 'manageOrganizationUsers',
        component: ManageOrganizationUsers,
        canActivate: [AuthGuard]
    },
    {
        pathMatch: 'full',
        path: 'viewQuotes',
        component: ViewQuotesComponent,
        canActivate: [AuthGuard]
    }
];

@NgModule( {
    imports: [RouterModule.forRoot( routes, {useHash: true} )],
    exports: [RouterModule],
    providers: [CanDeactivateGuard, AuthGuard]
} )

export class AppRoutingModule { }
