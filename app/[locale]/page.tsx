import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { Menu } from "@/components/menu";
import { Schedule } from "@/components/schedule";
import { Footer } from "@/components/footer";
import { FloatingCTA } from "@/components/floating-cta";

export default function Page() {
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <Menu />
      <Schedule />
      <Footer />
      <FloatingCTA />
    </div>
  );
}
