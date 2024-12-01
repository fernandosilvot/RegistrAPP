import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButton,
  LoadingController,
  AlertController,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner'; // Importa BarcodeScanner
import { AuthService } from '../services/auth.service';

interface Asignatura {
  asignatura: string;
  seccion: string;
  sala: string;
  fecha: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButton,
    CommonModule,
    IonIcon,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
  ],
})
export class HomePage implements OnInit {
  username: string = '';
  fullName: string = '';
  asignaturas: Asignatura[] = [];
  scannedCode: string | null = null;
  scanInProgress: boolean = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private loadingController: LoadingController,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    const userDetails = this.authService.getUserDetails();
    
    if (!userDetails || !userDetails.username) {
      this.router.navigate(['/login']);
      return;
    }
  
    this.username = userDetails.username;
    this.fullName = userDetails.fullName || '';
    this.asignaturas = userDetails.classes.map((clase: any) => ({
      asignatura: clase.asignatura || '',
      seccion: clase.seccion || '',
      sala: clase.sala || '',
      fecha: clase.fecha || '',
    }));
  }

  // Inicia el escaneo de QR
  async startScan() {
    if (this.scanInProgress) {
      return;
    }

    this.scanInProgress = true;

    // Verifica si el permiso de la cámara está disponible
    const permission = await BarcodeScanner.checkPermission({ force: true });
    if (!permission.granted) {
      alert('Permisos de cámara no concedidos. Actívalos manualmente.');
      this.scanInProgress = false;
      return;
    }

    // Ocultar el fondo mientras escaneamos
    await BarcodeScanner.hideBackground();

    // Inicia el escaneo
    const result = await BarcodeScanner.startScan();

    // Mostrar el fondo nuevamente
    await BarcodeScanner.showBackground();

    if (result?.hasContent) {
      this.scannedCode = result.content;
      this.showQrResultPopup(this.scannedCode); // Muestra el popup con el contenido del QR
    } else {
      alert('No se detectó ningún código QR');
    }

    this.scanInProgress = false;
  }

  // Detener el escaneo
  stopScan() {
    BarcodeScanner.stopScan();
    BarcodeScanner.showBackground();
    this.scanInProgress = false;
    this.scannedCode = null;
  }

  // Mostrar el popup con el resultado del QR
  async showQrResultPopup(result: string) {
    const alert = await this.alertController.create({
      header: 'Código QR Escaneado',
      message: `Contenido del QR: ${result}`,
      buttons: ['OK'],
    });

    await alert.present();
  }

  // Logout
  async logout() {
    const alert = await this.alertController.create({
      header: 'Cerrar sesión',
      message: '¿Estás seguro de que deseas cerrar sesión?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Cerrar sesión',
          handler: () => {
            this.authService.logout();
            this.router.navigate(['/login']);
          },
        },
      ],
    });
    await alert.present();
  }
}
