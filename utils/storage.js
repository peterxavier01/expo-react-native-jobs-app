import AsyncStorage from "@react-native-async-storage/async-storage";

// save to async storage
export const saveToStorage = async (key, value) => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (error) {
    throw error;
  }
};

// fetch from async storage
export const fetchFromStorage = async (key) => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue !== null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    throw error;
  }
};

// delete from async storage
export const deleteFromStorage = async (key) => {
  return await AsyncStorage.removeItem(key);
};
