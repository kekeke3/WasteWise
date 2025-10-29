import { useAuth } from "@/context/AuthContext";
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
  const inputRefs = useRef<any[]>([]);
  const toast = useToast();
  const { verifyOTP, resendOTP } = useAuth();

  useEffect(() => {
    if (isVisible) {
      startCountdown();
      // Focus first input when modal opens
      setTimeout(() => {
        if (inputRefs.current[0]) {
          inputRefs.current[0].focus();
        }
      }, 100);
    }
  }, [isVisible]);

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
    try {
      await verifyOTP(email, otpCode);
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
      toast.show({
        placement: "top right",
        render: ({ id }) => (
          <AppToast
            id={id}
            type="error"
            title="Verification Failed"
            description={error?.response?.data?.message || "Invalid OTP code"}
          />
        ),
      });
      // Clear OTP on failure
      setOtp(["", "", "", "", "", ""]);
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;

    setResendLoading(true);
    try {
      await resendOTP(email);
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

  return (
    <Modal isOpen={isVisible} onClose={onClose}>
      <ModalBackdrop />
      <ModalContent>
        <ModalHeader>
          <Heading size="lg">Verify Your Account</Heading>
        </ModalHeader>
        <ModalBody>
          <VStack space="md">
            <Text>Enter the 6-digit verification code sent to {email}</Text>

            <HStack space="sm" justifyContent="center">
              {otp.map((digit, index) => (
                <Input key={index} size="md" width="$12">
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
                    fontSize="$lg"
                    fontWeight="$bold"
                  />
                </Input>
              ))}
            </HStack>

            <Button
              variant="link"
              onPress={handleResendOTP}
              isDisabled={countdown > 0 || resendLoading}
            >
              <Text color={countdown > 0 ? "$gray400" : "$primary500"}>
                {resendLoading
                  ? "Sending..."
                  : countdown > 0
                  ? `Resend in ${countdown}s`
                  : "Resend OTP"}
              </Text>
            </Button>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button
            variant="outline"
            action="secondary"
            onPress={onClose}
            mr="$3"
          >
            <Text>Cancel</Text>
          </Button>
          <Button onPress={handleVerify} isDisabled={loading}>
            <Text color="$white">{loading ? "Verifying..." : "Verify"}</Text>
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
