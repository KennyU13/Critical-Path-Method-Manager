import TaskMethod from "./TaskMethod";

export default class MermaidDataBuilder extends TaskMethod {
  constructor(dataPrincipal) {
    super();
    this.dataPrincipal = dataPrincipal;
    this.schedule = this.buildSchedule(dataPrincipal);
    this.allDateTot = this.getDateTot();
    this.criticalPathData = this.getTacheCritique();
    this.allDateTard = this.getCheminMinimal();
    this.mermaidData = this.mappedToMermaidData();
  }

  getDateTot() {
    return this.dataPrincipal.map(([task, , successor]) => [
      task,
      this.schedule.earliestFinish.get(task),
      successor,
    ]);
  }
  getTacheCritique() {
    return this.schedule.criticalTasks;
  }
  getCheminMinimal() {
    return this.schedule.latestStart;
  }
  mappedToMermaidData() {
    let mappedData = [];
    const allDateTot = this.allDateTot;
    const criticalPathData = this.criticalPathData;
    const allDateTard = this.allDateTard;
    const data = this.dataPrincipal;

    data.forEach(([task, duration, [...suc]]) => {
      let successeur = suc.join("");
      let pred = this.getPredecessorValue(task, data);
      let predArray = this.getPredecessorArrayValue(task, data);
      let predSucc = this.getPredecessorWithSuccessor(successeur, data);
      let succArray = this.getSuccessorArray(successeur, data);

      let from,
        fromDuration,
        to = null,
        toDuration = "";
      // ICI ON DEFINIT LE form:
      if (pred == predArray) {
        from = pred;
        fromDuration = this.getDureeTache(pred, allDateTot);
      }

      if (pred != "deb" && predArray != "deb") {
        if (pred.length > 1) {
          from = pred;
          fromDuration = this.getDureeTache(task, allDateTot);
        }
        if ((pred.length > 1 && predArray.length > 1) || predArray.length > 1)
          from = predArray;
        // console.log("xxxxx ", task, "  xx  ", predArray, " -- ",  pred);

        if (!pred.length > 1)
          fromDuration = this.getDureeTache(pred, allDateTot);
        else {
          let predVirtual = this.getTachePredecesseur(task, data);
          if (Array.isArray(predVirtual)) {
            let max = 0;
            predVirtual.forEach((e) => {
              max = Math.max(max, this.getDureeTache(e, allDateTot));
            });
            fromDuration = max;
          }
        }
        if (pred.length == 1) {
          fromDuration = this.getDureeTache(pred, allDateTot);
        }
        if (
          predSucc != null &&
          pred.length > 1 &&
          predArray.length > 1 &&
          predSucc.length > 1 &&
          predArray != predSucc
        ) {
          from = task;
          fromDuration = this.getDureeTache(task, allDateTot);
        }
      }
      let arc = null,
        arcDuration = null;

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

        this.getTachePredecesseur(task, data).forEach((elem) => {
          let { arcVal, arcDur } = this.getArcFictif(elem, data, allDateTot);
          arc.push(arcVal);
          arcDuration.push(arcDur);
        });
      }
      let finDur = 0;
      // ICI ON DEFINIT LE to:
      if (successeur == "fin") {
        to = "fin";
        let predFin = this.getTachePredecesseur("fin", allDateTot);
        if (Array.isArray(predFin)) {
          let max = 0;
          predFin.forEach((e) => {
            max = Math.max(max, this.getDureeTache(e, allDateTot));
          });
          finDur = toDuration = max;
        }
      } else {
        if (pred === "deb") {
          to = task;
          toDuration = this.getDureeTache(task, allDateTot);
        }
        if (successeur == succArray) {
          to = successeur.length == 1 ? task : successeur;
          toDuration = this.getDureeTache(task, allDateTot);
        }
        if (predSucc != null && predSucc.length > 1) {
          to = predSucc;
        }
      }
      let isCritical = criticalPathData.includes(task);

      let dataPred = this.transormPred(task, predArray, arc, data);

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
        dateTard: this.getOptDate(dataPred, allDateTard),
        mapDateTard: allDateTard,
      });
    });

    return mappedData;
  }
  getCriticalData() {
    let arr = this.dataPrincipal;
    const tasks = this.getTacheCritique(arr);

    let i = 0;
    let linkIndex = [];

    let criticalData = [];

    this.mermaidData.forEach(({ task, from, to, isCritical, arc }) => {
      if (isCritical) {
        if (!criticalData.includes(task)) criticalData.push(task);
        if (!criticalData.includes(from)) criticalData.push(from);
        if (!criticalData.includes(to)) criticalData.push(to);
        if (Array.isArray(arc)) {
          this.getTachePredecesseur(task, arr).forEach((e) => {
            i += arc.length;
            if (tasks.includes(e)) {
              linkIndex.push(i);
            }
          });
        } else {
          linkIndex.push(i);
        }
      }
      i++;
    });
    return { criticalData, linkIndex };
  }
  getMermaidData() {
    return this.mermaidData;
  }
}
