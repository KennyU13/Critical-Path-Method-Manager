<template>
  <div class="container-fluid">
    <div class="">
      <div class="InsertionTableau">
        <div class="form-group d-flex align-items-center mb-5">
          <h5 for="usr" class="mb-2 fw-bold me-2"
            >Nouvelle tâche de <span class="text-danger display-7"> " a "</span> jusqu'au tache : </h5
          >
          <div class="d-flex">
            <input
              type="text"
              maxlength="1"
              class="form-control text-danger fw-bolder display-2 me-2"
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
                >Tâche :<strong class="ms-2 text-lowercase text-primary">{{
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
          <thead >
            <tr>
              <th class="text-success-virtual">Tâche</th>
              <th v-for="x of defaultTab" :key="x[0]" class="text-success-virtual">{{ x[0] }}</th>
            </tr>
          </thead>
          <tbody>
            <tr class="success">
              <td>Durée</td>
              <td v-for="x of defaultTab" :key="x[0]">{{ x[1] }}</td>
            </tr>
            <tr class="primary">
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
            <tr class="primary">
              <td>T.Suc.</td>
              <td v-for="x of newTab" :key="x[0]">{{ x[2].toString() }}</td>
            </tr>
          </tbody>
        </table>
        <button
          type="button"
          class="btn btn-success btn-sm my-3 me-3 d-flex align-items-center"
          @click="generate()"
        >
          Tracer le graph
          <span
            v-if="spin"
            class="spinner-border spinner-border-sm ms-2"
          ></span>
        </button>
        <div class="d-flex justify-content-center align-items-center">
          <span class="cpmLigne bg-secondary"></span><h2 class="mx-4">CPM</h2><span class="cpmLigne bg-secondary"></span>
        </div>        
        <div ref="cpmContainer" class="mt-5"></div>

      </div>
    </div>
  </div>
</template>
<script>
import mermaid from "mermaid";
import { test1, test2, test3 } from "@/data";
import mermaidConfig from "@/config/mermaidConfig";
import MermaidGraphBuilder from "@/graph/MermaidGraphBuilder";
import { generate } from "@vue/compiler-core";

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
      spin: true,
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
          let i = 0;
          i < this.mockAlphabet.indexOf(value.toLowerCase()) + 1;
          i++
        ) {
          this.newTab.push([this.mockAlphabet[i], 0, ""]);
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
    generate() {
      this.loadSpinner();
      setTimeout(() => {
        this.generateGraph()
      }, 500);
    },
    generateGraph() {
      const tablePrincipale =
        this.tableau.length > 0 ? this.tableau : this.defaultTab;
      let mermaidGraph = new MermaidGraphBuilder(tablePrincipale);

      this.mermaidCode = "";
      this.showGraph = true;
      this.mermaidCode = mermaidGraph.getMermaidGraph();

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
    loadSpinner() {
      this.spin = true;
      setTimeout(() => {
        this.spin = false;
      }, 500);
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
.cpmLigne{
  width: 30%;
  height: 2px;
}

</style>
