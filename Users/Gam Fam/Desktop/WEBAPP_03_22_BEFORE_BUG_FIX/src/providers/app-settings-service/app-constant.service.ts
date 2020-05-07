import { Injectable } from '@angular/core';

/**
 * Constants class : contains constants and strings
*/
@Injectable()
export class Constants {

    common_height: number;
    common_width: number;

    PLEASE_WAIT_TEXT: string;
    ERROR_MSG_UNABLE_TO_CONNECT: string;
    ERROR_NETWORK_UNAVAILABLE: string;
    ERROR_MSG_UNAUTHORIZED: string;
    ERROR_MSG_INVALID_LOGIN_DATA: string;
    ERROR_MSG_INVALID_FORGOT_PASSWORD_DATA: string;
    ERROR_MSG_PASSWORD_NOT_MATCH: string;
    NAVIGATE_AWAY_CONFIRM_MSG: string;
    UNABLE_TO_CONNECT_SERVER_MSG: string;
    SUCCESS_MSG_RESET_QUOTATION: string;
    WEBSERVICE_FAILED_MSG: string;
    COMMING_SOON_MSG: string;

    SUCCESS_MSG_RESET_PASSWORD: string;
    SUCCESS_TITLE_MSG: string;
    IMG_UPLOAD_UNABLE_ERROR_MSG: string;

    FILE_UPLOAD_TYPE_ERROR_MSG: string;
    FILE_UPLOAD_SIZE_ERROR_MSG: string;
    FILE_UPLOAD_UNABLE_ERROR_MSG: string;

    //Button Text
    SEARCH_BTN_TEXT: string;
    DELETE_BTN_TEXT: string;
    SAVE_DRAFT_BTN_TEXT: string;
    NEXT_BTN_TEXT: string;
    SAVE_BTN_TEXT: string;
    CANCEL_BTN_TEXT: string;
    RETRY_BTN_TEXT: string;
    SAVE_FINAL_BTN_TEXT: string;
    SIGN_IN_BTN_TEXT: string;
    SIGN_UP_BTN_TEXT: string;
    SIGN_UP_LINK: string;
    //ENTER_BTN_TEXT: string;
    SEND_BTN_TEXT: string;
    BACK_LOGIN_BTN: string;

    //No data 
    NO_DATA_FOUND: string;
    NO_MANUFACT_LIST: string;
    NO_SERIES_LIST: string;
    FAILED_LOAD: string;
    NO_CONTROLL_SENSOR: string;

    //Page Title
    CONTROLLER_SENSOR_TITLE: string;
    PANEL_OPTIONS_TITLE: string;
    MY_PROFILE_TITLE: string;
    WELCOME_CONFIGURATOR_TITLE: string;
    CONTRL_MANUFACT_TITLE: string;
    ACCESS_TITLE: string;
    CREATE_QUOTE_TITLE: string;
    ACCESSORIES_TITLE: string;
    WELCOME_TEXT: string;
    LOGIN_TITLE: string;
    FORGOT_PASS_TITLE: string;
    CONFIGURED_QUOTE_TITLE: string;

    //Form Label
    NAME_LABEL: string;
    EMAIL_LABEL: string;
    PHONE_NO_LABEL: string;
    ORGNIZATION_NAME: string;
    CUSTOMER_NAME: string;
    PROJECT_NAME: string;
    PASSWORD_LABEL: string;
    FORGOT_PASSWORD: string;

    //Placeholder Text
    PLEASE_ENTER_PHONE: string;
    OLD_PASSWORD: string;
    NEW_PASSWORD: string;
    CONFIRM_PASSWORD: string;
    RESET_PASSWORD: string;

