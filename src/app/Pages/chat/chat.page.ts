import { Component, OnInit } from '@angular/core';
import { Database, ref, list as listFire, push, remove } from '@angular/fire/database';
import { Observable, map } from 'rxjs';
import { Auth, signOut, onAuthStateChanged } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

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

  constructor(private db: Database, private auth: Auth, private router: Router, private http: HttpClient) {}

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

  is_user(sender_id: string){
    if (this.user_id == sender_id){
      return true;
    }else{
      return false;
    }
  }

  async delete_message(message_id: string){
    const path = `Messages/${message_id}`
    await remove(ref(this.db, path));
  }

  ai_message(message: any) {
    const payload = {message: message}
    this.http.post('https://web-production-db5e6.up.railway.app/chatApp', payload).subscribe(
      (response: any) => {
        this.new_message = response.response
      }
    )
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
