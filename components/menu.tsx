import { Button } from "@/components/ui/button";

export function Menu() {
  return (
    <div className="flex flex-col items-center justify-center">
      <Button className="text-2xl font-bold">Le Midi</Button>
      <Button className="text-2xl font-bold">Le Soir</Button>
    </div>
  );
}

function Carte() {
  return (
    <div>
      <h1>Menu</h1>
      <h1>Entrees</h1>
      <h1>Plats</h1>
      <h1>Desserts</h1>
    </div>
  );
}
