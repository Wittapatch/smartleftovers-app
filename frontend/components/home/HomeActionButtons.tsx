import { styles } from "@/components/styles/index.styles";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Text, TouchableOpacity, View } from "react-native";

// These are the bottom buttons for filter, add food, and ChefBot.

interface HomeActionButtonsProps {
  // Parent screen decides what each button does.
  onFilter: () => void;
  onOpenCamera: () => void;
  onOpenIngredients: () => void;
}

export function HomeActionButtons({
  onFilter,
  onOpenCamera,
  onOpenIngredients,
}: HomeActionButtonsProps) {
  return (
    <View style={styles.bottomActions}>
      <TouchableOpacity style={styles.circleButton} onPress={onFilter}>
        <IconSymbol
          size={30}
          name="line.3.horizontal.decrease.circle.fill"
          color="#222222"
        />
      </TouchableOpacity>

      <TouchableOpacity style={styles.circleButton} onPress={onOpenCamera}>
        <Text style={styles.plusIcon}>+</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.circleButton} onPress={onOpenIngredients}>
        <IconSymbol size={30} name="message.fill" color="#000000" />
      </TouchableOpacity>
    </View>
  );
}
