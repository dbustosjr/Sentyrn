import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Settings</h1>
        <p className="mt-1 text-sm text-frost">Workspace preferences · persistence in Phase 2</p>
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
              <CardDescription className="text-frost">Display name and email come from InsForge Auth.</CardDescription>
            </CardHeader>
            <CardContent className="max-w-md space-y-4">
              <div className="space-y-2">
                <Label htmlFor="dn">Display name</Label>
                <Input id="dn" disabled placeholder="Ada Lovelace" />
              </div>
              <Button disabled>Save</Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="workspace" className="mt-4">
          <Card className="border-border bg-surface/40">
            <CardHeader>
              <CardTitle className="text-ink">Workspace</CardTitle>
              <CardDescription className="text-frost">Members, roles, and repos — Phase 2.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-frost">Placeholder panel.</CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="privacy" className="mt-4">
          <Card className="border-border bg-surface/40">
            <CardHeader>
              <CardTitle className="text-ink">Privacy mode</CardTitle>
              <CardDescription className="text-frost">Safe / Standard / Full — see privacy-model.md</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-frost">Default workspace mode will be enforced server-side in Phase 2.</CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
