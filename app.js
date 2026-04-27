import {
  getDistance,
  pointInTriangle,
} from "./modules/delaunayTriangulation.js";
import { Point, Component, BoundaryCondition } from "./modules/CaB.js";

// ##################################
// #              Temp              #
// ##################################
// TODO: delete this:
const components = [];
const tmpComponents = [];
const boundaryConditions = [];
const tmpBoundaryConditions = [];
const uniquePoints = new Set();
let allPoints = [new Point(0, 0)];
const outside = 1;
const inside = 0;

// createComponents(10, 10, 10, 10, 1);
// boundaryConditions.push(new BoundaryCondition(10, 10, 10, 20, inside));
// boundaryConditions.push(new BoundaryCondition(20, 20, 10, 20, outside));

createComponents(80, 0, 20, 90, 2.1);
createComponents(0, 90, 200, 20, 2.1);
// createComponents(0, 90, 100, 20, 2.1);
// createComponents(100, 90, 7, 20, 0.035);
// createComponents(107, 90, 93, 20, 2.1);
createComponents(80, 110, 20, 90, 2.1);
createComponents(100, 0, 20, 90, 0.035);
createComponents(100, 110, 20, 90, 0.035);
boundaryConditions.push(new BoundaryCondition(80, 80, 0, 90, inside));
boundaryConditions.push(new BoundaryCondition(0, 80, 90, 90, inside));
boundaryConditions.push(new BoundaryCondition(0, 80, 110, 110, inside));
boundaryConditions.push(new BoundaryCondition(80, 80, 110, 200, inside));
boundaryConditions.push(new BoundaryCondition(120, 120, 0, 90, outside));
boundaryConditions.push(new BoundaryCondition(120, 200, 90, 90, outside));
boundaryConditions.push(new BoundaryCondition(120, 120, 110, 200, outside));
boundaryConditions.push(new BoundaryCondition(120, 200, 110, 110, outside));

// createComponents(10, 10, 150, 20, 0.035);
// createComponents(10, 30, 20, 130, 0.035);
// createComponents(30, 30, 130, 10, 2.1);
// createComponents(30, 40, 10, 120, 2.1);
// boundaryConditions.push(new BoundaryCondition(10, 10, 10, 160, outside));
// boundaryConditions.push(new BoundaryCondition(10, 160, 10, 10, outside));
// boundaryConditions.push(new BoundaryCondition(40, 40, 40, 160, inside));
// boundaryConditions.push(new BoundaryCondition(40, 160, 40, 40, inside));

// NORM DIN EN ISO 10211
// Fall 2 (2D)
// createComponents(0, 4.15, 50, 0.6, 1.15); // 1
// createComponents(0, 3.65, 1.5, 0.5, 0.12); // 2
// createComponents(0.15, 0.15, 13.5, 3.35, 0.029); // 3
// createComponents(1.5, 0.15, 48.5, 4, 0.029); // 3
// createComponents(0, 0, 0.15, 3.65, 230); // 4
// createComponents(0.15, 3.5, 1.35, 0.15, 230); // 4
// createComponents(0.15, 0, 49.85, 0.15, 230); // 4
// boundaryConditions.push(new BoundaryCondition(0, 50, 4.75, 4.75, outside)); // ÜW 0.11 20 °C
// boundaryConditions.push(new BoundaryCondition(0, 50, 0, 0, inside)); // ÜW 0.06 0 °C

function createComponents(x, y, dx, dy, lambda) {
  if (dx == 0 || dy == 0) {
    console.error("Die Breite und Höhe müssen größer als 0 sein.");
    return;
  }
  components.push(
    new Component(
      [
        new Point(x, y),
        new Point(x, y + dy),
        new Point(x + dx, y + dy),
        new Point(x + dx, y),
      ],
      lambda,
    ),
  );
  // Iteriere über die Liste der Komponenten und füge die Punkte zum Set hinzu
  components.forEach((component) => {
    component.points.forEach((point) => {
      // Konvertiere den Punkt in einen String, um ihn im Set zu speichern
      const pointString = `${point.x},${point.y}`;
      uniquePoints.add(pointString);
    });
  });

  // Konvertiere das Set zurück in ein Array von Punkt-Objekten
  allPoints = Array.from(uniquePoints).map((pointString) => {
    const [x, y] = pointString.split(",").map(Number);
    return { x, y };
  });
}
// ##################################

