import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { AuthenticationService } from '../service/authentication.service';
import { AutoDestroyable } from '../service/common-behaviors';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LandingComponent extends AutoDestroyable implements OnInit {
  errMsg: any;
  constructor(private router: Router,
    private cdr: ChangeDetectorRef,
    private authenticationService: AuthenticationService) { 
      super();
    }

  ngOnInit(): void {
    this.authenticationService.getLandingInfo().subscribe( response => {
      console.log(response);
    })
  }
}

// this.authenticationService.getLandingInfo().pipe(
//   this.untilDestroy(),
//   finalize(() => {
//     // resetting the loader.
//     // this.isLoading = false;
//     this.cdr.detectChanges();
//   }),
// ).subscribe((response) => {
//   console.log(response);
// }, error => {
//   this.errMsg = error.error.error_msg;
// });
// }