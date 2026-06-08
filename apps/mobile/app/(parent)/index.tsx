import { View, Text, StyleSheet } from "react-native";

export default function ParentHome() {
  return (
    <View style={styles.c}>
      <Text style={styles.h}>Parent dashboard</Text>
      <Text>Weekly patterns and agreement alignment appear here — patterns, never content.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, padding: 24, gap: 8 },
  h: { fontSize: 24, fontWeight: "700" },
});
