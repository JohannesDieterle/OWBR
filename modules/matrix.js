// Variable for floatingpoint comparassion
const EPS = 1e-9;

export function compact(ogMatrix) {
  let matrix = [];
  for (let i = 0; i < ogMatrix.length; i += 1) {
    let matrixRow = [];
    for (let j = 0; j < ogMatrix[i].length; j += 1) {
      if (ogMatrix[i][j] == 0) {
        continue;
      }
      matrixRow.push([j, ogMatrix[i][j]]);
    }
    matrix.push(matrixRow);
  }
  return matrix;
}

/**
 * This function creates a zero matrix with a given height and width
 * @param {number} height
 * @param {number} width
 * @returns {number[][]}
 */
export function zeroes(height, width) {
  let matrix = [];
  for (let i = 0; i < height; i += 1) {
    let matrixRow = [];
    for (let j = 0; j < width; j += 1) {
      matrixRow.push(0);
    }
    matrix.push(matrixRow);
  }
  return matrix;
}

/**
 * This function creates a one matrix with a given height and width
 * @param {number} height
 * @param {number} width
 * @returns {number[][]}
 */
export function ones(height, width) {
  let matrix = [];
  for (let i = 0; i < height; i += 1) {
    let matrixRow = [];
    for (let j = 0; j < width; j += 1) {
      matrixRow.push(1);
    }
    matrix.push(matrixRow);
  }
  return matrix;
}

/**
 * This function returns the entrywise sum of two matrix
 * @param {number[][]} matrix - e.g.: [[1, -1], [-1, 1]]
 * @param {number[][]} positionedMatrix - e.g.: [[[1], [1, 1], [2, -1]], [[2], [1, -1], [2, 1]]]
 * @returns {number[][]}
 */
export function addition(matrix, positionedMatrix) {
  for (let i = 0; i < positionedMatrix.length; i += 1) {
    column: for (let j = 1; j < positionedMatrix[i].length; j += 1) {
      // if row from positionedMatrix doesnt exist in ogMatrix, add the first element
      if (typeof matrix[positionedMatrix[i][0]] === "undefined") {
        if (positionedMatrix[i][j][1] == 0) {
          continue;
        }
        matrix.push([positionedMatrix[i][j]]);
        continue;
      }
      for (let k = 0; k < matrix[positionedMatrix[i][0]].length; k += 1) {
        if (positionedMatrix[i][j][0] == matrix[positionedMatrix[i][0]][k][0]) {
          matrix[positionedMatrix[i][0]][k][1] += positionedMatrix[i][j][1];
          continue column;
        }
      }
      if (positionedMatrix[i][j][1] != 0) {
        matrix[positionedMatrix[i][0]].push(positionedMatrix[i][j]);
      }
    }
  }
  return matrix;
}

/**
 * This function positions a matrix to its new position so it can be added to another matrix
 * @param {number[][]} ogMatrix - e.g.: [[1, -1], [-1, 1]]
 * @param {number[]} counterMatrix - e.g.: [79, 80]
 * @returns {number[][][]} - e.g.: [[[79], [79, 1], [80, -1]], [[80], [79, -1], [80, 1]]]
 */
export function positioned(ogMatrix, counterMatrix) {
  let positionMatrix = [];
  for (let i = 0; i < counterMatrix.length; i += 1) {
    let matrixRow = [];
    matrixRow.push(counterMatrix[i]);
    for (let j = 0; j < counterMatrix.length; j += 1) {
      matrixRow.push([counterMatrix[j], ogMatrix[i][j]]);
    }
    positionMatrix.push(matrixRow);
  }
  return positionMatrix;
}

