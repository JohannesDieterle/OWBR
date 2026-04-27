import * as matrix from "./matrix.js";
import { Element, BoundaryConditionPoint } from "./CaB.js";
import { calculate_elements } from "./delaunayTriangulation.js";

function calculate_stiffnessmatrix(elements, boundaryConditions) {
  const t0 = performance.now();
  let allPoints = [...elements[0].points];
  let globalMatrix = matrix.compact(matrix.get(elements[0]));
  for (let i = 1; i < elements.length; i += 1) {
    [allPoints, globalMatrix] = matrix.stiffness(
      allPoints,
      globalMatrix,
      elements[i].points,
      matrix.get(elements[i]),
    );
    if (i % 100 == 0) {
      console.log("Element: " + i + " of: " + elements.length);
      postMessage("Element: " + i + " of: " + elements.length);
    }
  }

  // for (let boundaryCondition of boundaryConditions) {
  //   const bcIndex = allPoints.length;
  //   allPoints.push(new BoundaryConditionPoint(boundaryCondition.temperature));
  //   for (let i = 0; i < bcIndex; i += 1) {
  //     const xMin = Math.min(boundaryCondition.xStart, boundaryCondition.xEnd);
  //     const xMax = Math.max(boundaryCondition.xStart, boundaryCondition.xEnd);
  //     const yMin = Math.min(boundaryCondition.yStart, boundaryCondition.yEnd);
  //     const yMax = Math.max(boundaryCondition.yStart, boundaryCondition.yEnd);
  //     if (
  //       allPoints[i].x >= xMin &&
  //       allPoints[i].x <= xMax &&
  //       allPoints[i].y >= yMin &&
  //       allPoints[i].y <= yMax
  //     ) {
  //       globalMatrix = matrix.addition(
  //         globalMatrix,
  //         matrix.positioned(boundaryCondition.matrix, [i, bcIndex]),
  //       );
  //     }
  //   }
  // }
  for (let boundaryCondition of boundaryConditions) {
    const xMin = Math.min(boundaryCondition.xStart, boundaryCondition.xEnd);
    const xMax = Math.max(boundaryCondition.xStart, boundaryCondition.xEnd);
    const yMin = Math.min(boundaryCondition.yStart, boundaryCondition.yEnd);
    const yMax = Math.max(boundaryCondition.yStart, boundaryCondition.yEnd);

    // Alle Randpunkte auf dieser Randbedingung finden und sortieren
    let bcPoints = [];
    for (let i = 0; i < allPoints.length; i++) {
      if (
        allPoints[i].x >= xMin &&
        allPoints[i].x <= xMax &&
        allPoints[i].y >= yMin &&
        allPoints[i].y <= yMax
      ) {
        bcPoints.push({ index: i, point: allPoints[i] });
      }
    }

    // Punkte entlang der Kante sortieren (nach x oder y je nach Orientierung)
    const isHorizontal = Math.abs(yMax - yMin) < 1e-9;
    bcPoints.sort((a, b) =>
      isHorizontal ? a.point.x - b.point.x : a.point.y - b.point.y,
    );

    // Für jedes Segment zwischen zwei benachbarten Randpunkten
    for (let k = 0; k < bcPoints.length - 1; k++) {
      const i = bcPoints[k].index;
      const j = bcPoints[k + 1].index;
      const p1 = bcPoints[k].point;
      const p2 = bcPoints[k + 1].point;

      // Länge des Segments
      const L = Math.sqrt(
        Math.pow((p2.x - p1.x) / 100, 2) + Math.pow((p2.y - p1.y) / 100, 2),
      );

      // Konvektionsmatrix: (alpha * L / 6) * [[2, 1], [1, 2]]
      // wird zur globalen Steifigkeitsmatrix addiert
      const a = boundaryCondition.alpha;
      const convMatrix = [
        [(a * L) / 3, (a * L) / 6],
        [(a * L) / 6, (a * L) / 3],
      ];
      globalMatrix = matrix.addition(
        globalMatrix,
        matrix.positioned(convMatrix, [i, j]),
      );

      // Konvektionslastvektor: (alpha * L * T_umgebung / 2) * [1, 1]
      // wird zum heatFlow der Randpunkte addiert (rechte Seite des LGS)
      const f = (a * L * boundaryCondition.temperature) / 2;
      allPoints[i].heatFlow += f;
      allPoints[j].heatFlow += f;
    }
  }

  console.log("Boundaryconditions added to stiffnessmatrix");
  postMessage("Boundaryconditions added to stiffnessmatrix");
  const t1 = performance.now();
  console.log(`Stiffness: ${t1 - t0}ms`);
  return [allPoints, globalMatrix];
}

