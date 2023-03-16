import type { AppProps } from "next/app";
import "styles/globals.css";
import { UserProvider } from "providers/user";
import { ModalProvider } from "providers/modals";
import { ProfileProvider } from "providers/profile";
import { TripProvider } from "providers/trip";
import { Toaster } from "react-hot-toast";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <UserProvider>
      <Toaster containerStyle={{ zIndex: 10001 }} />
      <ProfileProvider>
        <TripProvider>
          <ModalProvider>
            <Component {...pageProps} />
          </ModalProvider>
        </TripProvider>
      </ProfileProvider>
    </UserProvider>
  );
}

export default MyApp;
