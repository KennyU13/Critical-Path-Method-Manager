import { pushOrRemove } from "@/utils/arrayUtils";
import { isProxy } from "vue";

export default class TaskMethod {
  getDureeTache(task, arr) {
    if (task == "deb") return 0;
    for (let tab of arr) {
      if (task == tab[0]) return tab[1];
    }
  }
  getTacheSuccesseur(task, arr) {
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
  getTachePredecesseur(task, arr) {
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
  getTacheCheminC(task, arr) {
    let preTab = [];
    if (typeof task == "object") return this.getMaxPred(task, arr);
    if (task == "fin") {
      for (let tab of arr) {
        if (tab[2] == "fin") preTab.push(tab[0]);
      }
      return this.getMaxPred(preTab, arr);
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
        return this.getMaxPred(preTab, arr);
      }
    }
  }
  getMaxPred(arrData, arr) {
    let taskMax = "";
    let max = 0;

    for (let index in arrData) {
      if (max <= this.getDureeTache(arrData[index], arr)) {
        max = this.getDureeTache(arrData[index], arr);
        taskMax = arrData[index];
      }
    }
    return taskMax;
  }
  transormPred(task, pred, arc, arr) {
    if (Array.isArray(arc)) return task;

    if (pred.length > 1) return [...pred];
    if (pred.length == 1) {
      let predecessor = this.getTachePredecesseur(pred, arr);
      let successor = this.getTacheSuccesseur(pred, arr);
      if (Array.isArray(predecessor)) return pred;
      else return successor;
    }
  }
  getMaxFin(arr) {
    let max = 0;
    arr.forEach(([, duration, successeur]) => {
      if (successeur == "fin" && max <= duration) {
        max = duration;
      }
    });
    return max;
  }
  getOptDateArc(task, mapDateTard) {
    let tab = [];
    task.split("").forEach((e) => {
      tab.push(mapDateTard.get(e));
    });
    return Math.min(...tab);
  }
  getOptDate(data, mapDateTard) {
    if (Array.isArray(data)) {
      let tab = [];
      data.forEach((e) => {
        tab.push(mapDateTard.get(e));
      });
      return tab;
    }
    return mapDateTard.get(data);
  }

  getPredecessorValue(task, arr) {
    return !Array.isArray(this.getTachePredecesseur(task, arr))
      ? this.getTachePredecesseur(task, arr)
      : this.getTachePredecesseur(task, arr).join("");
  }
  getPredecessorArrayValue(task, arr) {
    if (!Array.isArray(this.getTachePredecesseur(task, arr))) {
      return !Array.isArray(
        this.getTacheSuccesseur(this.getTachePredecesseur(task, arr), arr)
      )
        ? this.getTachePredecesseur(task, arr)
        : this.getTacheSuccesseur(
            this.getTachePredecesseur(task, arr),
            arr
          ).join("");
    } else {
      let x = [];
      this.getTachePredecesseur(task, arr).forEach((element) => {
        !isProxy(this.getTacheSuccesseur(element, arr))
          ? pushOrRemove(this.getTacheSuccesseur(element, arr), x)
          : this.getTacheSuccesseur(element, arr).forEach((e) => {
              pushOrRemove(e, x);
            });
      });
      return x.join("");
    }
  }
  getPredecessorWithSuccessor(successor, arr) {
    return !Array.isArray(this.getTachePredecesseur(successor, arr))
      ? null
      : this.getTachePredecesseur(successor, arr).join("");
  }
  getSuccessorArray(successor, arr) {
    return !Array.isArray(this.getTacheSuccesseur(successor, arr))
      ? successor
      : this.getTacheSuccesseur(successor, arr).join("");
  }
  getArcFictif(elem, arr, allDateTot) {
    let arcVal = Array.isArray(this.getTacheSuccesseur(elem, arr))
      ? this.getTacheSuccesseur(elem, arr).join("")
      : this.getTacheSuccesseur(elem, arr);
    let arcDur = this.getDureeTache(elem, allDateTot)

    return {
      arcVal, arcDur
    }
  }
}
