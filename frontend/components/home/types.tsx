// Shared TypeScript types for Home screen components.
// FoodItem is saved/displayed data; FoodDraft is temporary form data.

export interface FoodItem {
  // Normalized food shape used by the Home UI after reading from the backend.
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
  // Editable form state before a food item is saved.
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