function calculate_linearequation(allPoints, globalMatrix, components) {
  // Gauss-Seidel-Method to solve the linear equation
  let lastConvergence = 0;
  for (let iteration = 0; true; iteration += 1) {
    for (let i = 0; i < allPoints.length; i += 1) {
      let sum = 0;
      let diagonal = 0;
      for (let j = 0; j < globalMatrix[i].length; j += 1) {
        if (globalMatrix[i][j][0] == i) {
          diagonal = globalMatrix[i][j][1];
        } else {
          sum +=
            globalMatrix[i][j][1] *
            allPoints[globalMatrix[i][j][0]].temperature;
        }
      }
      if (allPoints[i].boundaryCondition == true) {
        allPoints[i].heatFlow = diagonal * allPoints[i].temperature + sum;
      } else {
        allPoints[i].temperature =
          (1 / diagonal) * (allPoints[i].heatFlow - sum);
      }
    }

    if (iteration % 100 == 0) {
      let maxDiff = 0;
      for (let point of allPoints) {
        const diff = Math.abs(
          point.temperature - (point._lastTemp ?? point.temperature),
        );
        if (diff > maxDiff) maxDiff = diff;
        point._lastTemp = point.temperature;
      }
      console.log(`Iteration: ${iteration}, maxDiff: ${maxDiff}`);
      postMessage(`Iteration: ${iteration}, maxDiff: ${maxDiff}`);
      if (maxDiff < 1e-6 && iteration > 100) break;
    }
  }

  console.log("Linearequation calculation complete!");
  postMessage("Linearequation calculation complete!");
  return allPoints;
}

export function calculate_thermal_bridge(components, boundaryConditions) {
  // Create all elements from the components
  let elements = [];
  if (components[0].elements.length == 0) {
    elements = calculate_elements(components);
  } else {
    for (const component of components) {
      for (const element of component.elements) {
        elements.push(element);
      }
    }
  }

  // Get stiffnessmatrix
  let [allPoints, globalMatrix] = calculate_stiffnessmatrix(
    elements,
    boundaryConditions,
  );

  allPoints = calculate_linearequation(allPoints, globalMatrix, components);

  // Wärmestrom berechnen
  const heatflows = calculate_heatflow(allPoints, boundaryConditions);

  return [allPoints, components, heatflows];
}

function calculate_heatflow(allPoints, boundaryConditions) {
  const results = [];

  for (const boundaryCondition of boundaryConditions) {
    const xMin = Math.min(boundaryCondition.xStart, boundaryCondition.xEnd);
    const xMax = Math.max(boundaryCondition.xStart, boundaryCondition.xEnd);
    const yMin = Math.min(boundaryCondition.yStart, boundaryCondition.yEnd);
    const yMax = Math.max(boundaryCondition.yStart, boundaryCondition.yEnd);

    // Randpunkte finden und sortieren (gleiche Logik wie in calculate_stiffnessmatrix)
    let bcPoints = [];
    for (let i = 0; i < allPoints.length; i++) {
      if (
        allPoints[i].x >= xMin &&
        allPoints[i].x <= xMax &&
        allPoints[i].y >= yMin &&
        allPoints[i].y <= yMax
      ) {
        bcPoints.push({ index: i, point: allPoints[i] });
      }
    }

    const isHorizontal = Math.abs(yMax - yMin) < 1e-9;
    bcPoints.sort((a, b) =>
      isHorizontal ? a.point.x - b.point.x : a.point.y - b.point.y,
    );

    // Wärmestrom über alle Segmente summieren
    let Q = 0;
    for (let k = 0; k < bcPoints.length - 1; k++) {
      const p1 = bcPoints[k].point;
      const p2 = bcPoints[k + 1].point;

      const L = Math.sqrt(
        Math.pow((p2.x - p1.x) / 100, 2) + Math.pow((p2.y - p1.y) / 100, 2),
      );

      // Mittlere Temperatur der zwei Knoten
      const T_surface = (p1.temperature + p2.temperature) / 2;
      const T_umgebung = boundaryCondition.temperature;

      Q += boundaryCondition.alpha * L * (T_umgebung - T_surface);
    }

    results.push({
      temperature: boundaryCondition.temperature,
      Q_W_per_m: Q, // Wärmestrom in W/m (pro Meter Tiefe)
    });

    console.log(
      `Randbedingung T=${boundaryCondition.temperature}°C: Q = ${Q.toFixed(4)} W/m`,
    );
    postMessage(
      `Randbedingung T=${boundaryCondition.temperature}°C: Q = ${Q.toFixed(4)} W/m`,
    );
  }
  // Temperaturen für innen und außen finden
  let T_innen = null;
  let T_aussen = null;
  let Q_innen = 0;
  let Q_aussen = 0;

  for (const result of results) {
    if (result.temperature > 0) {
      T_innen = result.temperature;
      Q_innen += result.Q_W_per_m;
    } else {
      T_aussen = result.temperature;
      Q_aussen += result.Q_W_per_m;
    }
  }

  // L2D berechnen
  // Q_innen und Q_aussen sollten gleich groß sein – Mittelwert für Genauigkeit
  const Q_mittel = (Q_innen - Q_aussen) / 2;
  const L2D = Q_mittel / (T_innen - T_aussen);

  console.log(`Q_innen:  ${Q_innen.toFixed(4)} W/m`);
  console.log(`Q_aussen: ${Q_aussen.toFixed(4)} W/m`);
  console.log(`L2D:      ${L2D.toFixed(6)} W/mK`);
  postMessage(`L2D = ${L2D.toFixed(6)} W/mK`);

  // return { results, L2D, Q_innen, Q_aussen };
  return results;
}

onmessage = (e) => {
  let components, boundaryConditions;
  [components, boundaryConditions] = e.data;
  const results = calculate_thermal_bridge(components, boundaryConditions);
  postMessage(results);
};
