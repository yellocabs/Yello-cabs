import React from "react";
import { FlatList, TouchableOpacity, View, Text } from "react-native";

type Props = {
  suggestions: any[];
  onSelect: (item: any) => void;
};

const PlacesSuggestionList = ({ suggestions, onSelect }: Props) => {
  if (!suggestions.length) return null;

  return (
    <View className="bg-white rounded-xl shadow-lg mt-2 max-h-[250px]">
      <FlatList
        data={suggestions}
        keyExtractor={(item) => item.place_id}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => onSelect(item)}
            className="p-4 border-b border-gray-200"
          >
            <Text className="text-[15px] font-medium text-gray-800">
              {item.description}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default PlacesSuggestionList;
