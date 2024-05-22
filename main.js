function matrix_compact(ogMatrix) {
    let matrix = []
    for (let i = 0; i < ogMatrix.length; i += 1) {
        let matrixRow = []
        for (let j = 0; j < ogMatrix[1].length; j += 1) {
            if (ogMatrix[i][j] == 0) {
                continue
            }
            matrixRow.push([j, ogMatrix[i][j]])
        }
        matrix.push(matrixRow)
    }
    return matrix
}


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
 * This function returns the entrywise sum of two matrix
 * @param {number[][]} matrix - e.g.: [[1, -1], [-1, -1]]
 * @param {number[][]} positionedMatrix - e.g.: [[[1], [1, 1], [2, -1]], [[2], [1, -1], [2, 1]]]
 * @returns {number[][]}
 */
function matrix_addition(matrix, positionedMatrix) {
    for (let i = 0; i < positionedMatrix.length; i += 1) {
        column: for (let j = 1; j < positionedMatrix[i].length; j += 1) {
            // if row from positionedMatrix doesnt exist in ogMatrix, add the first element
            if (typeof matrix[positionedMatrix[i][0]] === "undefined") {
                if (positionedMatrix[i][j][1] == 0) { continue }
                matrix.push([positionedMatrix[i][j]])
                continue
            }
            for (let k = 0; k < matrix[positionedMatrix[i][0]].length; k += 1) {
                if (positionedMatrix[i][j][0] == matrix[positionedMatrix[i][0]][k][0]) {
                    matrix[positionedMatrix[i][0]][k][1] += positionedMatrix[i][j][1]
                    continue column
                }
            }
            if (positionedMatrix[i][j][1] != 0) {
                matrix[positionedMatrix[i][0]].push(positionedMatrix[i][j])
            }
        }
    }
    return matrix
}


/**
 * This function positions a matrix to its new position so it can be added to another matrix
 * @param {number[][]} ogMatrix - e.g.: [[1, -1], [-1, -1]]
 * @param {number[]} counterMatrix - e.g.: [79, 80]
 * @returns {number[][][]} - e.g.: [[[79], [79, 1], [80, -1]], [[80], [79, -1], [80, 1]]]
 */
function matrix_positioned(ogMatrix, counterMatrix) {
    let positionMatrix = []
    for (let i = 0; i < counterMatrix.length; i += 1) {
        let matrixRow = []
        matrixRow.push(counterMatrix[i])
        for (let j = 0; j < counterMatrix.length; j += 1) {
            matrixRow.push([counterMatrix[j], ogMatrix[i][j]])
        }
        positionMatrix.push(matrixRow)
    }
    return positionMatrix
}


/**
 * This function creates the stiffness matrix and returns all points and the stiffness matrix
 * @param {number[]} e1_points 
 * @param {number[][]} e1_matrix 
 * @param {number[]} e2_points 
 * @param {number[][]} e2_matrix 
 */
function stiffness_matrix(e1_points, e1_matrix, e2_points, e2_matrix) {
    let allPoints = e1_points.map((x) => x)

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
    let expand_counterMatrix_e2 = []
    for (let point of allPoints) {
        let e_counter = 0
        for (let e2_point of e2_points) {
            if (point.x == e2_point.x && point.y == e2_point.y) {
                expand_counterMatrix_e2.push(counter)
                break
            }
            e_counter += 1
        }
        counter += 1
    }


    e2_matrix = matrix_positioned(e2_matrix, expand_counterMatrix_e2)

    let global_matrix = matrix_addition(e1_matrix, e2_matrix)

    return [allPoints, global_matrix]
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
        this.temperature = 10
        this.heatFlow = 0
    }
}

class BoundaryConditionPoint {
    constructor(temperature) {
        this.temperature = temperature
        this.heatFlow = 0
        this.boundaryCondition = true
    }
}

class BoundaryCondition {
    constructor(x, y, width, height, condition) {
        this.x = x
        this.y = y
        this.width = width
        this.height = height
        if (condition == 0) {
            this.temperature = 20
            this.alpha = 0.19
        } else if (condition == 1) {
            this.temperature = 0
            this.alpha = 0.04
        }

        this.matrix = [
            [this.alpha, -this.alpha],
            [-this.alpha, this.alpha]
        ]
    }
}


/**
 * This function calculates the thermal bridge and returns all points and their temperature
 * @param {*} components 
 * @param {*} boundaryConditions 
 */
