import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { Observable, map } from 'rxjs';
import { Database, ref, list as listFire, update, get, remove, set } from '@angular/fire/database';


@Component({
  selector: 'app-chat-settings',
  templateUrl: './chat-settings.page.html',
  styleUrls: ['./chat-settings.page.scss'],
  standalone: false
})
export class ChatSettingsPage implements OnInit {

  user$: Observable<any> | undefined;
  user_id: any;
  chatMembers: any = [];
  add_remove: string = 'Add';
  chat_id: any;

  constructor(private auth: Auth, private db: Database ,private router: Router, private route: ActivatedRoute) { }

  ngOnInit() {
    onAuthStateChanged(this.auth, (user) => {
      if (!user) {
        this.router.navigate(['/login']); // Redirect to login if not authenticated
      }else{
        this.user_id = user.uid;
      }
    });

    this.chat_id =  this.route.snapshot.paramMap.get('chatId');
    this.get_users();

  }

  async get_users(){
    const dbref = ref(this.db, `/Users`)
    const dbref_chat = ref(this.db, `/Chat/${this.chat_id}/Chat People`)
    const response = await get(dbref_chat)
    const members = Object.keys(response.val())        
    this.user$ = listFire(dbref).pipe(
      map(users => users.filter((user:any) => !members.includes(user.snapshot.key))),
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

  async exit_chat(){
    // needs to be in this sequence as can not write a chat to User/uid/Chat until part of that chat
    let dbref = ref(this.db, `Users/${this.user_id}/Chat/${this.chat_id}`)
    await remove(dbref);
    dbref = ref(this.db, `Chat/${this.chat_id}/Chat People/${this.user_id}`)
    await remove(dbref);
    window.alert("You have exited the Chat")
    this.router.navigate(['/dashboard'])
  }

  chat_update_details() {
    const chatName = document.getElementById("chatName") as HTMLInputElement;
    const aiPrompt = document.getElementById("aiPrompt") as HTMLInputElement;
    const updates: any = {};
  
    if (chatName.value) {
      updates[`Chat/${this.chat_id}/Chat Name`] = chatName.value;
    }  
    if (aiPrompt.value) {
      updates[`Chat/${this.chat_id}/Chat People/${this.user_id}/Chat Prompt`] = aiPrompt.value;
    }
    if (Object.keys(updates).length > 0) {
      update(ref(this.db), updates);
      window.alert("Changes Updated Successfully")
    }else{
      window.alert("No Changes to Update")
    }

  }

  async add_new_members() {
    if (this.chatMembers.length > 0) {
      for (let member of this.chatMembers) {
        let dbref = ref(this.db, `Chat/${this.chat_id}/Chat People/${member}`);
        await set(dbref,"");
        dbref = ref(this.db, `Users/${member}/Chat/${this.chat_id}`)
        await set(dbref, "");
      }
      window.alert("New Members Added Successfully")
    } else {
      window.alert("You have not chose any new users to add");
    }
  }
 
  go_to_dashboard(){
    this.router.navigate(['/dashboard']);
  }

}
