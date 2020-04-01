import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[appNotAllowCopyPaste]'
})
export class NotAllowCopyPasteDirective {

  constructor() { }

  @HostListener('paste', ['$event']) blockPaste(e: KeyboardEvent) {
    e.preventDefault();
  }

  @HostListener('copy', ['$event']) blockCopy(e: KeyboardEvent) {
    e.preventDefault();
  }

  @HostListener('cut', ['$event']) blockCut(e: KeyboardEvent) {
    e.preventDefault();
  }
  @HostListener('keydown', ['$event']) onKeydownHandler(e: KeyboardEvent) {
    if(e.keyCode == 69 || e.keyCode == 187 || e.keyCode == 189 || e.keyCode == 190 || e.keyCode == 109 || e.keyCode == 110 || e.keyCode == 107) {
      e.preventDefault();
    }
  }

}
