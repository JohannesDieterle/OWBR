/**
 * This function creates a zero matrix with a given height and width 
 * @param {number} height 
 * @param {number} width 
 * @returns {number[][]} 
 */
function matrix_zero(height, width) {
    let matrix = []
    for (let i = 0; i < height; i += 1) {
        let matrixRow = []
        for (let j = 0; j < width; j += 1) {
            matrixRow.push(0)
        }
        matrix.push(matrixRow)
    }
    return matrix
}

/**
 * This function returns the width of a matrix
 * @param {number[][]} matrix 
 * @returns {number}
 */
function matrix_width(matrix) {
    return matrix[0].length
}

/**
 * This function returns the height of a matrix
 * @param {number[][]} matrix 
 * @returns {number}
 */
function matrix_height(matrix) {
    return matrix.length
}

/**
 * This function returns the entrywise sum of two matrix
 * @param {number[][]} matrix1
 * @param {number[][]} matrix2
 * @returns {number[][]}
 */
function matrix_addition(matrix1, matrix2) {
    if (matrix_width(matrix1) != matrix_width(matrix2) && matrix_height(matrix1) != matrix_height(matrix2)) {
        throw "Matrix addition aborted! Two wrong sized matrix"
    }
    let matrix = []
    for (let i = 0; i < matrix_width(matrix1); i += 1) {
        let matrixRow = []
        for (let j = 0; j < matrix_height(matrix1); j += 1) {
            matrixRow.push(matrix1[i][j] + matrix2[i][j])
        }
        matrix.push(matrixRow)
    }
    return matrix
}

/**
 * This function expands the original matrix to the new width. The counter matrix describes the new position of the original matrix
 * @param {number[][]} og_matrix - e.g.: [[1, -1], [-1, 1]]
 * @param {number[]} counter_matrix - e.g.: [1, 2]
 * @param {number} matrix_width - e.g: 3
 * @returns {number[][]} - e.g: [[ 0, 0, 0 ], [ 0, 1, -1 ], [ 0, -1, 1 ]]
 */
function matrix_expand(og_matrix, counter_matrix, matrix_width) {
    let matrix = []
    for (let i = 0; i < matrix_width; i += 1) {
        let matrixRow = []
        for (let j = 0; j < matrix_width; j += 1) {
            if (counter_matrix.includes(i) && counter_matrix.includes(j)) {
                matrixRow.push(og_matrix[counter_matrix.indexOf(i)][counter_matrix.indexOf(j)])
            } else {
                matrixRow.push(0)
            }
        }
        matrix.push(matrixRow)
    }
    return matrix
}

/**
 * This function shuffels the original matrix in a new order
 * @param {number[][]} og_matrix - e.g.: [[1, 2], [3, 4]]
 * @param {number[]} new_order - e.g.: [1, 0]
 * @returns {number[][]} - e.g.: [[4, 3], [2, 1]]
 */
function matrix_shuffel(og_matrix, new_order) {
    if (og_matrix.length != og_matrix[0].length) {
        throw "The function 'matrix_shuffel' needs a matrix with the same height and width"
    }
    let matrix = matrix_zero(og_matrix.length, og_matrix[0].length)
    for (let i = 0; i < og_matrix.length; i += 1) {
        for (let j = 0; j < og_matrix[0].length; j += 1) {
            matrix[i][j] = og_matrix[new_order[i]][new_order[j]]
        }
    }
    return matrix
}

/**
 * This function creates the stiffness matrix and returns all points and the stiffness matrix
 * @param {number[]} e1_points 
 * @param {number[][]} e1_matrix 
 * @param {number[]} e2_points 
 * @param {number[][]} e2_matrix 
 */
function stiffness_matrix(e1_points, e1_matrix, e2_points, e2_matrix) {
    allPoints = e1_points.map((x) => x)

    for (let e2_point of e2_points) {
        let double = false
        for (let point of e1_points) {
            if (point.x == e2_point.x && point.y == e2_point.y) {
                double = true
                break
            }
        }
        if (!double) { allPoints.push(e2_point) }
    }

    let counter = 0
    let expand_counter_matrix_e1 = []
    let expand_counter_matrix_e2 = []
    let shuffel_matrix_e1 = []
    let shuffel_matrix_e2 = []
    for (let point of allPoints) {
        let e_counter = 0
        for (let e1_point of e1_points) {
            if (point.x == e1_point.x && point.y == e1_point.y) {
                expand_counter_matrix_e1.push(counter)
                shuffel_matrix_e1.push(e_counter)
                break
            }
            e_counter += 1
        }
        e_counter = 0
        for (let e2_point of e2_points) {
            if (point.x == e2_point.x && point.y == e2_point.y) {
                expand_counter_matrix_e2.push(counter)
                shuffel_matrix_e2.push(e_counter)
                break
            }
            e_counter += 1
        }
        counter += 1
    }


    e1_matrix = matrix_shuffel(e1_matrix, shuffel_matrix_e1)
    e2_matrix = matrix_shuffel(e2_matrix, shuffel_matrix_e2)

    e1_matrix = matrix_expand(e1_matrix, expand_counter_matrix_e1, allPoints.length)
    e2_matrix = matrix_expand(e2_matrix, expand_counter_matrix_e2, allPoints.length)

    let global_matrix = matrix_addition(e1_matrix, e2_matrix)

    return allPoints, global_matrix
}


class Component {
    constructor(x, y, width, height, lambda) {
        this.x1 = x
        this.x2 = x + width
        this.y1 = y
        this.y2 = y + height
        this.width = width
        this.height = height
        this.lambda = lambda
    }
}

