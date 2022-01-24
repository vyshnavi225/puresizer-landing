import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../service/authentication.service';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit {

  constructor(private router: Router, private authenticateService: AuthenticationService) { }

  ngOnInit(): void {
  }
  openPureFlashArray(){
    this.authenticateService.getUserInfo().subscribe(data => {
      // localStorage.setItem('userInfo', JSON.stringify(data));
      // const userInfo = localStorage.getItem('userInfo');
      // this.authenticateService.userInfo$.next(userInfo);
      // this.router.navigate(['/scenario']);
    });
  }
}
