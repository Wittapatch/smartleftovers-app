import { CameraFoodModal } from "@/components/home/CameraFoodModal";
import { FilterModal } from "@/components/home/FilterModal";
import { FoodCard } from "@/components/home/FoodCard";
import { FoodFormModal } from "@/components/home/FoodFormModal";
import { HomeActionButtons } from "@/components/home/HomeActionButtons";
import { ImagePreviewModal } from "@/components/home/ImagePreviewModal";
import { IngredientPickerModal } from "@/components/home/IngredientPickerModal";
import { FoodDraft, FoodItem, SortMode } from "@/components/home/types";
import { useCallback, useEffect, useMemo, useState } from "react";
import {Alert,FlatList,Platform,Text,View} from "react-native";
import { auth } from "@/config/firebaseConfig";
import { onAuthStateChanged, type User } from "firebase/auth";
import { useFocusEffect, useRouter } from "expo-router";
import { apiJsonFetch, getApiUrl } from "@/lib/api";
import {analyzeImageWithGemini, ExtractedFoodData} from "@/lib/analyzeImageWithGemini";
import { chooseWebImageData, prepareImageUriForStorage } from "@/lib/imageStorage";
import { getFriendlyErrorMessage } from "@/lib/userFriendlyError";
import { styles } from "@/components/styles/index.styles";

// This is the main Home screen.
// It loads the food inventory, handles add/edit/delete, uses Gemini for photos,
// and opens ChefBot with selected ingredients.

interface StoredFoodItem {
  // This matches the food data we get back from the backend.
  food_id: string;
  image_uri?: string | null;
  image_data?: string | null;
  name?: string | null;
  food_type?: string | null;
  expiry_date?: string | null;
  purchase_date?: string | null;
  quantity?: number | string | null;
  unit?: string | null;
  description?: string | null;
  use_extract_feature?: boolean | null;
}

interface FoodListResponse {
  // This is the response from GET /foods.
  food_items?: StoredFoodItem[];
  error?: string;
}

interface FoodWriteResponse {
  // This is the response from add, update, and delete food requests.
  food_id?: string;
  error?: string;
}

const getTodayDate = () => {
  // New food starts with today's date as the purchase date.
  const today = new Date();

  return today.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "numeric",
    year: "2-digit",
  });
};

const mapStoredFoodToFoodItem = (food: StoredFoodItem): FoodItem => {
  // Convert backend field names into the field names our components use.
  return {
    id: food.food_id,
    imageUri: food.image_uri ?? null,
    imageData: food.image_data ?? null,
    name: food.name ?? "",
    type: food.food_type ?? "",
    expiryDate: food.expiry_date ?? "",
    purchaseDate: food.purchase_date ?? "",
    amount: food.quantity == null ? "" : String(food.quantity),
    unit: food.unit ?? "",
    description: food.description ?? "",
    useExtractFeature: Boolean(food.use_extract_feature),
  };
};

const createEmptyDraft = (): FoodDraft => {
  // Start the add/edit form with empty food values.
  return {
    imageUri: null,
    imageData: null,
    name: "",
    type: "",
    expiryDate: "",
    purchaseDate: getTodayDate(),
    amount: "",
    unit: "",
    description: "",
    useExtractFeature: false,
  };
};

const parseOptionalAmount = (amount: string) => {
  const trimmedAmount = amount.trim();

  if (!trimmedAmount) {
    return null;
  }

  const parsedAmount = Number(trimmedAmount);

  if (!Number.isFinite(parsedAmount) || parsedAmount < 0) {
    return undefined;
  }

  return parsedAmount;
};

const parseFoodDate = (value: string) => {
  // Parse the date that the user typed so we can compare it.
  const trimmedValue = value.trim();

  if (!/^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(trimmedValue)) {
    return null;
  }

  const parts = trimmedValue.split("/");

  if (parts.length !== 3) {
    return null;
  }

  const day = Number(parts[0]);
  const month = Number(parts[1]);
  const yearPart = Number(parts[2]);
  const year = yearPart < 100 ? 2000 + yearPart : yearPart;

  if (!day || !month || !year) {
    return null;
  }

  const parsedDate = new Date(year, month - 1, day);
  parsedDate.setHours(0, 0, 0, 0);

  if (
    parsedDate.getDate() !== day ||
    parsedDate.getMonth() !== month - 1 ||
    parsedDate.getFullYear() !== year
  ) {
    return null;
  }

  return parsedDate;
};

