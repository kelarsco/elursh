import { useState } from "react";
import { FadeIn } from "@/components/FadeIn";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowRight, CalendarDays } from "lucide-react";

const timeSlots = [
  "9:00 AM EST",
  "10:00 AM EST",
  "11:00 AM EST",
  "12:00 PM EST",
  "1:00 PM EST",
  "2:00 PM EST",
  "3:00 PM EST",
  "4:00 PM EST",
  "5:00 PM EST",
];

const BookingForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate submission
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success("Your audit request has been submitted! We'll be in touch within 24 hours.");
      e.target.reset();
    }, 1500);
  };

  return (
    <section id="booking-form" className="section-soft py-20 sm:py-28">
      <div className="container-section">
        <FadeIn>
          <p className="text-emerald font-display font-semibold text-sm uppercase tracking-widest mb-4 text-center">
            Book Your Session
          </p>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-center max-w-3xl mx-auto">
            Request Your Free Store Audit
          </h2>
          <p className="mt-6 text-center text-muted-foreground text-lg max-w-2xl mx-auto">
            Fill out the form below and we'll schedule your personalized audit session.
          </p>
        </FadeIn>

        <FadeIn delay={0.2}>
          <form onSubmit={handleSubmit} className="mt-12 max-w-xl mx-auto bg-background rounded-2xl p-8 sm:p-10 border border-border shadow-lg space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="font-display font-medium">Full Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="John Smith"
                required
                maxLength={100}
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="font-display font-medium">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="john@yourstore.com"
                required
                maxLength={255}
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="store-url" className="font-display font-medium">Store URL</Label>
              <Input
                id="store-url"
                name="store-url"
                type="url"
                placeholder="https://yourstore.com"
                required
                maxLength={500}
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date" className="font-display font-medium">Preferred Date</Label>
              <Input
                id="date"
                name="date"
                type="date"
                required
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label className="font-display font-medium">Preferred Time (US Timezone)</Label>
              <Select name="time" required>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select a time slot" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((slot) => (
                    <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              type="submit"
              variant="cta"
              size="xl"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                "Submitting..."
              ) : (
                <>
                  Request Free Audit Session
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>

            <div className="flex items-center gap-2 justify-center text-muted-foreground text-sm">
              <CalendarDays className="h-4 w-4" />
              <span className="font-body">We'll confirm your session within 24 hours</span>
            </div>
          </form>
        </FadeIn>
      </div>
    </section>
  );
};

export default BookingForm;
