const createWorker = (file)=>{
    var worker = new Worker('js/fileupload.js');
    worker.onmessage = function(e) {
        console.log(e.data);
    };
    worker.onerror = function werror(e) {
        console.error('ERROR: Line ', e.lineno, ' in ', e.filename, ': ', e.message);
    };
    worker.postMessage({'file':file});
};

function handleFileSelect(evt) {
    evt.stopPropagation();
    evt.preventDefault();

    var dataTransfer = (evt.dataTransfer || {})
    var files = dataTransfer.files || evt.target.files;

    var output = [];
    for (var i = 0, f; f = files[i]; i++) {
        createWorker(f);
        output.push('<li><strong>', escape(f.name), '</strong> (', f.type || 'n/a', ') - ', f.size, ' bytes, last modified: ', f.lastModifiedDate ? f.lastModifiedDate.toLocaleDateString() : 'n/a', '</li>');
    }
    document.getElementById('list').innerHTML = '<ul>' + output.join('') + '</ul>';
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