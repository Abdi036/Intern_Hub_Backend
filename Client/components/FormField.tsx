import React, { useState } from "react";
import { Text, TextInput, View, TextInputProps, Pressable } from "react-native";
import { EyeIcon, EyeSlashIcon } from "react-native-heroicons/outline";

interface FormFieldProps extends TextInputProps {
  title: string;
  value: string;
  placeholder: string;
  handleChangeText: (text: string) => void;
  otherStyles?: string;
}

const FormField: React.FC<FormFieldProps> = ({
  title,
  value,
  placeholder,
  handleChangeText,
  otherStyles,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const isPassword = title.toLowerCase() === "password";

  return (
    <View className={`space-y-2 ${otherStyles}`}>
      <Text className="text-base text-gray-800 mb-2 mx-2">{title}</Text>
      <View
        className={`flex-row items-center w-full h-16 px-4 bg-gray-200 rounded-2xl ${
          isFocused ? "border-2 border-black" : "border-2 border-gray-400"
        }`}
      >
        <TextInput
          className="flex-1 text-gray-900 font-semibold text-base"
          value={value}
          placeholder={placeholder}
          placeholderTextColor="#aaa"
          secureTextEntry={isPassword && !showPassword}
          onChangeText={handleChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />

        {isPassword && (
          <Pressable
            onPress={() => setShowPassword((prev) => !prev)}
            hitSlop={10}
          >
            {showPassword ? (
              <EyeSlashIcon size={20} color="gray" />
            ) : (
              <EyeIcon size={20} color="gray" />
            )}
          </Pressable>
        )}
      </View>
    </View>
  );
};

export default FormField;
