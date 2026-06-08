import { View, Text, StyleSheet } from "react-native";

export default function ChildHome() {
  return (
    <View style={styles.c}>
      <Text style={styles.h}>Your week</Text>
      <Text>A friendly look at your own patterns and goals. Only you see your content.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, padding: 24, gap: 8 },
  h: { fontSize: 24, fontWeight: "700" },
});
