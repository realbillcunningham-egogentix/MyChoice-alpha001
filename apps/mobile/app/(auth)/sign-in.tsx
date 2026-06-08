import { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import { supabase } from "../../src/lib/supabase";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  async function sendOtp() {
    await supabase.auth.signInWithOtp({ email });
    setSent(true);
  }

  return (
    <View style={styles.c}>
      <Text style={styles.h}>MyChoice</Text>
      <Text>Sign in to your family account</Text>
      <TextInput
        style={styles.i}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="you@example.com"
        value={email}
        onChangeText={setEmail}
      />
      <Button title={sent ? "Code sent — check your email" : "Send login code"} onPress={sendOtp} />
    </View>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, justifyContent: "center", padding: 24, gap: 12 },
  h: { fontSize: 28, fontWeight: "700" },
  i: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 12 },
});
