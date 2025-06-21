import { AuthProvider } from './_context/AuthContext'
import { SocketProvider } from './_context/SocketContext'
import './globals.css'

export const metadata = {
  title: 'Google Docs Clone',
  description: 'A real-time collaborative document editor',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <SocketProvider>
            {children}
          </SocketProvider>
        </AuthProvider>
      </body>
    </html>
  )
}