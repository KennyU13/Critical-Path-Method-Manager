function nodeShape(dateTot, dateTard = "", _isCritical) {
  if (!Array.isArray(dateTard)) {

    let marge = dateTot != "Fin"
    ?`<h1 class="m-0"><kbd class="text-dark bg-warning rounded fw-bolder tMin">${dateTard-dateTot}</kbd></h1>`
    : ""
  
    return `<div class="d-flex  justify-content-center align-items-center rounded p-2">
        <h1 class="m-0">${dateTot}</h1>
        <h1 class="m-0 ms-3"><kbd class="text-success rounded bg-white fw-bolder tMin">${dateTard}</kbd></h1>
      </div>${marge}`

  } else {
    
    let text = ""

    dateTard.forEach(e =>{
      text+= `<h1 class="m-0"><kbd class="text-success rounded bg-white fw-bolder tMin">${e}</kbd><kbd class="text-dark bg-warning rounded fw-bolder">${e-dateTot}</kbd></h1>`
    })

    return `<div class="d-flex  justify-content-center align-items-center rounded p-2">
        <h1 class="m-0">${dateTot}</h1>
        <div class="d-flex flex-column justify-content-start align-items-start rounded p-2 ms-3">
         ${text}
        </div>
      </div>`;
  }
}

function nodeShapeStart(from, dateTot = "", dateTard = "", isCritical) {
  return from == "deb"
    ? `deb((<h1 class="m-0">Deb - 0</h1>))`
    : `${from}((${nodeShape(dateTot, dateTard, isCritical)}))`;
  // return `${from}((${nodeShape(dateTot, dateTard)}))`;
}

function nodeShapeEnd(to, dateTot = "", dateTard = "", isCritical,finDur) {
  // dateTot = to == "fin" ? `fin` : dateTot;
  if( to == "fin"){
    dateTard = finDur
    dateTot = "Fin"
  }
  return `${to}((${nodeShape(dateTot, dateTard, isCritical)}))`;
}

function linkNode(task = "", duration = "0") {
  // return task + " " + duration;
  let style = task == "" ? "text-danger" : ""
  return `-->|**<div class='d-flex flex-column p-3 '><h2 class="m-0 mb-3">${task.toUpperCase()}</h2><h2 class="m-0  ${style}">${duration}</h2></div>**|`;
}

function applyStyle(node, classDef, link = null) {
  return link == null
    ? `class ${node} ${classDef};`
    : `class ${node} ${classDef};\n
  linkStyle ${link} stroke:#00d362, stroke-width:10px;\n`;
}

const mermaidClassDef = {
  criticalStyle: {
    classDef: "criticalPath",
    style: `classDef criticalPath fill:#57ffb1, color:#000, stroke:#00d362,stroke-width:3px; \n`,
  },
};
// --baseColor :#1cff86;
// --activeFocusColor : #057a5a;
//31bd7c

export { nodeShapeStart, nodeShapeEnd, linkNode, applyStyle, mermaidClassDef };
