import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormError } from "./FormError";
import { verifySecretCode } from "../lib/auth";
import { getSecretCodeHint } from "../lib/auth";
import type { UserRole } from "./RoleSelector";

interface SecretCodeFormProps {
  email: string;
  role: UserRole;
  onSuccess: () => void;
  onBack: () => void;
  isLoading?: boolean;
  error?: string | null;
}

/**
 * Secret code verification form for password recovery
 * Validates the secret code associated with user's role
 */
export function SecretCodeForm({
  email,
  role,
  onSuccess,
  onBack,
  isLoading = false,
  error: externalError,
}: SecretCodeFormProps) {
  const [error, setError] = useState<string | null>(externalError || null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    trigger,
  } = useForm({
    mode: "onChange",
    defaultValues: {
      secretCode: "",
    },
  });

  React.useEffect(() => {
    setError(externalError || null);
  }, [externalError]);

  const handleVerify = async (data: { secretCode: string }) => {
    setError(null);
    try {
      const result = await verifySecretCode(email, data.secretCode, role);

      if (!result.success) {
        setError(result.error || "Invalid secret code");
        return;
      }

      onSuccess();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Verification failed";
      setError(message);
    }
  };

  const submitting = isLoading || isSubmitting;

  return (
    <form onSubmit={handleSubmit(handleVerify)} className="space-y-5">
      {/* Info Section */}
      <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 space-y-1 text-sm">
        <p className="text-blue-900 font-medium">Enter Your Secret Code</p>
        <p className="text-blue-800 text-xs">{getSecretCodeHint(role)}</p>
      </div>

      {/* Secret Code Field */}
      <div className="space-y-2">
        <Label htmlFor="secret-code" className="font-medium flex items-center gap-2">
          <Lock className="h-4 w-4" />
          Secret Code
        </Label>
        <Input
          id="secret-code"
          type="text"
          placeholder="Enter secret code"
          disabled={submitting}
          autoComplete="off"
          aria-invalid={!!errors.secretCode}
          aria-describedby={errors.secretCode ? "secret-code-error" : undefined}
          {...register("secretCode", {
            required: "Secret code is required",
            minLength: {
              value: 4,
              message: "Secret code is too short",
            },
            onBlur: () => trigger("secretCode"),
          })}
          className="uppercase transition-colors focus-visible:ring-primary"
        />
        {errors.secretCode && (
          <p id="secret-code-error" className="text-xs text-destructive font-medium">
            {errors.secretCode.message}
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
              <span>Verifying...</span>
            </>
          ) : (
            "Verify"
          )}
        </Button>
      </div>
    </form>
  );
}
