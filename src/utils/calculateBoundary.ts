//This function is used to calculate all the coordinates near from the point
//that u give to it in some meters (in this app case 1000m). This is necessary
//to we use the boundary values inside the getRegionBySpecificPoint method at RegionsController.
export const calculateCircularBoundary = (
  coordinates: [number, number],
  radius: number,
  numSides: number
) => {
  const points = [];
  const deltaAngle = (2 * Math.PI) / numSides;

  for (let i = 0; i < numSides; i++) {
    const angle = i * deltaAngle;
    const dx = radius * Math.cos(angle);
    const dy = radius * Math.sin(angle);
    const pointLongitude =
      coordinates[0] +
      (dx / 111320) * Math.cos((coordinates[1] * Math.PI) / 180);
    const pointLatitude = coordinates[1] + dy / 110540;
    points.push([pointLongitude, pointLatitude]);
  }

  // Close the polygon by repeating the first point
  points.push(points[0]);
  return points;
};
