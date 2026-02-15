"use client";

import { useRouter } from "next/navigation";
import { LogIn, UserPlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const PENDING_SAVE_KEY = "workout-pending-save";
const CALLBACK_URL = encodeURIComponent("/workout/active");

interface AuthPromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuthPromptDialog({ open, onOpenChange }: AuthPromptDialogProps) {
  const router = useRouter();

  const handleNavigate = (path: string) => {
    localStorage.setItem(PENDING_SAVE_KEY, "true");
    onOpenChange(false);
    router.push(`${path}?callbackUrl=${CALLBACK_URL}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sign in to save your workout</DialogTitle>
          <DialogDescription>
            Your workout progress is saved on this device. Sign in or create an
            account to save it permanently.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => handleNavigate("/login")}
            className="gap-2"
          >
            <LogIn className="h-4 w-4" />
            Sign In
          </Button>
          <Button
            onClick={() => handleNavigate("/signup")}
            className="gap-2"
          >
            <UserPlus className="h-4 w-4" />
            Create Account
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export { PENDING_SAVE_KEY };
