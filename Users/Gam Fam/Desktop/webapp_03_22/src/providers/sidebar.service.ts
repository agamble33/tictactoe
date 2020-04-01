import { Injectable } from '@angular/core';

@Injectable()
export class SidebarService {
  visible: boolean;
  customHeader: boolean;

  constructor() { this.visible = false; this.customHeader = false; }
  
  /**
   * Function to hide side menu & header on login
  */
  hide() { this.visible = false; this.customHeader = false; }

  /**
   * Function to show side menu & header other components
  */
  show() { this.visible = true; this.customHeader = true; }

  /**
   * Function to toggle hide & show of side menu & header
  */
  toggle() { this.visible = !this.visible; this.customHeader = !this.customHeader; }
  
}