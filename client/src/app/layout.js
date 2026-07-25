import './globals.css'
import { Toaster } from 'react-hot-toast'

export const metadata = {
  title: 'DineFlow AI',
  description: 'Smart Restaurant Operations',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster position="top-center" /> {/* This makes the toasts visible! */}
      </body>
    </html>
  )
}
