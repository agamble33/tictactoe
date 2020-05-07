import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Component, OnInit, OnDestroy, ViewEncapsulation, ViewChild, Renderer2 } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbAlert } from '@ng-bootstrap/ng-bootstrap'

/*------------------ Models ---------------------*/
import { UserDTO } from '../../../models/user-dto';
import { HttpResponseDTO } from '../../../models/http-response-dto';

/*-------------------- Providers ----------------------------*/
import { CommonService } from '../../../providers/common-service/common.service';
import { Constants } from '../../../providers/app-settings-service/app-constant.service';
import { AuthServices } from '../../../providers/auth-service/auth.service';
import { LocalStorageService } from '../../../providers/local-storage-service/local-storage.service';
import { UserService } from '../../../providers/user-service/user.service';
import { SidebarService } from '../../../providers/sidebar.service';
import { Broadcaster } from "../../../providers/broadcast-service/broadcast.service";
import { AddPostService } from "../../../providers/add-post.service";
declare var jQuery: any;
@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['../auth.scss'],
    encapsulation: ViewEncapsulation.None
})

export class LoginComponent implements OnInit, OnDestroy {
    @ViewChild('loginForm') loginForm;
    public loginData: UserDTO;
    public passwordCheck: boolean;
    public inputType: string;
    public isError: boolean;
    public errMsg: string = '';
    public isAuthModule: boolean;
    successMsg: any;
    formSubmitted: boolean;
    topValue;
    contentHeight;
    fetchedMessage: string = "";
    formattedMessage: string = '';
    closed = false;

    constructor(private commonService: CommonService, public constants: Constants,
        private locstr: LocalStorageService,
        private authService: AuthServices, private broadcaster: Broadcaster,
        private router: Router, private userService: UserService, public sidebar: SidebarService,
        private renderer: Renderer2, private addPostService: AddPostService, ) {





        if (!this.locstr.getObj('windowInnerHeight')) {
            let windowInnerHeight = window.innerHeight;
            var windowHeight = this.locstr.setObj('windowInnerHeight', windowInnerHeight);
        }
    }

    /**
     * This function will be called when view loaded
     * */
    ngOnInit() {
        this.addPostService.getPost().subscribe(res => {
            if (res.success) {
                this.fetchedMessage = res.message.message
                this.formattedMessage = this.fetchedMessage.replace(/&nbsp;/g, '').replace(/<p>/g, '').replace(/<\/p>/g, '').trim()
            }
            console.log("res....", res)
        })

        //Calculate viewport height
        let windowInnerHeight = window.innerHeight;
        var windowHeight = this.locstr.setObj('windowInnerHeight', windowInnerHeight);
        jQuery('html').addClass('gradient');
        //Add conditional class only for login page
        this.renderer.addClass(document.body, 'bodyBg');

        this.sidebar.hide();
        // Initialization code will be here
        this.loginData = {
            loginIdentifyer: '',
            password: '',
        };
        this.inputType = 'password';
        this.isError = false;
        this.userService.setIsUserLoggedIn(false);
        this.isAuthModule = true;
        this.formSubmitted = false;


        /* if(this.locstr.getObj( 'accessToken')){
             this.userService.setIsUserLoggedIn( true );
             this.router.navigate(['/createQuote']);
         } */
    }

    //Remove conditional class only for login page
    ngOnDestroy() {
        jQuery('html').removeClass('gradient');
        this.renderer.removeClass(document.body, 'bodyBg');
    }

    /**
     * This function will login to user
     * param1: login form
     * */
    login = (form: NgForm) => {
        this.formSubmitted = true;
        if (form.valid) {
            this.commonService.showLoading(this.constants.PLEASE_WAIT_TEXT);
            this.loginData.deviceId = "123";
            this.loginData.deviceName = "sam";
            this.loginData.deviceType = "WEB";
            this.loginData.appVersion = "1.0";
            this.formSubmitted = false;


            this.authService.login(this.loginData).subscribe(
                res => {
                    this.commonService.hideLoading();
                    this.resetFields();
                    this.locstr.setObj('accessToken', res.token);
                    this.userService.setIsUserLoggedIn(true);
                    this.userService.setUser(res.data);
                    if (res.data && !res.data.profileImageUrl) {
                        res.data.profileImageUrl = "https://configuratortestenv.s3.amazonaws.com/1520335883profile-photo.png";
                    }
                    //event for profile values on header and sidebar. After logout get user values because there is no values in local storage.
                    this.broadcaster.broadcast('USER_CREATED', res.data);
                    this.router.navigate(['/home']);
                    // this.router.navigate(['/createQuote']);
                },
                error => {
                    //console.log("error,",error);
                    this.commonService.hideLoading();
                    // Error message for back-end If data not matched
                    this.errMsg = (error && error.message) ? error.message : '';
                }
            );
        } else {
            // If password and email fields are empty
            if ((this.loginData.password == null || this.loginData.password == "") && (this.loginData.email == null || this.loginData.email == "")) {
                this.isError = true;
            }

            // If only email field is empty
            if (this.loginData.email == null || this.loginData.email == "") {
                this.isError = true;
            }

            // If only password field is empty
            if (this.loginData.password == null || this.loginData.password == "") {
                this.isError = true;
            }
        }
    }

    /**
     * Function to reset login screen fields
     * */
    private resetFields() {
        this.loginData.loginIdentifyer = "";
        this.loginData.password = "";
    }

    sigupClicked() {
        window.location.href = 'https://info.aquaphoenixsci.com/h2-panel-builder'
    }



    /**
     * Function for hide/show password
     * */
    protected hideShowPassword = () => {
        this.commonService.hideShowPassword(this.inputType, this.passwordCheck, (showPassword, inputType) => {
            this.inputType = inputType;
            this.passwordCheck = showPassword;
        });
    }

}
