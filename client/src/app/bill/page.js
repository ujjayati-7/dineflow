'use client'
import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import axios from '@/lib/axios'
import toast from 'react-hot-toast'
import {
  Banknote,
  CreditCard,
  QrCode,
  CheckCircle,
  Download,
} from 'lucide-react'

// 1. Move all your existing logic into this inner component
function BillContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tableNumber = searchParams.get('table') || '1'

  const [orders, setOrders] = useState([])
  const [subtotal, setSubtotal] = useState(0)
  const [gst, setGst] = useState(0)
  const [grandTotal, setGrandTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [paymentMethod, setPaymentMethod] = useState(null)
  const [isPending, setIsPending] = useState(false)
  const [isPaid, setIsPaid] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [paidAmount, setPaidAmount] = useState(0)
  const [contactInfo, setContactInfo] = useState('')

  useEffect(() => {
    let isMounted = true

    const fetchBill = async () => {
      try {
        const res = await axios.get(`/orders/table/${tableNumber}`)
        if (!isMounted) return

        setOrders((prevOrders) => {
          if (prevOrders.length > 0 && res.data.orders.length === 0) {
            const paidTotal =
              prevOrders.reduce((sum, o) => sum + o.totalAmount, 0) * 1.05
            setPaidAmount(paidTotal)
            setIsPaid(true)
            setIsPending(false)
          }
          return res.data.orders
        })

        setSubtotal(res.data.subtotal)
        setGst(res.data.gst)
        setGrandTotal(res.data.grandTotal)

        const hasPending = res.data.orders.some(
          (o) => o.status === 'pending_payment',
        )
        if (hasPending) {
          setIsPending(true)
          setPaymentMethod(res.data.orders[0].paymentMethod)
        } else if (res.data.orders.length > 0) {
          setIsPending(false)
        }
      } catch (error) {
        if (error.response?.status === 401 || error.response?.status === 403) {
          router.push('/login')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchBill()
    const interval = setInterval(fetchBill, 4000)

    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [router, tableNumber])

  const handlePaymentRequest = async (method) => {
    try {
      await axios.put(`/orders/table/${tableNumber}/request-payment`, {
        paymentMethod: method,
      })
      setPaymentMethod(method)
      setIsPending(true)
      toast.success(`Payment requested via ${method}.`)
    } catch (error) {
      toast.error('Failed to request payment')
    }
  }

  const handleOnlinePaid = async () => {
    setIsProcessing(true)
    setTimeout(async () => {
      try {
        await axios.put(`/orders/table/${tableNumber}/online-paid`)
        setIsPaid(true)
        setIsPending(false)
        setIsProcessing(false)
        setPaidAmount(grandTotal)
        toast.success('Payment Verified by Bank!')
      } catch (error) {
        setIsProcessing(false)
        toast.error('Payment Failed')
      }
    }, 3000)
  }

    const generatePDF = async () => {
      if (!contactInfo) {
        toast.error('Please enter your Email or Phone number')
        return
      }

      // Dynamically import jsPDF only in the browser when clicked
      const { default: jsPDF } = await import('jspdf')

      const doc = new jsPDF()

      // Header
      doc.setFontSize(24)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(200, 175, 50)
      doc.text('The DineFlow Bistro', 20, 20)

      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(100)
      doc.text(`Table: ${tableNumber}`, 20, 30)
      doc.text(`Date: ${new Date().toLocaleString()}`, 20, 35)
      doc.text(`Billed To: ${contactInfo}`, 20, 40)

      doc.setDrawColor(200)
      doc.line(20, 45, 190, 45)

      let y = 55
      doc.setTextColor(0)
      doc.setFont('helvetica', 'bold')
      doc.text('Item', 20, y)
      doc.text('Qty', 120, y)
      doc.text('Price', 150, y)
      y += 5

      doc.setFont('helvetica', 'normal')
      orders.forEach((order) => {
        order.items.forEach((item) => {
          doc.text(item.name, 20, y)
          doc.text(String(item.quantity), 120, y)
          doc.text(`₹ ${(item.price * item.quantity).toFixed(2)}`, 150, y)
          y += 10
        })
      })

      y += 10
      doc.line(20, y, 190, y)
      y += 10
      doc.text(`Subtotal: ₹ ${subtotal.toFixed(2)}`, 120, y)
      y += 10
      doc.text(`GST (5%): ₹ ${gst.toFixed(2)}`, 120, y)
      y += 10
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(14)
      doc.text(`Grand Total: ₹ ${grandTotal.toFixed(2)}`, 120, y)

      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(100)
      doc.text('Thank you for dining with us! Powered by DineFlow AI.', 20, 280)

      doc.save(`DineFlow_Bill_Table${tableNumber}.pdf`)
      toast.success('Invoice downloaded!')

      setTimeout(() => {
        setIsPaid(false)
        setOrders([])
        setContactInfo('')
        router.push('/')
      }, 3000)
    }

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-amber-400">
        Loading bill...
      </div>
    )

  if (isPaid) {
    return (
      <div className="min-h-screen bg-black py-12 px-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-zinc-900 border border-amber-500/30 rounded-2xl shadow-xl p-8 text-center">
          <div className="inline-block bg-amber-500/10 p-4 rounded-full mb-4 border border-amber-500/30">
            <CheckCircle className="text-amber-400" size={48} />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2 font-serif">
            Payment Successful!
          </h1>
          <p className="text-gray-400 mb-6">
            Amount Paid:{' '}
            <span className="text-amber-400 font-bold">
              ₹{paidAmount.toFixed(2)}
            </span>{' '}
            via {paymentMethod}
          </p>

          <div className="border-t border-zinc-800 pt-6">
            <h3 className="font-bold text-white mb-2">Get Digital Invoice</h3>
            <p className="text-gray-500 text-sm mb-4">
              Enter your Email or Phone to receive the receipt
            </p>
            <input
              type="text"
              value={contactInfo}
              onChange={(e) => setContactInfo(e.target.value)}
              placeholder="email@example.com / 9876543210"
              className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none mb-4 text-center text-white"
            />
            <button
              onClick={generatePDF}
              className="w-full bg-amber-500 text-black p-3 rounded-xl font-bold hover:bg-amber-400 transition flex items-center justify-center gap-2"
            >
              <Download size={20} /> Download & Send Invoice
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black py-12 px-4">
      <div className="max-w-md mx-auto bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-black border-b border-amber-500/20 p-6 text-center">
          <h1 className="text-2xl font-bold text-amber-400 font-serif tracking-wide">
            The DineFlow Bistro
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Table {tableNumber} • Digital Receipt
          </p>
        </div>

        <div className="p-6">
          {orders.length === 0 ? (
            <div className="text-center py-10">
              <h2 className="text-2xl font-bold text-amber-400 mb-2 font-serif">
                No Active Bill 🎉
              </h2>
              <p className="text-gray-500">
                You have no pending items or your bill has been paid.
              </p>
              <button
                onClick={() => router.push('/')}
                className="mt-6 bg-amber-500 text-black px-6 py-2 rounded-lg font-semibold hover:bg-amber-400 transition"
              >
                Back to Menu
              </button>
            </div>
          ) : (
            <>
              {orders.map((order) => (
                <div
                  key={order._id}
                  className="mb-6 pb-6 border-b border-dashed border-zinc-700"
                >
                  <div className="flex justify-between text-xs text-gray-500 mb-2">
                    <span>Order ID: #{order._id.substring(0, 6)}</span>
                    <span className="uppercase font-semibold text-amber-500/80">
                      {order.status.replace('_', ' ')}
                    </span>
                  </div>
                  {order.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between py-1 text-sm text-gray-300"
                    >
                      <span>
                        {item.quantity}x {item.name}
                      </span>
                      <span className="font-medium">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              ))}

              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-sm text-gray-400">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-400">
                  <span>GST (5%)</span>
                  <span>₹{gst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-zinc-700 mt-2">
                  <span className="text-lg font-bold text-white font-serif">
                    Grand Total
                  </span>
                  <span className="text-3xl font-bold text-amber-400">
                    ₹{grandTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {isPending ? (
                <div className="text-center bg-amber-500/5 border border-amber-500/20 p-6 rounded-xl">
                  {paymentMethod === 'online' ? (
                    <div className="mb-4">
                      {isProcessing ? (
                        <div className="py-8">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400 mx-auto mb-4"></div>
                          <p className="text-sm font-bold text-white">
                            Verifying Payment with Bank...
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Please do not close this window.
                          </p>
                        </div>
                      ) : (
                        <>
                          <p className="text-sm font-bold text-white mb-3">
                            Scan UPI QR to Pay
                          </p>
                          <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=dineflow@upi&pn=TheDineFlowBistro&am=${grandTotal}&cu=INR`}
                            alt="Payment QR"
                            className="mx-auto rounded-lg bg-white p-2"
                          />
                          <button
                            onClick={handleOnlinePaid}
                            className="mt-4 w-full bg-amber-500 text-black py-3 rounded-lg font-bold hover:bg-amber-400 transition"
                          >
                            Proceed to Pay ₹{grandTotal.toFixed(2)}
                          </button>
                          <p className="mt-2 text-xs text-gray-500">
                            Click above after scanning to simulate bank
                            verification.
                          </p>
                        </>
                      )}
                    </div>
                  ) : (
                    <>
                      <p className="text-amber-400 font-bold">
                        Waiting for Waiter Confirmation...
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Please show this screen to your waiter for{' '}
                        {paymentMethod.toUpperCase()} payment.
                      </p>
                    </>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-center text-gray-500 text-sm mb-4">
                    Select Payment Method
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => handlePaymentRequest('cash')}
                      className="flex flex-col items-center gap-2 bg-zinc-800 border border-zinc-700 hover:border-amber-500/50 p-4 rounded-xl transition"
                    >
                      <Banknote size={24} className="text-amber-400" />
                      <span className="text-xs font-bold text-white">Cash</span>
                    </button>
                    <button
                      onClick={() => handlePaymentRequest('card')}
                      className="flex flex-col items-center gap-2 bg-zinc-800 border border-zinc-700 hover:border-amber-500/50 p-4 rounded-xl transition"
                    >
                      <CreditCard size={24} className="text-amber-400" />
                      <span className="text-xs font-bold text-white">Card</span>
                    </button>
                    <button
                      onClick={() => handlePaymentRequest('online')}
                      className="flex flex-col items-center gap-2 bg-zinc-800 border border-zinc-700 hover:border-amber-500/50 p-4 rounded-xl transition"
                    >
                      <QrCode size={24} className="text-amber-400" />
                      <span className="text-xs font-bold text-white">
                        Online (UPI)
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// 2. Export the default component wrapped in Suspense
export default function BillPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-amber-400">
          Loading...
        </div>
      }
    >
      <BillContent />
    </Suspense>
  )
}
