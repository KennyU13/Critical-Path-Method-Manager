<template>
  <div class="container-fluid">
    <div class="">
      <div class="InsertionTableau">
        <div class="form-group d-flex align-items-center mb-5">
          <label for="usr" class="mb-2 fw-bold me-2"
            >Nouveau tableau de "A" à</label
          >
          <div class="d-flex">
            <input
              type="text"
              maxlength="1"
              class="form-control me-2"
              id="usr"
              v-model="tableEnd"
            />
            <!-- <button type="button" class="btn btn-outline-success btn-sm" @click="showTableFromInput()">nouveau</button> -->
          </div>
        </div>

        <div v-if="tableEnd.length" class="mb-5">
          <div class="d-flex flex-wrap justify-content-start">
            <div
              class="input-group mb-1 d-flex flex-column inputXX me-2"
              v-for="(tab, index) of newTab"
              :key="index"
            >
              <span class="text-secondary"
                >Tâche :<strong class="ms-2 text-uppercase text-primary">{{
                  tab[0]
                }}</strong></span
              >
              <div class="d-flex align-items-center mb-1">
                <span class="text-secondary me-2">Succ :</span>
                <input
                  type="text"
                  class="form-control inputNumber"
                  placeholder=""
                  v-model="newTab[index][2]"
                />
              </div>
              <div class="d-flex align-items-center mb-4">
                <span class="text-secondary me-2">Duré :</span>
                <input
                  class="form-control inputNumber"
                  v-model="newTab[index][1]"
                />
              </div>
            </div>
          </div>
          <div class="d-flex">
            <button
              type="button"
              class="btn btn-primary me-2"
              @click="showTableFromInput()"
            >
              Créer
            </button>
            <button
              type="button"
              class="btn btn-primary btn-sm"
              @click="showDefaultTable()"
            >
              Par défaut
            </button>
          </div>
        </div>
      </div>
      <div class="Tableauuu">
        <table class="table" v-if="tableau.length == 0">
          <thead>
            <tr>
              <th>Tâche</th>
              <th v-for="x of defaultTab" :key="x[0]">{{ x[0] }}</th>
            </tr>
          </thead>
          <tbody>
            <tr class="success">
              <td>Durée</td>
              <td v-for="x of defaultTab" :key="x[0]">{{ x[1] }}</td>
            </tr>
            <tr class="danger">
              <td>T.Suc.</td>
              <td v-for="x of defaultTab" :key="x[0]">{{ x[2].toString() }}</td>
            </tr>
          </tbody>
        </table>
        <table class="table" v-else>
          <thead>
            <tr>
              <th>Tâche</th>
              <th v-for="x of newTab" :key="x[0]">{{ x[0] }}</th>
            </tr>
          </thead>
          <tbody>
            <tr class="success">
              <td>Durée</td>
              <td v-for="x of newTab" :key="x[0]">{{ x[1] }}</td>
            </tr>
            <tr class="danger">
              <td>T.Suc.</td>
              <td v-for="x of newTab" :key="x[0]">{{ x[2].toString() }}</td>
            </tr>
          </tbody>
        </table>
        <button
          type="button"
          class="btn btn-success btn-sm my-3 me-3"
          @click="generate()"
        >
          Tracer le graph
        </button>

        <div ref="cpmContainer"></div>
      </div>
    </div>
  </div>
</template>
<script>
import mermaid from "mermaid";
import {
  mappedToMermaidData,
  getCriticalData,
  getTacheCritique,
  getTachePredecesseur,
  getOptDateArc,
} from "@/graph";
import {
  nodeShapeStart,
  linkNode,
  nodeShapeEnd,
  mermaidClassDef,
  applyStyle,
} from "@/graph/mermaidGraph";
import { test1, test2, test3 } from "@/data";
import mermaidConfig from "@/config/mermaidConfig";
import MermaidGraphBuilder from "@/graph/MermaidGraphBuilder";

