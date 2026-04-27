const _canvas = {
  height: 650,
  width: 800,
  startScale: 2,
  startOffset: { x: 200, y: 150 },
  zoom: {
    delta: 0.1,
    max: 10,
    min: 0.1,
  },
  mode: "dragging" /* dragging, drawComp, drawBC, 
  editComp, editBC, eraseComp, eraseBC */,
};

// Hintergrund
const _background = {
  color: "white",
};

// Koordinatennetz
const _grid = {
  active: false,
  distance: 10,
  color: "black",
};

// Bauteile
const _component = {
  border: true,
  borderColor: "black",
  infill: true,
};

// Cursor
const _cursor = {
  width: 5,
  magnet: true,
  catch: {
    distance: 30,
    corner: true,
    line_center: true,
    object_center: true,
  },
  color: "black",
};

// Keybindings
const _keybindings = {
  resetZoom: "KeyR",
  // toggleGrid: "KeyG",
  toggleCursorMagnet: "KeyM",
  toggleModeDragging: "KeyC",
  toggleModeDrawComponent: "KeyV",
  toggleModeDrawBoundaryCondition: "KeyB",
  addComponent: "Enter",
  addComponent2: "NumpadEnter",
};

const _colorgradient = {
  tMin: -5,
  tMax: 20,
  _0: "blue",
  _25: "lighblue",
  _50: "green",
  _75: "yellow",
  _100: "red",
  alpha: 220,
};
