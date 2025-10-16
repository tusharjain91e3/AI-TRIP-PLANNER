"use client";

import { api } from "@/convex/_generated/api";
import { useQuery } from "convex-helpers/react/cache/hooks";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Image from "next/image";
import empty_cart from "@/public/empty_cart.svg";
import { Button, buttonVariants } from "@/components/ui/button";
import { Dispatch, ReactNode, SetStateAction, useState } from "react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import NewPlanForm from "@/components/NewPlanForm";
import { Backpack, LockIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Loading } from "@/components/shared/Loading"; // Add your loading component

// Loading state component
const CreditsLoading = () => (
  <div className="flex flex-col items-center justify-center p-8 gap-4">
    <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
    <span className="text-sm text-muted-foreground">Loading credits...</span>
  </div>
);

// Error state component
const CreditsError = ({ onRetry }: { onRetry: () => void }) => (
  <div className="flex flex-col items-center justify-center p-8 gap-4">
    <div className="text-destructive">Failed to load credits</div>
    <Button variant="outline" onClick={onRetry} size="sm">
      Retry
    </Button>
  </div>
);

export const CreditsDrawerWithDialog = () => {
  const userQuery = useQuery(api.users.currentUser);
  const [retryCount, setRetryCount] = useState(0);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  const boughtCredits = userQuery?.credits ?? 0;
  const freeCredits = userQuery?.freeCredits ?? 0;
  const totalCredits = freeCredits + boughtCredits;
  const email = userQuery?.email;

  const isLoading = userQuery === undefined;

  const dialogTriggerBtn = isLoading ? (
    <Button variant="link" className="text-foreground" disabled>
      <div className="w-4 h-4 border-2 border-primary/20 border-t-primary rounded-full animate-spin mr-2" />
      Loading...
    </Button>
  ) : (
    <Button
      aria-label={`Credits: ${totalCredits}`}
      variant="link"
      className="text-foreground p-0 h-auto"
    >
      Credits {totalCredits}
    </Button>
  );

  return (
    <DrawerWithDialog dialogTriggerBtn={dialogTriggerBtn}>
      {isLoading ? (
        <CreditsLoading />
      ) : (
        <CreditContent
          boughtCredits={boughtCredits}
          freeCredits={freeCredits}
          email={email}
        />
      )}
    </DrawerWithDialog>
  );
};

export const GeneratePlanDrawerWithDialog = () => {
  const userQuery = useQuery(api.users.currentUser);
  const [retryCount, setRetryCount] = useState(0);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  const boughtCredits = userQuery?.credits ?? 0;
  const freeCredits = userQuery?.freeCredits ?? 0;
  const totalCredits = freeCredits + boughtCredits;
  const email = userQuery?.email;

  const isLoading = userQuery === undefined;

  const dialogTriggerBtn = isLoading ? (
    <Button disabled className="bg-blue-500/50">
      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
      Loading...
    </Button>
  ) : (
    <Button
      aria-label="Create Travel Plan"
      className="bg-blue-500 hover:bg-blue-600 text-white flex gap-1 justify-center items-center transition-colors"
    >
      <Backpack className="h-4 w-4" />
      <span>Create Travel Plan</span>
    </Button>
  );

  return (
    <DrawerWithDialog dialogTriggerBtn={dialogTriggerBtn}>
      {({ setOpen }) =>
        isLoading ? (
          <CreditsLoading />
        ) : totalCredits > 0 ? (
          <>
            <DialogHeader>
              <DialogTitle>Create Travel Plan</DialogTitle>
            </DialogHeader>
            <NewPlanForm closeModal={setOpen} />
          </>
        ) : (
          <CreditContent
            boughtCredits={boughtCredits}
            freeCredits={freeCredits}
            email={email}
          />
        )
      }
    </DrawerWithDialog>
  );
};

interface DrawerWithDialogProps {
  dialogTriggerBtn: ReactNode;
  children:
    | ReactNode
    | ((props: { setOpen: Dispatch<SetStateAction<boolean>> }) => ReactNode);
}

const DrawerWithDialog = ({ dialogTriggerBtn, children }: DrawerWithDialogProps) => {
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const renderContent = () => {
    if (typeof children === "function") {
      return children({ setOpen });
    }
    return children;
  };

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{dialogTriggerBtn}</DialogTrigger>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          {renderContent()}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{dialogTriggerBtn}</DrawerTrigger>
      <DrawerContent className="flex flex-col gap-6 p-4 max-h-[90vh] overflow-y-auto">
        {renderContent()}
      </DrawerContent>
    </Drawer>
  );
};

interface CreditContentProps {
  boughtCredits: number;
  freeCredits: number;
  email?: string;
}

const CreditContent = ({ boughtCredits, freeCredits, email }: CreditContentProps) => {
  const totalCredits = freeCredits + boughtCredits;
  const hasCredits = boughtCredits > 0 || freeCredits > 0;

  return (
    <div className="flex flex-col gap-6 p-2">
      {hasCredits ? (
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <div className="flex flex-col gap-2 justify-center items-center p-6 rounded-lg border flex-1 bg-card">
            <span className="text-muted-foreground text-sm">Free Credits</span>
            <span className="font-bold text-4xl text-primary">{freeCredits}</span>
          </div>
          <div className="flex flex-col gap-2 justify-center items-center p-6 rounded-lg border flex-1 bg-card">
            <span className="text-muted-foreground text-sm">Bought Credits</span>
            <span className="font-bold text-4xl text-primary">{boughtCredits}</span>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-6 justify-center items-center text-center">
          <h1 className="font-bold text-xl text-foreground">
            You are out of credits!
          </h1>
          <div className="relative">
            <Image
              alt="Empty Cart"
              src={empty_cart}
              width={200}
              height={200}
              className="opacity-60"
              priority={false}
            />
          </div>
          <p className="text-muted-foreground text-sm">
            Purchase credits to create amazing travel plans
          </p>
        </div>
      )}

      <div className="flex flex-col gap-3 pt-2">
        <Link
          className={cn(
            buttonVariants({ variant: "default" }),
            "bg-blue-500 hover:bg-blue-600 text-white flex gap-2 justify-center items-center w-full",
            "transition-all duration-200 shadow-lg hover:shadow-xl"
          )}
          href={
            email
              ? `${process.env.NEXT_PUBLIC_RAZORPAY_PAYMENT_PAGE_URL}/?email=${encodeURIComponent(email)}`
              : process.env.NEXT_PUBLIC_RAZORPAY_PAYMENT_PAGE_URL || "/purchase"
          }
          target="_blank"
          rel="noopener noreferrer"
        >
          <LockIcon className="w-4 h-4" />
          <span>Purchase Credits</span>
        </Link>
        
        <div className="flex gap-1 justify-center items-center pt-2">
          <svg
            width="12"
            height="12"
            viewBox="0 0 18 20"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
            className="text-blue-500"
          >
            <path
              d="M7.077 6.476l-.988 3.569 5.65-3.589-3.695 13.54 3.752.004 5.457-20L7.077 6.476z"
              fill="#3b82f6"
            />
            <path
              d="M1.455 14.308L0 20h7.202L10.149 8.42l-8.694 5.887z"
              fill="#072654"
            />
          </svg>
          <span className="text-xs text-muted-foreground">Secured by Razorpay</span>
        </div>
      </div>
    </div>
  );
};

export default DrawerWithDialog;