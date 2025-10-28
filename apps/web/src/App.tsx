import AuthPage from './pages/AuthPage';
import { AuthProvider } from './context/AuthContext';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
// import Chat from './components/chat/Chat';
import { PrivateRoute } from './auth/Private';
import { PublicRoute } from './auth/Public';
import Home from './pages/Home';
import { ChatProvider } from './context/ChatContext';
import { ServerProvider } from './context/ServerContext';
import ServerInvitationPage from './components/server/ServerInvitationPage';

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
            path='/' 
            element={
            <PrivateRoute>
              <ChatProvider>
                <ServerProvider>
                  <Home />
                </ServerProvider>
              </ChatProvider>
            </PrivateRoute>
          } /> 

          {/* Invite Accept Page */}
          <Route
            path="/invite/:inviteId"
            element={
              <PrivateRoute>
                <ChatProvider>
                  <ServerProvider>
                    <ServerInvitationPage />
                  </ServerProvider>
                </ChatProvider>
              </PrivateRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
    </>
  )
}
