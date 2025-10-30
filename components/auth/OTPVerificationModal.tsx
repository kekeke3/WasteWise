import { useAuth } from "@/context/AuthContext";
import { otpService } from "@/services/otpService"; // Import the OTP service
import {
  Button,
  Heading,
  HStack,
  Input,
  InputField,
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Text,
  useToast,
  VStack,
} from "@gluestack-ui/themed";
import React, { useEffect, useRef, useState } from "react";
import { AppToast } from "../ui/AppToast";

interface OTPVerificationModalProps {
  isVisible: boolean;
  onClose: () => void;
  onVerifySuccess: () => void;
  email: string;
}

export const OTPVerificationModal: React.FC<OTPVerificationModalProps> = ({
  isVisible,
  onClose,
  onVerifySuccess,
  email,
}) => {
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState<boolean>(false);
  const [resendLoading, setResendLoading] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(0);
  const [initialRequestSent, setInitialRequestSent] = useState<boolean>(false);
  const inputRefs = useRef<any[]>([]);
  const toast = useToast();
  const { verifyOTP, resendOTP } = useAuth();

  useEffect(() => {
    if (isVisible && email && !initialRequestSent) {
      // Automatically send OTP when modal opens for the first time
      sendInitialOTP();
    }
  }, [isVisible, email, initialRequestSent]);

  const sendInitialOTP = async () => {
    try {
      setResendLoading(true);
      await otpService.requestOTP(email, "verification"); // Pass otp_type
      setInitialRequestSent(true);
      startCountdown();
      toast.show({
        placement: "top right",
        render: ({ id }) => (
          <AppToast
            id={id}
            type="success"
            title="OTP Sent"
            description="Verification code has been sent to your email"
          />
        ),
      });
    } catch (error: any) {
      toast.show({
        placement: "top right",
        render: ({ id }) => (
          <AppToast
            id={id}
            type="error"
            title="Failed to Send OTP"
            description={
              error?.response?.data?.message ||
              "Failed to send verification code"
            }
          />
        ),
      });
    } finally {
      setResendLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;

    setResendLoading(true);
    try {
      await otpService.requestOTP(email, "verification"); // Pass otp_type
      toast.show({
        placement: "top right",
        render: ({ id }) => (
          <AppToast
            id={id}
            type="success"
            title="OTP Resent"
            description="A new verification code has been sent to your email"
          />
        ),
      });
      startCountdown();
    } catch (error: any) {
      toast.show({
        placement: "top right",
        render: ({ id }) => (
          <AppToast
            id={id}
            type="error"
            title="Resend Failed"
            description={
              error?.response?.data?.message || "Failed to resend OTP"
            }
          />
        ),
      });
    } finally {
      setResendLoading(false);
    }
  };

  const startCountdown = () => {
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleOtpChange = (value: string, index: number) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      if (inputRefs.current[index + 1]) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      if (inputRefs.current[index - 1]) {
        inputRefs.current[index - 1].focus();
      }
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join("");

    if (otpCode.length !== 6) {
      toast.show({
        placement: "top right",
        render: ({ id }) => (
          <AppToast
            id={id}
            type="attention"
            title="Invalid OTP"
            description="Please enter the 6-digit code"
          />
        ),
      });
      return;
    }

    setLoading(true);
    console.log("Sending OTP verification with:", {
      email: email,
      otp: otpCode,
      otp_type: "verification",
    });

    try {
      const response = await verifyOTP(email, otpCode);
      console.log("OTP Verification Success:", response);

      toast.show({
        placement: "top right",
        render: ({ id }) => (
          <AppToast
            id={id}
            type="success"
            title="Verification Successful"
            description="Your account has been verified successfully!"
          />
        ),
      });
      onVerifySuccess();
      onClose();
    } catch (error: any) {
      console.log("OTP Verification Error Details:", error);

      // Check if it's actually a success message
      if (
        error.message &&
        error.message.includes("OTP verified successfully")
      ) {
        // This is actually success - show success message
        toast.show({
          placement: "top right",
          render: ({ id }) => (
            <AppToast
              id={id}
              type="success"
              title="Verification Successful"
              description="Your account has been verified successfully!"
            />
          ),
        });
        onVerifySuccess();
        onClose();
      } else {
        // Real error
        toast.show({
          placement: "top right",
          render: ({ id }) => (
            <AppToast
              id={id}
              type="error"
              title="Verification Failed"
              description={
                error?.response?.data?.message ||
                error.message ||
                "Invalid OTP code"
              }
            />
          ),
        });
        // Clear OTP on failure
        setOtp(["", "", "", "", "", ""]);
        if (inputRefs.current[0]) {
          inputRefs.current[0].focus();
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isVisible} onClose={onClose} closeOnOverlayClick={false}>
      <ModalBackdrop />
      <ModalContent
        width="90%"
        maxWidth="$96"
        minHeight="$80"
        paddingVertical="$4"
        marginHorizontal="$4"
      >
        <ModalHeader paddingBottom="$2">
          <Heading size="lg" textAlign="center">
            Verify Your Account
          </Heading>
        </ModalHeader>
        <ModalBody>
          <VStack space="xl" alignItems="center" width="100%">
            <Text textAlign="center" px="$2">
              Enter the 6-digit verification code sent to{"\n"}
              <Text fontWeight="$bold" color="$primary600">
                {email}
              </Text>
            </Text>

            <HStack
              space="md"
              justifyContent="center"
              alignItems="center"
              width="100%"
              px="$2"
            >
              {otp.map((digit, index) => (
                <Input
                  key={index}
                  size="lg"
                  width="$16"
                  height="$16"
                  flex={1}
                  maxWidth="$16"
                >
                  <InputField
                    ref={(ref) => {
                      inputRefs.current[index] = ref;
                    }}
                    value={digit}
                    onChangeText={(value) => handleOtpChange(value, index)}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                    keyboardType="numeric"
                    maxLength={1}
                    textAlign="center"
                    fontSize="$2xl"
                    fontWeight="$bold"
                    paddingHorizontal="$1"
                  />
                </Input>
              ))}
            </HStack>

            <Button
              variant="link"
              onPress={handleResendOTP}
              isDisabled={countdown > 0 || resendLoading}
              height="$8"
            >
              <Text
                color={countdown > 0 ? "$gray400" : "$primary500"}
                fontSize="$sm"
                fontWeight={countdown > 0 ? "$normal" : "$medium"}
              >
                {resendLoading
                  ? "Sending..."
                  : countdown > 0
                  ? `Resend code in ${countdown}s`
                  : "Resend verification code"}
              </Text>
            </Button>
          </VStack>
        </ModalBody>
        <ModalFooter paddingTop="$2">
          <Button
            variant="outline"
            action="secondary"
            onPress={onClose}
            mr="$3"
            flex={1}
          >
            <Text>Cancel</Text>
          </Button>
          <Button onPress={handleVerify} isDisabled={loading} flex={1}>
            <Text color="$white">{loading ? "Verifying..." : "Verify"}</Text>
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
