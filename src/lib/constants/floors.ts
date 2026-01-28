/**
 * Frontier Tower floor options for the floor lead application.
 * Used in ProposalStep dropdown and ReviewStep display.
 */
export const FRONTIER_TOWER_FLOORS = [
  { value: "floor-4", label: "Floor 4 - Robotics & Hard Tech" },
  { value: "floor-5", label: "Floor 5 - Movement Floor & Fitness Center" },
  { value: "floor-6", label: "Floor 6 - Arts & Music" },
  { value: "floor-7", label: "Floor 7 - Frontier Maker Space" },
  { value: "floor-8", label: "Floor 8 - Neuro & Biotech" },
  { value: "floor-9", label: "Floor 9 - AI & Autonomous Systems" },
  { value: "floor-10", label: "Floor 10 - Frontier @ Accelerate" },
  { value: "floor-11", label: "Floor 11 - Health & Longevity" },
  { value: "floor-12", label: "Floor 12 - Ethereum & Decentralized Tech" },
  { value: "floor-13", label: "Floor 13 - Ethereum & Decentralized Tech" },
] as const;

// Type for floor values
export type FloorValue = (typeof FRONTIER_TOWER_FLOORS)[number]["value"];

/**
 * Helper to get floor label from value
 */
export function getFloorLabel(value: string): string {
  const floor = FRONTIER_TOWER_FLOORS.find((f) => f.value === value);
  return floor?.label ?? value;
}
