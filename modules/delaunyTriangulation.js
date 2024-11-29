import { Component, Element, Point, Circle } from "./CaB.js";

function r_point(point, style = "red", size = 1) {
  context.fillStyle = style;
  context.fillRect(point.x - size / 2, point.y - size / 2, size, size);
}

function r_line(line, style = "green") {
  context.beginPath();
  context.moveTo(line.p1.x, line.p1.y);
  context.lineTo(line.p2.x, line.p2.y);
  context.strokeStyle = style;
  context.stroke();
}

function r_circle(circle) {
  context.beginPath();
  context.arc(circle.x, circle.y, circle.radius, 0, 2 * Math.PI);
  context.strokeStyle = "blue";
  context.stroke();
  r_point(new Point(circle.x, circle.y), "blue", 2);
}

function redraw(components) {
  context.clearRect(0, 0, canvas.width, canvas.height);
  for (const component of components) {
    let circles = [];
    let lines = [];
    let points = [];
    for (const element of component.elements) {
      circles.push(element.circle);
      for (const line of element.lines) {
        lines.push(line);
      }
      for (const point of element.points) {
        points.push(point);
      }
    }
    // circles.forEach((circle) => r_circle(circle));
    lines.forEach((line) => r_line(line));
    points.forEach((point) => r_point(point));
  }
}

//https://math.stackexchange.com/questions/213658/get-the-equation-of-a-circle-when-given-3-points
function getCircle(p1, p2, p3) {
  const A =
    p1.x * (p2.y - p3.y) - p1.y * (p2.x - p3.x) + p2.x * p3.y - p3.x * p2.y;
  if (A == 0) {
    throw new Error("Error: 2 points are exact oposits on the x-y scale!");
  }

  const B =
    (Math.pow(p1.x, 2) + Math.pow(p1.y, 2)) * (p3.y - p2.y) +
    (Math.pow(p2.x, 2) + Math.pow(p2.y, 2)) * (p1.y - p3.y) +
    (Math.pow(p3.x, 2) + Math.pow(p3.y, 2)) * (p2.y - p1.y);

  const C =
    (Math.pow(p1.x, 2) + Math.pow(p1.y, 2)) * (p2.x - p3.x) +
    (Math.pow(p2.x, 2) + Math.pow(p2.y, 2)) * (p3.x - p1.x) +
    (Math.pow(p3.x, 2) + Math.pow(p3.y, 2)) * (p1.x - p2.x);

  const D =
    (Math.pow(p1.x, 2) + Math.pow(p1.y, 2)) * (p3.x * p2.y - p2.x * p3.y) +
    (Math.pow(p2.x, 2) + Math.pow(p2.y, 2)) * (p1.x * p3.y - p3.x * p1.y) +
    (Math.pow(p3.x, 2) + Math.pow(p3.y, 2)) * (p2.x * p1.y - p1.x * p2.y);

  const x = -B / (2 * A);
  const y = -C / (2 * A);
  const radius = Math.sqrt(
    (Math.pow(B, 2) + Math.pow(C, 2) - 4 * A * D) / (4 * Math.pow(A, 2))
  );

  return new Circle(x, y, radius);
}

function getElementCenter(element) {
  const x =
    (element.points[0].x + element.points[1].x + element.points[2].x) / 3;
  const y =
    (element.points[0].y + element.points[1].y + element.points[2].y) / 3;
  return new Point(x, y);
}

function getDistance(p1, p2) {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}

function getAngleCircle(center, p2) {
  return Math.atan2(p2.y - center.y, p2.x - center.x);
}

function inCircle(circle, point) {
  if (getDistance(circle, point) <= circle.radius) {
    return true;
  } else {
    return false;
  }
}

function pointNotInPoints(point, points) {
  for (const p of points) {
    if (p.x == point.x && p.y == point.y) {
      return false;
    }
  }
  return true;
}

function pointInPolygon(point, polygon) {
  const numVertices = polygon.length;
  const x = point.x;
  const y = point.y;
  let inside = false;

  let p1 = polygon[0];
  let p2;

  for (let i = 1; i <= numVertices; i++) {
    p2 = polygon[i % numVertices];

    if (y > Math.min(p1.y, p2.y)) {
      if (y <= Math.max(p1.y, p2.y)) {
        if (x <= Math.max(p1.x, p2.x)) {
          const x_intersection =
            ((y - p1.y) * (p2.x - p1.x)) / (p2.y - p1.y) + p1.x;

          if (p1.x === p2.x || x <= x_intersection) {
            inside = !inside;
          }
        }
      }
    }

    p1 = p2;
  }

  return inside;
}

