import { pushOrRemove } from "@/utils/arrayUtils";
import { isProxy } from "vue";

export default class TaskMethod {
  toSuccessorList(successor) {
    if (successor == null || successor === "" || successor === "fin") return [];
    if (Array.isArray(successor)) return successor;
    return successor.length > 1 ? [...successor] : [successor];
  }

  buildSchedule(data) {
    const tasks = new Map();
    const successors = new Map();
    const predecessors = new Map();

    data.forEach(([task, duration, successor]) => {
      if (!task) throw new Error("Chaque tache doit avoir un nom.");
      if (tasks.has(task)) throw new Error(`Tache dupliquee: ${task}`);

      const numericDuration = Number(duration);
      if (!Number.isFinite(numericDuration) || numericDuration < 0) {
        throw new Error(`Duree invalide pour la tache ${task}.`);
      }

      tasks.set(task, numericDuration);
      successors.set(task, this.toSuccessorList(successor));
      predecessors.set(task, []);
    });

    successors.forEach((taskSuccessors, task) => {
      taskSuccessors.forEach((successor) => {
        if (!tasks.has(successor)) {
          throw new Error(`Successeur inconnu "${successor}" pour la tache ${task}.`);
        }
        predecessors.get(successor).push(task);
      });
    });

    const incomingCount = new Map(
      Array.from(predecessors, ([task, taskPredecessors]) => [
        task,
        taskPredecessors.length,
      ])
    );
    const queue = Array.from(incomingCount)
      .filter(([, count]) => count === 0)
      .map(([task]) => task);
    const order = [];

    while (queue.length) {
      const task = queue.shift();
      order.push(task);

      successors.get(task).forEach((successor) => {
        const nextCount = incomingCount.get(successor) - 1;
        incomingCount.set(successor, nextCount);
        if (nextCount === 0) queue.push(successor);
      });
    }

    if (order.length !== tasks.size) {
      throw new Error("Le graphe CPM contient un cycle.");
    }

    const earliestStart = new Map();
    const earliestFinish = new Map();

    order.forEach((task) => {
      const start = Math.max(
        0,
        ...predecessors.get(task).map((predecessor) => earliestFinish.get(predecessor))
      );
      earliestStart.set(task, start);
      earliestFinish.set(task, start + tasks.get(task));
    });

    const terminalTasks = Array.from(successors)
      .filter(([, taskSuccessors]) => taskSuccessors.length === 0)
      .map(([task]) => task);
    const projectDuration = Math.max(
      0,
      ...terminalTasks.map((task) => earliestFinish.get(task))
    );

    const latestFinish = new Map();
    const latestStart = new Map();

    [...order].reverse().forEach((task) => {
      const taskSuccessors = successors.get(task);
      const finish = taskSuccessors.length
        ? Math.min(...taskSuccessors.map((successor) => latestStart.get(successor)))
        : projectDuration;

      latestFinish.set(task, finish);
      latestStart.set(task, finish - tasks.get(task));
    });

    const criticalTasks = order.filter(
      (task) => latestStart.get(task) === earliestStart.get(task)
    );

    return {
      tasks,
      successors,
      predecessors,
      order,
      earliestStart,
      earliestFinish,
      latestStart,
      latestFinish,
      projectDuration,
      criticalTasks,
    };
  }

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
