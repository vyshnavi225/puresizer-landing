import { Component, OnInit, HostListener } from '@angular/core';
import { AuthenticationService } from '../service/authentication.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  loginHeight = window.innerHeight;
  errorMessage: string;
  isProd = false;

  constructor(
    private authenticationService: AuthenticationService,
  ) { }


  @HostListener('window:resize')
  onResizeLoginHeight() {
    this.loginHeight = window.innerHeight;
  }

  ngOnInit() {
    if (environment.production) {
      this.isProd = true;
    }
  }

  public oktaLogin() {
    this.authenticationService.oktaLogin().subscribe( (res: {redirect_url: string}) => {
      // redirecting user to okta login page
      window.location.href = res.redirect_url;
    } );
  } 
}
