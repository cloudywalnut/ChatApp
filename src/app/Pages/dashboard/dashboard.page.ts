import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Auth, signOut, onAuthStateChanged } from '@angular/fire/auth';
import { Observable, map } from 'rxjs';
import { Database, ref,list as listFire, get } from '@angular/fire/database';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: false
})
export class DashboardPage implements OnInit {

  user_chats$: Observable<any[]> | undefined;
  user_id: any;

  // i had previously set it to undefined which was causing problems with push
  // array needs to be defined for push to work with an array
  chat_data: any[] = [];

  constructor(private db: Database, private auth: Auth, private router: Router) { }

  ngOnInit() {
  
    onAuthStateChanged(this.auth, (user) => {
      if (!user) {
        this.router.navigate(['/login']); // Redirect to login if not authenticated
      }else{
        this.user_id = user.uid;

        // moved inside or else it will run before we even have the user id
        // this.get_chats(); 

        // This is the way i figured out to avoid any un necessary complications
        // This is however without an observable so will require reload if added to new chat - more on this tomorrow
        this.chat_data = []
        const dbref = ref(this.db, `/Users/${this.user_id}/Chat`);
        get(dbref).then(response => {
          let chat_ids = Object.keys(response.val());
        
          for (let chat of chat_ids) {
            const dbref = ref(this.db, `/Chat/${chat}/Chat Name`);
            get(dbref).then(response => {
              this.chat_data.push({ chat_id: chat, chat_name: response.val()});
            });
          }
        });
        
      }

    });  

  }

  to_chat(chat_id: any){
    this.router.navigate([`/chat/${chat_id}`]);
  }

  to_settings(chat_id: any){
    this.router.navigate([`chat-settings/${chat_id}`])
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
