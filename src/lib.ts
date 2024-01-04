class GeoLib {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.GOOGLE_GEOCODING_API_KEY;
    this.baseUrl = "https://maps.googleapis.com/maps/api/geocode/json";
  }

  public async getAddressFromCoordinates(
    coordinates: [number, number] | { lng: number; lat: number }
  ): Promise<string> {
    try {
      //Ensure that the coordinates comes as [lng,lat] because is the standard format
      //to work using 2dsphere format for coordinates.
      const [lng, lat] = Array.isArray(coordinates)
        ? coordinates
        : [coordinates.lng, coordinates.lat];
      const url = `${this.baseUrl}?latlng=${lat},${lng}&key=${this.apiKey}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.status === "OK") {
        return data.results[0].formatted_address; // Returns the full address
      } else {
        throw new Error(data.error_message || "Unable to geocode coordinates");
      }
    } catch (error) {
      throw new Error("Geocoding failed: " + error.message);
    }
  }

  public async getCoordinatesFromAddress(
    address: string
  ): Promise<{ lng: number; lat: number }> {
    try {
      const url = `${this.baseUrl}?address=${encodeURIComponent(address)}&key=${
        this.apiKey
      }`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.status === "OK") {
        const location = data.results[0].geometry.location;
        return { lng: location.lng, lat: location.lat };
      } else {
        throw new Error(
          data.error_message || "Unable to find coordinates for address"
        );
      }
    } catch (error) {
      throw new Error("Reverse geocoding failed: " + error.message);
    }
  }
}

const GeoLibInstance = new GeoLib();

export default GeoLibInstance;