// ##################################
// #            Elemetes            #
// ##################################

const follower = document.getElementById("follower");
const _var = {
  canvasNeedsUpdate: true,
  ctrlKeyDown: false,
  component: { start: false, xStart: 0, yStart: 0 },
  boundaryCondition: { start: false, xStart: 0, yStart: 0 },
  dragging: { start: false, xStart: 0, yStart: 0 },
  mouse: { x: _canvas.width / 2, y: _canvas.height / 2 },
  cursor: { x: 0, y: 0 },
  results: null,
};
// ##################################

// ##################################
// #             Canvas             #
// ##################################

const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");

canvas.width = _canvas.width;
canvas.height = _canvas.height;
// Funktion um das Koordinatensystem so zu ändern, dass der Ursprung unten links ist und nicht oben links
context.transform(1, 0, 0, -1, 0, _canvas.height);

let scale = _canvas.startScale;
let offsetXCanvas = _canvas.startOffset.x;
let offsetYCanvas = _canvas.startOffset.y;

requestAnimationFrame(updateCanvas);

function updateCanvas() {
  if (_var.canvasNeedsUpdate) {
    clearCanvas();
    updateBackground();
    updateGrid();
    updateComponents();
    updateResults(); // KI Generiert!
    updateCursor();
    _var.canvasNeedsUpdate = false;
  }
  requestAnimationFrame(updateCanvas);
}

function clearCanvas() {
  context.clearRect(0, 0, _canvas.width, _canvas.height);
  return 0;
}
function updateBackground() {
  canvas.style.backgroundColor = _background.color;
  return 0;
}
function updateGrid() {
  context.save();
  context.scale(scale, scale);

  // Vertikale Linie
  context.strokeStyle = "#888";
  context.lineWidth = 1 / scale;
  context.beginPath();
  context.moveTo(offsetXCanvas / scale, 0);
  context.lineTo(offsetXCanvas / scale, _canvas.height / scale);
  context.stroke();

  // Horizontale Linie
  context.beginPath();
  context.moveTo(0, offsetYCanvas / scale);
  context.lineTo(_canvas.width / scale, offsetYCanvas / scale);
  context.stroke();
  context.restore();
  return 0;
}
function updateComponents() {
  // TODO:
  // Reihenfolge der Objekte bestimmen
  // in der richtigen Reihenfolge Bilder, Bauteile und Randbedingungen zeichnen
  context.save();
  context.translate(offsetXCanvas, offsetYCanvas);
  context.scale(scale, scale);
  context.lineWidth = 1 / scale;

  // Zeichne alle Bauteile
  for (const component of components) {
    context.fillStyle = `rgb(
            ${Math.floor((component.lambda / 2) * 255)}
            200
            ${Math.floor(255 - (component.lambda / 2) * 255)})`;
    context.fillRect(
      component.xMin,
      component.yMin,
      component.xMax - component.xMin,
      component.yMax - component.yMin,
    );
    context.strokeStyle = "black";
    context.strokeRect(
      component.xMin,
      component.yMin,
      component.xMax - component.xMin,
      component.yMax - component.yMin,
    );
  }
  if (_var.component.start) {
    for (const tmpComponent of tmpComponents) {
      context.fillStyle = `rgb(
            ${Math.floor((tmpComponent.lambda / 2) * 255)}
            200
            ${Math.floor(255 - (tmpComponent.lambda / 2) * 255)})`;
      context.fillRect(
        tmpComponent.xMin,
        tmpComponent.yMin,
        tmpComponent.xMax - tmpComponent.xMin,
        tmpComponent.yMax - tmpComponent.yMin,
      );
      context.strokeStyle = "black";
      context.strokeRect(
        tmpComponent.xMin,
        tmpComponent.yMin,
        tmpComponent.xMax - tmpComponent.xMin,
        tmpComponent.yMax - tmpComponent.yMin,
      );
    }
  }
  // TODO: Randbedingung optional zeichnen
  for (const boundaryCondition of boundaryConditions) {
    if (boundaryCondition.temperature == -5) {
      context.strokeStyle = "#0000ff";
    } else if (boundaryCondition.temperature == 20) {
      context.strokeStyle = "#ff0000";
    } else {
      context.strokeStyle = "#ffffff";
    }
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(boundaryCondition.xStart, boundaryCondition.yStart);
    context.lineTo(boundaryCondition.xEnd, boundaryCondition.yEnd);
    context.stroke();
  }
  if (_var.boundaryCondition.start) {
    for (const tmpBoundaryCondition of tmpBoundaryConditions) {
      if (tmpBoundaryCondition.temperature == 0) {
        context.strokeStyle = "#0000ff";
      } else if (tmpBoundaryCondition.temperature == 20) {
        context.strokeStyle = "#ff0000";
      } else {
        context.strokeStyle = "#ffffff";
      }
      context.lineWidth = 1;
      context.beginPath();
      context.moveTo(tmpBoundaryCondition.xStart, tmpBoundaryCondition.yStart);
      context.lineTo(tmpBoundaryCondition.xEnd, tmpBoundaryCondition.yEnd);
      context.stroke();
    }
  }

  context.restore();
  return 0;
}
function updateCursor() {
  _var.cursor.x = _var.mouse.x;
  _var.cursor.y = _var.mouse.y;
  let distances = [];
  if (!_var.ctrlKeyDown && _cursor.magnet) {
    allPoints.forEach((point) => {
      let [x, y] = getPointCoords(point);
      distances.push({
        point: [x, y],
        dist: getDistance(
          new Point(_var.cursor.x, _var.cursor.y),
          new Point(x, y),
        ),
      });
    });
    let res = distances.sort((a, b) => a.dist - b.dist);
    if (res[0].dist < _cursor.catch.distance) {
      _var.cursor.x = res[0].point[0];
      _var.cursor.y = res[0].point[1];
    }
  }

  context.strokeStyle = _cursor.color;
  context.beginPath();
  context.arc(_var.cursor.x, _var.cursor.y, _cursor.width, 0, Math.PI * 2);
  context.stroke();
  return 0;
}
// ##################################

