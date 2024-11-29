import * as matrix from "/modules/matrix.js";
import { Element, BoundaryConditionPoint } from "/modules/CaB.js";
import { calculate_elements } from "/modules/delaunyTriangulation.js";

function calculate_stiffnessmatrix(elements, boundaryConditions) {
  let allPoints = elements[0].points;
  let globalMatrix = matrix.compact(matrix.get(elements[0]));
  for (let i = 1; i < elements.length; i += 1) {
    [allPoints, globalMatrix] = matrix.stiffness(
      allPoints,
      globalMatrix,
      elements[i].points,
      matrix.get(elements[i])
    );
    if (i % 100 == 0) {
      console.log("Element: " + i + " of: " + elements.length);
    }
  }

  for (let boundaryCondition of boundaryConditions) {
    allPoints.push(new BoundaryConditionPoint(boundaryCondition.temperature));
    for (let i = 0; i < allPoints.length; i += 1) {
      if (
        allPoints[i].x >= boundaryCondition.x &&
        allPoints[i].x < boundaryCondition.width + boundaryCondition.x &&
        allPoints[i].y >= boundaryCondition.y &&
        allPoints[i].y < boundaryCondition.height + boundaryCondition.y
      ) {
        globalMatrix = matrix.addition(
          globalMatrix,
          matrix.positioned(boundaryCondition.matrix, [i, allPoints.length - 1])
        );
      }
    }
  }

  console.log("Boundaryconditions added to stiffnessmatrix");
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
      let convergence = 0;
      for (let point of allPoints) {
        convergence += point.temperature;
      }
      convergence /= allPoints.length;
      let dif =
        convergence > lastConvergence
          ? convergence - lastConvergence
          : lastConvergence - convergence;
      lastConvergence = convergence;
      console.log(
        `Iteration: ${iteration}, convergence: ${Math.floor(dif * 10e4)}`
      );
      // show_calculation(allPoints, components);
      if (dif < 10e-6) {
        break;
      }
    }
  }

  console.log("Linearequation calculation complete!");
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
    boundaryConditions
  );

  allPoints = calculate_linearequation(allPoints, globalMatrix, components);

  return [allPoints, components];
}