class Element {
    constructor(x, y, elementWidth, elementHeight, lambda) {
        this.x1 = x
        this.x2 = x + elementWidth
        this.y1 = y
        this.y2 = y + elementHeight
        this.alpha = lambda / elementWidth // TODO: Change to include elementHeight

        this.points = [
            new Point(this.x1, this.y1),
            new Point(this.x2, this.y1),
            new Point(this.x1, this.y2),
            new Point(this.x2, this.y2)
        ]

        this.matrix = [
            [2 * this.alpha, -this.alpha, -this.alpha, 0],
            [-this.alpha, 2 * this.alpha, 0, -this.alpha],
            [-this.alpha, 0, 2 * this.alpha, -this.alpha],
            [0, -this.alpha, -this.alpha, 2 * this.alpha]
        ]
    }
}

class Point {
    constructor(x, y) {
        this.x = x
        this.y = y
        this.temperature = 0
        this.heatFlow = 0
        this.boundaryCondition = false
    }
}

class BoundaryCondition {
    constructor(x, y, width, height, temperature) {
        this.x = x
        this.y = y
        this.width = width
        this.height = height
        this.temperature = temperature
    }
}




let components = []
components.push(new Component(0, 0, 10, 10, 0.035))
components.push(new Component(10, 0, 10, 10, 2))

let boundaryConditions = []
let outsideTemperature = 0
let insideTemperature = 20
boundaryConditions.push(new BoundaryCondition(0, 0, 1, 500, outsideTemperature))
boundaryConditions.push(new BoundaryCondition(20, 0, 1, 500, insideTemperature))

// let components = []
// components.push(new Component(0, 0, 5, 10,  0.035))
// components.push(new Component(0, 10, 15, 5, 0.035))
// components.push(new Component(5, 0, 3, 10, 2))
// components.push(new Component(8, 7, 7, 3, 2))

// let boundaryConditions = []
// let outsideTemperature = 0
// let insideTemperature = 20
// boundaryConditions.push(new BoundaryCondition(0, 0, 1, 50, insideTemperature))
// boundaryConditions.push(new BoundaryCondition(0, 15, 50, 1, insideTemperature))
// boundaryConditions.push(new BoundaryCondition(8, 0, 1, 7, outsideTemperature))
// boundaryConditions.push(new BoundaryCondition(8, 7, 9, 1, outsideTemperature))

let elements = []
let elementWidth = 1
let elementHeigth = 1

for (let component of components) {
    for (y = component.y1; y < component.y2; y += 1) {
        for (x = component.x1; x < component.x2; x += 1) {
            elements.push(new Element(x, y, elementWidth, elementHeigth, component.lambda))
        }
    }
}

let allPoints = elements[0].points
let global_matrix = elements[0].matrix
for (let i = 1; i < elements.length; i += 1) {
    console.log("Element: " + i + " von: " + elements.length)
    allPoints, global_matrix = stiffness_matrix(allPoints, global_matrix, elements[i].points, elements[i].matrix)
}

for (let boundaryCondition of boundaryConditions) {
    for (let i = 0; i < allPoints.length; i += 1) {
        if (allPoints[i].x >= boundaryCondition.x && allPoints[i].x < boundaryCondition.width + boundaryCondition.x
            && allPoints[i].y >= boundaryCondition.y && allPoints[i].y < boundaryCondition.height + boundaryCondition.y
        ) {
            allPoints[i].temperature = boundaryCondition.temperature
            allPoints[i].heatFlow = 0
            allPoints[i].boundaryCondition = true
        }
    }
}


// Gauss-Seidel-Method to solve the linear equation
let iterations = 1000
for (let iteration = 0; iteration < iterations; iteration += 1) {
    console.log("Iteration: " + iteration + " of: " + iterations)
    for (let i = 0; i < allPoints.length; i += 1) {
        let sum = 0
        for (let j = 0; j < global_matrix[i].length; j += 1) {
            if (global_matrix[i][j] == 0 || i == j) {
                continue
            }
            sum += global_matrix[i][j] * allPoints[j].temperature
        }
        if (allPoints[i].boundaryCondition == true) {
            allPoints[i].heatFlow = global_matrix[i][i] * allPoints[i].temperature + sum
        } else {
            allPoints[i].temperature = 1 / global_matrix[i][i] * (allPoints[i].heatFlow - sum)
        }
    }
}

for (let point of allPoints) {
    if (point.y == 0) {
        console.log("x: " + point.x + " y: " + point.y + " T: " + ("  " + point.temperature.toFixed(1)).slice(-4) + " HF: " + ("  " + point.heatFlow.toFixed(1)).slice(-4) + " RB: " + point.boundaryCondition)
    }
}


// Paint results on canvas
let canvas = document.getElementById("canvas")
let context = canvas.getContext("2d")

let window_height = window.innerHeight
let window_width = window.innerWidth

canvas.height = window_height
canvas.width = window_width

canvas.style.backgroundColor = "#ff8"

for (let point of allPoints) {
    let middleTemperature = (insideTemperature-outsideTemperature)/2
    if (point.temperature <= middleTemperature) {
        context.fillStyle = `rgb(
            0
            ${Math.floor(point.temperature / middleTemperature * 255)}
            ${Math.floor(255 - point.temperature / middleTemperature * 255)})`;
    } else {
        context.fillStyle = `rgb(
            ${Math.floor((point.temperature-middleTemperature) / middleTemperature * 255)}
            ${Math.floor(255 - (point.temperature-middleTemperature) / middleTemperature * 255)}
            0)`;
    }
    context.fillRect(50 + point.x * 10, 50 + point.y * 10, 10, 10)
}
