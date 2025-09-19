import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";


export default function PromoGrid() {
  return (
    <section className="section">
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-rose-50">
          <CardHeader>
            <CardTitle className="text-xl">Ongoing SALE. 50% OFF.</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">Limited time on select categories.</p>
            <Button>Browse products</Button>
          </CardContent>
        </Card>
        <Card className="bg-amber-50">
          <CardHeader><CardTitle className="text-xl">Other offer</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">Check out bundle deals.</p>
            <Button variant="secondary">Read more</Button>
          </CardContent>
        </Card>
        <Card className="bg-indigo-50">
          <CardHeader><CardTitle className="text-xl">Bestselling products</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">Most loved by customers.</p>
            <Button variant="outline">Explore</Button>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
