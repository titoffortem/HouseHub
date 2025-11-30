export type House = {
  address: string;
  // Can be a single point [lat, lon] or a polygon [[lat, lon], [lat, lon], ...]
  coordinates: [number, number] | [number, number][];
  year: number;
  buildingSeries: string;
  floors: number;
  floorPlanUrl: string;
  floorPlanHint: string;
};

export type HouseWithId = House & { id: string };
