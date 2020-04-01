import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

/*------------------ Models ---------------------*/
import { UserDTO } from '../../models/user-dto';

/*-------------------- Providers ----------------------------*/
import { CommonService } from '../../providers/common-service/common.service';
import { Constants } from '../../providers/app-settings-service/app-constant.service';
import { AuthServices } from '../../providers/auth-service/auth.service';
import { LocalStorageService } from '../../providers/local-storage-service/local-storage.service';

@Component( {
    selector: 'app-change-password',
    templateUrl: './change-password.component.html',
    styleUrls: ['./change-password.component.scss'],
    encapsulation: ViewEncapsulation.None
} )

export class ChangePasswordComponent implements OnInit {
    protected changePasswordData: UserDTO;
    public passwordCheck: boolean;
    public isEmpty: boolean;
    public oldInputType: string;
    public newInputType: string;
    public inputType: string;
    public save: string;
    public close: string;
    public titleText: string;
    public saveFlag: boolean = true;
    public webServiceError: string;

    constructor( private locstr: LocalStorageService, private commonService: CommonService, public activeModal: NgbActiveModal, public constants: Constants, private authService: AuthServices ) {

    }

    ngOnInit() {
        /* Following local storage used to maintain previuos data for view quote page 
           It will clear data once user redirect to this page
        */
        this.locstr.setObj('viweQuote', false);
        this.locstr.setObj('viweQuoteFilterData', {});

        this.oldInputType = 'password';
        this.newInputType = 'password';
        this.save = 'Save';
        this.close = 'Cancel';
        this.titleText = 'Change Password';
        this.isEmpty = false;

        this.changePasswordData = {
            newPassword: '',
            oldPassword: '',
        };
    }

    /**
     * Function for hide/show password
     * */
    protected hideShowPassword = ( field ) => {
        if ( field == 'old' ) {
            this.inputType = this.oldInputType;
        } else if ( field == 'new' ) {
            this.inputType = this.newInputType;
        }

        this.commonService.hideShowPassword( this.inputType, this.passwordCheck, ( showPassword, inputType ) => {
            if ( field == 'old' ) {
                this.oldInputType = inputType;
            } else if ( field == 'new' ) {
                this.newInputType = inputType;
            }
        } );
    }

    /**
     * Function for cancel change password modal
     * */
    cancel() {
        this.activeModal.dismiss( 'Cross click' );
    }

    /**
     * Function for save password
     * */
    savePassword() {
        if ( this.changePasswordData.newPassword == '' || this.changePasswordData.newPassword == undefined || this.changePasswordData.oldPassword == '' || this.changePasswordData.oldPassword == undefined ) {
            this.isEmpty = true;
        } else {
            this.commonService.showLoading( this.constants.PLEASE_WAIT_TEXT );
            this.authService.changePassword( this.changePasswordData ).subscribe(
                res => {
                    this.commonService.hideLoading();
                    this.isEmpty = false;
                    this.close = 'Ok';
                    this.titleText = 'Success';
                    this.saveFlag = false;
                },
                error => {
                    this.commonService.hideLoading();      
                    if(error && error != undefined && error.statusCode==401) {
                        this.commonService.hideLoading();
                        this.commonService.showAlert( "Error", error.error, "OK", () => {
                            this.commonService.logout();
                        } );
                    } else {
                     // Error message for back-end If data not matched                  
                        if ( error && error != undefined ) {
                            this.webServiceError = error.message;
                        } else {
                            this.activeModal.close( 'Close click' );
                        }
                    }
                }
            );
        }
    }
}
