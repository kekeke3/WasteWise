import {
  Box,
  Button,
  Image,
  Input,
  InputField,
  ScrollView,
  Text,
  VStack,
} from "@gluestack-ui/themed";
import { Link } from "expo-router";
import React, { useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback
} from "react-native";
import { Loader } from "../../components/ui/Loader";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const { login } = useAuth();

  const handleLogin = async (): Promise<void> => {
    if (!email || !password) {
      alert("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
    } catch (error: any) {
      alert("Login failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "white" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
          }}
          keyboardShouldPersistTaps="handled"
        >
          <VStack space="lg" px="$6" py="$6">
            {/* Logo & Title */}
            <Box alignItems="center" mb="$8">
              <Image
                source={require("../../assets/logo.png")}
                alt="WasteWise Logo"
                width={120}
                height={120}
                resizeMode="contain"
              />
              <Text size="2xl" fontWeight="$bold" color="$primary500">
                WasteWise
              </Text>
              <Text color="$secondary500">Sign in to your account</Text>
            </Box>

            {/* Input Fields */}
            <VStack space="md">
              <Input>
                <InputField
                  placeholder="Email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </Input>

              <Input>
                <InputField
                  placeholder="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </Input>

              <Button onPress={handleLogin} mt="$4">
                <Text color="$white">Sign In</Text>
              </Button>
            </VStack>

            {/* Links at Bottom */}
            <VStack space="sm" mt="$8" alignItems="center">
              <Link href="/auth/forgot-password" asChild>
                <Text color="$primary500">Forgot Password?</Text>
              </Link>

              <Text color="$secondary500">
                Don’t have an account?{" "}
                <Link href="/auth/signup">
                  <Text color="$primary500">Sign up</Text>
                </Link>
              </Text>
            </VStack>
          </VStack>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
