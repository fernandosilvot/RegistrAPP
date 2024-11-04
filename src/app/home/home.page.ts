import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, LoadingController } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { BrowserMultiFormatReader } from '@zxing/library';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonButton, CommonModule],
})
export class HomePage implements OnInit {
  username: string = '';
  fullName: string = '';
  classes: string[] = [];
  scannedCode: string | null = null;
  codeReader: BrowserMultiFormatReader | null = null;

  constructor(
    private router: Router,
    private authService: AuthService,
    private loadingController: LoadingController
  ) {}

  ngOnInit() {
    const userDetails = this.authService.getUserDetails(); // Obtener detalles del usuario
    if (!userDetails.username) {
      this.router.navigate(['/login']);
      return;
    }

    this.username = userDetails.username;
    this.fullName = userDetails.fullName || ''; // Recuperar el nombre completo
    this.classes = userDetails.classes || []; // Recuperar las clases
  }

  async openQrScanner() {
    const loading = await this.loadingController.create({
      message: 'Escaneando QR...',
    });
    await loading.present();

    this.codeReader = new BrowserMultiFormatReader();
    this.codeReader.decodeFromVideoDevice(null, 'video', async (result, err) => {
      if (result) {
        await loading.dismiss();
        this.scannedCode = result.getText();
      }
      if (err) {
        await loading.dismiss();
        console.error('Error:', err);
      }
    }).catch(async (err) => {
      await loading.dismiss();
      console.error(err);
    });
  }

  stopQrScanner() {
    if (this.codeReader) {
      this.codeReader.reset();
      this.scannedCode = null;
      this.codeReader = null;
    }
  }

  logout() {
    this.authService.logout(); // Llamada a logout en AuthService para limpiar Local Storage
    this.router.navigate(['/login']);
  }  
}
