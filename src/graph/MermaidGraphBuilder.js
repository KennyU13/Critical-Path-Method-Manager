import MermaidDataBuilder from "./MermaidDataBuilder";
import { applyStyle, linkNode, mermaidClassDef, nodeShapeEnd, nodeShapeStart } from "./mermaidGraph";

export default class MermaidGraphBuilder extends MermaidDataBuilder {
  constructor(dataPrincipal) {
    super(dataPrincipal);
    this.mermaidText = this.generateMermaidText();
  }

  generateMermaidText() {
    let mermData = this.mermaidData;
    let mermaidText = "graph LR; \n";

    let incr = 0;
    let linkInfo = [];
    let tardArc = [];
    const tasks = this.getTacheCritique();

    mermData.forEach(
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
            this.getTachePredecesseur(task, this.dataPrincipal).forEach((e) => {
              if (tasks.includes(e)) linkInfo.push(incr);
            });
          }
          tardArc.push();
          arc.forEach((from) => {
            incr++;
            let indexDuration = arc.indexOf(from);
            if (isCritical && Math.max(...arcDur) == arcDur[indexDuration])
              linkInfo.push(incr);
            mermaidText += `${nodeShapeStart(from, arcDur[indexDuration], this.getOptDateArc(from, mapDateTard), isCritical)} ${linkNode("")} ${nodeShapeEnd(task, Math.max(...arcDur), dateTard, isCritical)} \n`;
          });
        }
      }
    );
    linkInfo = linkInfo.map((value) => value - 1);
    linkInfo.push();
    mermaidText += mermaidClassDef.criticalStyle.style

    const critData = this.getCriticalData()
    const node = critData.criticalData

    mermaidText += applyStyle(
        node,
        mermaidClassDef.criticalStyle.classDef,
        linkInfo
      );

      return mermaidText
  }
  getMermaidGraph (){
    return this.mermaidText
  }
}
