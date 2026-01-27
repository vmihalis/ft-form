/**
 * Frontier Tower floor options for the floor lead application.
 * Used in ProposalStep dropdown and ReviewStep display.
 */
export const FRONTIER_TOWER_FLOORS = [
  { value: "floor-2", label: "Floor 2 - The Spaceship (Events)" },
  { value: "floor-3", label: "Floor 3 - Private Offices" },
  { value: "floor-4", label: "Floor 4 - Robotics / Cyberpunk Lab" },
  { value: "floor-8", label: "Floor 8 - Biotech" },
  { value: "floor-11", label: "Floor 11 - Longevity" },
  { value: "floor-12", label: "Floor 12 - Ethereum House" },
  { value: "ai", label: "AI Floor" },
  { value: "neurotech", label: "Neurotech Floor" },
  { value: "arts-music", label: "Arts & Music Floor" },
  { value: "human-flourishing", label: "Human Flourishing Floor" },
  { value: "other", label: "Other (propose a new floor)" },
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
