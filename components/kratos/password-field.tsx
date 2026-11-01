"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type PasswordFieldProps = {
  id: string;
  name: string;
  defaultValue?: string;
  autoComplete?: string;
  required?: boolean;
  disabled?: boolean;
};

export function PasswordField({
  id,
  name,
  defaultValue,
  autoComplete,
  required,
  disabled,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Input
        id={id}
        name={name}
        type={visible ? "text" : "password"}
        variant="lg"
        defaultValue={defaultValue}
        autoComplete={autoComplete}
        required={required}
        disabled={disabled}
        className="pe-10"
      />
      <Button
        type="button"
        variant="ghost"
        mode="icon"
        size="sm"
        className="absolute end-1 top-1/2 -translate-y-1/2"
        aria-label={visible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
        onClick={() => setVisible((current) => !current)}
      >
        {visible ? <EyeOff /> : <Eye />}
      </Button>
    </div>
  );
}
