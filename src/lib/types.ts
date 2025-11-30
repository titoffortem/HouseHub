export type House = {
  address: string;
  price: number;
  // Can be a single point [lat, lon] or a polygon [[lat, lon], [lat, lon], ...]
  coordinates: [number, number] | [number, number][];
  size: number; // in sq meters
  rooms: number;
  year: number;
  wallMaterial: string;
  buildingSeries: string;
  floors: number;
  hasElevator: boolean;
  floorType: string;
  foundationType: string;
  hasGarbageChute: boolean;
  hotWaterSupply: string;
  floorPlanUrl: string;
  floorPlanHint: string;
};

export type HouseWithId = House & { id: string };
