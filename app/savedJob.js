import { useCallback, useEffect, useState } from "react";
import { SafeAreaView, Alert, FlatList, Button } from "react-native";
import { Stack, useNavigation, useRouter } from "expo-router";
import { DrawerActions } from "@react-navigation/native";

import { COLORS, SIZES, icons } from "../constants";
import { NearbyJobCard, ScreenHeaderBtn } from "../components";
import { deleteFromStorage, fetchFromStorage } from "../utils/storage";

export default function SavedJob() {
  const navigation = useNavigation();
  const router = useRouter();
  const [data, setData] = useState([]);

  const getStoreData = useCallback(async () => {
    try {
      const jobs = await fetchFromStorage("savedJobs");
      setData(jobs);
    } catch (error) {
      Alert.alert("Error", `Failed to fetch the job. Error: ${error.message}`);
    }
  });

  useEffect(() => {
    getStoreData();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.lightWhite }}>
      <Stack.Screen
        options={{
          headerStyle: { backgroundColor: COLORS.lightWhite },
          headerShadowVisible: false,
          headerLeft: () => (
            <ScreenHeaderBtn
              iconUrl={icons.menu}
              dimension="60%"
              handlePress={() =>
                navigation.dispatch(DrawerActions.toggleDrawer)
              }
            />
          ),
          headerTitle: "Saved Jobs",
        }}
      />

      <FlatList
        data={data}
        renderItem={({ item }) => (
          <NearbyJobCard
            job={item}
            handleNavigate={() => router.push(`/job-details/${item.job_id}`)}
          />
        )}
        keyExtractor={(item) => String(item.job_id)}
        contentContainerStyle={{ columnGap: SIZES.medium }}
      />

      <Button
        title="Clear Storage"
        color={COLORS.tertiary}
        onPress={() => deleteFromStorage("savedJobs")}
      />
    </SafeAreaView>
  );
}
