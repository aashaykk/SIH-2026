import { Redirect } from "expo-router";
import { useAuth } from "../features/auth/AuthContext";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import { COLORS } from "../config/constants";

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();

  // Show a clean loading state while AsyncStorage token bootstrapping completes
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // Declaratively route based on user session status
  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/(auth)/login" />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
});
