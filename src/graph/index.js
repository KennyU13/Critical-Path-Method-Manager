import { isProxy } from "vue";

function pushOrRemove(value, arr) {
  arr.includes(value)
    ? (arr = arr.filter((elem) => elem !== value))
    : arr.push(value);
  return arr;
}
function getDureeTache(task, arr) {
  if (task == "deb") return 0;
  for (let tab of arr) {
    if (task == tab[0]) return tab[1];
  }
}
function transormPred(task, pred ,arc, arr) {
  if(Array.isArray(arc)) return task
    
  if(pred.length>1) return [...pred]
  if(pred.length == 1 ){
    let predecessor = getTachePredecesseur(pred, arr)
    let successor = getTacheSuccesseur(pred, arr)
    if( Array.isArray(predecessor)) return pred
    else return successor
  }
}
function getTacheSuccesseur(task, arr) {
  if (Array.isArray(task)) {
    let preTab = [];
    for (let ta of task) {
      for (let tabArr of arr) {
        if (tabArr[0] == ta || tabArr.includes(ta)) {
          pushOrRemove(tabArr[2], preTab);
        }
      }
    }
    for (let x of preTab) {
      pushOrRemove(x, preTab);
    }

    return preTab;
  }
  for (let tab of arr) {
    if (task == tab[0]) return tab[2];
  }
}
function getTachePredecesseur(task, arr) {
  let preTab = [];
  if (Array.isArray(task)) {
    for (let ta of task) {
      for (let tabArr of arr) {
        if (tabArr[2] == ta || tabArr.includes(ta)) {
          pushOrRemove(tabArr[0], preTab);
        }
      }
    }
    return preTab;
  }
  if (task == "fin") {
    for (let tab of arr) {
      if (tab[2] == "fin") preTab.push(tab[0]);
    }
    return preTab;
  }
  for (let tab of arr) {
    if (tab[2].length >= 1 && tab[2] != "fin")
      for (let x of tab[2]) if (x == task) preTab.push(tab[0]);
  }
  if (preTab.length == 0) {
    return "deb";
  } else if (preTab.length == 1) {
    return preTab[0];
  } else {
    return preTab;
  }
}
function getTacheCheminC(task, arr) {
  let preTab = [];
  if (typeof task == "object") return getMaxPred(task, arr);
  if (task == "fin") {
    for (let tab of arr) {
      if (tab[2] == "fin") preTab.push(tab[0]);
    }
    return getMaxPred(preTab, arr);
  }
  if (typeof task == "string") {
    preTab = [];

    for (let tab of arr) {
      if (typeof tab[2] == "object") {
        for (let x of tab[2]) if (x === task) preTab.push(tab[0]);
      }

      if (typeof tab[2] == "string" && tab[2] == task) {
        preTab.push(tab[0]);
      }
    }
    if (preTab.length == 0) {
      return "deb";
    } else {
      return getMaxPred(preTab, arr);
    }
  }
}
function getMaxPred(arrData, arr) {
  let taskMax = "";
  let max = 0;

  for (let index in arrData) {
    if (max <= getDureeTache(arrData[index], arr)) {
      max = getDureeTache(arrData[index], arr);
      taskMax = arrData[index];
    }
  }
  return taskMax;
}
function getDateTot(arrData) { //GraphMermaid
  let arr = arrData.map((item) => (Array.isArray(item) ? [...item] : item));

  for (let tab of arr) {
    let taskPred = getTachePredecesseur(tab[0], arr);

    if (taskPred.length > 1 && taskPred != "deb") {
      let max = 0;
      for (let task of taskPred) {
        max = Math.max(max, getDureeTache(task, arr));
      }
      tab[1] = max + getDureeTache(tab[0], arr);
    } else {
      tab[1] = getDureeTache(taskPred, arr) + getDureeTache(tab[0], arr);
    }
  }
  return arr;
}
function getTacheCritique(arr) { // GraphMermaid
  let lastTask = "fin";
  let chemin = [];

  while (lastTask != "deb") {
    lastTask = getTacheCheminC(lastTask, arr);
    chemin.push(lastTask);
  }

  return chemin;
}


