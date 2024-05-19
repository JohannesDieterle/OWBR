/**
 * creates zero Matrix 
 * @param {number} hight 
 * @param {number} width 
 * @returns {array}
 */
function matrix_zero(hight, width) {
    let matrix = []
    for (let i = 0; i < hight; i += 1) {
        let matrix_row = []
        for (let j = 0; j < width; j += 1) {
            matrix_row.push(0)
        }
        matrix.push(matrix_row)
    }
    return matrix
}

function matrix_width(matrix) {
    return matrix[0].length
}

function matrix_hight(matrix) {
    return matrix.length
}

/**
 * adds two Matrix
 * @param {array} m1
 * @param {array} m2
 * @returns {array}
 */
function matrix_addition(m1, m2) {
    if (matrix_width(m1) != matrix_width(m2) && matrix_hight(m1) != matrix_hight(m2)) {
        throw "Matrix addition aborted! Two wrong sized matrix"
    }
    let matrix = []
    for (let i = 0; i < matrix_width(m1); i += 1) {
        let matrix_row = []
        for (let j = 0; j < matrix_hight(m1); j += 1) {
            matrix_row.push(m1[i][j] + m2[i][j])
        }
        matrix.push(matrix_row)
    }
    return matrix
}

/**
 * Expands matrix
 * @param {array} small_matrix [[1, -1], [-1, 1]]
 * @param {array} counter_matrix [1, 2]
 * @param {array} matrix_width 3
 * @returns {array} [[ 0, 0, 0 ], [ 0, 1, -1 ], [ 0, -1, 1 ]]
 */
function matrix_expand(small_matrix, counter_matrix, matrix_width) {
    let matrix = []
    for (let i = 0; i < matrix_width; i += 1) {
        let matrix_row = []
        for (let j = 0; j < matrix_width; j += 1) {
            if (counter_matrix.includes(i) && counter_matrix.includes(j)) {
                matrix_row.push(small_matrix[counter_matrix.indexOf(i)][counter_matrix.indexOf(j)])
            } else {
                matrix_row.push(0)
            }
        }
        matrix.push(matrix_row)
    }
    return matrix
}

/**
 * Shuffels matrix in new orientation
 * @param {array} matrix 
 * @param {array} new_order 
 * @returns {array}
 */
function matrix_shuffel(og_matrix, new_order) {
    if (og_matrix.length != og_matrix[0].length) {
        throw "The function 'matrix_shuffel' needs a matrix with the same hight and width"
    }
    let matrix = matrix_zero(og_matrix.length, og_matrix[0].length)
    for (let i = 0; i < og_matrix.length; i += 1) {
        for (let j = 0; j < og_matrix[0].length; j += 1) {
            matrix[i][j] = og_matrix[new_order[i]][new_order[j]]
        }
    }
    return matrix
}

function matrix_multiplication(og_matrix, multiplicator) {
    if (og_matrix.length != og_matrix[0].length) {
        throw "The function 'matrix_multiplication' needs a matrix with the same hight and width"
    }
    let matrix = matrix_zero(og_matrix.length, og_matrix[0].length)
    for (let i = 0; i < og_matrix.length; i += 1) {
        for (let j = 0; j < og_matrix[0].length; j += 1) {
            matrix[i][j] = og_matrix[i][j] * multiplicator
        }
    }
    return matrix
}

function matrix_division(og_matrix, divisior) {
    if (og_matrix.length != og_matrix[0].length) {
        throw "The function 'matrix_division' needs a matrix with the same hight and width"
    }
    let matrix = matrix_zero(og_matrix.length, og_matrix[0].length)
    for (let i = 0; i < og_matrix.length; i += 1) {
        for (let j = 0; j < og_matrix[0].length; j += 1) {
            matrix[i][j] = og_matrix[i][j] / divisior
        }
    }
    return matrix
}

/**
 * Function to create the stiffnes matrix
 * @param {array} e1_punkte 
 * @param {array} e1_matrix 
 * @param {array} e2_punkte 
 * @param {array} e2_matrix 
 * @returns {{array}, {array}}
 */
