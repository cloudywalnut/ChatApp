import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Auth, signOut, onAuthStateChanged } from '@angular/fire/auth';
import { Observable, map } from 'rxjs';
import { Database, ref,list as listFire } from '@angular/fire/database';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: false
})
export class DashboardPage implements OnInit {

  user_chats$: Observable<any[]> | undefined;
  user_id: any;

  constructor(private db: Database, private auth: Auth, private router: Router) { }

  ngOnInit() {
  
    onAuthStateChanged(this.auth, (user) => {
      if (!user) {
        this.router.navigate(['/login']); // Redirect to login if not authenticated
      }else{
        this.user_id = user.uid;
        // moved inside or else it will run before we even have the user id
        this.get_chats(); 
      }
    });
  

  }

  to_chat(chat_id: any){
    this.router.navigate([`/chat/${chat_id}`]);
  }

  async logout() {
    try {
      await signOut(this.auth);
      console.log("User signed out");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  }

  create_chat(){
    this.router.navigate(['/new-chat'])
  }  

  // less efficient but has easier implementation
  // can later use other approach in which i access the chats directly from User
  // and then get the meta data of the chat
  get_chats(){
    const dbref = ref(this.db, `Chat`)
    this.user_chats$ = listFire(dbref).pipe(
      map(chats => chats.filter(chat => Object.keys(chat.snapshot.val()['Chat People']).includes(this.user_id))),
      map(filteredChats => filteredChats.map(chat => chat.snapshot)) 
    )
  }


}
