import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  View,
  Text,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Share,
} from "react-native";
import { Stack, useRouter, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  Company,
  JobAbout,
  JobFooter,
  JobTabs,
  ScreenHeaderBtn,
  Specifics,
} from "../../components";
import { COLORS, SIZES, icons } from "../../constants";
import useFetch from "../../hook/useFetch";

const tabs = ["About", "Qualifications", "Responsibilities"];

const JobDetails = () => {
  const params = useLocalSearchParams();
  const router = useRouter();

  const { data, isLoading, error, refetch } = useFetch("job-details", {
    job_id: params.id,
  });

  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [refreshing, setRefreshing] = useState(false);

  // Refresh Screen to refetch data
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refetch();
    setRefreshing(false);
  });

  // Share Job Listing
  const onShareJob = async () => {
    const urlToShare =
      data[0]?.job_google_link ?? "https://careers.google.com/jobs/results";

    try {
      const result = await Share.share({
        message: `Job Finder: ${urlToShare}`,
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          __DEV__ &&
            console.log(`Shared with activity type: ${result.activityType}`);
        } else {
          __DEV__ && console.log("Shared successfully");
        }
      } else if (result.action === Share.dismissedAction) {
        __DEV__ && console.log("Share dismissed");
      }
    } catch (error) {
      Alert.alert("Error sharing link", error.message);
    }
  };

  const dataToSave = {
    job_id: data[0]?.job_id,
    job_title: data[0]?.job_title,
    job_description: data[0]?.job_description,
    employer_logo: data[0]?.employer_logo,
    employer_name: data[0]?.employer_name,
    job_country: data[0]?.job_country,
    job_google_link: data[0]?.job_google_link,
    job_employment_type: data[0]?.job_employment_type,
    job_highlights: {
      Responsibilities: data[0]?.job_highlights?.Responsibilities,
      Qualifications: data[0]?.job_highlights?.Qualifications,
    },
  };

  // Save job data to Async Storage
  const saveJob = async () => {
    try {
      // Retrieve existing data from AsyncStorage
      const existingData = await AsyncStorage.getItem("savedJobs");
      let parsedData = existingData ? JSON.parse(existingData) : [];

      // Append the new job to the existing data
      parsedData.push(dataToSave);

      // Save the updated data back to AsyncStorage
      await AsyncStorage.setItem("savedJobs", JSON.stringify(parsedData));
      Alert.alert("Job Saved", "The job has been saved successfully.");
    } catch (error) {
      Alert.alert("Error", `Failed to save the job. Error: ${error.message}`);
    }
  };

  const displayTabContent = () => {
    switch (activeTab) {
      case "Qualifications":
        return (
          <Specifics
            title="Qualifications"
            points={data[0].job_highlights?.Qualifications ?? ["N/A"]}
          />
        );
      case "About":
        return (
          <JobAbout info={data[0].job_description ?? "No data provided"} />
        );
      case "Responsibilities":
        return (
          <Specifics
            title="Responsibilities"
            points={data[0].job_highlights?.Responsibilities ?? ["N/A"]}
          />
        );
      default:
        break;
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.lightWhite }}>
      <Stack.Screen
        options={{
          headerStyle: { backgroundColor: COLORS.lightWhite },
          headerShadowVisible: false,
          headerBackVisible: false,
          headerTitle: "",
          headerLeft: () => (
            <ScreenHeaderBtn
              iconUrl={icons.left}
              dimension="60%"
              handlePress={() => router.back()}
            />
          ),
          headerRight: () => (
            <ScreenHeaderBtn
              iconUrl={icons.share}
              dimension="60%"
              handlePress={onShareJob}
            />
          ),
        }}
      />

      <>
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {isLoading ? (
            <ActivityIndicator size={SIZES.large} color={COLORS.primary} />
          ) : error ? (
            <Text>Something went wrong</Text>
          ) : data.length === 0 ? (
            <Text>No data</Text>
          ) : (
            <View style={{ padding: SIZES.medium, paddingBottom: 100 }}>
              <Company
                companyLogo={data[0].employer_logo}
                jobTitle={data[0].job_title}
                companyName={data[0].employer_name}
                location={data[0].job_country}
              />

              <JobTabs
                tabs={tabs}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
              />

              {displayTabContent()}
            </View>
          )}
        </ScrollView>

        <JobFooter
          url={
            data[0]?.job_google_link ??
            "https://careers.google.com/jobs/results"
          }
          saveJob={saveJob}
        />
      </>
    </SafeAreaView>
  );
};

export default JobDetails;
