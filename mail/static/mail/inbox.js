document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbo
    ListMails('inbox');

});

function compose_email() {
  document.querySelector('#table').innerHTML = '';
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

}

function load_mailbox(mailbox) {

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

}

document.addEventListener('DOMContentLoaded', ()=>{
  document.querySelector('#compose-form').onsubmit = function(){
      const recipients = document.querySelector('#compose-recipients').value ;
      const  subject = document.querySelector('#compose-subject').value ;
      const   body = document.querySelector('#compose-body').value ;
      const Sender = document.querySelector('#Sender').value ;
      fetch('/emails', {
        method: 'POST',
        body: JSON.stringify({
        recipients: recipients ,
        subject: subject ,
        body: body
        })
      })

      .then(response => response.json())
      .then(result => {
      console.log(result);
    })
    ListMails('sent')
    return false;
  }
})

function ListMails(mailbox){
  load_mailbox(mailbox)
    document.querySelector('#table').innerHTML = '';
  fetch(`/emails/${mailbox}`)
.then(response => response.json())
.then(email => {
  email.forEach((Mail)=>{
        const mail =  document.createElement('tr')
        const ToOrFrom = document.createElement('th')
        const subject = document.createElement('td')
        const time = document.createElement('td')
        subject.style.paddingRight = '300px';
        if(mailbox === 'inbox' || mailbox=='archive'){
          ToOrFrom.innerHTML = `From : ${Mail['sender']}`
        }
        else if(mailbox === 'sent'){
          ToOrFrom.innerHTML = `To : ${Mail['recipients']}`
        }
        if(Mail['read']===true){
          mail.style.backgroundColor = '#ebeddd';
        }
        else{
          mail.style.backgroundColor = 'white';
        }
        subject.innerHTML = Mail['subject']
        time.innerHTML = `<small>${Mail['timestamp']}</small>`
        mail.append(ToOrFrom)
        mail.append(subject)
        mail.append(time)
        document.querySelector('#table').append(mail)
        mail.addEventListener('click', ()=>ShowEmail(Mail,mailbox))
  })
});
}

document.addEventListener('DOMContentLoaded', ()=>{
  document.querySelector('#inbox').addEventListener('click', ()=>ListMails('inbox'));
  document.querySelector('#sent').addEventListener('click', ()=>ListMails('sent'))
  document.querySelector('#archived').addEventListener('click', ()=>ListMails('archive'))
})

function ShowEmail(mail,mailbox){
  const heading = document.createElement('p')
  const body = document.createElement('h5')
  const reply = document.createElement('button')
  heading.innerHTML = `From : ${mail['recipients']}<br>To : ${mail['sender']}<br>Subject: ${mail['subject']}<br><small>${mail['timestamp']}</small>`
  body.innerHTML = `${mail['body']}`.replace(/(?:\r\n|\r|\n)/g, '<br>');
  body.style.paddingBottom = '50px';
  heading.style.paddingBottom = '40px';
  document.querySelector('#table').innerHTML= ''
  document.querySelector('#emails-view').append(heading)
  document.querySelector('#emails-view').append(body)
  document.querySelector('#emails-view').append(reply)
  reply.classList.add("btn-primary")
  reply.innerHTML = "Reply"
  reply.addEventListener('click', ()=>Reply(mail))
  if(mailbox!== 'sent'){
    const archive = document.createElement('button')
    if(mail['archived']===false){
      archive.innerHTML = "Archive"
    }
    else{
      archive.innerHTML = "Un-Archive"
    }
    document.querySelector('#emails-view').append(archive)
    archive.addEventListener('click', ()=>Archive(mail))
  }a
  fetch(`/emails/${mail['id']}`, {
  method: 'PUT',
  body: JSON.stringify({
      read : true
  })
})
console.log(mail)
}

function Archive(mail){
  if(mail['archived']===false){
    fetch(`/emails/${mail['id']}`, {
    method: 'PUT',
    body: JSON.stringify({
        archived: true
    })
  })
  }
  else{
    fetch(`/emails/${mail['id']}`, {
    method: 'PUT',
    body: JSON.stringify({
        archived: false
    })
  })
  }
  setTimeout(function(){ListMails('inbox')},100);
}

function Reply(mail){
    compose_email()
    document.querySelector('#compose-recipients').value = `${mail['sender']}`
    if (mail['subject'].startsWith('RE:')){
        document.querySelector('#compose-subject').value = `${mail['subject']}`
    }
    else{
      document.querySelector('#compose-subject').value = `RE: ${mail['subject']}`
    }

    document.querySelector('#compose-body').value =    `\n\n On ${mail['timestamp']} ${mail['sender']} wrote:\n\n ${mail['body']}`
}
