import { Text, TouchableOpacity, TouchableOpacityProps } from "react-native";

interface CustomButtonProps extends TouchableOpacityProps {
  title: string;
  handlePress: () => void;
  isLoading: boolean;
  containerStyles?: string;
  textStyles?: string;
}

export default function CustomButton({
  title,
  handlePress,
  containerStyles = "",
  textStyles = "",
  isLoading,
}: CustomButtonProps) {
  return (
    <TouchableOpacity
      className={`bg-black px-6 py-3 rounded-full shadow-md w-[328px] min-h-[62px] justify-center items-center ${
        isLoading ? "opacity-50" : ""
      } ${containerStyles} 
      }`}
      disabled={isLoading}
      onPress={handlePress}
    >
      <Text
        className={`text-white text-2xl font-semibold text-center ${textStyles}`}
      >
        {isLoading ? "please wait..." : title}
      </Text>
    </TouchableOpacity>
  );
}