export function calculate_elements(components) {
  const maxElementSize = 1.5; // max. size of elements on edge and inside components
  const minElements = 5; // min. number of elements on edge

  // TODO: check if components are overlaping

  // check if components lay next to each other and add cornerpoint of the neighbor to the component
  // https://stackoverflow.com/questions/17692922/check-is-a-point-x-y-is-between-two-points-drawn-on-a-straight-line
  for (const mainComponent of components) {
    for (const secComponent of components) {
      if (mainComponent == secComponent) {
        continue;
      }

      secComp: for (const p3 of secComponent.points) {
        if (!pointNotInPoints(p3, mainComponent.points)) {
          continue secComp;
        }
        for (let [i, p1] of mainComponent.points.entries()) {
          let p2 = mainComponent.points[i + 1];
          if (p2 === undefined) {
            p2 = mainComponent.points[0];
          }
          if (
            getDistance(p1, p3) + getDistance(p2, p3) ==
            getDistance(p1, p2)
          ) {
            mainComponent.points.splice(i + 1, 0, p3);
            continue secComp;
          }
        }
      }
    }
  }

  // add points to all edges of components
  for (const component of components) {
    const numOfEdges = component.points.length;
    for (let i = 0; i < numOfEdges; i++) {
      const tmpP1 = component.points[i];
      let tmpP2;
      if (i == numOfEdges - 1) {
        tmpP2 = component.points[0];
      } else {
        tmpP2 = component.points[i + 1];
      }

      // all edges get pointed in the same direktion
      let p1;
      let p2;
      if (tmpP1.x > tmpP2.x || tmpP1.y > tmpP2.y) {
        [p1, p2] = [tmpP2, tmpP1];
      } else {
        [p1, p2] = [tmpP1, tmpP2];
      }

      const dist = getDistance(p1, p2);

      let numPointsOnEdge = Math.floor(dist / maxElementSize);
      if (numPointsOnEdge < minElements) {
        numPointsOnEdge = minElements;
      }

      for (let j = 1; j <= numPointsOnEdge; j++) {
        const x = p1.x + (j * (p2.x - p1.x)) / (numPointsOnEdge + 1);
        const y = p1.y + (j * (p2.y - p1.y)) / (numPointsOnEdge + 1);

        const p = new Point(x, y);
        if (pointNotInPoints(p, component.points)) {
          component.points.push(p);
        }
      }
    }
  }

  // add points to the inside of the components
  for (const component of components) {
    const dX = component.xMax - component.xMin;
    const dY = component.yMax - component.yMin;

    let numPointsOnDX = Math.floor(dX / maxElementSize);
    if (numPointsOnDX < minElements) {
      numPointsOnDX = minElements;
    }
    let numPointsOnDY = Math.floor(dY / maxElementSize);
    if (numPointsOnDY < minElements) {
      numPointsOnDY = minElements;
    }

    for (let pX = 1; pX <= numPointsOnDX; pX++) {
      for (let pY = 1; pY <= numPointsOnDY; pY++) {
        const x = component.xMin + (pX * dX) / (numPointsOnDX + 1);
        const y = component.yMin + (pY * dY) / (numPointsOnDY + 1);

        const p = new Point(x, y);
        if (
          pointInPolygon(p, component.cornerPoints) &&
          pointNotInPoints(p, component.points)
        )
          component.points.push(p);
      }
    }
  }

  // define the supertriangle. It has to be so big, that all points are contained in it
  let superTriangle = [
    new Point(-100000, -100000),
    new Point(-100000, 100000),
    new Point(200000, -100000),
  ];

  for (let [i, component] of components.entries()) {
    // create triangle out of supertriangle
    component.elements.push(
      new Element(
        [superTriangle[0], superTriangle[1], superTriangle[2]],
        getCircle(superTriangle[0], superTriangle[1], superTriangle[2]),
        component.lambda
      )
    );

    // afterwards check every point and do the Delaunay-Triangulation
    for (let point of component.points) {
      let newFreePoints = [];
      let newElements = [];
      for (let j = component.elements.length - 1; j >= 0; j--) {
        if (inCircle(component.elements[j].circle, point)) {
          for (const p of component.elements[j].points) {
            newFreePoints.push(p);
          }
          components[i].elements.splice(j, 1);
        }
      }

      // remove duplicates of newFreePoints
      checkpoint: for (let k = newFreePoints.length - 1; k >= 0; k--) {
        for (let l = k - 1; l >= 0; l--) {
          if (
            newFreePoints[k].x == newFreePoints[l].x &&
            newFreePoints[k].y == newFreePoints[l].y
          ) {
            newFreePoints.splice(k, 1);
            continue checkpoint;
          }
        }
      }

      // create triangles
      let anglePoints = [];
      for (const p of newFreePoints) {
        anglePoints.push([getAngleCircle(point, p), p]);
      }
      anglePoints.sort((a, b) => a[0] - b[0]);

      for (let k = 0; k < anglePoints.length; k++) {
        if (k == anglePoints.length - 1) {
          newElements.push(
            new Element(
              [point, anglePoints[k][1], anglePoints[0][1]],
              getCircle(point, anglePoints[k][1], anglePoints[0][1]),
              component.lambda
            )
          );
        } else {
          newElements.push(
            new Element(
              [point, anglePoints[k][1], anglePoints[k + 1][1]],
              getCircle(point, anglePoints[k][1], anglePoints[k + 1][1]),
              component.lambda
            )
          );
        }
      }

      for (const element of newElements) {
        component.elements.push(element);
      }
    }
  }

  // check if element is outside of the polygon and remove if it is
  for (const component of components) {
    for (let i = component.elements.length - 1; i >= 0; i--) {
      if (
        !pointInPolygon(
          getElementCenter(component.elements[i]),
          component.cornerPoints
        )
      ) {
        component.elements.splice(i, 1);
      }
    }
  }

  // delete the supertriangle
  for (const component of components) {
    checkpoint: for (let i = component.elements.length - 1; i >= 0; i--) {
      for (const point of component.elements[i].points) {
        if (
          point == superTriangle[0] ||
          point == superTriangle[1] ||
          point == superTriangle[2]
        ) {
          component.elements.splice(i, 1);
          continue checkpoint;
        }
      }
    }
  }

  let elementCount = 0;
  let pointCount = 0;
  for (const component of components) {
    elementCount += component.elements.length;
    pointCount += component.points.length;
  }
  console.log("ElementCount: " + elementCount);
  console.log("PointCount: " + pointCount);

  let allElements = [];
  for (const component of components) {
    for (const element of component.elements) {
      allElements.push(element);
    }
  }
  return allElements;
}