function stiffness_matrix(e1_punkte, e1_matrix, e2_punkte, e2_matrix) {
    alle_punkte = e1_punkte.map((x) => x)

    for (let e2_punkt of e2_punkte) {
        let doppelt = false
        for (let punkt of e1_punkte) {
            if (punkt.x == e2_punkt.x && punkt.y == e2_punkt.y) {
                doppelt = true
                break
            }
        }
        if (!doppelt) { alle_punkte.push(e2_punkt) }
    }

    let counter = 0
    let exp_counter_matrix_e1 = []
    let exp_counter_matrix_e2 = []
    let shuffel_matrix_e1 = []
    let shuffel_matrix_e2 = []
    for (let punkt of alle_punkte) {
        let e_counter = 0
        for (let punkt_e1 of e1_punkte) {
            if (punkt.x == punkt_e1.x && punkt.y == punkt_e1.y) {
                exp_counter_matrix_e1.push(counter)
                shuffel_matrix_e1.push(e_counter)
                break
            }
            e_counter += 1
        }
        e_counter = 0
        for (let punkt_e2 of e2_punkte) {
            if (punkt.x == punkt_e2.x && punkt.y == punkt_e2.y) {
                exp_counter_matrix_e2.push(counter)
                shuffel_matrix_e2.push(e_counter)
                break
            }
            e_counter += 1
        }
        counter += 1
    }


    e1_matrix = matrix_shuffel(e1_matrix, shuffel_matrix_e1)
    e2_matrix = matrix_shuffel(e2_matrix, shuffel_matrix_e2)

    e1_matrix = matrix_expand(e1_matrix, exp_counter_matrix_e1, alle_punkte.length)
    e2_matrix = matrix_expand(e2_matrix, exp_counter_matrix_e2, alle_punkte.length)

    let globale_matrix = matrix_addition(e1_matrix, e2_matrix)

    return alle_punkte, globale_matrix
}


class Bauteil {
    constructor(x, y, breite, höhe, lambda) {
        this.x1 = x
        this.x2 = x + breite
        this.y1 = y
        this.y2 = y + höhe
        this.breite = breite
        this.höhe = höhe
        this.lambda = lambda
    }
}

class Element {
    constructor(x, y, elementbreite, elementhöhe, lambda) {
        this.x1 = x
        this.x2 = x + elementbreite
        this.y1 = y
        this.y2 = y + elementhöhe
        this.alpha = lambda / elementbreite // TODO: Ändern in allgemeine Länge nicht nur Breite

        this.punkte = [
            new Punkt(this.x1, this.y1),
            new Punkt(this.x2, this.y1),
            new Punkt(this.x1, this.y2),
            new Punkt(this.x2, this.y2)
        ]

        this.matrix = [
            [2 * this.alpha, -this.alpha, -this.alpha, 0],
            [-this.alpha, 2 * this.alpha, 0, -this.alpha],
            [-this.alpha, 0, 2 * this.alpha, -this.alpha],
            [0, -this.alpha, -this.alpha, 2 * this.alpha]
        ]
    }
}

class Punkt {
    constructor(x, y) {
        this.x = x
        this.y = y
        this.temperatur = 0
        this.wärmestrom = 0
        this.randbedingung = false
    }
}

class Randbedingung {
    constructor(x, y, breite, höhe, temperatur) {
        this.x = x
        this.y = y
        this.breite = breite
        this.höhe = höhe
        this.temperatur = temperatur
    }
}




let bauteile = []
bauteile.push(new Bauteil(0, 0, 10, 10, 0.035))
bauteile.push(new Bauteil(10, 0, 10, 10, 2))

let randbedingungen = []
let innentemp = 20
let außentemp = 0
randbedingungen.push(new Randbedingung(0, 0, 1, 500, außentemp))
randbedingungen.push(new Randbedingung(20, 0, 1, 500, innentemp))

// let bauteile = []
// bauteile.push(new Bauteil(0, 0, 5, 10,  0.035))
// bauteile.push(new Bauteil(0, 10, 15, 5, 0.035))
// bauteile.push(new Bauteil(5, 0, 3, 10, 2))
// bauteile.push(new Bauteil(8, 7, 7, 3, 2))

