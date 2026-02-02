import { useState } from "react";
import { sendEmail } from "@/lib/managerApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

export default function SendEmail() {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [bodyText, setBodyText] = useState("");
  const [bodyHtml, setBodyHtml] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    const toEmail = to.trim();
    if (!toEmail) {
      toast({ title: "Error", description: "To email is required", variant: "destructive" });
      return;
    }
    setLoading(true);
    sendEmail({
      to_email: toEmail,
      subject: subject.trim(),
      body_text: bodyText.trim() || undefined,
      body_html: bodyHtml.trim() || undefined,
    })
      .then(() => {
        toast({ title: "Email sent", description: `Sent to ${toEmail}` });
        setTo("");
        setSubject("");
        setBodyText("");
        setBodyHtml("");
      })
      .catch((err) => toast({ title: "Error", description: err.message, variant: "destructive" }))
      .finally(() => setLoading(false));
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold text-black">
        Send Email
      </h1>
      <div className="manager-glass-panel max-w-2xl">
        <div className="p-6 border-b border-white/30">
          <h2 className="text-lg font-semibold text-black">Send an email to a customer</h2>
          <p className="text-sm text-black/60 mt-1">Transactional, marketing, support — all kinds of messages.</p>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="to">To email</Label>
              <Input
                id="to"
                type="email"
                placeholder="customer@example.com"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                type="text"
                placeholder="Subject line"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="bodyText">Body (plain text)</Label>
              <Textarea
                id="bodyText"
                placeholder="Plain text content..."
                value={bodyText}
                onChange={(e) => setBodyText(e.target.value)}
                rows={6}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="bodyHtml">Body (HTML, optional)</Label>
              <Textarea
                id="bodyHtml"
                placeholder="<p>HTML content...</p>"
                value={bodyHtml}
                onChange={(e) => setBodyHtml(e.target.value)}
                rows={4}
                className="mt-1 font-mono text-sm"
              />
            </div>
            <Button type="submit" disabled={loading} className="bg-black text-[var(--manager-lime)] hover:bg-black/90">
              {loading ? "Sending…" : "Send email"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