const getDateValidationError = (
  expiryDateValue: string,
  purchaseDateValue: string,
) => {
  // Check dates before saving so expiry logic does not get confused.
  const expiryText = expiryDateValue.trim();
  const purchaseText = purchaseDateValue.trim();
  const expiryDate = expiryText ? parseFoodDate(expiryText) : null;
  const purchaseDate = purchaseText ? parseFoodDate(purchaseText) : null;

  if (expiryText && !expiryDate) {
    return "Expiry date must use DD/MM/YY, for example 17/05/26.";
  }

  if (purchaseText && !purchaseDate) {
    return "Purchase date must use DD/MM/YY, for example 17/05/26.";
  }

  if (expiryDate && purchaseDate && purchaseDate.getTime() > expiryDate.getTime()) {
    return "Purchase date cannot be after expiry date.";
  }

  return "";
};

const isFoodExpired = (food: FoodItem) => {
  // Hide expired food from Home, but keep it saved for Notifications.
  if (!food.expiryDate) {
    return false;
  }

  const expiryDate = parseFoodDate(food.expiryDate);

  if (!expiryDate) {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return expiryDate.getTime() < today.getTime();
};

const isExpiryDateTextExpired = (expiryDateText: string) => {
  // Check if a saved food will be hidden because it is already expired.
  if (!expiryDateText) {
    return false;
  }

  const expiryDate = parseFoodDate(expiryDateText);

  if (!expiryDate) {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return expiryDate.getTime() < today.getTime();
};

const getDisplayImageUri = (food: FoodItem) => {
  // Web cannot show mobile local file paths, so use stored image data first.
  if (food.imageData) {
    return food.imageData;
  }

  if (!food.imageUri) {
    return null;
  }

  if (Platform.OS === "web") {
    return food.imageUri.startsWith("http") || food.imageUri.startsWith("data:")
      ? food.imageUri
      : null;
  }

  return food.imageUri;
};

const hasUnsyncedWebImage = (food: FoodItem) => {
  // This is true when web needs the user to re-add an image.
  return (
    Platform.OS === "web" &&
    Boolean(food.imageUri) &&
    !food.imageData &&
    !food.imageUri?.startsWith("http") &&
    !food.imageUri?.startsWith("data:")
  );
};

export default function HomeScreen() {
  const router = useRouter();

  // Backend URL comes from EXPO_PUBLIC_API_URL.
  const API_URL = getApiUrl();

  // Loading values for image extraction and food loading.
  const [loading, setLoading] = useState(false);
  const [loadingFoods, setLoadingFoods] = useState(true);

  // Current Firebase user decides which food list we load.
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Main food list shown on Home.
  const [foods, setFoods] = useState<FoodItem[]>([]);

  // Modal and temporary screen state.
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showIngredientModal, setShowIngredientModal] = useState(false);
  const [formErrorMessage, setFormErrorMessage] = useState("");
  const [homeStatusMessage, setHomeStatusMessage] = useState("");
  const [savingFood, setSavingFood] = useState(false);

  // ChefBot ingredient selection values.
  const [selectedChatFoodIds, setSelectedChatFoodIds] = useState<string[]>([]);
  const [chatServings, setChatServings] = useState("1");

  // Filter, sort, and menu state for the food list.
  const [sortMode, setSortMode] = useState<SortMode>("none");
  const [selectedFoodType, setSelectedFoodType] = useState<string | null>(null);
  const [openWebMenuFoodId, setOpenWebMenuFoodId] = useState<string | null>(null);
  const [previewingImageUri, setPreviewingImageUri] = useState<string | null>(null);

  // Draft keeps form values before the user saves.
  const [draft, setDraft] = useState<FoodDraft>(createEmptyDraft());

  // null means adding new food; an id means editing existing food.
  const [editingFoodId, setEditingFoodId] = useState<string | null>(null);

  useEffect(() => {
    // Hide the saved/updated message after a few seconds.
    if (!homeStatusMessage) {
      return;
    }

    const timeoutId = setTimeout(() => {
      setHomeStatusMessage("");
    }, 3000);

    return () => clearTimeout(timeoutId);
  }, [homeStatusMessage]);

  const displayedFoods = useMemo(() => {
    // Filter and sort a copy so the original saved food list stays unchanged.
    const sortedFoods = foods.filter((food) => {
      if (!selectedFoodType) {
        return true;
      }

      return food.type.toLowerCase() === selectedFoodType.toLowerCase();
    });

    if (sortMode === "name_az") {
      sortedFoods.sort((firstFood, secondFood) =>
        firstFood.name.localeCompare(secondFood.name),
      );
    }

    return sortedFoods;
  }, [foods, selectedFoodType, sortMode]);

  const foodTypes = useMemo(() => {
    // Create filter options from the food types the user already saved.
    const uniqueTypes = new Set<string>();

    foods.forEach((food) => {
      const type = food.type.trim();

      if (type) {
        uniqueTypes.add(type);
      }
    });

    return Array.from(uniqueTypes).sort((firstType, secondType) =>
      firstType.localeCompare(secondType),
    );
  }, [foods]);

  const saveFoodImageData = useCallback(async (food: FoodItem, user: User) => {
    // Mobile photos are local files, so we save image data for web display too.
    if (Platform.OS === "web" || !food.imageUri || food.imageData) {
      return null;
    }

    const imageData = await prepareImageUriForStorage(food.imageUri);

    if (!imageData) {
      return null;
    }

    await apiJsonFetch<FoodWriteResponse>("/update-food", {
      method: "PUT",
      body: JSON.stringify({
        _id: user.uid,
        food_id: food.id,
        image_uri: food.imageUri,
        image_data: imageData,
        name: food.name,
        expiry_date: food.expiryDate || null,
        purchase_date: food.purchaseDate || null,
        food_type: food.type || null,
        quantity: parseOptionalAmount(food.amount) ?? null,
        unit: food.unit || null,
        description: food.description || null,
        use_extract_feature: food.useExtractFeature,
      }),
    });

    return imageData;
  }, []);

  const syncMissingImageData = useCallback((savedFoods: FoodItem[], user: User) => {
    // On mobile, convert missing image data so web can show the image later.
    if (Platform.OS === "web") {
      return;
    }

    savedFoods.forEach((food) => {
      saveFoodImageData(food, user)
        .then((imageData) => {
          if (!imageData) {
            return;
          }

          setFoods((currentFoods) =>
            currentFoods.map((currentFood) =>
              currentFood.id === food.id
                ? {
                    ...currentFood,
                    imageData,
                  }
                : currentFood,
            ),
          );
        })
        .catch((error) => {
          console.log("Could not save image data for web display", error);
        });
    });
  }, [saveFoodImageData]);

  const loadFoods = useCallback(async (user: User) => {
    // Use the Firebase uid so each user only loads their own foods.
    if (!API_URL) {
      Alert.alert("Error", "Missing EXPO_PUBLIC_API_URL");
      setLoadingFoods(false);
      return;
    }

    try {
      setLoadingFoods(true);

      const { data, response } = await apiJsonFetch<FoodListResponse>(
        `/foods?_id=${encodeURIComponent(user.uid)}`,
      );

      if (!response.ok) {
        Alert.alert("Load food failed", getFriendlyErrorMessage(data.error, "Could not load your food. Please try again."));
        return;
      }

      const savedFoods = Array.isArray(data.food_items)
        ? data.food_items.map(mapStoredFoodToFoodItem)
        : [];
      // Expired foods are hidden from Home but not deleted here.
      const activeFoods = savedFoods.filter((food) => !isFoodExpired(food));

      setFoods(activeFoods);
      syncMissingImageData(activeFoods, user);

    } catch (error: any) {
      Alert.alert("Load food failed", getFriendlyErrorMessage(error, "Could not load your food. Please try again."));
    } finally {
      setLoadingFoods(false);
    }
  }, [API_URL, syncMissingImageData]);

  useEffect(() => {
    // If the user logs out, send them back to login.
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);

      if (!user) {
        setFoods([]);
        setLoadingFoods(false);
        router.replace("/login");
        return;
      }

      loadFoods(user);
    });

    return unsubscribe;
  }, [loadFoods, router]);

  useFocusEffect(
    useCallback(() => {
      // Reload foods when the user comes back to the Home tab.
      const user = auth.currentUser;

      if (user) {
        loadFoods(user);
      }
    }, [loadFoods]),
  );

  const openCamera = () => {
    // Opening the camera starts a new food item.
    setEditingFoodId(null);
    setDraft(createEmptyDraft());
    setShowCameraModal(true);
  };

  const openEditFood = (food: FoodItem) => {
    // Copy the selected food into the form before editing.
    setEditingFoodId(food.id);

    setDraft({
      imageUri: food.imageUri,
      imageData: food.imageData,
      name: food.name,
      type: food.type,
      expiryDate: food.expiryDate,
      purchaseDate: food.purchaseDate,
      amount: food.amount,
      unit: food.unit,
      description: food.description,
      useExtractFeature: food.useExtractFeature,
    });

    setShowFormModal(true);
  };

  const openIngredientPicker = () => {
    // ChefBot needs at least one saved food to make a recipe.
    if (foods.length === 0) {
      Alert.alert("No food saved", "Add food first so ChefBot can use it.");
      return;
    }

    // Select all foods first, then the user can unselect any item.
    setSelectedChatFoodIds(foods.map((food) => food.id));
    setChatServings("1");
    setShowIngredientModal(true);
  };

  const toggleChatFood = (foodId: string) => {
    // Add or remove one food from the ChefBot selection.
    setSelectedChatFoodIds((currentIds) =>
      currentIds.includes(foodId)
        ? currentIds.filter((id) => id !== foodId)
        : [...currentIds, foodId],
    );
  };

  const openChefBot = () => {
    // Send only selected foods to the Chat screen.
    const selectedFoods = foods.filter((food) =>
      selectedChatFoodIds.includes(food.id),
    );

    if (selectedFoods.length === 0) {
      Alert.alert("Choose ingredients", "Select at least one food for ChefBot.");
      return;
    }

    setShowIngredientModal(false);
    // Route params must be strings, so we send the foods as JSON text.
    router.push({
      pathname: "/ChatScreen",
      params: {
        servings: chatServings,
        ingredients: JSON.stringify(
          selectedFoods.map((food) => ({
            name: food.name,
            type: food.type,
            quantity: food.amount,
            unit: food.unit,
            expiryDate: food.expiryDate,
            description: food.description,
          })),
        ),
      },
    });
  };

  const deleteFood = async (foodId: string) => {
    // Deleting needs the backend URL and a logged-in user.
    if (!API_URL) {
      Alert.alert("Error", "Missing EXPO_PUBLIC_API_URL");
      return;
    }

    if (!currentUser) {
      Alert.alert("Not logged in", "Please log in again.");
      return;
    }

    try {
      const { data, response } = await apiJsonFetch<FoodWriteResponse>("/delete-food", {
        method: "DELETE",
        body: JSON.stringify({
          _id: currentUser.uid,
          food_id: foodId,
        }),
      });

      if (!response.ok) {
        Alert.alert("Delete food failed", getFriendlyErrorMessage(data.error, "Could not delete this food. Please try again."));
        return;
      }

      setFoods((currentFoods) =>
        // Remove it from the screen after the backend deletes it.
        currentFoods.filter((food) => food.id !== foodId),
      );
    } catch (error: any) {
      Alert.alert("Delete food failed", getFriendlyErrorMessage(error, "Could not delete this food. Please try again."));
    }
  };

  const saveImageDataForFood = async (food: FoodItem, imageData: string) => {
    // On web, this saves an image the user re-attaches to a food.
    if (!currentUser) {
      Alert.alert("Not logged in", "Please log in again.");
      return;
    }

    try {
      const { data, response } = await apiJsonFetch<FoodWriteResponse>("/update-food", {
        method: "PUT",
        body: JSON.stringify({
          _id: currentUser.uid,
          food_id: food.id,
          image_uri: food.imageUri,
          image_data: imageData,
          name: food.name,
          expiry_date: food.expiryDate || null,
          purchase_date: food.purchaseDate || null,
          food_type: food.type || null,
          quantity: parseOptionalAmount(food.amount) ?? null,
          unit: food.unit || null,
          description: food.description || null,
          use_extract_feature: food.useExtractFeature,
        }),
      });

      if (!response.ok) {
        Alert.alert("Image save failed", getFriendlyErrorMessage(data.error, "Could not save the image. Please try again."));
        return;
      }

      setFoods((currentFoods) =>
        // Update the image on screen without reloading all foods.
        currentFoods.map((currentFood) =>
          currentFood.id === food.id
            ? {
                ...currentFood,
                imageData,
              }
            : currentFood,
        ),
      );
    } catch (error: any) {
      Alert.alert("Image save failed", getFriendlyErrorMessage(error, "Could not save the image. Please try again."));
    }
  };

  const chooseImageForWebFood = async (food: FoodItem) => {
    // Web cannot use mobile file paths, so the user can pick a web image.
    if (Platform.OS !== "web") {
      return;
    }

    const imageData = await chooseWebImageData();

    if (!imageData) {
      return;
    }

    saveImageDataForFood(food, imageData);
  };

  const showFoodOptions = (food: FoodItem) => {
    // Web uses an inline menu because action sheets are not available there.
    if (Platform.OS === "web") {
      setOpenWebMenuFoodId((currentFoodId) =>
        currentFoodId === food.id ? null : food.id,
      );
      return;
    }

    // Mobile uses an Alert menu for edit and delete.
    Alert.alert(food.name, "Choose an action", [
      {
        text: "Edit",
        onPress: () => openEditFood(food),
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteFood(food.id),
      },
      {
        text: "Cancel",
        style: "cancel",
      },
    ]);
  };

  const saveFood = async () => {
    // The same form is used for adding and editing food.
    setFormErrorMessage("");

    if (!API_URL) {
      setFormErrorMessage("Missing backend URL. Check EXPO_PUBLIC_API_URL.");
      Alert.alert("Error", "Missing EXPO_PUBLIC_API_URL");
      return;
    }

    if (draft.name.trim() === "") {
      setFormErrorMessage("Please enter a food name before saving.");
      Alert.alert("Missing name", "Name is important. Please enter food name.");
      return;
    }

    const parsedAmount = parseOptionalAmount(draft.amount);

    if (parsedAmount === undefined) {
      setFormErrorMessage("Amount must be a number, such as 1 or 0.5. You can also leave it blank.");
      Alert.alert("Invalid amount", "Please enter a valid amount, such as 1, 0.5, or leave it blank.");
      return;
    }

    const dateValidationError = getDateValidationError(
      draft.expiryDate,
      draft.purchaseDate,
    );

    if (dateValidationError) {
      setFormErrorMessage(dateValidationError);
      Alert.alert("Invalid date", dateValidationError);
      return;
    }

    let imageData = draft.imageData;
    const savedFoodWillBeHidden = isExpiryDateTextExpired(draft.expiryDate);

    try {
      // Convert the image before saving if we can.
      imageData = imageData ?? await prepareImageUriForStorage(draft.imageUri);
    } catch (error) {
      console.log("Could not prepare image for web display", error);
    }

    if (editingFoodId) {
      // Editing updates the backend item and then updates it on screen.
      if (!currentUser) {
        setFormErrorMessage("Please log in again before saving.");
        Alert.alert("Not logged in", "Please log in again.");
        return;
      }

      try {
        setSavingFood(true);
        const { data, response } = await apiJsonFetch<FoodWriteResponse>("/update-food", {
          method: "PUT",
          body: JSON.stringify({
            _id: currentUser.uid,
            food_id: editingFoodId,
            image_uri: draft.imageUri,
            image_data: imageData,
            name: draft.name,
            expiry_date: draft.expiryDate || null,
            purchase_date: draft.purchaseDate || null,
            food_type: draft.type || null,
            quantity: parsedAmount,
            unit: draft.unit || null,
            description: draft.description || null,
            use_extract_feature: draft.useExtractFeature,
          }),
        });

        if (!response.ok) {
          setFormErrorMessage(getFriendlyErrorMessage(data.error, "Could not update this food. Please try again."));
          Alert.alert("Update food failed", getFriendlyErrorMessage(data.error, "Could not update this food. Please try again."));
          return;
        }
      } catch (error: any) {
        setFormErrorMessage(getFriendlyErrorMessage(error, "Could not update this food. Please try again."));
        Alert.alert("Update food failed", getFriendlyErrorMessage(error, "Could not update this food. Please try again."));
        return;
      } finally {
        setSavingFood(false);
      }

      const updatedFood: FoodItem = {
        id: editingFoodId,
        imageUri: draft.imageUri,
        imageData,
        name: draft.name,
        type: draft.type,
        expiryDate: draft.expiryDate,
        purchaseDate: draft.purchaseDate,
        amount: draft.amount,
        unit: draft.unit,
        description: draft.description,
        useExtractFeature: draft.useExtractFeature,
      };

      setFoods((currentFoods) => {
        if (isFoodExpired(updatedFood)) {
          return currentFoods.filter((food) => food.id !== editingFoodId);
        }

        return currentFoods.map((food) =>
          food.id === editingFoodId ? updatedFood : food,
        );
      });
    } else {
      // Adding saves a new backend item and uses the returned food_id.
      if (!currentUser) {
        setFormErrorMessage("Please log in again before saving.");
        Alert.alert("Not logged in", "Please log in again.");
        return;
      }

      try {
        setSavingFood(true);
        const { data, response } = await apiJsonFetch<FoodWriteResponse>("/add-food", {
          method: "POST",
          body: JSON.stringify({
            _id: currentUser.uid,
            image_uri: draft.imageUri,
            image_data: imageData,
            name: draft.name,
            expiry_date: draft.expiryDate || null,
            purchase_date: draft.purchaseDate || null,
            food_type: draft.type || null,
            quantity: parsedAmount,
            unit: draft.unit || null,
            description: draft.description || null,
            use_extract_feature: draft.useExtractFeature,
          }),
        });
        if (!response.ok) {
          setFormErrorMessage(getFriendlyErrorMessage(data.error, "Could not add this food. Please try again."));
          Alert.alert("Add food failed", getFriendlyErrorMessage(data.error, "Could not add this food. Please try again."));
          return;
        }

        if (!data.food_id) {
          setFormErrorMessage("The backend saved no food id. Please try again.");
          Alert.alert("Add food failed", "Backend did not return a food id.");
          return;
        }

        const newFood: FoodItem = {
          // Use the backend id so edit/delete knows which food to change later.
          id: data.food_id,
          imageUri: draft.imageUri,
          imageData,
          name: draft.name,
          type: draft.type,
          expiryDate: draft.expiryDate,
          purchaseDate: draft.purchaseDate,
          amount: draft.amount,
          unit: draft.unit,
          description: draft.description,
          useExtractFeature: draft.useExtractFeature,
        };
        if (!isFoodExpired(newFood)) {
          setFoods((currentFoods) => [newFood, ...currentFoods]);
        }
      } catch (error: any) {
        setFormErrorMessage(getFriendlyErrorMessage(error, "Could not add this food. Please try again."));
        Alert.alert("Add food failed", getFriendlyErrorMessage(error, "Could not add this food. Please try again."));
        return;
      } finally {
        setSavingFood(false);
      }
    }

    setShowFormModal(false);
    setEditingFoodId(null);
    setFormErrorMessage("");
    setHomeStatusMessage(
      savedFoodWillBeHidden
        ? "Food saved as expired and hidden from Home. Check Notifications to delete it."
        : editingFoodId
          ? "Food updated successfully."
          : "Food saved successfully.",
    );
    setDraft(createEmptyDraft());
  };

  const analyzeTakenPhoto = async (uri:string) => {
    // Ask Gemini through the backend to read food details from the image.
    try {
      setLoading(true);

      const result = await analyzeImageWithGemini(uri);

      console.log("Raw Gemini result:", result.rawText);
      console.log("Extracted data:", result.extractedData);

      if (result.extractedData) {
        fillDraftWithExtractedData(result.extractedData);
      } else {
        Alert.alert("Extraction warning", "Gemini returned a result, but it could not be converted into form fields");
      } 
    } catch(error:any) {
      console.log("Extract error", error);
      Alert.alert("Error", getFriendlyErrorMessage(error, "Could not extract image data."));
    } finally { 
      setLoading(false);
    }
  }

  const fillDraftWithExtractedData = (data: ExtractedFoodData) => {
    // Put Gemini's extracted fields into the current form.
    setDraft((currentDraft) => ({
      ...currentDraft,
      // Keep the image that was already taken.
      imageUri: currentDraft.imageUri,
      imageData: currentDraft.imageData,
      // Fill fields from Gemini, but keep user text when Gemini leaves it blank.
      name: data.name || currentDraft.name,
      type: data.food_type || currentDraft.type,
      expiryDate: data.expiry_date || currentDraft.expiryDate,
      purchaseDate: data.purchase_date || currentDraft.purchaseDate,
      amount: data.quantity || currentDraft.amount,
      unit: data.unit || currentDraft.unit,
      description: data.description || currentDraft.description,

      // Remember that the extract feature was used.
      useExtractFeature: true,
    }))
  }

  const renderFoodCard = ({ item }: { item: FoodItem }) => {
    // FlatList uses this to render each food card.
    const displayImageUri = getDisplayImageUri(item);

    return (
      <FoodCard
        food={item}
        displayImageUri={displayImageUri}
        hasUnsyncedImage={hasUnsyncedWebImage(item)}
        isWebMenuOpen={openWebMenuFoodId === item.id}
        onAddWebImage={() => chooseImageForWebFood(item)}
        onCloseWebMenu={() => setOpenWebMenuFoodId(null)}
        onDelete={() => deleteFood(item.id)}
        onEdit={() => openEditFood(item)}
        onPreviewImage={setPreviewingImageUri}
        onShowOptions={() => showFoodOptions(item)}
      />
    );
  };

  const previewImageUri = draft.imageData ?? draft.imageUri;

  const handlePhotoTaken = (uri: string) => {
    // After taking a photo, put it in the form and open the form.
    setDraft((currentDraft) => ({
      ...currentDraft,
      imageUri: uri,
      imageData: null,
    }));

    setShowCameraModal(false);
    setShowFormModal(true);
  };

  const extractDraftImage = () => {
    // Extraction fills the form, but the user still reviews before saving.
    const imageUri = draft.imageUri ?? draft.imageData;

    if (!imageUri) {
      Alert.alert("No image", "Add a food photo before extracting information.");
      return;
    }

    analyzeTakenPhoto(imageUri);
  };

  return (
    <View style={styles.container}>
      {homeStatusMessage ? (
        <View style={styles.statusBanner}>
          <Text style={styles.statusBannerText}>{homeStatusMessage}</Text>
        </View>
      ) : null}

      {/* Show loading, empty state, or the food list. */}
      {loadingFoods ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyTitle}>Loading your food...</Text>
        </View>
      ) : foods.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyTitle}>No food added yet</Text>
          <Text style={styles.emptyText}>
            Press + to take a picture and add your first food item.
          </Text>
        </View>
      ) : (
        <FlatList
          data={displayedFoods}
          renderItem={renderFoodCard}
          keyExtractor={(item) => item.id}
          numColumns={Platform.OS === "web" ? 1 : 2}
          columnWrapperStyle={Platform.OS === "web" ? undefined : styles.cardRow}
          contentContainerStyle={[
            styles.foodList,
            Platform.OS === "web" && styles.foodListWeb,
          ]}
          showsVerticalScrollIndicator={false}
        />
      )}

      <HomeActionButtons
        // Bottom buttons open filter, camera, or ChefBot.
        onFilter={() => setShowFilterModal(true)}
        onOpenCamera={openCamera}
        onOpenIngredients={openIngredientPicker}
      />

      <ImagePreviewModal
        imageUri={previewingImageUri}
        onClose={() => setPreviewingImageUri(null)}
      />

      <CameraFoodModal
        visible={showCameraModal}
        onClose={() => setShowCameraModal(false)}
        onPhotoTaken={handlePhotoTaken}
      />

      <FoodFormModal
        // Food form gets the draft and calls back when the user acts.
        draft={draft}
        editingFoodId={editingFoodId}
        loading={loading}
        previewImageUri={previewImageUri}
        visible={showFormModal}
        onCancel={() => {
          setShowFormModal(false);
          setEditingFoodId(null);
          setFormErrorMessage("");
        }}
        errorMessage={formErrorMessage}
        onExtract={extractDraftImage}
        onSave={saveFood}
        saving={savingFood}
        setDraft={setDraft}
      />

      <FilterModal
        // Filter modal changes food type and sort mode.
        foodTypes={foodTypes}
        selectedFoodType={selectedFoodType}
        sortMode={sortMode}
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onSelectFoodType={setSelectedFoodType}
        onSelectSortMode={setSortMode}
      />

      <IngredientPickerModal
        // Ingredient picker chooses foods and servings for ChefBot.
        chatServings={chatServings}
        foods={foods}
        selectedFoodIds={selectedChatFoodIds}
        visible={showIngredientModal}
        onCancel={() => setShowIngredientModal(false)}
        onOpenChefBot={openChefBot}
        onSetChatServings={setChatServings}
        onToggleFood={toggleChatFood}
      />
    </View>
  );
}