export default {
  data() {
    return {
      mermaidConfig,
      mockAlphabet: "abcdefghijklmnopqrstuvwxyz",
      defaultTab: test1,
      allDateTot: [],
      newTab: [],
      tableau: [],
      tableEnd: "",
      mermaidCode: "",
      showGraph: false,
    };
  },
  mounted() {
    this.generate();
  },
  watch: {
    tableEnd(value) {
      if (value.length > 1) this.tableEnd = "";
      else {
        this.newTab = [];
        for (
          let index = 0;
          index < this.mockAlphabet.indexOf(value) + 1;
          index++
        ) {
          this.newTab.push([this.mockAlphabet[index], 0, ""]);
        }
      }
    },
  },
  methods: {
    showTableFromInput() {
      this.tableau = this.newTab;

      for (let tab of this.tableau) {
        tab[1] = parseInt(tab[1]);
        tab[2] = tab[2].toLowerCase();
        if (tab[2].length > 1 && tab[2].indexOf(",") > -1) {
          tab[2] = tab[2].split(",");
        }
      }
    },
    showDefaultTable() {
      this.tableau = this.newTab = [];
      this.tableEnd = "";
    },
    generateMermaidCode() {
      const tablePrincipale =
        this.tableau.length > 0 ? this.tableau : this.defaultTab;

      let mermaidData = mappedToMermaidData(tablePrincipale);
      let mermaidText = `graph LR; \n`;

      let incr = 0;
      let linkInfo = [];
      let tardArc = [];
      const tasks = getTacheCritique(tablePrincipale);
      // allDateTot
      mermaidData.forEach(
        ({
          task,
          linkDuration,
          from,
          to,
          arc,
          arcDur,
          fromDur,
          isCritical,
          dateTard,
          mapDateTard,
          finDur,
        }) => {
          incr++;
          let dateTot = fromDur;
          if (isCritical) linkInfo.push(incr);

          mermaidText += `${nodeShapeStart(from, dateTot, dateTard, isCritical)} ${linkNode(task, linkDuration)} ${nodeShapeEnd(to, dateTot, "", isCritical, finDur)} \n`;

          if (Array.isArray(arc)) {
            if (isCritical) {
              getTachePredecesseur(task, tablePrincipale).forEach((e) => {
                if (tasks.includes(e)) linkInfo.push(incr);
              });
            }
            tardArc.push();
            arc.forEach((from) => {
              incr++;
              let indexDuration = arc.indexOf(from);
              if (isCritical && Math.max(...arcDur) == arcDur[indexDuration])
                linkInfo.push(incr);
              mermaidText += `${nodeShapeStart(from, arcDur[indexDuration], getOptDateArc(from, mapDateTard), isCritical)} ${linkNode("")} ${nodeShapeEnd(task, Math.max(...arcDur), dateTard, isCritical)} \n`;
            });
          }
        }
      );
      linkInfo = linkInfo.map((value) => value - 1);
      linkInfo.push();

      mermaidText += mermaidClassDef.criticalStyle.style;

      const critData = getCriticalData(mermaidData, tablePrincipale);
      const node = critData.criticalData;

      // const linkIndex = critData.linkIndex;
      mermaidText += applyStyle(
        node,
        mermaidClassDef.criticalStyle.classDef,
        linkInfo
      );

      this.mermaidCode = mermaidText;
    },

    generate() {
      const tablePrincipale = this.tableau.length > 0 ? this.tableau : this.defaultTab;
      let mermaidGraph = new MermaidGraphBuilder(tablePrincipale)
      
      this.mermaidCode = "";
      this.showGraph = true;
      this.mermaidCode = mermaidGraph.getMermaidGraph()


      const container = this.$refs.cpmContainer;
      container.innerHTML = "";

      const mermaidEl = document.createElement("div");
      mermaidEl.className = "mermaidContainer";
      mermaidEl.innerHTML = this.mermaidCode;
      container.appendChild(mermaidEl);

      this.$nextTick(() => {
        mermaid.init(this.mermaidConfig, mermaidEl);
      });

    },
  },
};
</script>
<style scoped>
.form-control {
  max-width: 50px !important;
}
.inputXX {
  min-width: 140px !important;
  max-width: 140px !important;
}
.inputNumber {
  min-width: 70px !important;
  max-width: 70px !important;
}
.inputText {
  min-width: 110px !important;
  max-width: 110px !important;
}
.inputSpan {
  min-width: 40px !important;
  max-width: 40px !important;
}
.tMin {
  font-size: 45px !important;
}
</style>
