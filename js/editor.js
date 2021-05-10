function builtinRead(x) {
  if (Sk.builtinFiles === undefined || Sk.builtinFiles["files"][x] === undefined)
    throw "File not found: '" + x + "'";
  return Sk.builtinFiles["files"][x];
}

function saveTextAsFile(cmEditor, blockname) {
  let fileNameToSaveAs = `konturer_${blockname}.py`
  function setLink(event) {
    let textToWrite = cmEditor.getValue();
    let textFileAsBlob = new Blob([textToWrite], {
    type: "text/plain;charset=utf-8"
    });

    // var fileNameToSaveAs = "konturer_turtleprogram.py";
    var downloadLink = document.createElement("a");
    // let downloadLink = event.target;
    downloadLink.download = fileNameToSaveAs;

    if (window.webkitURL != null) {
      // Chrome allows the link to be clicked
      // without actually adding it to the DOM.
      downloadLink.href = window.webkitURL.createObjectURL(textFileAsBlob);
    } else {
      // Firefox requires the link to be added to the DOM
      // before it can be clicked.
      downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
      downloadLink.onclick = destroyClickedElement;
      downloadLink.style.display = "none";
      document.body.appendChild(downloadLink);
    }
    downloadLink.click();
  }
  return setLink;
}

function destroyClickedElement(event) {
  document.body.removeChild(event.target);}

function saveCanvasAsFile(name){
  let canvasDivName = `${name}-canvas`;
  function saveCanvas(event) {
    let div = document.getElementById(canvasDivName);
    let canvas = div.querySelectorAll("canvas")[1];
    let downloadLink = document.createElement('a');
    downloadLink.setAttribute('download', `konturer_${name}.png`);
    canvas.toBlob(function(blob) {
      let url = URL.createObjectURL(blob);
      downloadLink.setAttribute('href', url);
      downloadLink.onclick = destroyClickedElement;
      downloadLink.click();
    });
  }
  return saveCanvas;
}

document.addEventListener("DOMContentLoaded", function(){
  for (let skulptdiv of document.getElementsByClassName("skulpt")) {
    let name = skulptdiv.id;
    let editorId = name + "-code";
    let outputId = name + "-output";
    let canvasId = name + "-canvas";
    
    let keymap = {
      "Ctrl-Enter" : function (cmEditor) {
	let output = document.getElementById(`${name}-output`);
	let prog = cmEditor.getValue();
	output.textContent = "";
	Sk.pre = "${name}-output";
	Sk.configure({output: (text) => output.textContent += text,
		      read: builtinRead}); 
	(Sk.TurtleGraphics || (Sk.TurtleGraphics = {})).target = canvasId;
	Sk.TurtleGraphics.height = 600; Sk.TurtleGraphics.width = 800;

	let myPromise = Sk.misceval.asyncToPromise(function() {
	  return Sk.importMainWithBody("<stdin>", false, prog, true);
	});
	myPromise.then(function(mod) {
	  console.log('Success');
	},
		       function(err) {
			 console.log(err.toString());
			 output.textContent = err.toString();
		       });
      } 
    }

    let editor = CodeMirror.fromTextArea(document.getElementById(editorId), {
      mode: 'python',
      matchBrackets: true,
      dragDrop: false,
      styleSelectedText: false,
      showCursorWhenSelecting: true,
      lineWrapping: true,
      indentUnit: 4,
      extraKeys: keymap,
    });

    let runId = name + "-run";
    let saveId = name + "-save";
    let saveCanvasId = name + "-saveCanvas";
    document.getElementById(runId).addEventListener("click", function () {keymap["Ctrl-Enter"](editor)});
    document.getElementById(saveId).addEventListener("click", saveTextAsFile(editor, name));
    document.getElementById(saveCanvasId).addEventListener("click", saveCanvasAsFile(name));
  }
});
