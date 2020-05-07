import { Component, OnInit, ViewEncapsulation } from "@angular/core";
import { Router, NavigationStart, RouterLinkActive } from "@angular/router";

/*---------------------------- Provider -----------------------------------*/
import { SidebarService } from "../../providers/sidebar.service";
import { LocalStorageService } from "../../providers/local-storage-service/local-storage.service";
import { CommonService } from "../../providers/common-service/common.service";
import { Broadcaster } from "../../providers/broadcast-service/broadcast.service";
import { UserService } from "../../providers/user-service/user.service";
import { Constants } from "../../providers/app-settings-service/app-constant.service";

/*------------------Pages---------------------*/
import { CreateQuoteComponent } from "../create-quote/create-quote.component";
import { SaveQuoteComponent } from "../save-quote/save-quote.component";
import { DraftQuoteComponent } from "../draft-quote/draft-quote.component";
import { ChangePasswordComponent } from "../../pages/change-password/change-password.component";

declare var jQuery: any;
@Component({
  selector: "app-sidebar",
  templateUrl: "./sidebar.component.html",
  styleUrls: ["./sidebar.component.scss"],
  encapsulation: ViewEncapsulation.None
})
export class SidebarComponent implements OnInit {
  isCreateQuote: boolean = false;
  userProfileData = {
    name: "",
    profileImageUrl: "",
    role_id: 1,
    organizationUrl: "",
    draftQuoteCount: 0,
    savedQuoteCount: 0
  };

  constructor(
    public sidebar: SidebarService,
    private router: Router,
    private userService: UserService,
    private broadcaster: Broadcaster,
    private commonService: CommonService,
    public locstr: LocalStorageService,
    private constants: Constants
  ) {}

  ngOnInit() {
    /* when logout initial there is no value in local storage so when login and
     * set user at that time fired a event and captured to show initial value on profile
     */
    this.broadcaster.on<any>("USER_CREATED").subscribe(message => {
      this.userProfileData = message;
    });

    // Register route change event to handle active current menu
    this.routeChangeDetector();

    // Update user profile in header
    this.broadcaster.on<any>("PROFILE_UPDATED").subscribe(message => {
      this.userProfileData = message;
      //console.log("FUNNYUserERROR5####----------", message);
    });

    // change draft quote count on save as draft success
    this.broadcaster
      .on<any>("ON_SAVE_DRAFT_QUOTE_SUCCESS")
      .subscribe(message => {
        //console.log("count message", message);
        this.userProfileData.draftQuoteCount = message;
        //console.log("FUNNYUserERROR2####----------", message);
      });

    // change draft quote count on delete saved quote success
    this.broadcaster.on<any>("DRAFT_QUOTE_COUNT").subscribe(message => {
      this.userProfileData.draftQuoteCount = message;
      //console.log(
       // "FUNNY###########----------",
        //this.userProfileData.draftQuoteCount
     // );
    });

    // change saved quote count on save as final success
    this.broadcaster.on<any>("ON_SAVED_QUOTE_SUCCESS").subscribe(message => {
      //console.log("count message", message);
      this.userProfileData.savedQuoteCount = message;
     // console.log("WHERRE111112232223333########----------", message);
    });

    // change saved quote count on delete saved quote success
    this.broadcaster.on<any>("SAVE_QUOTE_COUNT").subscribe(message => {
      this.userProfileData.savedQuoteCount = message;
      //console.log("WHERRE3########----------", message);
    });

    // Browser refresh get profile values
    if (
      !this.userProfileData ||
      this.userProfileData.name === "" ||
      this.userProfileData.profileImageUrl === ""
    ) {
      this.userProfileData = this.userService.getUser();
    }

    if (this.locstr.get("draftQuoteCount")) {
      //console.log("draftQuoteCount");
      this.userProfileData.draftQuoteCount = this.locstr.get("draftQuoteCount");
     // console.log(
       // "WHERRE########----------",
       // this.userProfileData.draftQuoteCount
      //);
    }

    if (this.locstr.get("savedQuoteCount")) {
      this.userProfileData.savedQuoteCount = this.locstr.get("savedQuoteCount");
      //console.log(
       // "WHERRE1########----------",
       // this.userProfileData.savedQuoteCount
      //);
    }
  }

  /**
   * This function will call on route change and header is managed through it
   * */
  routeChangeDetector() {
    // this.router.events.subscribe( event => {
    //     if ( event.constructor.name === "NavigationStart" ) {
    //         if ( ( event['url'] === '/createQuote' ) || ( event['url'] === '/dashboard' ) || ( event['url'] === '/controllerSeries' ) ||
    //             ( event['url'] === '/controllerSensorSelection' ) || ( event['url'] === '/panelOptions' ) ||
    //             ( event['url'] === '/accessories' ) || ( event['url'] === '/configuredQuote' ) ) {
    //             this.isCreateQuote = true;
    //         } else {
    //             this.isCreateQuote = false;
    //         }
    //     }
    // } );

    this.router.events
      .filter(event => event instanceof NavigationStart)
      .subscribe((event: NavigationStart) => {
        if (
          event["url"] === "/createQuote" ||
          event["url"] === "/dashboard" ||
          event["url"] === "/controllerSeries" ||
          event["url"] === "/controllerSensorSelection" ||
          event["url"] === "/panelOptions" ||
          event["url"] === "/accessories" ||
          event["url"] === "/configuredQuote"
        ) {
          this.isCreateQuote = true;
        } else {
          this.isCreateQuote = false;
        }
      });
  }

  // To hide mobile menu
  hideMenu(page?) {
    if (!page) {
      /* Following local storage used to maintain previuos data for view quote page 
                It will clear data once user redirect to another page except view quote page
            */
      this.locstr.setObj("viweQuote", false);
      this.locstr.setObj("viweQuoteFilterData", {});
    }

    if (jQuery("#wrapper").hasClass("active")) {
      jQuery("#wrapper").removeClass("active");
    }

    if (jQuery("body").hasClass("overflowHide")) {
      jQuery("body").toggleClass("overflowHide");
    }
  }

  /**
   * Change password popup
   * */
  changePassword() {
    this.commonService.formModal(ChangePasswordComponent);
  }

  /**
   * Logout : clear local storage + kill session
   * */
  logout() {
    let titleText: string = "Logout";
    let messageText: string = "Are you sure you want to logout ?";
    let cancelText: string = "Cancel";
    let okText: string = "Ok";

    this.commonService.showConfirm(
      titleText,
      messageText,
      cancelText,
      okText,
      () => {
        this.locstr.clearAllLocalStorage();
        // to clear data stored in provider
        this.commonService.clearCreateQuoteVo();
        this.router.navigate(["/"]);
      }
    );
  }

  commingSoon = () => {
    this.commonService.showAlert(
      "Info",
      this.constants.COMMING_SOON_MSG,
      "OK",
      () => {
        // Ok click code will be here
      }
    );
  };
}
