var active=false;

function uploadFile(blob){
    active=true;
    var formData = new FormData();
    formData.append(escape(blob.name), blob);
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/multiPartServlet', true);

    xhr.upload.addEventListener('progress', function(ev) {
       var percent = Math.round((ev.loaded/ev.total) * 100);
       self.postMessage("message" + escape(blob.name) + " : " + percent + "%");
    });
    xhr.addEventListener('loadend', (evt)=>{
        self.postMessage(blob.name + " Uploaded Succesfully");
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
    console.log("MESSAGE RECEIVED");
    if (!active) {
        uploadFile(e.data.file);
    }
};