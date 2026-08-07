"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function TabsStandaloneExample() {
  return (
    <Tabs defaultValue="account" className="w-full max-w-sm">
      <TabsList>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="billing">Billing</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
      </TabsList>
      <TabsContent value="account" className="text-caption text-muted-foreground">
        Manage your profile, password, and connected accounts.
      </TabsContent>
      <TabsContent value="billing" className="text-caption text-muted-foreground">
        View invoices and update your payment method.
      </TabsContent>
      <TabsContent value="notifications" className="text-caption text-muted-foreground">
        Choose which updates you want to hear about, and how.
      </TabsContent>
    </Tabs>
  );
}
