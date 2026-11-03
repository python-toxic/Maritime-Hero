import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormError } from "./FormError";
import { resetPassword } from "../lib/auth";
import type { UserRole } from "./RoleSelector";

interface PasswordResetFormProps {
  email: string;
  role: UserRole;
  onSuccess: () => void;
  onBack: () => void;
  isLoading?: boolean;
}

interface ResetFormData {
  newPassword: string;
  confirmPassword: string;
}

/**
 * Password reset form after secret code verification
 * Allows user to set a new password
 */
export function PasswordResetForm({
  email,
  role,
  onSuccess,
  onBack,
  isLoading = false,
}: PasswordResetFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    trigger,
  } = useForm<ResetFormData>({
    mode: "onChange",
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const newPassword = watch("newPassword");

  const handleResetPassword = async (data: ResetFormData) => {
    setError(null);
    try {
      if (data.newPassword !== data.confirmPassword) {
        setError("Passwords do not match");
        return;
      }

      const result = await resetPassword(email, data.newPassword, role);

      if (!result.success) {
        setError(result.error || "Password reset failed");
        return;
      }

      // Show success message briefly
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Password reset failed";
      setError(message);
    }
  };

  const submitting = isLoading || isSubmitting;

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-8">
        <div className="rounded-full bg-green-100 p-3">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold text-green-900">Password Reset Successful</h3>
          <p className="text-sm text-green-700">
            Your password has been updated. Redirecting to login...
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(handleResetPassword)} className="space-y-5">
      {/* Info Section */}
      <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 space-y-1 text-sm">
        <p className="text-blue-900 font-medium">Create New Password</p>
        <p className="text-blue-800 text-xs">
          Password must be at least 6 characters long
        </p>
      </div>

      {/* New Password Field */}
      <div className="space-y-2">
        <Label htmlFor="new-password" className="font-medium">
          New Password
        </Label>
        <div className="relative">
          <Input
            id="new-password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            disabled={submitting}
            aria-invalid={!!errors.newPassword}
            aria-describedby={errors.newPassword ? "password-error" : undefined}
            {...register("newPassword", {
              required: "Password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters",
              },
              onBlur: () => trigger("newPassword"),
            })}
            className="pr-10 transition-colors focus-visible:ring-primary"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            disabled={submitting}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {errors.newPassword && (
          <p id="password-error" className="text-xs text-destructive font-medium">
            {errors.newPassword.message}
          </p>
        )}
      </div>

      {/* Confirm Password Field */}
      <div className="space-y-2">
        <Label htmlFor="confirm-password" className="font-medium">
          Confirm Password
        </Label>
        <div className="relative">
          <Input
            id="confirm-password"
            type={showConfirm ? "text" : "password"}
            placeholder="••••••••"
            disabled={submitting}
            aria-invalid={!!errors.confirmPassword}
            aria-describedby={
              errors.confirmPassword ? "confirm-password-error" : undefined
            }
            {...register("confirmPassword", {
              required: "Please confirm your password",
              validate: (value) =>
                value === newPassword || "Passwords do not match",
              onBlur: () => trigger("confirmPassword"),
            })}
            className="pr-10 transition-colors focus-visible:ring-primary"
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            disabled={submitting}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
            aria-label={showConfirm ? "Hide password" : "Show password"}
          >
            {showConfirm ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {errors.confirmPassword && (
          <p
            id="confirm-password-error"
            className="text-xs text-destructive font-medium"
          >
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      {/* Form-level error message */}
      {error && <FormError message={error} />}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={submitting}
          className="flex-1"
        >
          Back
        </Button>
        <Button
          type="submit"
          className="flex-1"
          disabled={submitting}
          aria-busy={submitting}
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Resetting...</span>
            </>
          ) : (
            "Reset Password"
          )}
        </Button>
      </div>
    </form>
  );
}
