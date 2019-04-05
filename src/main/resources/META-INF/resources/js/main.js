const createWorker = (file)=>{
    const fileString=`${escape(file.name)} (${file.type || 'unavailableType'}, ${Math.round(file.size/1024)} kB )`;
    const worker = new Worker('js/fileupload.js');
    worker.onmessage = function(e) {
        if (e.data.type === 'progress'){
            const percentString = `${e.data.progress/100}%`;
            progressBarProgress.style.width = percentString;
            progressBarProgress.textContent = percentString;
        } else if (e.data.type === 'message') {
//            alert(e.data.message);
        } else if (e.data.type === 'complete') {
            progressBarProgress.style.width = "100%";
            progressBarProgress.textContent = "Completo";
        } else {
        }
    };
    worker.onerror = function werror(e) {
        console.error('ERROR: Line ', e.lineno, ' in ', e.filename, ': ', e.message);
    };
    worker.postMessage({'type':'upload', 'file':file});

    let progressBar = document.createElement("div");
    progressBar.classList.add('progress-bar');

    let progressBarTitle = document.createElement("label");
    progressBarTitle.textContent=fileString;
    progressBarTitle.classList.add("progress-bar--text");
    progressBar.appendChild(progressBarTitle);

    let progressBarProgress = document.createElement("span");
    progressBarProgress.classList.add("progress-bar--span");
    progressBar.appendChild(progressBarProgress);

    let progressBarCancel = document.createElement("button");
    progressBarCancel.addEventListener("click", (evt)=>{
        if (confirm('Cancelar o download?')){
            worker.postMessage({'type':'cancel'});
        }

        evt.stopPropagation();
        evt.preventDefault();
    });
    progressBarCancel.textContent="Cancelar";
    progressBar.appendChild(progressBarCancel);

    let progressContainer = document.getElementById("progress");
    progressContainer.appendChild(progressBar);

    document.getElementById('files').files
};

function handleFileSelect(evt) {
    evt.stopPropagation();
    evt.preventDefault();

    var dataTransfer = (evt.dataTransfer || {})
    var files = dataTransfer.files || evt.target.files;

//    var output = [];
    for (var i = 0, f; f = files[i]; i++) {
        createWorker(f);
//        output.push('<li><strong>', escape(f.name), '</strong> (', f.type || 'n/a', ') - ', f.size, ' bytes, last modified: ', f.lastModifiedDate ? f.lastModifiedDate.toLocaleDateString() : 'n/a', '</li>');
    }
    evt.target.value="";
//    document.getElementById('list').innerHTML = '<ul>' + output.join('') + '</ul>';
}

function handleDragOver(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    evt.dataTransfer.dropEffect = 'copy';
    // Explicitly show this is a copy.
}

// Setup the dnd listeners.
var dropZone = document.getElementById('drop_zone');
dropZone.addEventListener('dragover', handleDragOver, false);
dropZone.addEventListener('drop', handleFileSelect, false);
document.getElementById('files').addEventListener('change', handleFileSelect, false);
console.log('loaded');