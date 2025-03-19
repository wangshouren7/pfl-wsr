import { Background } from "@/domains/assets";
import { Wizard } from "@/domains/models/wizard";
import { Navigation } from "@/domains/navigation";
import RenderModel from "@/libs/ui/render-model";

export default function Home() {
  return (
    <main className="relative flex h-screen flex-col items-center justify-center">
      <Background
        fill
        priority
        className="-z-50 h-full w-full object-cover object-center opacity-50"
        sizes="100vw"
        variant="home"
      />

      <div className="h-screen w-full">
        <Navigation />

        <RenderModel>
          <Wizard />
        </RenderModel>
      </div>
    </main>
  );
}
