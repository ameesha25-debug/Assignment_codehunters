import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function EmailSubscribe() {
  return (
    <section className="bg-muted/40">
      <div className="container mx-auto flex flex-col items-center gap-3 px-4 py-10 text-center">
        <h3 className="text-lg font-medium">Get special discounts in your inbox</h3>
        <form className="flex w-full max-w-xl items-center gap-2">
          <Input type="email" placeholder="Your email" aria-label="Your email" required />
          <Button type="submit">Send</Button>
        </form>
      </div>
    </section>
  );
}
