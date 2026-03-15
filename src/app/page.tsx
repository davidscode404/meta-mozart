import { TrackProvider } from "@/hooks/useTrackStore";
import SonicBlueprint from "@/components/SonicBlueprint";

export default function Home() {
  return (
    <TrackProvider>
      <SonicBlueprint />
    </TrackProvider>
  );
}
