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
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
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
  clasesAceptadas: Asignatura[] = [];
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
    this.asignaturas = userDetails.asignaturas.map((asignatura: any) => ({
      asignatura: asignatura.asignatura || '',
      seccion: asignatura.seccion || '',
      sala: asignatura.sala || '',
      fecha: asignatura.fecha || '',
    }));

    this.clasesAceptadas = userDetails.clasesAceptadas || [];
  }

  // Inicia el escaneo de QR
  async startScan() {
    if (this.scanInProgress) {
      return;
    }

    this.scanInProgress = true;

    const permission = await BarcodeScanner.checkPermission({ force: true });
    if (!permission.granted) {
      await this.presentAlert('Error', 'Permisos de cámara no concedidos. Actívalos manualmente.');
      this.scanInProgress = false;
      return;
    }

    await BarcodeScanner.hideBackground();
    const result = await BarcodeScanner.startScan();
    await BarcodeScanner.showBackground();

    if (result?.hasContent) {
      this.scannedCode = result.content;
      this.showQrResultPopup(this.scannedCode); 
    } else {
      await this.presentAlert('Error', 'No se detectó ningún código QR');
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

  // Mostrar el popup con el resultado del QR y procesar la clase
  async showQrResultPopup(result: string) {
    // Parsear el contenido del QR
    const [asignatura, seccion, sala, fecha] = result.split('|');

    const claseEscaneada: Asignatura = {
      asignatura: asignatura || '',
      seccion: seccion || '',
      sala: sala || '',
      fecha: fecha || '',
    };

    // Verificar si la clase escaneada pertenece a las asignaturas del usuario
    const asignaturaEncontrada = this.asignaturas.find(
      (a) =>
        a.asignatura === claseEscaneada.asignatura &&
        a.seccion === claseEscaneada.seccion &&
        a.sala === claseEscaneada.sala &&
        a.fecha === claseEscaneada.fecha
    );

    if (!asignaturaEncontrada) {
      // La asignatura no pertenece al usuario
      await this.presentAlert('Error', 'La asignatura escaneada no pertenece a tus asignaturas.');
      return;
    }

    // Verificar si ya existe la clase en las clasesAceptadas (evitar duplicados)
    const yaRegistrada = this.clasesAceptadas.some(
      (c) =>
        c.asignatura === claseEscaneada.asignatura &&
        c.seccion === claseEscaneada.seccion &&
        c.sala === claseEscaneada.sala &&
        c.fecha === claseEscaneada.fecha
    );

    if (yaRegistrada) {
      await this.presentAlert('Información', 'Esta clase ya fue registrada previamente.');
      return;
    }

    // Si pasa las validaciones, mostrar el popup de confirmación
    const alert = await this.alertController.create({
      header: 'Clase Escaneada',
      message: `Asignatura: ${asignatura} | Sección: ${seccion} | Sala: ${sala} | Fecha: ${fecha}| ¿Deseas registrar tu asistencia a esta clase?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Aceptar',
          handler: () => {
            this.addClaseAceptada(claseEscaneada);
          },
        },
      ],
    });

    await alert.present();
  }

  // Agregar clase aceptada
  addClaseAceptada(clase: Asignatura) {
    this.authService.addClaseAceptada(clase).subscribe(
      async (response) => {
        // Actualizar clases aceptadas localmente
        this.clasesAceptadas.push(clase);
        localStorage.setItem('clases_aceptadas', JSON.stringify(this.clasesAceptadas));
        await this.presentAlert('Éxito', 'Asistencia registrada correctamente.');
      },
      async (error) => {
        console.error('Error al agregar clase aceptada', error);
        await this.presentAlert('Error', 'Ocurrió un error al registrar tu asistencia.');
      }
    );
  }

  // Mostrar alerta genérica
  async presentAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
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
