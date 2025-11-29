export type House = {
  address: string;
  price: number;
  coordinates: [number, number];
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
