export class Component {
  constructor(x, y, width, height, lambda) {
    this.x1 = x;
    this.x2 = x + width;
    this.y1 = y;
    this.y2 = y + height;
    this.width = width;
    this.height = height;
    this.lambda = lambda;
  }
}

export class Element {
  constructor(x, y, elementWidth, elementHeight, lambda) {
    this.x1 = x;
    this.x2 = x + elementWidth;
    this.y1 = y;
    this.y2 = y + elementHeight;
    this.alpha = lambda / elementWidth; // TODO: Change to include elementHeight

    this.points = [
      new Point(this.x1, this.y1),
      new Point(this.x2, this.y1),
      new Point(this.x1, this.y2),
      new Point(this.x2, this.y2),
    ];

    this.matrix = [
      [2 * this.alpha, -this.alpha, -this.alpha, 0],
      [-this.alpha, 2 * this.alpha, 0, -this.alpha],
      [-this.alpha, 0, 2 * this.alpha, -this.alpha],
      [0, -this.alpha, -this.alpha, 2 * this.alpha],
    ];
  }
}

export class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.temperature = 10;
    this.heatFlow = 0;
  }
}

export class BoundaryConditionPoint {
  constructor(temperature) {
    this.temperature = temperature;
    this.heatFlow = 0;
    this.boundaryCondition = true;
  }
}

export class BoundaryCondition {
  constructor(x, y, width, height, condition) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    if (condition == 0) {
      this.temperature = 20;
      this.alpha = 0.19;
    } else if (condition == 1) {
      this.temperature = 0;
      this.alpha = 0.04;
    }

    this.matrix = [
      [this.alpha, -this.alpha],
      [-this.alpha, this.alpha],
    ];
  }
}

export class CanvasData {
  constructor() {
    this.is_down = false;
    this.near_point = false;
    this.x_down = 0;
    this.y_down = 0;
    this.x_up = 0;
    this.y_up = 0;
  }
}