// let randbedingungen = []
// let innentemp = 20
// let außentemp = 0
// randbedingungen.push(new Randbedingung(0, 0, 1, 50, innentemp))
// randbedingungen.push(new Randbedingung(0, 15, 50, 1, innentemp))
// randbedingungen.push(new Randbedingung(8, 0, 1, 7, außentemp))
// randbedingungen.push(new Randbedingung(8, 7, 9, 1, außentemp))

let elemente = []
let elementbreite = 1
let elementhöhe = 1

for (bauteil of bauteile) {
    for (y = bauteil.y1; y < bauteil.y2; y += 1) {
        for (x = bauteil.x1; x < bauteil.x2; x += 1) {
            elemente.push(new Element(x, y, elementbreite, elementhöhe, bauteil.lambda))
        }
    }
}

let alle_punkte = elemente[0].punkte
let globale_matrix = elemente[0].matrix
for (let i = 1; i < elemente.length; i += 1) {
    console.log("Element: " + i + " von: " + elemente.length)
    alle_punkte, globale_matrix = stiffness_matrix(alle_punkte, globale_matrix, elemente[i].punkte, elemente[i].matrix)
}

for (randbedingung of randbedingungen) {
    for (let i = 0; i < alle_punkte.length; i += 1) {
        if (alle_punkte[i].x >= randbedingung.x && alle_punkte[i].x < randbedingung.breite + randbedingung.x
            && alle_punkte[i].y >= randbedingung.y && alle_punkte[i].y < randbedingung.höhe + randbedingung.y
        ) {
            alle_punkte[i].temperatur = randbedingung.temperatur
            alle_punkte[i].wärmestrom = 0
            alle_punkte[i].randbedingung = true
        }
    }
}


// Gauss-Seidel-Verfahren zum Lösen des linearen Gleichungssystems
let iterationen = 1000
for (let foo = 0; foo < iterationen; foo += 1) {
    console.log("Iteration: " + foo + " von: " + iterationen)
    for (let i = 0; i < alle_punkte.length; i += 1) {
        let summe = 0
        for (let j = 0; j < globale_matrix[i].length; j += 1) {
            if (globale_matrix[i][j] == 0 || i == j) {
                continue
            }
            summe += globale_matrix[i][j] * alle_punkte[j].temperatur
        }
        if (alle_punkte[i].randbedingung == true) {
            alle_punkte[i].wärmestrom = globale_matrix[i][i] * alle_punkte[i].temperatur + summe
        } else {
            alle_punkte[i].temperatur = 1 / globale_matrix[i][i] * (alle_punkte[i].wärmestrom - summe)
        }
    }
}

for (punkt of alle_punkte) {
    if (punkt.y == 0) {
        console.log("x: " + punkt.x + " y: " + punkt.y + " T: " + ("   " + punkt.temperatur.toFixed(1)).slice(-6) + " WS: " + ("    " + punkt.wärmestrom.toFixed(1)).slice(-6) + " RB: " + punkt.randbedingung)
    }
}



let canvas = document.getElementById("canvas")
let context = canvas.getContext("2d")

let window_height = window.innerHeight
let window_width = window.innerWidth

canvas.height = window_height
canvas.width = window_width

canvas.style.backgroundColor = "#ff8"

for (punkt of alle_punkte) {
    let mitteltemp = (innentemp-außentemp)/2
    if (punkt.temperatur <= mitteltemp) {
        context.fillStyle = `rgb(
            0
            ${Math.floor(punkt.temperatur / mitteltemp * 255)}
            ${Math.floor(255 - punkt.temperatur / mitteltemp * 255)})`;
    } else {
        context.fillStyle = `rgb(
            ${Math.floor((punkt.temperatur-mitteltemp) / mitteltemp * 255)}
            ${Math.floor(255 - (punkt.temperatur-mitteltemp) / mitteltemp * 255)}
            0)`;
    }
    context.fillRect(50 + punkt.x * 10, 50 + punkt.y * 10, 10, 10)
}
