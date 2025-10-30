import {
  Box,
  Button,
  Image,
  Input,
  InputField,
  ScrollView,
  Text,
  useToast,
  VStack,
} from "@gluestack-ui/themed";
import { Link } from "expo-router";
import React, { useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
} from "react-native";
import { OTPVerificationModal } from "../../components/auth/OTPVerificationModal";
import { AppToast } from "../../components/ui/AppToast";
import { Loader } from "../../components/ui/Loader";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // OTP Verification states
  const [showOTPModal, setShowOTPModal] = useState<boolean>(false);
  const [pendingEmail, setPendingEmail] = useState<string>("");

  const { login } = useAuth();
  const toast = useToast();

  const handleLogin = async (): Promise<void> => {
    if (!email || !password) {
      toast.show({
        placement: "top right",
        render: ({ id }) => (
          <AppToast
            id={id}
            type="attention"
            title="Login Failed"
            description="Please fill in all fields"
          />
        ),
      });
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      // If login is successful, the user will be redirected automatically
    } catch (error: any) {
      // Check if the error is due to unverified account
      if (error.requiresVerification) {
        // Show OTP modal for unverified account
        setPendingEmail(error.email || email);
        setShowOTPModal(true);
        toast.show({
          placement: "top right",
          render: ({ id }) => (
            <AppToast
              id={id}
              type="attention"
              title="Account Not Verified"
              description="Please verify your account with the OTP code sent to your email"
            />
          ),
        });
      } else {
        toast.show({
          placement: "top right",
          render: ({ id }) => (
            <AppToast
              id={id}
              type="error"
              title="Login Failed"
              description={
                error?.response?.data?.message ||
                error.message ||
                "Something went wrong"
              }
            />
          ),
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationSuccess = () => {
    toast.show({
      placement: "top right",
      render: ({ id }) => (
        <AppToast
          id={id}
          type="success"
          title="Verification Successful"
          description="Your account has been verified! Please login again."
        />
      ),
    });
    // Clear the form
    setEmail("");
    setPassword("");
  };

  if (loading) return <Loader />;

  return (
    <>
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
                  Don&apos;t have an account?{" "}
                  <Link href="/auth/signup">
                    <Text color="$primary500">Sign up</Text>
                  </Link>
                </Text>
              </VStack>
            </VStack>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {/* OTP Verification Modal for unverified accounts */}
      <OTPVerificationModal
        isVisible={showOTPModal}
        onClose={() => setShowOTPModal(false)}
        onVerifySuccess={handleVerificationSuccess}
        email={pendingEmail}
      />
    </>
  );
}
