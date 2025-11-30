
export type GeoPoint = {
  lat: number;
  lng: number;
};

export type Coordinates = {
  type: "Point" | "Polygon";
  points: GeoPoint[];
};

export type House = {
  address: string;
  coordinates: Coordinates;
  year: number;
  buildingSeries: string;
  floors: number;
  floorPlanUrl: string;
  floorPlanHint: string;
  imageUrl: string;
  imageHint: string;
};

export type HouseWithId = House & { id: string };