// ##################################
// #           Functions            #
// ##################################

// Mauskoordinaten im Koordinatensystem
function getMouseCoords(event) {
  const XCoordMouse = (event.offsetX - offsetXCanvas) / scale;
  const YCoordMouse = (canvas.height - event.offsetY - offsetYCanvas) / scale;
  return [XCoordMouse, YCoordMouse];
}

// Cursor-Koordinaten im Koordinatensystem
function getCursorCoords() {
  const XCoordCursor = (_var.cursor.x - offsetXCanvas) / scale;
  const YCoordCursor = (_var.cursor.y - offsetYCanvas) / scale;
  return [XCoordCursor, YCoordCursor];
}

// Konvertiere die Koordinaten des Punktes in die Koordinaten des Canvas
function getPointCoords(p) {
  const XCoordPoint = p.x * scale + offsetXCanvas;
  const YCoordPoint = p.y * scale + offsetYCanvas;
  return [XCoordPoint, YCoordPoint];
}

// Gibt den dargestellten Pixel mit x und y von einem angegebenen Punkt zurück
function toPixel(p) {
  const [cx, cy] = getPointCoords(p);
  return { x: Math.round(cx), y: Math.round(cy), temperatur: p.temperature };
}

function updateCornerInfoUR(event) {
  const [XCoordMouse, YCoordMouse] = getMouseCoords(event);
  const [XCoordCursor, YCoordCursor] = getCursorCoords(event);
  document.getElementById("info1").innerText = XCoordMouse + " :MouseX";
  document.getElementById("info2").innerText = YCoordMouse + " :MouseY";
  document.getElementById("info3").innerText = XCoordCursor + " :CursorX";
  document.getElementById("info4").innerText = YCoordCursor + " :CursorY";
  document.getElementById("info5").innerText = offsetXCanvas + " :OffsetX";
  document.getElementById("info6").innerText = offsetYCanvas + " :OffsetY";
  document.getElementById("info7").innerText = scale + " :Scale";
  document.getElementById("info8").innerText = _canvas.mode + " :Mode";
}
export function updateCornerInfoUL(info) {
  document.getElementById("infoUL").innerText = info;
}
// ##################################

