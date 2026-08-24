import { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PaperProvider, MD3LightTheme } from "react-native-paper";
import { AuthProvider, useAuth } from "../features/auth/AuthContext";
import { COLORS } from "../config/constants";

// Initialize TanStack Query Client for server-state caching
const queryClient = new QueryClient();

// Configure React Native Paper material design theme using brand colors
const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: COLORS.primary,
    secondary: COLORS.accent,
    background: COLORS.background,
    surface: COLORS.surface,
    error: COLORS.error,
  },
};

function RootLayoutNav() {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments() as any;
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    // Check if the user's current segment is in the authentication group
    const inAuthGroup = segments[0] === "(auth)";

    if (!isAuthenticated && !inAuthGroup) {
      // If user logs out or session is empty, redirect to sign-in instantly
      router.replace("/(auth)/login" as any);
    } else if (isAuthenticated && (inAuthGroup || segments.length === 0 || segments[0] === "index")) {
      // If user successfully logs in, transition them to the tabs dashboard
      router.replace("/(tabs)" as any);
    }
  }, [isAuthenticated, isLoading, segments]);

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <PaperProvider theme={theme}>
        <AuthProvider>
          <RootLayoutNav />
        </AuthProvider>
      </PaperProvider>
    </QueryClientProvider>
  );
}
