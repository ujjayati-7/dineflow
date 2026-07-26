import './globals.css'
import { Toaster } from 'react-hot-toast'

export const metadata = {
  title: 'DineFlow AI',
  description: 'Smart Restaurant Operations',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-black text-white antialiased" data-theme="dark">
        {children}
        <Toaster
          position="top-center"
          toastOptions={{ style: { background: '#333', color: '#fff' } }}
        />
      </body>
    </html>
  )
}
