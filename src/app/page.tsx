import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Dumbbell, BarChart3, Calendar, FileText } from "lucide-react";
import { StartWorkoutCTA } from "@/components/workout/start-workout-cta";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Dumbbell className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">Workout Tracker</span>
          </Link>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
          Track Your Fitness Journey
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Log workouts, create templates, analyze progress, and reach your
          fitness goals with our comprehensive workout tracking app.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <StartWorkoutCTA />
          <Button size="lg" variant="outline" asChild>
            <Link href="/signup">Create Account</Link>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">
          Everything You Need
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center p-6 rounded-lg bg-card border">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Dumbbell className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Log Workouts</h3>
            <p className="text-sm text-muted-foreground">
              Track exercises, sets, reps, and weights with an intuitive
              interface.
            </p>
          </div>
          <div className="text-center p-6 rounded-lg bg-card border">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Create Templates</h3>
            <p className="text-sm text-muted-foreground">
              Save your favorite routines and use them to quickly log workouts.
            </p>
          </div>
          <div className="text-center p-6 rounded-lg bg-card border">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">View History</h3>
            <p className="text-sm text-muted-foreground">
              See your workout history in calendar, week, or month views.
            </p>
          </div>
          <div className="text-center p-6 rounded-lg bg-card border">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Analyze Progress</h3>
            <p className="text-sm text-muted-foreground">
              Visualize your progress with detailed charts and statistics.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="bg-primary/5 rounded-2xl p-12 border">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Join thousands of fitness enthusiasts tracking their workouts and
            achieving their goals.
          </p>
          <Button size="lg" asChild>
            <Link href="/signup">Create Free Account</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; 2024 Workout Tracker. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