// ##################################
// #     EventListeners Canvas      #
// ##################################

// Status der Steuerungstaste
document.addEventListener("keydown", handelCrtlKey);
document.addEventListener("keyup", handelCrtlKey);
function handelCrtlKey(event) {
  if (event.key !== "Control") {
    return;
  }
  if (event.type === "keyup") {
    _var.ctrlKeyDown = false;
  }
  if (event.type === "keydown") {
    _var.ctrlKeyDown = true;
  }
}

// Shortcuts
document.addEventListener("keydown", handelShortcuts);
function handelShortcuts(event) {
  // Zoom zurücksetzen
  if (event.code === _keybindings.resetZoom) {
    scale = _canvas.startScale;
    offsetXCanvas = _canvas.startOffset.x;
    offsetYCanvas = _canvas.startOffset.y;
    updateCornerInfoUR(event);
    _var.canvasNeedsUpdate = true;
  }
  // Cursor Magnetismus umschalten
  if (event.code === _keybindings.toggleCursorMagnet) {
    _cursor.magnet = !_cursor.magnet;
    updateCornerInfoUR(event);
    _var.canvasNeedsUpdate = true;
  }
}

// Modus Steuerung
document.addEventListener("keydown", handelMode);
function handelMode(event) {
  // Kamera ziehen umschalten
  if (event.code === _keybindings.toggleModeDragging) {
    _canvas.mode = "dragging";
    updateCornerInfoUR(event);
  }
  // Bauteil zeichnen umschalten
  if (event.code === _keybindings.toggleModeDrawComponent) {
    _canvas.mode = "drawComp";
    _var.dragging.start = false;
    updateCornerInfoUR(event);
  }
  // Randbedingung zeichnen umschalten
  if (event.code === _keybindings.toggleModeDrawBoundaryCondition) {
    _canvas.mode = "drawBC";
    _var.dragging.start = false;
    updateCornerInfoUR(event);
  }
}

// Maus Cursor anzeigen
canvas.addEventListener("mousemove", handelCursor);
function handelCursor(event) {
  // Die letzte erfasste Mausposition aufnehmen
  _var.mouse.x = event.offsetX;
  _var.mouse.y = canvas.height - event.offsetY;
  _var.canvasNeedsUpdate = true;
  updateCornerInfoUR(event);

  // Temperatur anzeigen
  const t = getTemperatureAtCursor();
  if (t !== null) {
    document.getElementById("infoUL").innerText = `T = ${t.toFixed(2)} °C`;
  } else {
    document.getElementById("infoUL").innerText = "";
  }
}

