export function compact(ogMatrix) {
  let matrix = [];
  for (let i = 0; i < ogMatrix.length; i += 1) {
    let matrixRow = [];
    for (let j = 0; j < ogMatrix[1].length; j += 1) {
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
export function zeros(height, width) {
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
 * This function returns the entrywise sum of two matrix
 * @param {number[][]} matrix - e.g.: [[1, -1], [-1, -1]]
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
 * @param {number[][]} ogMatrix - e.g.: [[1, -1], [-1, -1]]
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
 * This function creates the stiffness matrix and returns all points and the stiffness matrix
 * @param {number[]} e1_points
 * @param {number[][]} e1_matrix
 * @param {number[]} e2_points
 * @param {number[][]} e2_matrix
 */
export function stiffness(e1_points, e1_matrix, e2_points, e2_matrix) {
  let allPoints = e1_points.map((x) => x);

  for (let e2_point of e2_points) {
    let double = false;
    for (let point of e1_points) {
      if (point.x == e2_point.x && point.y == e2_point.y) {
        double = true;
        break;
      }
    }
    if (!double) {
      allPoints.push(e2_point);
    }
  }

  let counter = 0;
  let expand_counterMatrix_e2 = [];
  for (let point of allPoints) {
    let e_counter = 0;
    for (let e2_point of e2_points) {
      if (point.x == e2_point.x && point.y == e2_point.y) {
        expand_counterMatrix_e2.push(counter);
        break;
      }
      e_counter += 1;
    }
    counter += 1;
  }

  e2_matrix = positioned(e2_matrix, expand_counterMatrix_e2);

  let global_matrix = addition(e1_matrix, e2_matrix);

  return [allPoints, global_matrix];
}
