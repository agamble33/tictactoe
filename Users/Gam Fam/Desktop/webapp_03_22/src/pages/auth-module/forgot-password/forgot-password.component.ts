import { Component, OnInit, OnDestroy, ViewEncapsulation, ViewChild, Renderer2 } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';

/*------------------ Models ---------------------*/
import { UserDTO } from '../../../models/user-dto';

/*-------------------- Providers ----------------------------*/
import { CommonService } from '../../../providers/common-service/common.service';
import { Constants } from '../../../providers/app-settings-service/app-constant.service';
import { AuthServices } from '../../../providers/auth-service/auth.service';
declare var jQuery: any;
@Component({
    selector: 'app-forgot-password',
    templateUrl: './forgot-password.component.html',
    styleUrls: ['../auth.scss'],
    encapsulation: ViewEncapsulation.None
})

export class ForgotPasswordComponent implements OnInit, OnDestroy {
    @ViewChild('forgotPasswordForm') forgotPasswordForm;
    public error: any;
    protected forgotData: UserDTO;
    protected formSubmitted: boolean;
    public isInvalid: boolean;
    public errMsg: string = '';
    public isResetPassword: boolean;
    topValue;
    contentHeight;

    constructor(private commonService: CommonService, public constants: Constants, private authService: AuthServices, private router: Router,
        private renderer: Renderer2) {

    }

    ngOnInit() {
        //Add conditional class only for login page
        jQuery('html').addClass('gradient');
        this.renderer.addClass(document.body, 'bodyBg');

        this.forgotData = {
            email: '',
            transactionId: ''
        };
        this.formSubmitted = false;
        this.isInvalid = false;
        this.isResetPassword = false;

    }

    /**
     * Remove conditional class only for login page
     * */
    ngOnDestroy() {
        jQuery('html').removeClass('gradient');
        this.renderer.removeClass(document.body, 'bodyBg');
    }

    /**
     * Function to redirect to reset password screen
     * @param: form
     */
    forgotPassword = (form: NgForm) => {
        this.formSubmitted = true;
        if (form.valid) {
            this.commonService.showLoading('');
            this.formSubmitted = false;
            let email = form.value.forgotName;
            this.authService.forgotPassword({ email: this.forgotData.loginIdentifyer }).subscribe(
                res => {
                    this.commonService.hideLoading();
                    this.isResetPassword = true;
                },
                error => {
                    this.commonService.hideLoading();
                    this.errMsg = (error && error.message) ? error.message : '';
                }
            );
        } else {
            // If email field is empty showing red border
            if (this.forgotData.email == null || this.forgotData.email == "") {
                this.isInvalid = true;
            }
        }
    }

    /**
     * back to login after sent reset password link
     * */
    backToLogin() {
        this.router.navigate(['']);
    }
}