    //Validation Text
    ENTER_NAME: string;
    ENTER_PHONE: string;
    ENTER_CUSTOMER: string;
    ENTER_PROJECT: string;
    SELECT_QUOTE: string;
    OLD_PASSWORD_ERROR: string;
    OLD_PASSWORD_LIMIT: string;
    NEW_PASSWORD_ERROR: string;
    NEW_PASSWORD_LIMIT: string;
    PASSWORD_SUCCESS_TEXT: string;
    ENTER_EMAIL: string;
    INVALID_EMAIL: string;
    ENTER_PASSWORD: string;
    PASSWORD_LIMIT: string;
    SUCCESS_EMAIL_ADDRESS: string;
    ENTER_EMAIL_ADDRESS: string;

    //On Sidebar
    CREATE_NEW_QUOTE_TEXT: string;
    My_SAVED_QUOTE_TEXT: string;
    My_DRAFT_QUOTE_TEXT: string;
    MY_PROFILE_TEXT: string;
    CHANGE_PASSWORD_TEXT: string;
    LOGOUT_TEXT: string;
    BADGE_TEXT_0: string;
    WEB_APP_VERSION: string;
    //WEB_APP_CATALOG: string;
    SELECT_SALES_REP: string;
    PRODUCTION_RELEASE_DATE: any;