/**
 * Fügt die lokale Steifigkeitsmatrix eines neuen Elements in die globale
 * Steifigkeitsmatrix ein (Assembling-Schritt der FEM). Funktion ist KI generiert - langsameres original vom Kommit 29.11.2024
 *
 * @param {Point[]} e1_points   - Alle Punkte die bisher in der globalen Matrix sind
 * @param {number[][][]} e1_matrix  - Die bisherige globale Steifigkeitsmatrix (kompaktes Format)
 * @param {Point[]} e2_points   - Die 3 Punkte des neuen Elements (lokale Punkte)
 * @param {number[][]} e2_matrix    - Die 3x3 lokale Steifigkeitsmatrix des neuen Elements
 * @returns {[Point[], number[][][]]} - Aktualisierte Punktliste und globale Steifigkeitsmatrix
 */
export function stiffness(e1_points, e1_matrix, e2_points, e2_matrix) {
  // Kopie der bisherigen Punktliste erstellen, damit das Original nicht verändert wird
  let allPoints = e1_points.map((x) => x);

  // Map aufbauen: Koordinaten → Index in allPoints
  // Ermöglicht O(1)-Lookup statt O(n)-Suche
  const pointMap = new Map();
  for (let [i, p] of allPoints.entries()) {
    pointMap.set(p.x * 1_000_000 + p.y, i);
  }

  // Neue Punkte des Elements zur globalen Punktliste hinzufügen,
  // falls sie noch nicht vorhanden sind (gemeinsame Knoten werden nicht doppelt eingefügt)
  for (let e2_point of e2_points) {
    const key = e2_point.x * 1_000_000 + e2_point.y;
    if (!pointMap.has(key)) {
      pointMap.set(key, allPoints.length);
      allPoints.push(e2_point);
    }
  }

  // Mapping: lokaler Index (0,1,2) → globaler Index in allPoints
  // z.B. [0, 1, 2] → [42, 7, 103] bedeutet:
  // lokaler Punkt 0 ist globaler Punkt 42, usw.
  const expand_counterMatrix_e2 = e2_points.map((p) =>
    pointMap.get(p.x * 1_000_000 + p.y),
  );

  // Lokale 3x3 Matrix in die richtige Position der globalen Matrix bringen
  // aus z.B. [[k00, k01], [k10, k11]] wird eine positionierte Matrix
  // die weiß, in welche Zeilen/Spalten der globalen Matrix die Werte gehören
  e2_matrix = positioned(e2_matrix, expand_counterMatrix_e2);

  // Positionierte lokale Matrix zur globalen Matrix addieren
  let global_matrix = addition(e1_matrix, e2_matrix);

  return [allPoints, global_matrix];
}

// function getDistance(p1, p2) {
//   return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
// }

export function get(element) {
  const points = element.points;
  if (points.length !== 3) {
    throw new Error("Element must have exactly 3 points for 2D FEM");
  }

  const p1 = points[0],
    p2 = points[1],
    p3 = points[2];

  // Calculate area using cross product

  const A =
    0.5 *
    Math.abs((p2.x - p1.x) * (p3.y - p1.y) - (p3.x - p1.x) * (p2.y - p1.y));
  if (A < EPS) {
    throw new Error("Degenerate triangle");
  }

  // Calculate b and c coefficients
  const b1 = p2.y - p3.y;
  const c1 = p3.x - p2.x;
  const b2 = p3.y - p1.y;
  const c2 = p1.x - p3.x;
  const b3 = p1.y - p2.y;
  const c3 = p2.x - p1.x;

  // Local stiffness matrix
  const factor = element.lambda / (4 * A);
  const elementMatrix = [
    [
      factor * (b1 * b1 + c1 * c1),
      factor * (b1 * b2 + c1 * c2),
      factor * (b1 * b3 + c1 * c3),
    ],
    [
      factor * (b2 * b1 + c2 * c1),
      factor * (b2 * b2 + c2 * c2),
      factor * (b2 * b3 + c2 * c3),
    ],
    [
      factor * (b3 * b1 + c3 * c1),
      factor * (b3 * b2 + c3 * c2),
      factor * (b3 * b3 + c3 * c3),
    ],
  ];

  return elementMatrix;
}