function getCheminMinimal(tableauVerifier, principalArray) { //GraphMermaid
  
  let copyOfPrincipalTable = principalArray.map((item) =>
    Array.isArray(item) ? [...item] : item
  );
  let copyOfTableauVerifier = tableauVerifier.map((item) =>
    Array.isArray(item) ? [...item] : item
  );

  let minTable = [];

  const finDuraiton = getMaxFin(copyOfTableauVerifier.reverse());

  copyOfPrincipalTable.reverse().forEach(([task, duration, successeur]) => {
    if (successeur == "fin") {
      minTable.push([task, finDuraiton - duration]);
    } else if (Array.isArray(successeur)) {
      let min = finDuraiton;
      successeur.forEach((suc) => {
        if (min >= getDureeTache(suc, minTable))
          min = getDureeTache(suc, minTable);
      });
      minTable.push([task, min - duration]);
    } else
      minTable.push([task, getDureeTache(successeur, minTable) - duration]);
  });

  return minTable;
}

function mappedToMermaidData(data) { // GraphMermaid
  let mappedData = [];
  const allDateTot = getDateTot(data);
  const criticalPathData = getTacheCritique(allDateTot);
  const allDateTard = new Map(getCheminMinimal(allDateTot, data))
  
  
  data.forEach(([task, duration, [...suc]]) => {
    
    let successeur = suc.join("");
    let pred = !Array.isArray(getTachePredecesseur(task, data))
      ? getTachePredecesseur(task, data)
      : getTachePredecesseur(task, data).join("");

    let predArray = "";
    // if(task=="r") console.log("arc --  ",successeur);

    if (!Array.isArray(getTachePredecesseur(task, data))) {
      predArray = !Array.isArray(
        getTacheSuccesseur(getTachePredecesseur(task, data), data)
      )
        ? getTachePredecesseur(task, data)
        : getTacheSuccesseur(getTachePredecesseur(task, data), data).join("");
    } else {
      let x = [];
      getTachePredecesseur(task, data).forEach((element) => {
        !isProxy(getTacheSuccesseur(element, data))
          ? pushOrRemove(getTacheSuccesseur(element, data), x)
          : getTacheSuccesseur(element, data).forEach((e) => {
              pushOrRemove(e, x);
            });
      });
      predArray = x.join("");
    }

    let predSucc = !Array.isArray(getTachePredecesseur(successeur, data))
      ? null
      : getTachePredecesseur(successeur, data).join("");

    let succArray = !Array.isArray(getTacheSuccesseur(successeur, data))
      ? successeur
      : getTacheSuccesseur(successeur, data).join("");

    let from, fromDuration, to = null, toDuration = "";
    // ICI ON DEFINIT LE form:
    if (pred == predArray) {
      from = pred;
      fromDuration = getDureeTache(pred, allDateTot);
    }

    if (pred != "deb" && predArray != "deb") {
      if (pred.length > 1) {
        from = pred;
        fromDuration = getDureeTache(task, allDateTot);
      }
      if ((pred.length > 1 && predArray.length > 1) || predArray.length > 1)
        from = predArray;
      // console.log("xxxxx ", task, "  xx  ", predArray, " -- ",  pred);

      if (!pred.length > 1) fromDuration = getDureeTache(pred, allDateTot);
      else {
        let predXX = getTachePredecesseur(task, data);
        if (Array.isArray(predXX)) {
          let max = 0;
          predXX.forEach((e) => {
            max = Math.max(max, getDureeTache(e, allDateTot));
          });
          fromDuration = max;
        }
      }
      if (pred.length == 1) {
        fromDuration = getDureeTache(pred, allDateTot);
      }
      if (
        predSucc != null &&
        pred.length > 1 &&
        predArray.length > 1 &&
        predSucc.length > 1 &&
        predArray != predSucc
      ) {
        from = task;
        fromDuration = getDureeTache(task, allDateTot);
      }
    }
    let arc = null, arcDuration = null;

    if (
      predSucc != null &&
      predArray.includes(task) &&
      predSucc.includes(task) &&
      predArray != predSucc &&
      pred.length > 1 &&
      pred != "deb"
    ) {
      arc = [];
      arcDuration = [];
      
      
      getTachePredecesseur(task, data).forEach((elem) => {
        let varToPush = Array.isArray(getTacheSuccesseur(elem, data))
          ? getTacheSuccesseur(elem, data).join("")
          : getTacheSuccesseur(elem, data);
        arc.push(varToPush);
        arcDuration.push(getDureeTache(elem, allDateTot));
      });
    }
    let finDur=0
    // ICI ON DEFINIT LE to:
    if (successeur == "fin") {
      to = "fin";
      let predFin = getTachePredecesseur("fin", allDateTot);
      if (Array.isArray(predFin)) {
        let max = 0;
        predFin.forEach((e) => { max = Math.max(max, getDureeTache(e, allDateTot)) });
        finDur = toDuration = max;
        
      }
    } else {
      if (pred === "deb") {
        to = task;
        toDuration = getDureeTache(task, allDateTot);
      }
      if (successeur == succArray) {
        to = (successeur.length == 1) ? task : successeur
        toDuration = getDureeTache(task, allDateTot);
      }
      if (predSucc != null && predSucc.length > 1) {
        to = predSucc;
      }
    }
    let isCritical = criticalPathData.includes(task);  
    
    
    
    let dataPred = transormPred(task, predArray,arc,data)

    mappedData.push({
      task: task,
      linkDuration: duration,
      pred: pred,
      predArray: predArray,
      succ: successeur,
      succArray: succArray,
      predSucc: predSucc,
      from: from,
      to: to,
      arc: arc,
      arcDur: arcDuration,
      fromDur: fromDuration,
      toDur: toDuration,
      finDur: finDur,
      isCritical: isCritical,
      dateTard: getOptDate( dataPred, allDateTard),
      mapDateTard: allDateTard
    });
  });


  return mappedData;
}
function getCriticalData(mermaidData, arr) { // GraphMrmaid
  const tasks = getTacheCritique(arr)
  
  let i = 0
  let linkIndex=[]
  
  let criticalData = []
  
  mermaidData.forEach(
    ({task, from, to, isCritical, arc}) => {   
      if(isCritical){
        if(!criticalData.includes(task)) criticalData.push(task)
        if(!criticalData.includes(from)) criticalData.push(from)
        if(!criticalData.includes(to)) criticalData.push(to)
              //********************************************************** */

        if(Array.isArray(arc)){
          getTachePredecesseur(task,arr).forEach(e=>{
            i+=arc.length
            if(tasks.includes(e)){
              linkIndex.push(i)
            }
            // linkIndex.push(i)
          })
          
        }
        else{
          linkIndex.push(i)
        }
        // console.log(from," - ( ",task," )[",i,"] - ",to, " ---- ", arc);
      }
      i++
      
    }
  )

  return {criticalData, linkIndex};
}
function getOptDateArc(task,mapDateTard){
  let tab=[]
  task.split('').forEach(e=>{
    tab.push(mapDateTard.get(e))
  })
  return Math.min(...tab);
}
function getOptDate( data, mapDateTard){
  if(Array.isArray(data)){
    let tab = []
    data.forEach( e => {
      tab.push(mapDateTard.get(e))
    })
    return tab
  }
  return mapDateTard.get(data)
  
}

function getMaxFin(arr) {
  let max = 0;
  arr.forEach(([, duration, successeur]) => {
    if (successeur == "fin" && max <= duration) {
      max = duration;
    }
  });
  return max;
}
export { 
  getDateTot, 
  mappedToMermaidData, 
  getCriticalData, 
  getTacheCritique, 
  getTachePredecesseur,
  getCheminMinimal,
  getOptDateArc
};