    constructor() {
        this.common_height = 900;
        this.common_width = 1600;

        this.ERROR_NETWORK_UNAVAILABLE = 'Please check your internet connection and try again.';
        this.PLEASE_WAIT_TEXT = 'Please wait.';
        this.ERROR_MSG_UNABLE_TO_CONNECT = 'Unable to connect with server. Please try again.';
        this.ERROR_MSG_UNAUTHORIZED = 'Unauthorized.';
        this.ERROR_MSG_INVALID_LOGIN_DATA = 'Invalid login credentials, Please try again';
        this.ERROR_MSG_INVALID_FORGOT_PASSWORD_DATA = 'Please enter valid email address';
        this.ERROR_MSG_INVALID_LOGIN_DATA = 'Invalid Email Or Password. Please try again';
        this.ERROR_MSG_PASSWORD_NOT_MATCH = "'New Password' and 'Confirm Password' should be same";
        this.SUCCESS_MSG_RESET_PASSWORD = 'Password reset successfully.';
        this.SUCCESS_TITLE_MSG = 'Success';
        this.NAVIGATE_AWAY_CONFIRM_MSG = 'Changes you made may not be saved.';
        this.UNABLE_TO_CONNECT_SERVER_MSG = "Unable to connect to server, please try again.";
        this.SUCCESS_MSG_RESET_QUOTATION = 'You are successfully changed your Customer & Project Name.';
        this.WEBSERVICE_FAILED_MSG = 'Web Service call failed.';
        this.COMMING_SOON_MSG = "Coming soon...";

        //Button Text
        this.SEARCH_BTN_TEXT = "Search";
        this.DELETE_BTN_TEXT = "Delete";
        this.SAVE_DRAFT_BTN_TEXT = "Save as Draft";
        this.NEXT_BTN_TEXT = "Next";
        this.SAVE_BTN_TEXT = "Save";
        this.CANCEL_BTN_TEXT = "Cancel";
        this.RETRY_BTN_TEXT = "Retry";
        this.SAVE_FINAL_BTN_TEXT = "Save as Final";
        this.SIGN_IN_BTN_TEXT = "Log in";
        this.SIGN_UP_BTN_TEXT = "Sign up for FREE";
        this.SIGN_UP_LINK = "https://info.aquaphoenixsci.com/h2-panel-builder"
        //this.ENTER_BTN_TEXT = "Enter";
        this.SEND_BTN_TEXT = "Send";
        this.BACK_LOGIN_BTN = "Back To Login";

        //No data 
        this.NO_DATA_FOUND = "No data found";
        this.NO_MANUFACT_LIST = "No manufacturer list available.";
        this.NO_SERIES_LIST = "No series available for selected controller manufacturer.";
        this.FAILED_LOAD = "Failed to load data";
        this.NO_CONTROLL_SENSOR = "There are no panel options available for the selected controller manufacturer series.";

        //Page Title
        this.CONTROLLER_SENSOR_TITLE = "Controller Sensor  & I/O";
        this.PANEL_OPTIONS_TITLE = "Panel Options";
        this.MY_PROFILE_TITLE = "My Profile";
        this.WELCOME_CONFIGURATOR_TITLE = "Welcome to Configurator";
        this.CONTRL_MANUFACT_TITLE = "Build a Panel Quote";
        this.ACCESS_TITLE = "Build an Accessories or Quick Ship Panels Quote";
        this.CREATE_QUOTE_TITLE = "Configure your Model & Panel number and view the quote";
        this.ACCESSORIES_TITLE = "Accessories(optional)";
        this.WELCOME_TEXT = "Welcome";
        this.LOGIN_TITLE = "Login";
        this.FORGOT_PASS_TITLE = "Forgot Password";
        this.CONFIGURED_QUOTE_TITLE = "Configured Quote";

        //Form Label
        this.NAME_LABEL = "Name";
        this.EMAIL_LABEL = "Email";
        this.PHONE_NO_LABEL = "Phone No.";
        this.ORGNIZATION_NAME = "Organization Name";
        this.CUSTOMER_NAME = "Customer Name";
        this.PROJECT_NAME = "Project Name";
        this.PASSWORD_LABEL = "Password";
        this.FORGOT_PASSWORD = "Forgot Password?";

        //Placeholder Text
        this.PLEASE_ENTER_PHONE = "Please Enter Phone";
        this.OLD_PASSWORD = "Old Password";
        this.NEW_PASSWORD = "New Password";
        this.CONFIRM_PASSWORD = "Confirm Password";
        this.RESET_PASSWORD = "Reset Password";

        //Validation Text
        this.ENTER_NAME = "Please enter name.";
        this.ENTER_PHONE = "Please enter phone number.";
        this.ENTER_CUSTOMER = "Please enter customer name.";
        this.ENTER_PROJECT = "Please enter project name.";
        this.SELECT_QUOTE = "Please select pricing option.";
        this.SELECT_SALES_REP = "Please select sales representative.";
        this.OLD_PASSWORD_ERROR = "Please enter old password.";
        this.OLD_PASSWORD_LIMIT = "Please enter old password between 8 to 20 characters.";
        this.NEW_PASSWORD_ERROR = "Please enter new password.";
        this.NEW_PASSWORD_LIMIT = "Please enter new password between 8 to 20 characters.";
        this.PASSWORD_SUCCESS_TEXT = "Password Changed Successfully";
        this.ENTER_EMAIL = "Please enter email";
        this.INVALID_EMAIL = 'Invalid login credentials, Please try again';
        this.ENTER_PASSWORD = "Please enter password";
        this.PASSWORD_LIMIT = "Please enter password between 8 to 20 characters.";
        this.SUCCESS_EMAIL_ADDRESS = "Successfully sent a link to your email address. Please click on link to reset password";
        this.ENTER_EMAIL_ADDRESS = "Enter your email address, we'll send you a link so you can reset your password.";

        //Sidebar 
        this.CREATE_NEW_QUOTE_TEXT = "Create New Quote";
        this.My_SAVED_QUOTE_TEXT = "My Saved Quote";
        this.My_DRAFT_QUOTE_TEXT = "My Draft Quote";
        this.MY_PROFILE_TEXT = "My Profile";
        this.CHANGE_PASSWORD_TEXT = "Change Password";
        this.LOGOUT_TEXT = "Logout";
        this.BADGE_TEXT_0 = "0";
        this.WEB_APP_VERSION = "v1.1.5";
        //this.WEB_APP_CATALOG = "https://info.aquaphoenixsci.com/2020-industrial-catalog";
        this.PRODUCTION_RELEASE_DATE = new Date('26-08-2019');// mm/dd/yy
    }

    /* Change environment value as per build environment 
    
        options: production, uat, qa

        if 'environment' varible value not provided (or value other than 'production', 'uat') 
        it will get QA environment
    */
   public static get CURRENT_ENVIRONMENT(): string { return 'local'}
   //  public static get CURRENT_ENVIRONMENT(): string { return 'production' }
}
