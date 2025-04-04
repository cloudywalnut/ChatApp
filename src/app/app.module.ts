import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getDatabase, provideDatabase } from '@angular/fire/database';
import { provideAuth, getAuth } from '@angular/fire/auth';


@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }, 
  provideFirebaseApp(() => initializeApp({ projectId: "chatapp-6e900", appId: "1:398280129355:web:482a05869570ed135a46ce", databaseURL: "https://chatapp-6e900-default-rtdb.asia-southeast1.firebasedatabase.app", storageBucket: "chatapp-6e900.firebasestorage.app", apiKey: "AIzaSyBUaug24fTC5qsbh_GiAITyG3KpCNOyxXQ", authDomain: "chatapp-6e900.firebaseapp.com", messagingSenderId: "398280129355", measurementId: "G-VHNS0NTPJL" })), 
  provideDatabase(() => getDatabase()),
  provideAuth(() => getAuth())
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