// Bauteil zeichnen
canvas.addEventListener("mousedown", handelCreateComponent);
canvas.addEventListener("mousemove", handelCreateComponent);
document.addEventListener("keydown", handelCreateComponent);
function handelCreateComponent(event) {
  if (_canvas.mode !== "drawComp") {
    return;
  }
  if (event.type === "mousedown") {
    event.preventDefault();
    if (_var.component.start) {
      // Bauteil erstellen
      _var.component.start = false;
      turnComponentPreviewInComponent(event);
    } else if (_canvas.mode === "drawComp") {
      // Bauteilvorschau starten
      _var.component.start = true;
      follower.style.display = "block";
      document.getElementById("followerInfo1").focus();
      const [XCoordCursor, YCoordCursor] = getCursorCoords(event);
      _var.component.xStart = XCoordCursor;
      _var.component.yStart = YCoordCursor;
    }
    _var.canvasNeedsUpdate = true;
  }
  if (event.type === "mousemove") {
    event.preventDefault();
    // Follower-Element bewegen
    follower.style.left = event.clientX + "px";
    follower.style.top = event.clientY + "px";
    const [XCoordCursor, YCoordCursor] = getCursorCoords(event);
    document.getElementById("followerInfo1").value =
      XCoordCursor - _var.component.xStart;
    document.getElementById("followerInfo2").value =
      YCoordCursor - _var.component.yStart;
  }
  if (event.type === "keydown") {
    // Bauteil zeichnen:
    if (
      event.code === _keybindings.addComponent ||
      event.code === _keybindings.addComponent2
    ) {
      turnComponentPreviewInComponent(event);
    }
    if (event.code === "Escape") {
      _var.component.start = false;
      follower.style.display = "none";
    }
    _var.canvasNeedsUpdate = true;
  }
}
function turnComponentPreviewInComponent(event) {
  event.preventDefault();
  const componentWidth = parseFloat(
    document.getElementById("followerInfo1").value,
  );
  const componentHeight = parseFloat(
    document.getElementById("followerInfo2").value,
  );
  const offsetXComponent = parseFloat(
    document.getElementById("followerInfo3").value,
  );
  const offsetYComponent = parseFloat(
    document.getElementById("followerInfo4").value,
  );
  document.getElementById("followerInfo3").value = 0;
  document.getElementById("followerInfo4").value = 0;
  const lambda = parseFloat(document.getElementById("followerInfo5").value);
  createComponents(
    _var.component.xStart + offsetXComponent,
    _var.component.yStart + offsetYComponent,
    componentWidth,
    componentHeight,
    lambda,
  );
  _var.component.start = false;
  follower.style.display = "none";
}

// Bauteilvorschau zeichnen
canvas.addEventListener("mousemove", handelComponentPreview);
canvas.addEventListener("mousedown", handelComponentPreview);
function handelComponentPreview(event) {
  if (!_var.component.start) {
    return;
  }
  if (event.type === "mousemove") {
    event.preventDefault();
    const [XCoordCursor, YCoordCursor] = getCursorCoords(event);
    tmpComponents[0] = new Component(
      [
        new Point(_var.component.xStart, _var.component.yStart),
        new Point(_var.component.xStart, YCoordCursor),
        new Point(XCoordCursor, YCoordCursor),
        new Point(XCoordCursor, _var.component.yStart),
      ],
      1,
    );
  }
  if (event.type === "mousedown") {
    tmpComponents.length = 0;
  }
  _var.canvasNeedsUpdate = true;
}

// Canvas verschieben
canvas.addEventListener("mousedown", handelDragging);
canvas.addEventListener("mouseup", handelDragging);
canvas.addEventListener("mouseleave", handelDragging);
canvas.addEventListener("mousemove", handelDragging);
function handelDragging(event) {
  if (_canvas.mode !== "dragging") {
    return;
  }
  event.preventDefault();
  if (event.type === "mouseup" || event.type === "mouseleave") {
    _var.dragging.start = false;
  }
  if (event.type === "mousedown") {
    _var.dragging.start = true;
    _var.dragging.xStart = event.clientX - offsetXCanvas;
    _var.dragging.yStart = event.clientY + offsetYCanvas;
  }
  if (event.type === "mousemove" && _var.dragging.start) {
    offsetXCanvas = event.clientX - _var.dragging.xStart;
    offsetYCanvas = _var.dragging.yStart - event.clientY;
  }
}

// Randbedingung hinzufügen
canvas.addEventListener("mousedown", handelBoudaryCondition);
function handelBoudaryCondition(event) {
  if (_canvas.mode !== "drawBC") {
    return;
  }
  event.preventDefault();
  if (_var.boundaryCondition.start) {
    _var.boundaryCondition.start = false;
    const [XCoordCursor, YCoordCursor] = getCursorCoords(event);
    const condition = 0; // TODO: Randbedingung Kondition eingeben
    boundaryConditions.push(
      new BoundaryCondition(
        _var.boundaryCondition.xStart,
        XCoordCursor,
        _var.boundaryCondition.yStart,
        YCoordCursor,
        condition,
      ),
    );
    _var.canvasNeedsUpdate = true;
  } else {
    _var.boundaryCondition.start = true;
    [_var.boundaryCondition.xStart, _var.boundaryCondition.yStart] =
      getCursorCoords(event);
  }
}
canvas.addEventListener("mousemove", handelBoudaryConditionPreview);
canvas.addEventListener("mousedown", handelBoudaryConditionPreview);
function handelBoudaryConditionPreview(event) {
  if (!_var.boundaryCondition.start) {
    return;
  }
  if (event.type === "mousemove") {
    event.preventDefault();
    const [XCoordCursor, YCoordCursor] = getCursorCoords(event);
    tmpBoundaryConditions[0] = new BoundaryCondition(
      _var.boundaryCondition.xStart,
      XCoordCursor,
      _var.boundaryCondition.yStart,
      YCoordCursor,
      0,
    );
  }
  if (event.type === "mousedown") {
    tmpBoundaryConditions.length = 0;
  }
  _var.canvasNeedsUpdate = true;
}

