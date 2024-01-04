import GeoLib from "./lib";

export const validateCoordinatesSpecificPoint = async (
  address: string,
  lng: number,
  lat: number
) => {
  let coordinates: String | [number, number];

  if (address) {
    const { lng, lat } = await GeoLib.getCoordinatesFromAddress(
      address as string
    );
    coordinates = [lng, lat];
  } else if (lat && lng) {
    coordinates = [lng, lat];
  }

  return coordinates;
};
