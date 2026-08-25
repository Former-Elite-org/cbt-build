import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Provider } from 'react-redux';
import { router } from './routes';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { AuthInitializer } from './features/auth/components/AuthInitializer';
import store from './redux/store';

// React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

// 👇 Move theme usage INSIDE provider
function AppContent() {
  const { theme } = useTheme();

  return (
    <>
      <AuthInitializer />
      <RouterProvider router={router} />

      <Toaster
        toastOptions={{
          style: {
            background: theme === 'dark' ? '#363636' : '#fff',
            color: theme === 'dark' ? '#fff' : '#000',
          },
        }}
      />

      {import.meta.env.DEV && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </>
  );
}

function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </QueryClientProvider>
    </Provider>
  );
}

export default App;