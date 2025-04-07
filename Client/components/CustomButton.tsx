import { Text, TouchableOpacity, TouchableOpacityProps } from "react-native";
import React from "react";

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
      className={`bg-black px-6 py-3 rounded-full shadow-md w-[328px] min-h-[62px] justify-center items-center ${containerStyles} 
      }`}
      disabled={isLoading}
      onPress={handlePress}
    >
      <Text
        className={`text-white text-2xl font-semibold text-center ${textStyles}`}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}
