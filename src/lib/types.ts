
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
  osmId?: string;
  address: string;
  coordinates: Coordinates;
  year: string;
  projectType: 'Типовой' | 'Индивидуальный';
  buildingSeries: string[];
  architect?: string;
  purpose: string;
  floors: number;
  imageUrl: string;
  floorPlans: FloorPlan[];
};

export type HouseWithId = House & { id: string };
