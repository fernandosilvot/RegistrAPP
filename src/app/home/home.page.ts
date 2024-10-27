import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonCard } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { BrowserMultiFormatReader } from '@zxing/library';
import { AuthService } from '../services/auth.service'; 

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonButton, CommonModule, IonCard ], 
})
export class HomePage implements OnInit {
  username: string = '';
  fullName: string = '';
  classes: string[] = [];
  scannedCode: string | null = null;
  codeReader: BrowserMultiFormatReader | null = null; 

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit() {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.username = navigation.extras.state['username'];
      this.fullName = navigation.extras.state['fullName'];
      this.classes = navigation.extras.state['classes'];
    }
  }

  openQrScanner() {
    this.codeReader = new BrowserMultiFormatReader();
    this.codeReader.decodeFromVideoDevice(null, 'video', (result, err) => {
      if (result) {
        console.log('QR result:', result);
        this.scannedCode = result.getText();
      }
      if (err) {
        console.error('Error:', err);
      }
    }).catch(err => console.error(err));
  }

  stopQrScanner() {
    if (this.codeReader) {
      this.codeReader.reset(); 
      this.scannedCode = null; 
      this.codeReader = null; 
    }
  }

  logout() {
    this.authService.setUsername(''); 
    this.router.navigate(['/login']); 
  }
}
