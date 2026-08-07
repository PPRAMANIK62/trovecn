"use client";

import { BellIcon, CreditCardIcon, UserIcon } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function TabsIconsExample() {
  return (
    <Tabs defaultValue="profile" className="w-full max-w-sm">
      <TabsList>
        <TabsTrigger value="profile">
          <UserIcon className="size-3.5" />
          Profile
        </TabsTrigger>
        <TabsTrigger value="billing">
          <CreditCardIcon className="size-3.5" />
          Billing
        </TabsTrigger>
        <TabsTrigger value="alerts">
          <BellIcon className="size-3.5" />
          Alerts
        </TabsTrigger>
      </TabsList>
      <TabsContent value="profile" className="text-caption text-muted-foreground">
        Update your name, avatar, and bio.
      </TabsContent>
      <TabsContent value="billing" className="text-caption text-muted-foreground">
        Manage plans, invoices, and payment methods.
      </TabsContent>
      <TabsContent value="alerts" className="text-caption text-muted-foreground">
        Control which alerts land in your inbox.
      </TabsContent>
    </Tabs>
  );
}
