
export type GeoPoint = {
  lat: number;
  lng: number;
};

export type Coordinates = {
  type: "Point" | "Polygon";
  points: GeoPoint[];
};

export type FloorPlan = {
  url: string;
};

export type House = {
  address: string;
  coordinates: Coordinates;
  year: number;
  buildingSeries: string[];
  floors: number;
  imageUrl: string;
  floorPlans: FloorPlan[];
};

export type HouseWithId = House & { id: string };
