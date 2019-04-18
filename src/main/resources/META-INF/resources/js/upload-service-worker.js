var active=false;
var xhr;

const sendMessage = (message)=>{
    if ("Notification" in this) {
        if (Notification.permission !== "granted" && Notification.permission !== 'denied') {
            Notification.requestPermission();
        }
        if (Notification.permission === "granted") {
            var notification = new Notification(message);
        }
    }
    self.postMessage({
        type:"message",
        message: message
    });
};

function uploadFile(blob){
    active=true;
    var formData = new FormData();
    formData.append(escape(blob.name), blob);
    xhr = new XMLHttpRequest();
    xhr.open('POST', '/multiPartServlet', true);

    xhr.upload.addEventListener('progress', function(ev) {
       var percent = Math.round((ev.loaded/ev.total) * 10000);
       self.postMessage({
           type:"progress",
           progress: percent
       });
    });
    xhr.addEventListener('loadend', (evt)=>{
        sendMessage(blob.name + " Uploaded Succesfully");

        self.postMessage({
            type:"complete",
            payload: blob
        });
        self.close();
    });
    xhr.addEventListener('error', (evt)=>
        self.close()
    );
    xhr.addEventListener('abort', (evt)=>
        self.close()
    );
    xhr.send(formData);
}
function send_message_to_all_clients(msg){
    clients.matchAll().then(clients => {
        clients.forEach(client => {
            send_message_to_client(client, msg).then(m => console.log("SW Received Message: "+m));
        })
    })
}
function send_message_to_client(client, msg){
    return new Promise(function(resolve, reject){
        var msg_chan = new MessageChannel();

        msg_chan.port1.onmessage = function(event){
            if(event.data.error){
                reject(event.data.error);
            }else{
                resolve(event.data);
            }
        };

        client.postMessage("SW Says: '"+msg+"'", [msg_chan.port2]);
    });
}

console.log("SW Startup!");

// Install Service Worker
self.addEventListener('install', function(event){
    console.log('install');
    event.waitUntil(self.skipWaiting());
    console.log('installed!');
});

// Service Worker Active
self.addEventListener('activate', function(event){
    console.log('activate');
    event.waitUntil(clients.claim());
    event.waitUntil(clients.matchAll({
      includeUncontrolled: true
    }).then(allClients=>{
        for (const client of allClients) {
            client.postMessage({type:'activate', message:'Yay done it'})
        }
    }));
    console.log('activated');
});

var addGenericEvent = (element,eventName)=>{
    element.addEventListener(eventName, (evt) => console.log(eventName, JSON.stringify(evt)));
};
addGenericEvent(self, 'statechange');
addGenericEvent(self, 'message');
addGenericEvent(self, 'updatefound');
addGenericEvent(self, 'controllerchange');

self.addEventListener('fetch', function(event){
    console.log('begin fetch');
    event.respondWith(fetch(event.request));
    console.log('after fetch');
});
clients.matchAll({
      includeUncontrolled: true
}).then(allClients=>{
    for (const client of allClients) {
        client.postMessage({type:'activate', message:'Yay done it'})
    }
});