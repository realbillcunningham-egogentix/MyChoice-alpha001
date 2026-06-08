import { Redirect } from "expo-router";
import { View, Text } from "react-native";
import { useSession } from "../src/lib/session";

export default function Index() {
  const { loading, role } = useSession();
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading…</Text>
      </View>
    );
  }
  if (!role) return <Redirect href="/(auth)/sign-in" />;
  if (role === "child") return <Redirect href="/(child)" />;
  return <Redirect href="/(parent)" />;
}