// Zoom
canvas.addEventListener("wheel", handelZoom);
function handelZoom(event) {
  event.preventDefault();
  const delta = event.deltaY > 0 ? -_canvas.zoom.delta : _canvas.zoom.delta;

  const XCanvas = event.clientX - canvas.getBoundingClientRect().left;
  const YCanvas = canvas.getBoundingClientRect().bottom - event.clientY;

  // Berechne die neue Skalierung
  const newScale = Math.round((scale + delta) * 10) / 10;

  // Sollte das Bild zu weit raus- oder reingezoomt sein, zoom nicht weiter
  if (newScale > _canvas.zoom.max || newScale < _canvas.zoom.min) {
    return;
  }

  // Berechne die neue Position, um den Zoom auf die Mausposition zu zentrieren
  offsetXCanvas = XCanvas - (XCanvas - offsetXCanvas) * (newScale / scale);
  offsetYCanvas = YCanvas - (YCanvas - offsetYCanvas) * (newScale / scale);

  scale = newScale;

  updateCornerInfoUR(event);
  _var.canvasNeedsUpdate = true;
}

// ##################################

// ##################################
// #             Knöpfe             #
// ##################################

// TODO: Knöpfe hinzufügen um Bauteile und Randbedingungen zu löschen, zu bearbeiten und zu zeichnen

// Knöpfe in der oberen Navigationsleiste
const buttonCalculate = document.getElementById("button_calculate");
const workerCTB = new Worker("./modules/calculations.js", { type: "module" });
buttonCalculate.addEventListener("click", () => {
  buttonCalculate.disabled = true;
  buttonCalculate.setAttribute("value", "Calculating...");
  workerCTB.postMessage([components, boundaryConditions]);
});
workerCTB.onmessage = (e) => {
  if (typeof e.data === "string" || e.data instanceof String) {
    updateCornerInfoUL(e.data);
  } else {
    const [allPoints, components, heatflows] = e.data;
    _var.results = [allPoints, components];

    // Gesamtwärmestrom gruppieren (innen/außen summieren)
    let Q_innen = 0;
    let Q_aussen = 0;
    for (const hf of heatflows) {
      if (hf.temperature > 0) {
        Q_innen += hf.Q_W_per_m;
      } else {
        Q_aussen += hf.Q_W_per_m;
      }
    }
    console.log(`Gesamtwärmestrom innen: ${Q_innen.toFixed(4)} W/m`);
    console.log(`Gesamtwärmestrom außen: ${Q_aussen.toFixed(4)} W/m`);

    // Energiebilanz prüfen (sollten gleich groß sein mit entgegengesetztem Vorzeichen)
    console.log(`Bilanzfehler: ${Math.abs(Q_innen + Q_aussen).toFixed(6)} W/m`);

    _var.canvasNeedsUpdate = true;
    buttonCalculate.disabled = false;
    buttonCalculate.setAttribute("value", "Calculate");
  }
  // TODO: UI aktualisieren
};

// Knöpfe in der linken Navigationsleiste
const actionButtons = document.getElementsByClassName("leftnav")[0].children;
for (let actionButton of actionButtons) {
  actionButton.addEventListener("click", (event) => {
    document
      .querySelectorAll(".active")
      .forEach((btn) => btn.classList.remove("active"));
    event.target.classList.add("active");
    _canvas.mode = event.currentTarget.getAttribute("aria-label");
    updateCornerInfoUR(event);
  });
}

