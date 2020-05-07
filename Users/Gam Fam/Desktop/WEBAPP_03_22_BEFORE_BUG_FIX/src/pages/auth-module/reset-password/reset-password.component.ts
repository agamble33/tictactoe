import { Component, OnInit, OnDestroy, ViewEncapsulation, ViewChild, Renderer2 } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router, ActivatedRoute, Params } from '@angular/router';

/*-------------------- Providers ----------------------------*/
import { CommonService } from '../../../providers/common-service/common.service';
import { Constants } from '../../../providers/app-settings-service/app-constant.service';
import { AuthServices } from '../../../providers/auth-service/auth.service';
import { LocalStorageService } from '../../../providers/local-storage-service/local-storage.service';
declare var jQuery: any;
@Component({
    selector: 'app-reset-password',
    templateUrl: './reset-password.component.html',
    styleUrls: ['../auth.scss'],
    encapsulation: ViewEncapsulation.None
})

export class ResetPasswordComponent implements OnInit, OnDestroy {
    @ViewChild('resetPasswordForm') resetPasswordForm;
    public newPasswordCheck: boolean;
    public confirmPasswordCheck: boolean;
    private transactionId: string;
    public inputType: string;
    public confirmInputType: string;
    public isError: boolean;
    public errMsg: any;
    public formSubmitted: boolean;
    public params: any;
    public isResetPasswordLinkInvalid: boolean = false;
    topValue;
    contentHeight;

    public resetPasswordData = {
        newPassword: '',
        confirmPassword: ''
    };

    constructor(private commonService: CommonService, public constants: Constants, private locStr: LocalStorageService, private authService: AuthServices,
        private router: Router, private actRoute: ActivatedRoute, private renderer: Renderer2) {

        this.actRoute.queryParams
            .subscribe(params => {
                this.params = params;
                this.transactionId = params['tokan'] || 0;

                this.getResetPasswordLinkStatus(this.transactionId);
            });
    }

    /**
     * This function will check if password reset link expired
     * */
    getResetPasswordLinkStatus(transactionId) {
        let payload = {
            "token": transactionId
        }

        this.authService.getResetPasswordLinkStatus(payload).subscribe(
            res => {
                this.commonService.hideLoading();
                this.isResetPasswordLinkInvalid = false;
            },
            error => {
                this.commonService.hideLoading();
                this.errMsg = error.message;
                this.isResetPasswordLinkInvalid = true;
            }
        );
    }

    ngOnInit() {
        //Add conditional class only for login page
        jQuery('html').removeClass('gradient');
        this.renderer.addClass(document.body, 'bodyBg');

        this.formSubmitted = false;
        this.newPasswordCheck = false;
        this.confirmPasswordCheck = false;
        this.inputType = 'password';
        this.confirmInputType = 'password';
    }

    /**
     * Remove conditional class only for login page
     * */
    ngOnDestroy() {
        jQuery('html').removeClass('gradient');
        this.renderer.removeClass(document.body, 'bodyBg');
    }

    /**
     * Function to reset the newly added password
     * @param form
     */
    resetPassword(form: NgForm) {
        this.formSubmitted = true;
        if (form.valid) {
            let newPassword = this.resetPasswordData.newPassword;
            let confirmPassword = this.resetPasswordData.confirmPassword;
            this.formSubmitted = false;
            if (newPassword == confirmPassword) {
                let payload = {
                    "password": form.value.confirmPassword,
                    "token": this.transactionId
                }
                this.commonService.showLoading('');
                this.authService.resetPassword(payload).subscribe(
                    res => {
                        this.commonService.hideLoading();
                        // this.locStr.setObj('tokan', res.payload);
                        this.commonService.showAlert(this.constants.SUCCESS_TITLE_MSG, this.constants.SUCCESS_MSG_RESET_PASSWORD, "Ok", () => {
                            form.resetForm();
                            this.router.navigate(['']);
                        });
                    },
                    error => {
                        this.commonService.hideLoading();
                        this.errMsg = error.message;
                    }
                );
            } else {
                this.errMsg = this.constants.ERROR_MSG_PASSWORD_NOT_MATCH;
            }
        } else {
            // If password and email fields are empty
            if ((this.resetPasswordData.newPassword == null || this.resetPasswordData.newPassword == "") && (this.resetPasswordData.confirmPassword == null || this.resetPasswordData.confirmPassword == "")) {
                this.isError = true;
            }

            // if only email field is empty
            if (this.resetPasswordData.newPassword == null || this.resetPasswordData.newPassword == "") {
                this.isError = true;
            }

            // if only password field is empty
            if (this.resetPasswordData.confirmPassword == null || this.resetPasswordData.confirmPassword == "") {
                this.isError = true;
            }
        }
    }

    /**
     * Function for hide/show password
     * */
    protected hideShowPassword = (inputType, passwordCheck, isNewPass) => {
        this.commonService.hideShowPassword(inputType, passwordCheck, (showPassword, passwordInputType) => {
            if (isNewPass) {
                this.inputType = passwordInputType;
                this.newPasswordCheck = showPassword;
            } else {
                this.confirmInputType = passwordInputType;
                this.confirmPasswordCheck = showPassword;
            }
        });
    }

}

