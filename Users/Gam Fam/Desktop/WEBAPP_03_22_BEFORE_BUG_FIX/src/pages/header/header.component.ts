import { Component, OnInit, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';

/*---------------------------- Provider -----------------------------------*/
import { LocalStorageService } from '../../providers/local-storage-service/local-storage.service';
import { Broadcaster } from "../../providers/broadcast-service/broadcast.service";
import { CommonService } from '../../providers/common-service/common.service';
import { SidebarService } from '../../providers/sidebar.service';
import { UserService } from '../../providers/user-service/user.service';

/*------------------Pages---------------------*/
import { ChangePasswordComponent } from '../../pages/change-password/change-password.component';
import { EditQuotationComponent } from '../../pages/edit-quotation/edit-quotation.component';

declare var jQuery: any;
@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
    encapsulation: ViewEncapsulation.None
})

export class HeaderComponent implements OnInit {
    customerData = {
        "customerName": "",
        "projectName": "",
        "salesRep": null,
        "quoteType": null
    };

    userProfileData = {
        "name": "",
        "profileImageUrl": ""
    };

    isWelcomeHeader: boolean = false;
    isdisableEditOnViewQuote: boolean = false;

    constructor(public locstr: LocalStorageService, private userService: UserService, private router: Router, private broadcaster: Broadcaster,
        private cdr: ChangeDetectorRef, private commonService: CommonService, public sidebar: SidebarService) {

    }

    ngOnInit() {
        this.broadcaster.on<any>('ON_VIEW_QUOTE_DISABLE_EDIT_ICON')
            .subscribe(message => {
                this.isdisableEditOnViewQuote = true;
            });

        this.broadcaster.on<any>('ON_VIEW_QUOTE_ENABLE_EDIT_ICON')
            .subscribe(message => {
                this.isdisableEditOnViewQuote = false;
            });

        /* when logout initial there is no value in local storage so when login and 
         * set user at that time fired a event and captured to show initial value on profile
         */
        this.broadcaster.on<any>('USER_CREATED')
            .subscribe(message => {
                this.userProfileData = message;
            });

        // Register route change event to handle header condition
        this.routeChangeDetector();
        // this.userProfileData= this.userService.getUser();

        // Update customer and project in header
        this.broadcaster.on<any>('UPDATE_HEADER')
            .subscribe(message => {
                if (message && message.customerName) {
                    this.customerData.customerName = message.customerName;
                } else {
                    this.customerData.customerName = '';
                }

                if (message && message.projectName) {
                    this.customerData.projectName = message.projectName;
                } else {
                    this.customerData.projectName = '';
                }

                if (message && message.salesRep) {
                    this.customerData.salesRep = message.salesRep;
                } else {
                    this.customerData.salesRep = '';
                }

                if (message && message.quoteType) {
                    this.customerData.quoteType = message.quoteType;
                } else {
                    this.customerData.quoteType = '';
                }
            });

        // Update customer and project in header
        this.broadcaster.on<any>('ON_EDIT_DRAFT')
            .subscribe(message => {
                if (message && message.customerName) {
                    this.customerData.customerName = message.customerName;
                } else {
                    this.customerData.customerName = '';
                }

                if (message && message.projectName) {
                    this.customerData.projectName = message.projectName;
                } else {
                    this.customerData.projectName = '';
                }

                if (message && message.salesRep) {
                    this.customerData.salesRep = message.salesRep;
                } else {
                    this.customerData.salesRep = '';
                }

                if (message && message.quoteType) {
                    this.customerData.quoteType = message.quoteType;
                } else {
                    this.customerData.quoteType = '';
                }

            });



        // Update customer and project in header
        this.broadcaster.on<any>('ON_EDIT_QUOTE')
            .subscribe(message => {
                if (message && message.customerName) {
                    this.customerData.customerName = message.customerName;
                } else {
                    this.customerData.customerName = '';
                }

                if (message && message.projectName) {
                    this.customerData.projectName = message.projectName;
                } else {
                    this.customerData.projectName = '';
                }

                if (message && message.salesRep) {
                    this.customerData.salesRep = message.salesRep;
                } else {
                    this.customerData.salesRep = '';
                }

                if (message && message.quoteType) {
                    this.customerData.quoteType = message.quoteType;
                } else {
                    this.customerData.quoteType = '';
                }
            });

        // Browser refresh keep entered customer and project in header
        if (!this.customerData || (this.customerData.customerName === '')) {
            if (this.commonService.getCreateQuoteVo() && this.commonService.getCreateQuoteVo().projectDetails) {
                this.customerData = this.commonService.getCreateQuoteVo().projectDetails;
            }
        }

        // Update user profile in header
        this.broadcaster.on<any>('PROFILE_UPDATED')
            .subscribe(message => {
                this.userProfileData = message;
            });

        // Browser refresh get profile values
        if (!this.userProfileData || (this.userProfileData.name === '') || (this.userProfileData.profileImageUrl == '')) {
            this.userProfileData = this.userService.getUser();
        }

    }

    ngAfterContentChecked() {
        this.cdr.detectChanges();
    }

    /**
     * This function will call on route change and header is managed through it
     * */
    routeChangeDetector() {
        this.router.events
            .filter(event => event instanceof NavigationStart)
            .subscribe((event: NavigationStart) => {
                if ((event['url'] === '/createQuote') || (event['url'] === '/saveQuote') || (event['url'] === '/draftQuote') || (event['url'] === '/myProfile') || (event['url'] === '/manageOrganizationUsers') || (event['url'] === '/home') || (event['url'] === '/viewQuotes')) {
                    this.isWelcomeHeader = true;
                } else {
                    this.isWelcomeHeader = false;
                }
            });
    }

    //To hide/show mobile menu  
    toggleMenu() {
        jQuery("#wrapper").toggleClass("active");
        jQuery("body").toggleClass("overflowHide");
    }

    /**
     * Logout : clear local storage + kill session
     * */
    logout() {
        let titleText: string = "Logout";
        let messageText: string = "Are you sure you want to logout ?";
        let cancelText: string = "Cancel";
        let okText: string = "Ok";

        this.commonService.showConfirm(titleText, messageText, cancelText, okText, () => {
            this.locstr.clearAllLocalStorage();
            // to clear data stored in provider
            this.commonService.clearCreateQuoteVo();

            /* Following local storage used to maintain previuos data for view quote page 
                It will clear data once user logout
            */
            this.locstr.setObj('viweQuote', false);
            this.locstr.setObj('viweQuoteFilterData', {});

            this.router.navigate(['/']);
        })
    }

    /**
     * This function will Edit Configurator Info
     * */
    onEditQuotation() {
        this.commonService.formModal(EditQuotationComponent);
    }

    /**
 	 * Change password popup
 	 * */
    changePassword() {
        this.commonService.formModal(ChangePasswordComponent);
    }
}
