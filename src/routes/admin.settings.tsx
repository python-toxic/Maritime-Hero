import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({ meta: [{ title: "Settings — SOS India Admin" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const [author, setAuthor] = useState("SOS India Editorial");
  const [email, setEmail] = useState("admin@sosindia.org");
  const [region, setRegion] = useState("India");
  const [autoPublish, setAutoPublish] = useState(false);
  const [saved, setSaved] = useState(false);

  const saveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            Settings
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your admin profile, publishing preferences, and general settings.
          </p>
        </div>
      </div>

      <form onSubmit={saveSettings} className="mt-8 max-w-2xl space-y-6">
        <div className="rounded-lg border border-border bg-background p-6 space-y-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground border-b border-border pb-3">
            Publishing Configuration
          </h2>

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground">
                Default Author Name
              </label>
              <input
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-primary transition-colors"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground">
                System Notification Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-primary transition-colors"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground">
                Default Operation Region
              </label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-primary transition-colors"
              >
                <option value="India">India (HQ)</option>
                <option value="Global">Global</option>
                <option value="EU">European Union</option>
              </select>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <input
                type="checkbox"
                id="autoPublish"
                checked={autoPublish}
                onChange={(e) => setAutoPublish(e.target.checked)}
                className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
              />
              <label htmlFor="autoPublish" className="text-sm text-foreground select-none">
                Automatically publish new articles/FAQs immediately
              </label>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="submit"
            className="h-10 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Save configurations
          </button>
          {saved && (
            <span className="text-sm font-medium text-emerald-600 animate-in fade-in duration-200">
              Settings updated successfully.
            </span>
          )}
        </div>
      </form>
    </>
  );
}