// ##################################

// ##################################
// #          Visualization         #
// ##################################

function temperaturToColor(
  t,
  tMin = _colorgradient.tMin,
  tMax = _colorgradient.tMax,
) {
  let color = null;
  // Schauen wo die Temperaur auf dem Farbspecktrum liegt
  // Aufgrund von float Ungenauigkeiten Math.max und min, damit die Werte auf
  // jeden Fall zwischen 0 und 1 liegen
  const ratio = Math.max(0, Math.min(1, (t - tMin) / (tMax - tMin)));

  // Farbe gemäß config.js (Standart: blau (-5°C) -> hellblau (1,3°C) ->
  // grün (7,5°C) -> gelb (13,7°C) -> rot (20°C))
  // TODO: gradient von config.js nehmen
  const gradient = [
    [0.0, 0, 0, 255], // Blau
    [0.25, 0, 255, 255], // Hellblau
    [0.5, 0, 255, 0], // Grün
    [0.75, 255, 255, 0], // Gelb
    [1.0, 255, 0, 0], // Rot
  ];

  for (let i = 0; i < gradient.length - 1; i++) {
    const [r0, R0, G0, B0] = gradient[i];
    const [r1, R1, G1, B1] = gradient[i + 1];

    if (ratio > r1) {
      continue;
    }
    const localR = (ratio - r0) / (r1 - r0);

    const R = Math.round(R0 + localR * (R1 - R0));
    const G = Math.round(G0 + localR * (G1 - G0));
    const B = Math.round(B0 + localR * (B1 - B0));

    return [R, G, B];
  }

  console.log(
    "Farbe für Farbgradient konnte nicht bestimmt werden! Farbe wird auf schwarz gesetzt!",
  );
  return [255, 255, 255];
}

let offscreen = new OffscreenCanvas(_canvas.width, _canvas.height);
let offscreenCtx = offscreen.getContext("2d");

function updateResults() {
  // Wenn es keine Ergebnisse gibt, gibt es nichts zu anzeigen
  // TODO: Ergebnisse auf Knopfdruck anzeigen oder ausblenden
  if (!_var.results) return;

  const [allPoints, components] = _var.results;
  // Pixel-Buffer direkt beschreiben
  const imageData = offscreenCtx.createImageData(_canvas.width, _canvas.height);
  const data = imageData.data;

  // Für jeden Pixel prüfen ob er in einem Element liegt und dann Farbe bestimmen
  for (const component of components) {
    for (const element of component.elements) {
      const [p1, p2, p3] = element.points;

      // q Punkte sind Koordinaten im Canvas
      const q1 = toPixel(p1);
      const q2 = toPixel(p2);
      const q3 = toPixel(p3);

      // Bounding Box des Dreiecks (geclipt auf Canvas-Größe)
      // -1 und +1 je als margin, so dass Element auf jeden Fall in bbox liegt
      const bboxXMin = Math.max(0, Math.min(q1.x, q2.x, q3.x) - 1);
      const bboxXMax = Math.min(
        _canvas.width - 1,
        Math.max(q1.x, q2.x, q3.x) + 1,
      );
      const bboxYMin = Math.max(0, Math.min(q1.y, q2.y, q3.y) - 1);
      const bboxYMax = Math.min(
        _canvas.height - 1,
        Math.max(q1.y, q2.y, q3.y) + 1,
      );

      // Vorberechnungen für baryzentrische Koordinaten
      const dX13 = q1.x - q3.x;
      const dX23 = q2.x - q3.x;
      const dY13 = q1.y - q3.y;
      const dY23 = q2.y - q3.y;
      const det = dY23 * dX13 - dX23 * dY13;
      if (Math.abs(det) < 1) continue; // degeneriertes Dreieck überspringen

      // Jeden Pixel in der Bounding Box testen
      for (let py = bboxYMin; py <= bboxYMax; py++) {
        for (let px = bboxXMin; px <= bboxXMax; px++) {
          // Baryzentrische Koordinaten berechnen
          const dx = px - q3.x;
          const dy = py - q3.y;
          const lambda1 = (dY23 * dx - dX23 * dy) / det;
          const lambda2 = (dY13 * dx - dX13 * dy) / -det; // Vorzeichen beachten
          const lambda3 = 1 - lambda1 - lambda2;

          // Punkt liegt außerhalb des Dreiecks
          const EPS_PIX = 0.01;
          if (lambda1 < -EPS_PIX || lambda2 < -EPS_PIX || lambda3 < -EPS_PIX)
            continue;

          // Temperatur interpolieren
          const t =
            lambda1 * q1.temperatur +
            lambda2 * q2.temperatur +
            lambda3 * q3.temperatur;

          const color = temperaturToColor(t);
          const idx = (py * _canvas.width + px) * 4;

          data[idx] = color[0]; // R
          data[idx + 1] = color[1]; // G
          data[idx + 2] = color[2]; // B
          data[idx + 3] = _colorgradient.alpha; // Alpha
        }
      }
    }
  }
  offscreenCtx.putImageData(imageData, 0, 0);
  context.drawImage(offscreen, 0, 0);
  context.restore();
  // Isolinien darüber (bleiben wie gehabt)
  context.save();
  context.translate(offsetXCanvas, offsetYCanvas);
  context.scale(scale, scale);
  for (const component of components) {
    for (const element of component.elements) {
      const [p1, p2, p3] = element.points;
      drawIsolines(context, p1, p2, p3);
    }
  }
  context.restore();
}

