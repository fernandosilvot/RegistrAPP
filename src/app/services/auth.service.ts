import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://54.210.160.48:3000/usuarios'; // URL de la API
  private userId: string = ''; // Guardar el ID del usuario

  constructor(private http: HttpClient) {}

  validateEmail(email: string): Observable<boolean> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map((users) => users.some((user) => user.correo === email))
    );
  }

  validateUser(username: string, password: string): Observable<any> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map((users) => {
        const user = users.find(
          (user) =>
            user.correo === username && user.contraseña === password
        );
        return user;
      }),
      switchMap((user) => {
        if (user) {
          this.userId = user.id; // Guardar el ID del usuario
        }
        return of(user);
      })
    );
  }

  setUserDetails(user: {
    id: string;
    correo: string;
    nombre: string;
    apellido: string;
    asignaturas: any[];
    clases_aceptadas: any[];
  }) {
    const fullName = `${user.nombre} ${user.apellido}`;
    localStorage.setItem('username', user.correo);
    localStorage.setItem('fullName', fullName);
    localStorage.setItem('userId', user.id);

    // Almacenar asignaturas
    const formattedAsignaturas = user.asignaturas.map((asignatura) => ({
      asignatura: asignatura.asignatura || '',
      seccion: asignatura.seccion || '',
      sala: asignatura.sala || '',
      fecha: asignatura.fecha || '',
    }));
    localStorage.setItem(
      'asignaturas',
      JSON.stringify(formattedAsignaturas)
    );

    // Almacenar clases aceptadas
    const formattedClasesAceptadas = user.clases_aceptadas || [];
    localStorage.setItem(
      'clases_aceptadas',
      JSON.stringify(formattedClasesAceptadas)
    );
  }

  getUserDetails() {
    const username = localStorage.getItem('username');
    const fullName = localStorage.getItem('fullName');
    const userId = localStorage.getItem('userId') || '';
    const asignaturas = JSON.parse(
      localStorage.getItem('asignaturas') || '[]'
    );
    const clasesAceptadas = JSON.parse(
      localStorage.getItem('clases_aceptadas') || '[]'
    );
    return { username, fullName, asignaturas, clasesAceptadas, userId };
  }

  isAuthenticated(): boolean {
    return this.getUserDetails().username !== null;
  }

  logout() {
    localStorage.removeItem('username');
    localStorage.removeItem('fullName');
    localStorage.removeItem('asignaturas');
    localStorage.removeItem('clases_aceptadas');
    localStorage.removeItem('userId');
  }

  // Nuevo método para agregar una clase aceptada
  addClaseAceptada(clase: any): Observable<any> {
    const userId = this.getUserDetails().userId;
    if (!userId) {
      return of(null);
    }

    // Primero, obtener las clases aceptadas actuales del usuario
    return this.http.get<any>(`${this.apiUrl}/${userId}`).pipe(
      switchMap((user) => {
        const clasesAceptadas = user.clases_aceptadas || [];
        clasesAceptadas.push(clase);

        // Ahora, actualizar el usuario con la nueva clase aceptada
        return this.http.patch(`${this.apiUrl}/${userId}`, {
          clases_aceptadas: clasesAceptadas,
        });
      })
    );
  }
}