function calculate_thermal_bridge(components, boundaryConditions) {
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
    let globalMatrix = matrix_compact(elements[0].matrix)
    for (let i = 1; i < elements.length; i += 1) {
        [allPoints, globalMatrix] = stiffness_matrix(allPoints, globalMatrix, elements[i].points, elements[i].matrix)
        if (i % 100 == 0) {
            console.log("Element: " + i + " of: " + elements.length)
        }
    }
    console.log("Stiffness matrix set up!")


    for (let boundaryCondition of boundaryConditions) {
        allPoints.push(new BoundaryConditionPoint(boundaryCondition.temperature))
        for (let i = 0; i < allPoints.length; i += 1) {
            if (allPoints[i].x >= boundaryCondition.x && allPoints[i].x < boundaryCondition.width + boundaryCondition.x
                && allPoints[i].y >= boundaryCondition.y && allPoints[i].y < boundaryCondition.height + boundaryCondition.y
            ) {
                globalMatrix = matrix_addition(globalMatrix, matrix_positioned(boundaryCondition.matrix, [i, allPoints.length - 1]))
            }
        }
    }
    console.log("Boundary conditions set up!")

    // Gauss-Seidel-Method to solve the linear equation
    let iterations = 10000 // TODO: iterate as long as needed
    for (let iteration = 0; iteration < iterations; iteration += 1) {
        for (let i = 0; i < allPoints.length; i += 1) {
            let sum = 0
            let diagonal = 0
            for (let j = 0; j < globalMatrix[i].length; j += 1) {
                if (globalMatrix[i][j][0] == i) {
                    diagonal = globalMatrix[i][j][1]
                } else {
                    sum += globalMatrix[i][j][1] * allPoints[globalMatrix[i][j][0]].temperature
                }
            }
            if (allPoints[i].boundaryCondition == true) {
                allPoints[i].heatFlow = diagonal * allPoints[i].temperature + sum
            } else {
                allPoints[i].temperature = 1 / diagonal * (allPoints[i].heatFlow - sum)
            }
        }

        if (iteration % 100 == 0) {
            console.log("Iteration: " + iteration + " of: " + iterations)
        }
    }
    console.log("Calculations complete!")

    return allPoints
}


/*---------------------- components and boundaryConditions ----------------------*/

let components = []
components.push(new Component(80, 0, 20, 90, 2.1))
components.push(new Component(0, 90, 200, 20, 2.1))
components.push(new Component(80, 110, 20, 90, 2.1))
components.push(new Component(100, 0, 20, 90, 0.035))
components.push(new Component(100, 110, 20, 90, 0.035))

let boundaryConditions = []
let outside = 1
let inside = 0
boundaryConditions.push(new BoundaryCondition(80, 0, 1, 90, inside))
boundaryConditions.push(new BoundaryCondition(0, 90, 80, 1, inside))
boundaryConditions.push(new BoundaryCondition(0, 110, 80, 1, inside))
boundaryConditions.push(new BoundaryCondition(80, 110, 1, 90, inside))
boundaryConditions.push(new BoundaryCondition(120, 0, 1, 90, outside))
boundaryConditions.push(new BoundaryCondition(120, 90, 80, 1, outside))
boundaryConditions.push(new BoundaryCondition(120, 110, 1, 90, outside))
boundaryConditions.push(new BoundaryCondition(120, 110, 80, 1, outside))

/*---------------------- components and boundaryConditions ----------------------*/

let allPoints = calculate_thermal_bridge(components, boundaryConditions)



// Paint results on canvas
let canvas = document.getElementById("canvas")
let context = canvas.getContext("2d")

let window_height = window.innerHeight
let window_width = window.innerWidth

canvas.height = window_height
canvas.width = window_width

canvas.style.backgroundColor = "#ff8"

for (let point of allPoints) {
    if (typeof point.boundaryCondition == true) { continue }
    let middleTemperature = (20 - 0) / 2 // TODO: change to temperatures used in calculation
    if (point.temperature <= middleTemperature) {
        context.fillStyle = `rgb(
            0
            ${Math.floor(point.temperature / middleTemperature * 255)}
            ${Math.floor(255 - point.temperature / middleTemperature * 255)})`;
    } else {
        context.fillStyle = `rgb(
            ${Math.floor((point.temperature - middleTemperature) / middleTemperature * 255)}
            ${Math.floor(255 - (point.temperature - middleTemperature) / middleTemperature * 255)}
            0)`;
    }
    context.fillRect(50 + point.x * 3, 50 + point.y * 3, 3, 3)
}
