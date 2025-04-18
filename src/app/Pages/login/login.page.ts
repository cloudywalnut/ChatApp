import { Component, OnInit } from '@angular/core';
import { Auth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from '@angular/fire/auth';
import { Database, ref, set, update } from '@angular/fire/database';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false
})
export class LoginPage implements OnInit {

  user: any = null;

  constructor(private auth : Auth, private db: Database, private router: Router) { }

  ngOnInit() {
    
    // This is done so that the user can not navigate to the login page if he hasn't already logged out
    onAuthStateChanged(this.auth, (user) => {
      if (user) {
        this.router.navigate(['/dashboard']); // Redirect to login if not authenticated
      }
    });

  }

  async loginWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' }); // Forces account selection
      const result = await signInWithPopup(this.auth, provider);
      this.user = result.user; // Store user data

      // In orders to get this and store this in the realtime database
      // ref gives the reference of what needs to be created
      // update sets the value at that place
      // previously using set was causing issues as it was over writing the whole thing (Chat was getting removed)
      await update(ref(this.db,`Users/${this.user.uid}`),{
        email: this.user.email,
        name: this.user.displayName
      })

      if(this.user){
        this.router.navigate(['/dashboard'])
        console.log("Sign In Successful")
      }

    } catch (error) {
      console.error("Error signing in:", error);
    }
  }

}
