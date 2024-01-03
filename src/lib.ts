class GeoLib {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.GOOGLE_GEOCODING_API_KEY;
    this.baseUrl = "https://maps.googleapis.com/maps/api/geocode/json";
  }

  public async getAddressFromCoordinates(
    coordinates: [number, number] | { lat: number; lng: number }
  ): Promise<string> {
    try {
      const [lat, lng] = Array.isArray(coordinates)
        ? coordinates
        : [coordinates.lat, coordinates.lng];
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
  ): Promise<{ lat: number; lng: number }> {
    try {
      const url = `${this.baseUrl}?address=${encodeURIComponent(address)}&key=${
        this.apiKey
      }`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.status === "OK") {
        const location = data.results[0].geometry.location;
        return { lat: location.lat, lng: location.lng };
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
