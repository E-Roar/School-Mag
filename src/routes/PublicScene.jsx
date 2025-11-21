import { SceneLayout } from "../components/SceneLayout";
import { UI } from "../components/UI";
import { Landing } from "../components/Landing";
import { PWAInstallPrompt } from "../components/PWAInstallPrompt";

export const PublicScene = () => {
  return (
    <SceneLayout>
      <UI />
      <Landing />
      <PWAInstallPrompt />
    </SceneLayout>
  );
};


