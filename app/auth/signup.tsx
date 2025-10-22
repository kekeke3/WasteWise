import {
  Box,
  Button,
  Heading,
  Input,
  InputField,
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ScrollView,
  Text,
  Toast,
  ToastDescription,
  ToastTitle,
  useToast,
  VStack,
} from "@gluestack-ui/themed";

import { Link } from "expo-router";
import React, { useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native";
import { Loader } from "../../components/ui/Loader";
import { useAuth } from "../../context/AuthContext";
import { BARANGAYS } from "../../utils/constants";

interface SignupFormData {
  first_name: string;
  middle_name: string;
  last_name: string;
  gender: string;
  contact_number: string;
  password: string;
  confirmPassword: string;
  email: string;
  barangay: string;
  role: string;
}

export default function Signup() {
  const [formData, setFormData] = useState<SignupFormData>({
    first_name: "",
    middle_name: "",
    last_name: "",
    gender: "",
    contact_number: "",
    password: "",
    confirmPassword: "",
    email: "",
    barangay: "",
    role: "resident",
  });

  const [loading, setLoading] = useState(false);
  const [isBarangayModalVisible, setBarangayModalVisible] = useState(false);
  const [isGenderModalVisible, setGenderModalVisible] = useState(false);
  const [search, setSearch] = useState("");
  const { signup } = useAuth();
  const toast = useToast();

  const handleSignup = async (): Promise<void> => {
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    if (
      !formData.first_name ||
      !formData.last_name ||
      !formData.email ||
      !formData.barangay ||
      !formData.gender
    ) {
      alert("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const response: { data: any } = await signup({
        first_name: formData.first_name,
        middle_name: formData.middle_name,
        last_name: formData.last_name,
        gender: formData.gender,
        contact_number: formData.contact_number,
        password: formData.password,
        email: formData.email,
        role: "resident", // Fixed role as resident
        barangay: formData.barangay,
      });
      alert(response.data);
      toast.show({
        placement: "top",
        render: ({ id }) => {
          return (
            <Toast nativeID={id} action="success" variant="solid">
              <ToastTitle>Success</ToastTitle>
              <ToastDescription>response.data</ToastDescription>
            </Toast>
          );
        },
      });
    } catch (error: any) {
      alert("Signup failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredBarangays = BARANGAYS.filter((b) =>
    b.toLowerCase().includes(search.toLowerCase())
  );

  const genders = ["Male", "Female", "Other"];

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
            <Box alignItems="center" mb="$4">
              <Text size="2xl" fontWeight="$bold" color="$primary500">
                Create Account
              </Text>
              <Text color="$secondary500">Join WasteWise as Resident</Text>
            </Box>

            <VStack space="md">
              {/* First Name */}
              <Input>
                <InputField
                  placeholder="First Name *"
                  value={formData.first_name}
                  onChangeText={(text) =>
                    setFormData({ ...formData, first_name: text })
                  }
                />
              </Input>

              {/* Middle Name */}
              <Input>
                <InputField
                  placeholder="Middle Name"
                  value={formData.middle_name}
                  onChangeText={(text) =>
                    setFormData({ ...formData, middle_name: text })
                  }
                />
              </Input>

              {/* Last Name */}
              <Input>
                <InputField
                  placeholder="Last Name *"
                  value={formData.last_name}
                  onChangeText={(text) =>
                    setFormData({ ...formData, last_name: text })
                  }
                />
              </Input>

              {/* Gender Selector */}
              <TouchableOpacity
                onPress={() => setGenderModalVisible(true)}
                style={{
                  borderWidth: 1,
                  borderColor: "#ccc",
                  borderRadius: 4,
                  paddingVertical: 6,
                  paddingHorizontal: 12,
                }}
              >
                <Text color={formData.gender ? "$black" : "$gray"}>
                  {formData.gender || "Select Gender *"}
                </Text>
              </TouchableOpacity>

              {/* Gender Modal */}
              <Modal
                isOpen={isGenderModalVisible}
                onClose={() => setGenderModalVisible(false)}
              >
                <ModalBackdrop />
                <ModalContent>
                  <ModalHeader>
                    <Heading size="md">Select Gender</Heading>
                  </ModalHeader>
                  <ModalBody>
                    {genders.map((gender, index) => (
                      <TouchableOpacity
                        key={`${gender}-${index}`}
                        onPress={() => {
                          setFormData({ ...formData, gender });
                          setGenderModalVisible(false);
                        }}
                        style={{
                          paddingVertical: 10,
                          borderBottomWidth: 1,
                          borderColor: "#eee",
                        }}
                      >
                        <Text>{gender}</Text>
                      </TouchableOpacity>
                    ))}
                  </ModalBody>
                  <ModalFooter>
                    <Button
                      variant="outline"
                      action="secondary"
                      onPress={() => setGenderModalVisible(false)}
                    >
                      <Text>Close</Text>
                    </Button>
                  </ModalFooter>
                </ModalContent>
              </Modal>

              {/* Email */}
              <Input>
                <InputField
                  placeholder="Email *"
                  value={formData.email}
                  onChangeText={(text) =>
                    setFormData({ ...formData, email: text })
                  }
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </Input>

              {/* Contact Number */}
              <Input>
                <InputField
                  placeholder="Contact Number"
                  value={formData.contact_number}
                  onChangeText={(text) =>
                    setFormData({ ...formData, contact_number: text })
                  }
                  keyboardType="phone-pad"
                />
              </Input>

              {/* Barangay Selector */}
              <TouchableOpacity
                onPress={() => setBarangayModalVisible(true)}
                style={{
                  borderWidth: 1,
                  borderColor: "#ccc",
                  borderRadius: 4,
                  paddingVertical: 6,
                  paddingHorizontal: 12,
                }}
              >
                <Text color={formData.barangay ? "$black" : "$gray"}>
                  {formData.barangay || "Select Barangay *"}
                </Text>
              </TouchableOpacity>

              {/* Barangay Modal */}
              <Modal
                isOpen={isBarangayModalVisible}
                onClose={() => setBarangayModalVisible(false)}
              >
                <ModalBackdrop />
                <ModalContent maxHeight="$3/4">
                  <ModalHeader>
                    <Heading size="md">Select Barangay</Heading>
                  </ModalHeader>
                  <ModalBody>
                    <Input mb="$3">
                      <InputField
                        placeholder="Search barangay..."
                        value={search}
                        onChangeText={setSearch}
                      />
                    </Input>
                    <ScrollView style={{ maxHeight: 300 }}>
                      {filteredBarangays.map((item, index) => (
                        <TouchableOpacity
                          key={`${item}-${index}`}
                          onPress={() => {
                            setFormData({ ...formData, barangay: item });
                            setBarangayModalVisible(false);
                            setSearch(""); // Clear search after selection
                          }}
                          style={{
                            paddingVertical: 10,
                            borderBottomWidth: 1,
                            borderColor: "#eee",
                          }}
                        >
                          <Text>{item}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </ModalBody>
                  <ModalFooter>
                    <Button
                      variant="outline"
                      action="secondary"
                      onPress={() => setBarangayModalVisible(false)}
                    >
                      <Text>Close</Text>
                    </Button>
                  </ModalFooter>
                </ModalContent>
              </Modal>

              {/* Password */}
              <Input>
                <InputField
                  placeholder="Password *"
                  value={formData.password}
                  onChangeText={(text) =>
                    setFormData({ ...formData, password: text })
                  }
                  secureTextEntry
                />
              </Input>

              {/* Confirm Password */}
              <Input>
                <InputField
                  placeholder="Confirm Password *"
                  value={formData.confirmPassword}
                  onChangeText={(text) =>
                    setFormData({ ...formData, confirmPassword: text })
                  }
                  secureTextEntry
                />
              </Input>

              <Button onPress={handleSignup} mt="$4">
                <Text color="$white">Create Account</Text>
              </Button>
            </VStack>

            <Text textAlign="center" mt="$4" color="$secondary500">
              Already have an account?{" "}
              <Link href="/auth/login">
                <Text color="$primary500">Sign in</Text>
              </Link>
            </Text>
          </VStack>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
