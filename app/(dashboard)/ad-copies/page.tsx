import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function AdCopiesPage() {
  return (
    <div className="space-y-10">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Ad copies
        </h1>
        <p className="max-w-xl text-muted-foreground">
          Create and refine ad copy for your campaigns. Generate variations, A/B test messaging, and keep everything in one place.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="border-border/80 bg-card/50 transition-colors hover:border-primary/30 hover:bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Copy className="size-4" />
              </span>
              New copy
            </CardTitle>
            <CardDescription>
              Start from a product or idea and generate multiple ad variations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" size="sm" className="w-full gap-2" asChild>
              <Link href="#">
                Create copy
                <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="border-border/80 bg-card/50 transition-colors hover:border-primary/30 hover:bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Templates</CardTitle>
            <CardDescription>
              Use proven structures for e‑commerce, SaaS, and lead gen.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="ghost" size="sm" className="w-full gap-2" asChild>
              <Link href="#">Browse templates</Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="border-border/80 bg-card/50 transition-colors hover:border-primary/30 hover:bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Recent</CardTitle>
            <CardDescription>
              Your latest ad copies and drafts in one place.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">No recent copies yet.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
