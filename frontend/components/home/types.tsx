// Shared types for the Home screen and its components.
// FoodItem is saved data, while FoodDraft is the form before saving.

export interface FoodItem {
  // This is the food shape the Home UI uses.
  id: string;
  imageUri: string | null;
  imageData: string | null;
  name: string;
  type: string;
  expiryDate: string;
  purchaseDate: string;
  amount: string;
  unit: string;
  description: string;
  useExtractFeature: boolean;
}

export interface FoodDraft {
  // This is the form data before a food item is saved.
  imageUri: string | null;
  imageData: string | null;
  name: string;
  type: string;
  expiryDate: string;
  purchaseDate: string;
  amount: string;
  unit: string;
  description: string;
  useExtractFeature: boolean;
}

export type SortMode = "none" | "name_az";
