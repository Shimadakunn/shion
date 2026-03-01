import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { Menu } from "@/components/menu";
import { Footer } from "@/components/footer";
import { FloatingCTA } from "@/components/floating-cta";

export default function Page() {
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <Menu />
      <Footer />
      <FloatingCTA />
    </div>
  );
}
