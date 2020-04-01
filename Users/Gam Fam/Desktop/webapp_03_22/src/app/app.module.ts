import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpModule } from '@angular/http';
import { HttpClientModule, HttpClientJsonpModule } from '@angular/common/http';

/*-------------------------- npm providers -------------------------------*/
import { NgbModal, NgbModule, NgbActiveModal, NgbModalRef, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { ImageCropperComponent, CropperSettings } from 'ng2-img-cropper';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { ToasterModule, ToasterService, ToasterConfig } from 'angular2-toaster';
import { ShareButtonsModule } from 'ngx-sharebuttons';
import { TagInputModule } from 'ngx-chips';
import { NgIdleKeepaliveModule } from '@ng-idle/keepalive';
import { MomentModule } from 'angular2-moment';

/*------------------------ Components ----------------------------*/
import { AppComponent } from './app.component';
import { LoginComponent } from '../pages/auth-module/login/login.component';
import { HeaderComponent } from '../pages/header/header.component';
import { SidebarComponent } from '../pages/sidebar/sidebar.component';
import { ModalComponent } from '../pages/modal/modal.component';
import { ImageCropComponent } from '../pages/image-crop-modal/image-crop-modal.component';
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
import { ChangePasswordComponent } from '../pages/change-password/change-password.component';
import { EditQuotationComponent } from '../pages/edit-quotation/edit-quotation.component';
import { MyProfileComponent } from '../pages/my-profile/my-profile.component';
import { AccessoriesComponent } from '../pages/accessories/accessories.component';
import { ConfiguredQuoteComponent } from '../pages/configured-quote/configured-quote.component';
import { ManageOrganizationUsers } from '../pages/manage-organization-users/manage-organization-users';
import { AddNewUserComponent } from '../pages/add-new-user/add-new-user.component';
import { AddNewAdminComponent } from '../pages/add-new-admin/add-new-admin.component';
import { AddNewSuperUserComponent } from '../pages/add-new-super-user/add-new-super-user.component';
import { FlowDiscardConfirmComponent } from '../pages/flow-discard-confirm-modal/flow-discard-confirm-modal.component';
import { PanelDiscardConfirmComponent } from '../pages/panel-discard-confirm-modal/panel-discard-confirm-modal.component';
import { SensorDiscardConfirmComponent } from '../pages/sensor-discard-confirm-modal/sensor-discard-confirm-modal.component';
import { AccessoryDiscardConfirmComponent } from '../pages/accessory-discard-confirm-modal/accessory-discard-confirm-modal.component';
import { DraftDiscardConfirmComponent } from '../pages/draft-discard-confirm-modal/draft-discard-confirm-modal.component';
import { SaveDiscardConfirmComponent } from '../pages/save-discard-confirm-modal/save-discard-confirm-modal.component';
import { ChangeProjectDetailsComponent } from '../pages/change-project-details/change-project-details.component';
import { ShareQuoteComponent } from '../pages/share-quote/share-quote.component';
import { ShareQuoteH2Component } from '../pages/share-quoteH2/share-quoteH2.component';
import { SetRoleBasedQuoteTypeComponent } from '../pages/set-role-based-quote-type/set-role-based-quote-type.component';
import { ViewQuotesComponent } from '../pages/view-quotes/view-quotes.component';

/*------------------------ Services ----------------------------*/
import { AppSettings } from '../providers/app-settings-service/app-settings.service';
import { Constants } from '../providers/app-settings-service/app-constant.service';
import { RestService } from '../providers/rest-service/rest.service';
import { AuthServices } from '../providers/auth-service/auth.service';
import { NetworkService } from '../providers/network-service/network.service';
import { LocalStorageService } from '../providers/local-storage-service/local-storage.service';
import { CommonService } from '../providers/common-service/common.service';
import { LoaderService } from '../providers/common-service/loader-services';
import { UserService } from '../providers/user-service/user.service';
import { SidebarService } from '../providers/sidebar.service';
import { Broadcaster } from '../providers/broadcast-service/broadcast.service';
import { UploadAwsService } from '../providers/uploadAwsService/uploadAwsService';
import { PaginationService } from '../providers/pagination-service/pagination.service';
import { LocalPaginationService } from '../providers/pagination-service/local-pagination.service';
import { ToastService } from '../providers/common-service/toaster-service';
import { ManageOrgUserService } from '../providers/manage-org-user-service/manage-org-user.service';
import { QuoteService } from '../providers/quote-service/quote-service.service';
import { PanelDiagramService } from '../providers/panel-diagram-service/panel-diagram.service';
import { ViewQuoteServiceService } from '../providers/view-quote-service/view-quote.service';
import { AddPostService } from "../providers/add-post.service";

/*------------------------ Pipes ----------------------------*/
import { SearchPipe } from '../pipes/table-filter/table-filter';
import { OrderByPipe } from '../pipes/sort/sort';
import { SortingColumnsPipe } from '../pipes/sort/sort-column';
import { SafePipe } from '../pipes/safe/safe';
import { ImageCropperModule } from 'ng2-img-cropper/src/imageCropperModule';
import { NotAllowCopyPasteDirective } from '../directive/not-allow-copy-paste.directive';



@NgModule( {
    declarations: [
        AppComponent,
        LoginComponent,
        ForgotPasswordComponent,
        ResetPasswordComponent,
        HeaderComponent,
        ModalComponent,
        ImageCropComponent,
        SidebarComponent,
        CreateQuoteComponent,
        HomeComponent,
        SaveQuoteComponent,
        DraftQuoteComponent,
        ControllerSensorSelection,
        SearchPipe,
        OrderByPipe,
        SortingColumnsPipe,
        SafePipe,
        DashboardComponent,
        ControllerSeriesComponent,
        panelOptions,
        flowDirection,
        ChangePasswordComponent,
        EditQuotationComponent,
        MyProfileComponent,
        AccessoriesComponent,
        ConfiguredQuoteComponent,
        ManageOrganizationUsers,
        AddNewUserComponent,
        AddNewAdminComponent,
        AddNewSuperUserComponent,
        ChangeProjectDetailsComponent,
        PanelDiscardConfirmComponent,
        FlowDiscardConfirmComponent,
        SensorDiscardConfirmComponent,
        AccessoryDiscardConfirmComponent,
        DraftDiscardConfirmComponent,
        SaveDiscardConfirmComponent,
        ShareQuoteComponent,
        ShareQuoteH2Component,
        NotAllowCopyPasteDirective,
        SetRoleBasedQuoteTypeComponent,
        ViewQuotesComponent,
      
        
    ],
    entryComponents: [
        ModalComponent,
        ImageCropComponent,
        ChangePasswordComponent,
        EditQuotationComponent,
        AddNewUserComponent,
        AddNewAdminComponent,
        AddNewSuperUserComponent,
        ChangeProjectDetailsComponent,
        PanelDiscardConfirmComponent,
        FlowDiscardConfirmComponent,
        SensorDiscardConfirmComponent,
        AccessoryDiscardConfirmComponent,
        DraftDiscardConfirmComponent,
        SaveDiscardConfirmComponent,
        ShareQuoteComponent,
        ShareQuoteH2Component,
        SetRoleBasedQuoteTypeComponent
    ],
    imports: [
        BrowserModule,
        FormsModule,
        HttpModule,
        InfiniteScrollModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        ToasterModule.forRoot(),
        NgbModule.forRoot(),
        HttpClientModule,
        HttpClientJsonpModule,
        TagInputModule,
        ImageCropperModule,
        ShareButtonsModule.forRoot(),
        MomentModule,
        NgIdleKeepaliveModule.forRoot()
    ],
    providers: [NgbModal, NgbActiveModal, AppSettings,
        Constants, RestService, NetworkService,
        LocalStorageService, CommonService,
        LoaderService, AuthServices, UserService, SidebarService,
        Broadcaster, UploadAwsService, CropperSettings,
        PaginationService, LocalPaginationService,
        ToastService, ManageOrgUserService, QuoteService,
        PanelDiagramService, ViewQuoteServiceService, SearchPipe, SortingColumnsPipe,  AddPostService ],
    bootstrap: [AppComponent]
} )
export class AppModule { }
