import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormError } from "./FormError";
import { validateCredentials } from "../lib/auth";
import type { LoginCredentials } from "../types";
import type { UserRole } from "./RoleSelector";

interface LoginFormProps {
  role: UserRole;
  onSubmit?: (credentials: LoginCredentials) => Promise<void>;
  onForgotPassword?: () => void;
  isLoading?: boolean;
  error?: string | null;
}

/**
 * Login form component with full accessibility and validation
 * Now includes role parameter and hardcoded credential validation
 */
export function LoginForm({
  role,
  onSubmit,
  onForgotPassword,
  isLoading = false,
  error: externalError,
}: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(externalError || null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    trigger,
  } = useForm<LoginCredentials>({
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  React.useEffect(() => {
    setFormError(externalError || null);
  }, [externalError]);

  const handleFormSubmit = async (data: LoginCredentials) => {
    setFormError(null);
    try {
      // Validate credentials
      const result = await validateCredentials(data, role);

      if (!result.success) {
        setFormError(result.error || "Login failed");
        return;
      }

      // If validation passes, call the onSubmit handler
      if (onSubmit) {
        await onSubmit(data);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred";
      setFormError(message);
    }
  };

  const submitting = isLoading || isSubmitting;

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
      {/* Email Field */}
      <div className="space-y-2">
        <Label htmlFor="email" className="font-medium">
          Email Address
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="your.email@example.com"
          disabled={submitting}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "email-error" : undefined}
          {...register("email", {
            required: "Email is required",
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: "Please enter a valid email address",
            },
            onBlur: () => trigger("email"),
          })}
          className="transition-colors focus-visible:ring-primary"
        />
        {errors.email && (
          <p id="email-error" className="text-xs text-destructive font-medium">
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Password Field */}
      <div className="space-y-2">
        <Label htmlFor="password" className="font-medium">
          Password
        </Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            disabled={submitting}
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? "password-error" : undefined}
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters",
              },
              onBlur: () => trigger("password"),
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
        {errors.password && (
          <p id="password-error" className="text-xs text-destructive font-medium">
            {errors.password.message}
          </p>
        )}
      </div>

      {/* Form-level error message */}
      {formError && <FormError message={formError} />}

      {/* Sign In Button */}
      <Button
        type="submit"
        className="w-full"
        disabled={submitting}
        aria-busy={submitting}
      >
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Signing in...</span>
          </>
        ) : (
          "Sign In"
        )}
      </Button>

      {/* Forgot Password Link */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={onForgotPassword}
          className="text-xs text-muted-foreground hover:text-primary transition-colors underline-offset-2 hover:underline disabled:opacity-50"
          disabled={submitting}
        >
          Forgot password?
        </button>
      </div>
    </form>
  );
}
