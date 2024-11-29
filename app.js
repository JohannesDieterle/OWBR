import {
  Component,
  Point,
  BoundaryCondition,
  CanvasData,
} from "./modules/CaB.js";
import { calculate_thermal_bridge } from "./modules/calculations.js";

/*---------------------- components and boundaryConditions ----------------------*/

let components = [];
let boundaryConditions = [];
let outside = 1;
let inside = 0;

// createComponents(80, 0, 20, 90, 2.1);
// createComponents(0, 90, 200, 20, 2.1);
// createComponents(80, 110, 20, 90, 2.1);
// createComponents(100, 0, 20, 90, 0.035);
// createComponents(100, 110, 20, 90, 0.035);
// boundaryConditions.push(new BoundaryCondition(80, 0, 1, 90, inside));
// boundaryConditions.push(new BoundaryCondition(0, 90, 80, 1, inside));
// boundaryConditions.push(new BoundaryCondition(0, 110, 80, 1, inside));
// boundaryConditions.push(new BoundaryCondition(80, 110, 1, 90, inside));
// boundaryConditions.push(new BoundaryCondition(120, 0, 1, 90, outside));
// boundaryConditions.push(new BoundaryCondition(120, 90, 80, 1, outside));
// boundaryConditions.push(new BoundaryCondition(120, 110, 1, 90, outside));
// boundaryConditions.push(new BoundaryCondition(120, 110, 80, 1, outside));

createComponents(10, 10, 150, 20, 0.035);
createComponents(10, 30, 20, 130, 0.035);
createComponents(30, 30, 130, 10, 2.1);
createComponents(30, 40, 10, 120, 2.1);

boundaryConditions.push(new BoundaryCondition(10, 10, 150, 1, outside));
boundaryConditions.push(new BoundaryCondition(10, 10, 1, 150, outside));
boundaryConditions.push(new BoundaryCondition(40, 40, 120, 1, inside));
boundaryConditions.push(new BoundaryCondition(40, 40, 1, 120, inside));

/*---------------------- components and boundaryConditions ----------------------*/

let scaleFactor = 3;

let results = [];

const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
canvas.width = 800;
canvas.height = 650;
show_components(components);

let canvasData = new CanvasData();

function createComponents(x, y, dx, dy, lambda) {
  components.push(
    new Component(
      [
        new Point(x, y),
        new Point(x, y + dy),
        new Point(x + dx, y + dy),
        new Point(x + dx, y),
      ],
      lambda
    )
  );
}

/**
 * This function calculates the thermal bridge and returns all points and their temperature
 * @param {*} components
 * @param {*} boundaryConditions
 */

export function show_calculation(allPoints, components) {
  showInfo("Show calculations");
  if (typeof allPoints == "undefined") {
    return;
  }
  context.clearRect(0, 0, canvas.width, canvas.height);

  for (let point of allPoints) {
    if (typeof point.boundaryCondition == true) {
      continue;
    }
    let middleTemperature = (20 - 0) / 2; // TODO: change to temperatures used in calculation
    if (point.temperature <= middleTemperature) {
      context.fillStyle = `rgb(
                0
                ${Math.floor((point.temperature / middleTemperature) * 255)}
                ${Math.floor(
                  255 - (point.temperature / middleTemperature) * 255
                )})`;
    } else {
      context.fillStyle = `rgb(
                ${Math.floor(
                  ((point.temperature - middleTemperature) /
                    middleTemperature) *
                    255
                )}
                ${Math.floor(
                  255 -
                    ((point.temperature - middleTemperature) /
                      middleTemperature) *
                      255
                )}
                0)`;
    }
    context.fillRect(
      point.x * scaleFactor,
      point.y * scaleFactor,
      scaleFactor,
      scaleFactor
    );
  }
  for (const component of components) {
    context.strokeRect(
      component.x1 * scaleFactor,
      component.y1 * scaleFactor,
      component.width * scaleFactor,
      component.height * scaleFactor
    );
  }
}

function show_components(components) {
  showInfo("Show components");
  context.clearRect(0, 0, canvas.width, canvas.height);
  for (const component of components) {
    context.fillStyle = `rgb(
            ${Math.floor((component.lambda / 2) * 255)}
            200
            ${Math.floor(255 - (component.lambda / 2) * 255)})`;
    context.fillRect(
      component.xMin * scaleFactor,
      component.yMin * scaleFactor,
      (component.xMax - component.xMin) * scaleFactor,
      (component.yMax - component.yMin) * scaleFactor
    );
    context.strokeRect(
      component.xMin * scaleFactor,
      component.yMin * scaleFactor,
      (component.xMax - component.xMin) * scaleFactor,
      (component.yMax - component.yMin) * scaleFactor
    );
  }
}

