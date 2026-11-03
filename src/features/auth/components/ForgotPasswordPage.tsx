import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormError } from "./FormError";
import { SecretCodeForm } from "./SecretCodeForm";
import { PasswordResetForm } from "./PasswordResetForm";
import { RoleSelector, type UserRole } from "./RoleSelector";
import type { PasswordRecoveryConfig } from "../types";

type RecoveryStep = "role" | "email" | "secret-code" | "reset-password";

interface ForgotPasswordPageProps {
  onBack: () => void;
}

/**
 * Forgot password page - Multi-step password recovery flow
 * Step 1: Select role
 * Step 2: Enter email
 * Step 3: Verify secret code
 * Step 4: Reset password
 */
export function ForgotPasswordPage({ onBack }: ForgotPasswordPageProps) {
  const [step, setStep] = useState<RecoveryStep>("role");
  const [selectedRole, setSelectedRole] = useState<UserRole>("admin");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    trigger,
  } = useForm({
    mode: "onChange",
    defaultValues: {
      email: "",
    },
  });

  const handleEmailSubmit = async (data: { email: string }) => {
    setError(null);
    setIsLoading(true);
    try {
      // TODO: Verify email exists in database
      // For now, just proceed to secret code step
      await new Promise((resolve) => setTimeout(resolve, 300));
      setEmail(data.email);
      setStep("secret-code");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to verify email";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSecretCodeSuccess = () => {
    setStep("reset-password");
    setError(null);
  };

  const handlePasswordResetSuccess = () => {
    // Reset and go back to login
    onBack();
  };

  const handleBackFromEmail = () => {
    setStep("role");
    setError(null);
  };

  const handleBackFromSecretCode = () => {
    setStep("email");
    setError(null);
  };

  const handleBackFromPasswordReset = () => {
    setStep("secret-code");
    setError(null);
  };

  // Step 1: Role Selection
  if (step === "role") {
    return (
      <div className="space-y-5">
        <div className="text-center space-y-2 mb-6">
          <h2 className="text-xl font-semibold">Select Your Role</h2>
          <p className="text-sm text-muted-foreground">
            Choose your role to begin password recovery
          </p>
        </div>

        <RoleSelector
          selectedRole={selectedRole}
          onRoleChange={(role) => {
            setSelectedRole(role);
            setError(null);
          }}
          disabled={false}
        />

        <Button
          onClick={() => setStep("email")}
          className="w-full"
        >
          Continue
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="w-full"
        >
          Back to Login
        </Button>
      </div>
    );
  }

  // Step 2: Email Verification
  if (step === "email") {
    return (
      <form onSubmit={handleSubmit(handleEmailSubmit)} className="space-y-5">
        <div className="text-center space-y-2 mb-6">
          <h2 className="text-xl font-semibold">Enter Your Email</h2>
          <p className="text-sm text-muted-foreground">
            We'll use this to verify your account
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="recovery-email" className="font-medium">
            Email Address
          </Label>
          <Input
            id="recovery-email"
            type="email"
            placeholder="your.email@example.com"
            disabled={isLoading}
            aria-invalid={!!errors.email}
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Please enter a valid email address",
              },
              onBlur: () => trigger("email"),
            })}
          />
          {errors.email && (
            <p className="text-xs text-destructive font-medium">
              {errors.email.message}
            </p>
          )}
        </div>

        {error && <FormError message={error} />}

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleBackFromEmail}
            disabled={isLoading}
            className="flex-1"
          >
            Back
          </Button>
          <Button
            type="submit"
            className="flex-1"
            disabled={isLoading}
            aria-busy={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Verifying...</span>
              </>
            ) : (
              "Next"
            )}
          </Button>
        </div>
      </form>
    );
  }

  // Step 3: Secret Code Verification
  if (step === "secret-code") {
    return (
      <div className="space-y-5">
        <div className="text-center space-y-2 mb-6">
          <h2 className="text-xl font-semibold">Verify Secret Code</h2>
          <p className="text-sm text-muted-foreground">
            Enter your secret code to proceed
          </p>
        </div>

        <SecretCodeForm
          email={email}
          role={selectedRole}
          onSuccess={handleSecretCodeSuccess}
          onBack={handleBackFromSecretCode}
          isLoading={isLoading}
          error={error}
        />
      </div>
    );
  }

  // Step 4: Password Reset
  if (step === "reset-password") {
    return (
      <div className="space-y-5">
        <div className="text-center space-y-2 mb-6">
          <h2 className="text-xl font-semibold">Reset Your Password</h2>
          <p className="text-sm text-muted-foreground">
            Create a new password for your account
          </p>
        </div>

        <PasswordResetForm
          email={email}
          role={selectedRole}
          onSuccess={handlePasswordResetSuccess}
          onBack={handleBackFromPasswordReset}
          isLoading={isLoading}
        />
      </div>
    );
  }

  return null;
}
