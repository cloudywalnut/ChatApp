import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { Database, ref, list as listFire, push, set } from '@angular/fire/database';
import { Observable, map } from 'rxjs';

@Component({
  selector: 'app-new-chat',
  templateUrl: './new-chat.page.html',
  styleUrls: ['./new-chat.page.scss'],
  standalone: false
})
export class NewChatPage implements OnInit {

  user$: Observable<any> | undefined;
  user_id: any;
  chatMembers: any = [];
  add_remove: string = 'Add';

  constructor(private auth: Auth, private db: Database, private router: Router) { }


  ngOnInit() {
      onAuthStateChanged(this.auth, (user) => {
        if (!user) {
          this.router.navigate(['/login']); // Redirect to login if not authenticated
        }else{
          this.user_id = user.uid;
        }
      });

      this.get_users();
  }

  go_dashboard(){
    this.router.navigate(['/dashboard'])
  }

  get_users(){
    const dbref = ref(this.db, `/Users`)
    this.user$ = listFire(dbref).pipe(
      map(users => users.map(user => user.snapshot))
    )
  }

  addToChat(user: any){
    if (!this.chatMembers.includes(user)){
      this.chatMembers.push(user);
    }else if(this.chatMembers.includes(user)){
      this.chatMembers.splice(this.chatMembers.indexOf(user),1)
    }
  }

  member_added(user:any){
    if (this.chatMembers.includes(user)){
      this.add_remove = 'Remove';
      return 'danger'
    }else{
      this.add_remove = 'Add';
      return 'success'
    }
  }

  async create_chat(){
    const chatName = document.getElementById("chatName") as HTMLInputElement;
    const aiPrompt = document.getElementById("aiPrompt") as HTMLInputElement;  // Fixed typo here
    if (this.chatMembers.length > 0 && chatName.value && aiPrompt.value) {
      
      this.chatMembers.push(this.user_id) // The user himself needs to be in the chat
      let chatPeopleObj: any = {};

      // Convert chatMembers array into an object with each member as a key
      // for correct representation in firebase realtime database
      this.chatMembers.forEach((member:any)  => {
        if (member == this.user_id){
          chatPeopleObj[member] = {
            "Chat Prompt": aiPrompt.value
          };  
        }else{
          chatPeopleObj[member] = ""
        }
      });
      
      let dbref = ref(this.db, `/Chat`);
      const pushref = await push(dbref, {"Chat Name": chatName.value, "Chat People": chatPeopleObj})

      for (let member of this.chatMembers){
        dbref = ref(this.db, `/Users/${member}/Chat/${pushref.key}`);
        await set (dbref, "");
      }

      window.alert("Chat Has been created Successfully")
      window.location.reload()

    }else{
      window.alert("Fill in the fields and add atleast one person to the Chat"); // For Testing purposes
    }
  
  }

}
