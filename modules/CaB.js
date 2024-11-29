import * as matrix from "/modules/matrix.js";

export class Component {
  constructor(cornerPoints, lambda = 1) {
    this.cornerPoints = cornerPoints;
    this.lambda = lambda;
    this.elements = [];
    this.points = [...cornerPoints];

    this.xMin = cornerPoints[0].x;
    this.xMax = cornerPoints[0].x;
    this.yMin = cornerPoints[0].y;
    this.yMax = cornerPoints[0].y;
    for (const cornerPoint of cornerPoints) {
      if (cornerPoint.x < this.xMin) {
        this.xMin = cornerPoint.x;
      }
      if (cornerPoint.x > this.xMax) {
        this.xMax = cornerPoint.x;
      }
      if (cornerPoint.y < this.yMin) {
        this.yMin = cornerPoint.y;
      }
      if (cornerPoint.y > this.yMax) {
        this.yMax = cornerPoint.y;
      }
    }
  }
}

export class Line {
  constructor(point1, point2) {
    this.p1 = point1;
    this.p2 = point2;
  }
}

export class Element {
  constructor(points, circle = undefined, lambda = 1) {
    this.points = points;
    this.lambda = lambda;
    this.circle = circle;
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

export class Circle {
  constructor(x, y, radius) {
    this.x = x;
    this.y = y;
    this.radius = radius;
  }
}
