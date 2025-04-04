import { Component, OnInit } from '@angular/core';
import { Database, ref, list as listFire, push } from '@angular/fire/database';
import { Observable, map } from 'rxjs';
import { Auth, signOut, onAuthStateChanged } from '@angular/fire/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
  standalone: false
})
export class ChatPage implements OnInit {

  items$: Observable<any[]> | undefined;
  user_id: any;
  user_name: any;
  new_message: any;

  constructor(private db: Database, private auth: Auth, private router: Router) {}

  ngOnInit(){

    // This is done so that user goes back to login after logout and can not direclty come to chat 
    // without loggin in
    onAuthStateChanged(this.auth, (user) => {
      if (!user) {
        this.router.navigate(['/login']); // Redirect to login if not authenticated
      }else{
        this.user_id = user.uid;
        this.user_name = user.displayName;
      }
    });

    this.getMessages()
  }

  getMessages(){
    const dbref = ref(this.db, "/Messages")
    this.items$ = listFire(dbref).pipe(
      map(items => items.map(item => item.snapshot))
    )
  }

  async sendMessage(){
    const path = `/Messages`
    if (this.new_message){
      await push(ref(this.db, path), {sender_id: this.user_id, sender_name: this.user_name ,message: this.new_message});    
      this.new_message = "";
    }
  }

  getSenderColor(sender_id: string): string {
    if (sender_id == this.user_id) {
      return 'greenyellow';  // Color values should be in quotes
    } else {
      return 'skyblue';  // Color values should be in quotes
    } 
  }  

  async logout() {
    try {
      await signOut(this.auth);
      console.log("User signed out");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  }

}
