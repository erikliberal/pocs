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

self.onmessage = function(e) {
    if (e.data.type === 'upload'){
        if (!active) {
            uploadFile(e.data.file);
        }
    } else if (e.data.type === 'cancel'){
        if (active) {
            xhr.abort();
            xhr = null;
            active=false;
        }
    }
};