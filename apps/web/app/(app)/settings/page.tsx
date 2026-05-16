import { redirect } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { getCurrentUser } from "@/lib/auth/session";
import { getWorkspaceContext } from "@/lib/data/workspace";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const ctx = await getWorkspaceContext(user);
  if (!ctx) redirect("/login");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Settings</h1>
        <p className="mt-1 text-sm text-frost">Workspace and account · backed by InsForge</p>
      </div>
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="border border-border bg-surface/60">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="workspace">Workspace</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
        </TabsList>
        <TabsContent value="general" className="mt-4">
          <Card className="border-border bg-surface/40">
            <CardHeader>
              <CardTitle className="text-ink">Profile</CardTitle>
              <CardDescription className="text-frost">From InsForge Auth (read-only in Phase 2).</CardDescription>
            </CardHeader>
            <CardContent className="max-w-md space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={user.email ?? ""} disabled readOnly />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dn">Display name</Label>
                <Input id="dn" value={user.name ?? ""} disabled readOnly />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="workspace" className="mt-4">
          <Card className="border-border bg-surface/40">
            <CardHeader>
              <CardTitle className="text-ink">Workspace</CardTitle>
              <CardDescription className="text-frost">Tenant boundary for sessions and policies.</CardDescription>
            </CardHeader>
            <CardContent className="max-w-md space-y-3 text-sm">
              <div>
                <p className="text-frost">Name</p>
                <p className="text-ink">{ctx.workspace.name}</p>
              </div>
              <div>
                <p className="text-frost">Slug</p>
                <p className="font-mono text-ink">{ctx.workspace.slug}</p>
              </div>
              <div>
                <p className="text-frost">Retention</p>
                <p className="text-ink">{ctx.workspace.retention_days} days</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="privacy" className="mt-4">
          <Card className="border-border bg-surface/40">
            <CardHeader>
              <CardTitle className="text-ink">Privacy mode</CardTitle>
              <CardDescription className="text-frost">Default telemetry mode for this workspace.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-ink capitalize">{ctx.workspace.privacy_mode}</CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