function drawIsolines(
  ctx,
  p1,
  p2,
  p3,
  tMin = _colorgradient.tMin,
  tMax = _colorgradient.tMax,
) {
  const tIsos = [12.6];
  // Zeichnet Isolinien für gleichmäßig verteilte Temperaturstufen
  for (const tIso of tIsos) {
    // Schnittpunkte der Isolinie mit den 3 Kanten des Dreiecks
    const intersections = [];
    const edges = [
      [p1, p2],
      [p2, p3],
      [p3, p1],
    ];
    for (const [a, b] of edges) {
      if (
        (a.temperature <= tIso && b.temperature >= tIso) ||
        (a.temperature >= tIso && b.temperature <= tIso)
      ) {
        const t = (tIso - a.temperature) / (b.temperature - a.temperature);
        intersections.push({
          x: a.x + t * (b.x - a.x),
          y: a.y + t * (b.y - a.y),
        });
      }
    }
    if (intersections.length === 2) {
      ctx.beginPath();
      ctx.moveTo(intersections[0].x, intersections[0].y);
      ctx.lineTo(intersections[1].x, intersections[1].y);
      ctx.strokeStyle = "rgba(0, 0, 0, 0.5)";
      ctx.lineWidth = 0.5 / scale;
      ctx.stroke();
    }
  }
}

function getTemperatureAtCursor() {
  if (!_var.results) return null;

  const [allPoints, components] = _var.results;
  const [mouseX, mouseY] = getCursorCoords();

  for (const component of components) {
    for (const element of component.elements) {
      const [p1, p2, p3] = element.points;

      // Baryzentrische Koordinaten berechnen (gleiche Logik wie in updateResults)
      const dX13 = p1.x - p3.x;
      const dX23 = p2.x - p3.x;
      const dY13 = p1.y - p3.y;
      const dY23 = p2.y - p3.y;
      const det = dY23 * dX13 - dX23 * dY13;
      if (Math.abs(det) < 1e-10) continue;

      const dx = mouseX - p3.x;
      const dy = mouseY - p3.y;
      const lambda1 = (dY23 * dx - dX23 * dy) / det;
      const lambda2 = (dY13 * dx - dX13 * dy) / -det;
      const lambda3 = 1 - lambda1 - lambda2;

      // Maus liegt im Dreieck
      if (lambda1 >= 0 && lambda2 >= 0 && lambda3 >= 0) {
        const t =
          lambda1 * p1.temperature +
          lambda2 * p2.temperature +
          lambda3 * p3.temperature;
        return t;
      }
    }
  }
  return null; // Maus liegt außerhalb aller Elemente
}
