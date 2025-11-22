import { SceneLayout } from "../components/SceneLayout";
import { UI } from "../components/UI";
import { Landing } from "../components/Landing";
import { PWAInstallPrompt } from "../components/PWAInstallPrompt";
import { BookDataProvider } from "../context/BookDataContext";

export const PublicScene = () => {
  return (
    <BookDataProvider isAdminMode={false}>
      <SceneLayout>
        <UI />
        <Landing />
        <PWAInstallPrompt />
      </SceneLayout>
    </BookDataProvider>
  );
};


