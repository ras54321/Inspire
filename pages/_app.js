import "../styles/globals.css";
import { Toaster } from 'react-hot-toast';
import AppLayout from '../components/Layout/AppLayout';
import { useRouter } from 'next/router';

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  
  // List of pages that don't need the layout (auth pages, etc.)
  const noLayoutPages = ['/create-profile', '/welcome'];
  
  const shouldUseLayout = !noLayoutPages.includes(router.pathname);

  return (
    <>
      {shouldUseLayout ? (
        <AppLayout>
          <Component {...pageProps} />
        </AppLayout>
      ) : (
        <Component {...pageProps} />
      )}
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10B981',
              secondary: 'white',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#EF4444',
              secondary: 'white',
            },
          },
        }}
      />
    </>
  );
}

export default MyApp;