function show_boundaryconditions(boundaryConditions) {
  showInfo("Show boundary conditions");
  if (typeof boundaryConditions == "undefined") {
    return;
  }
  for (let boundaryCondition of boundaryConditions) {
    if (boundaryCondition.temperature == 0) {
      context.fillStyle = "#0000ff";
    } else if (boundaryCondition.temperature == 20) {
      context.fillStyle = "#ff0000";
    } else {
      context.fillStyle = "#ffffff";
    }
    context.fillRect(
      boundaryCondition.x * scaleFactor,
      boundaryCondition.y * scaleFactor,
      boundaryCondition.width * scaleFactor,
      boundaryCondition.height * scaleFactor
    );
  }
}

// Start calculating button
const button_calculate = document.getElementById("button_calculate");
button_calculate.addEventListener(
  "click",
  () => (results = calculate_thermal_bridge(components, boundaryConditions))
);

// Show components button
const button_show_components = document.getElementById(
  "button_show_components"
);
button_show_components.addEventListener("click", () => {
  show_components(components);
  show_boundaryconditions(boundaryConditions);
  showInfo("Show components and boundarys");
});

// Show calculations button
const button_show_calculations = document.getElementById(
  "button_show_calculations"
);
button_show_calculations.addEventListener("click", () =>
  show_calculation(results[0], components)
);

// Delete all components and boundary conditions
const button_delete_all = document.getElementById("button_delete_all");
button_delete_all.addEventListener("click", () => {
  components = [];
  boundaryConditions = [];
  show_components(components);
  showInfo("Delete all!");
});

function showInfo(text) {
  const info1 = document.getElementById("info1");
  const info2 = document.getElementById("info2");
  const info3 = document.getElementById("info3");
  const info4 = document.getElementById("info4");
  info4.innerText = info3.innerText;
  info3.innerText = info2.innerText;
  info2.innerText = info1.innerText;
  info1.innerText = text;
}

let action = "point";
const action_buttons = document.getElementsByClassName("leftnav")[0].children;
for (let action_button of action_buttons) {
  action_button.addEventListener("click", (event) => {
    document
      .querySelectorAll(".active")
      .forEach((btn) => btn.classList.remove("active"));
    event.target.classList.add("active");
    action = event.target.defaultValue;
  });
}

canvas.addEventListener("mousedown", (event) => {
  switch (action) {
    case "point":
      break;
    case "draw":
      canvas_draw(event);
      break;
    case "erase":
      break;
  }
});

canvas.addEventListener("mouseup", (event) => {
  switch (action) {
    case "point":
      break;
    case "draw":
      canvas_draw(event);
      break;
    case "erase":
      canvas_erase(event);
      break;
  }
});

canvas.addEventListener("mousemove", (event) => {
  switch (action) {
    case "point":
      break;
    case "draw":
      canvas_draw(event);
      break;
    case "erase":
      break;
  }
});

// Add point under mouse to see where it would draw
// canvas.addEventListener("mousemove", (event) => {
//   if (!canvasData.is_down) {
//     show_components(components);
//   }
//   context.fillStyle = "red";
//   context.fillRect(event.offsetX - 1, event.offsetY - 1, 2, 2);
// });

function canvas_draw(event) {
  if (event.type == "mousedown") {
    canvasData.is_down = true;
    if (canvasData.near_point) {
      return;
    }
    canvasData.x_down = event.offsetX;
    canvasData.y_down = event.offsetY;
  } else if (event.type == "mouseup") {
    canvasData.is_down = false;

    let x_small = 0;
    let y_small = 0;
    let hight = 0;
    let width = 0;

    if (canvasData.x_down <= event.offsetX) {
      x_small = canvasData.x_down;
      width = event.offsetX - canvasData.x_down;
    } else {
      x_small = event.offsetX;
      width = canvasData.x_down - event.offsetX;
    }
    if (canvasData.y_down <= event.offsetY) {
      y_small = canvasData.y_down;
      hight = event.offsetY - canvasData.y_down;
    } else {
      y_small = event.offsetY;
      hight = canvasData.y_down - event.offsetY;
    }
    createComponents(
      Math.floor(x_small / scaleFactor),
      Math.floor(y_small / scaleFactor),
      Math.floor(width / scaleFactor),
      Math.floor(hight / scaleFactor),
      1
    );
    show_components(components);
  } else if (event.type == "mousemove") {
    if (!canvasData.is_down) {
      return;
    }
    show_components(components);
    canvasData.x_up = event.offsetX;
    canvasData.y_up = event.offsetY;
    context.strokeStyle = "grey";
    context.strokeRect(
      canvasData.x_down,
      canvasData.y_down,
      canvasData.x_up - canvasData.x_down,
      canvasData.y_up - canvasData.y_down
    );
  }
}

function canvas_erase(event) {
  if (event.type == "mouseup") {
    for (let i = 0; i < components.length; i += 1) {
      if (
        event.offsetX / scaleFactor >= components[i].x1 &&
        event.offsetX / scaleFactor <= components[i].x2 &&
        event.offsetY / scaleFactor >= components[i].y1 &&
        event.offsetY / scaleFactor <= components[i].y2
      ) {
        components.splice(i, 1);
      }
    }
    show_components(components);
  }
}
