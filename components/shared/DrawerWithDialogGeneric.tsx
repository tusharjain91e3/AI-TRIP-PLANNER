"use client";

import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react"; // Changed to standard useQuery from convex/react
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
import { Backpack, LockIcon, CreditCard } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export const CreditsDrawerWithDialog = () => {
  const userQuery = useQuery(api.users.currentUser);

  const isLoading = userQuery === undefined;
  const boughtCredits = userQuery?.credits ?? 0;
  const freeCredits = userQuery?.freeCredits ?? 0;
  const totalCredits = freeCredits + boughtCredits;

  // Always show the credits button, even during loading
  const dialogTriggerBtn = (
    <Button
      variant="ghost"
      className="text-foreground hover:text-primary transition-colors text-sm font-medium flex items-center gap-2"
      disabled={isLoading}
      aria-label={isLoading ? "Loading credits" : `Credits: ${totalCredits}`}
    >
      <CreditCard className="h-4 w-4" />
      {isLoading ? (
        <div className="w-8 h-4 bg-muted rounded animate-pulse" />
      ) : (
        <span>{totalCredits}</span>
      )}
    </Button>
  );

  return (
    <DrawerWithDialog dialogTriggerBtn={dialogTriggerBtn}>
      {isLoading ? (
        <div className="flex flex-col gap-4 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-muted rounded-full animate-pulse" />
            <div className="space-y-2">
              <div className="w-32 h-4 bg-muted rounded animate-pulse" />
              <div className="w-24 h-3 bg-muted rounded animate-pulse" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border bg-card">
              <div className="w-16 h-4 bg-muted rounded mb-2 animate-pulse mx-auto" />
              <div className="w-12 h-6 bg-muted rounded animate-pulse mx-auto" />
            </div>
            <div className="p-4 rounded-lg border bg-card">
              <div className="w-20 h-4 bg-muted rounded mb-2 animate-pulse mx-auto" />
              <div className="w-12 h-6 bg-muted rounded animate-pulse mx-auto" />
            </div>
          </div>
        </div>
      ) : (
        <CreditContent
          boughtCredits={boughtCredits}
          freeCredits={freeCredits}
          email={userQuery?.email}
        />
      )}
    </DrawerWithDialog>
  );
};

export const GeneratePlanDrawerWithDialog = () => {
  const userQuery = useQuery(api.users.currentUser);

  const isLoading = userQuery === undefined;
  const boughtCredits = userQuery?.credits ?? 0;
  const freeCredits = userQuery?.freeCredits ?? 0;
  const totalCredits = freeCredits + boughtCredits;

  // Always show the create plan button, even during loading
  const dialogTriggerBtn = (
    <Button
      className="bg-blue-600 hover:bg-blue-700 text-white flex gap-2 justify-center items-center transition-colors shadow-lg hover:shadow-xl px-4 py-2 rounded-lg font-medium"
      disabled={isLoading}
      aria-label={isLoading ? "Loading" : "Create Travel Plan"}
    >
      <Backpack className="h-4 w-4" />
      {isLoading ? (
        <div className="w-24 h-4 bg-blue-400 rounded animate-pulse" />
      ) : (
        <span>Create Travel Plan</span>
      )}
    </Button>
  );

  return (
    <DrawerWithDialog dialogTriggerBtn={dialogTriggerBtn}>
      {({ setOpen }) =>
        isLoading ? (
          <div className="flex flex-col gap-6 p-6">
            <div className="space-y-3">
              <div className="w-3/4 h-6 bg-muted rounded animate-pulse" />
              <div className="w-1/2 h-4 bg-muted rounded animate-pulse" />
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="w-20 h-4 bg-muted rounded animate-pulse" />
                  <div className="w-full h-10 bg-muted rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        ) : totalCredits > 0 ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-foreground">
                Create Travel Plan
              </DialogTitle>
            </DialogHeader>
            <NewPlanForm closeModal={setOpen} />
          </>
        ) : (
          <CreditContent
            boughtCredits={boughtCredits}
            freeCredits={freeCredits}
            email={userQuery?.email}
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
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto p-0">
          <DialogTitle className="sr-only">Create Travel Plan</DialogTitle>
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
  const hasCredits = totalCredits > 0;

  return (
    <div className="flex flex-col gap-6 p-2">
      {hasCredits ? (
        <>
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-foreground">Your Credits</h2>
            <p className="text-muted-foreground text-sm">
              Total available: <span className="font-semibold text-primary">{totalCredits}</span> credits
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <div className="flex flex-col gap-2 justify-center items-center p-6 rounded-lg border flex-1 bg-card shadow-sm">
              <span className="text-muted-foreground text-sm">Free Credits</span>
              <span className="font-bold text-3xl text-green-600">{freeCredits}</span>
            </div>
            <div className="flex flex-col gap-2 justify-center items-center p-6 rounded-lg border flex-1 bg-card shadow-sm">
              <span className="text-muted-foreground text-sm">Purchased Credits</span>
              <span className="font-bold text-3xl text-blue-600">{boughtCredits}</span>
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col gap-6 justify-center items-center text-center py-4">
          <h2 className="font-bold text-2xl text-foreground">
            You're out of credits!
          </h2>
          <div className="relative">
            <Image
              alt="Empty Cart"
              src={empty_cart}
              width={180}
              height={180}
              className="opacity-70"
              priority={false}
            />
          </div>
          <p className="text-muted-foreground text-sm max-w-sm">
            Purchase credits to create amazing travel plans with AI
          </p>
        </div>
      )}

      <div className="flex flex-col gap-3 pt-2">
        <Link
          className={cn(
            buttonVariants({ variant: "default" }),
            "bg-blue-600 hover:bg-blue-700 text-white flex gap-2 justify-center items-center w-full py-3",
            "transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02] font-medium"
          )}
          href={
            email
              ? `${process.env.NEXT_PUBLIC_RAZORPAY_PAYMENT_PAGE_URL}/?email=${encodeURIComponent(email)}`
              : process.env.NEXT_PUBLIC_RAZORPAY_PAYMENT_PAGE_URL || "/purchase"
          }
          target="_blank"
          rel="noopener noreferrer"
          prefetch={false}
        >
          <LockIcon className="w-4 h-4" />
          <span>Purchase Credits</span>
        </Link>
        
        <div className="flex gap-2 justify-center items-center pt-1">
          <svg
            width="14"
            height="14"
            viewBox="0 0 18 20"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
            className="text-blue-600"
            aria-hidden="true"
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