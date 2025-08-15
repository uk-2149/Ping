import AuthPage from './pages/AuthPage';
import { AuthProvider } from './context/AuthContext';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Chat from './components/Chat';
import { PrivateRoute } from './auth/Private';
import { PublicRoute } from './auth/Public';

export default function App() {
  return (
    // <header>
    //   <SignedOut>
    //     <SignInButton />
    //   </SignedOut>
    //   <SignedIn>
    //     <UserButton />
    //   </SignedIn>
    // </header>
    <>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route 
            path='/auth' 
            element={
              <PublicRoute restricted>
                <AuthPage />
              </PublicRoute>
            } />
          <Route 
            path='/chat' 
            element={
            <PrivateRoute>
              <Chat />
            </PrivateRoute>
          } /> 
        </Routes>
      </BrowserRouter>
    </AuthProvider>
    </>
  )
}
