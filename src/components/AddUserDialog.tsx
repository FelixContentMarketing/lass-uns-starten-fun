import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";

export function AddUserDialog({ onUserAdded }: { onUserAdded?: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    ghl_user_id: "",
    name: "",
    email: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('ghl_users')
        .upsert({
          ghl_user_id: formData.ghl_user_id,
          name: formData.name,
          email: formData.email,
          last_synced_at: new Date().toISOString(),
        }, {
          onConflict: 'ghl_user_id',
        });

      if (error) throw error;

      toast.success('Benutzer erfolgreich hinzugefügt');
      setOpen(false);
      setFormData({ ghl_user_id: "", name: "", email: "" });
      onUserAdded?.();
    } catch (error: any) {
      toast.error('Fehler beim Hinzufügen: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Benutzer hinzufügen
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>GoHighLevel Benutzer hinzufügen</DialogTitle>
          <DialogDescription>
            Füge einen Benutzer aus GoHighLevel manuell hinzu
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="ghl_user_id">GoHighLevel User ID *</Label>
              <Input
                id="ghl_user_id"
                required
                value={formData.ghl_user_id}
                onChange={(e) => setFormData({ ...formData, ghl_user_id: e.target.value })}
                placeholder="z.B. Kzj3WixN9NaFY9b0RtGN"
              />
              <p className="text-sm text-muted-foreground">
                Die User ID findest du in GoHighLevel unter Einstellungen → Team
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="z.B. Felix Schmidt"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-Mail</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="z.B. felix@example.com"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Wird hinzugefügt...' : 'Hinzufügen'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

