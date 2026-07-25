const { GoogleGenerativeAI } = require('@google/generative-ai')
const MenuItem = require('../models/MenuItem')

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'mock_key')

// @desc    Get AI operational insights
// @route   POST /api/ai/insights
exports.getInsights = async (req, res) => {
  try {
    // 1. Fetch all menu items and their current inventory
    const menuItems = await MenuItem.find({})

    if (menuItems.length === 0) {
      return res
        .status(200)
        .json({ insights: 'No menu items found to analyze.' })
    }

    // Format data for the AI
    const dataContext = menuItems.map((item) => ({
      name: item.name,
      price: item.price,
      inventoryLeft: item.dailyInventory,
      isAvailable: item.isAvailable,
    }))

    let text = ''

    try {
      // Try to use real Gemini AI
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' })
      const prompt = `
        You are an AI restaurant operations assistant. 
        Here is the current menu data: ${JSON.stringify(dataContext)}.
        
        Task: Analyze this data. Identify items that are low on inventory and might sell out soon. Suggest which items the manager should promote to balance inventory, and which items need restocking urgently. Keep the response concise, friendly, and formatted in markdown.
      `
      const result = await model.generateContent(prompt)
      const response = await result.response
      text = response.text()
    } catch (aiError) {
      console.log(
        '⚠️ Gemini API failed, using smart fallback:',
        aiError.message,
      )
      // Fallback logic if API fails
      const lowStock = menuItems.filter((item) => item.dailyInventory < 5)

      text = `### 🤖 AI Operational Insights (Smart Fallback)\n\n`
      text += `I analyzed your current menu data. Here is what I found:\n\n`

      if (lowStock.length > 0) {
        text += `**⚠️ Low Inventory Alerts:**\n`
        lowStock.forEach((item) => {
          text += `- **${item.name}** is running low with only ${item.dailyInventory} left. Consider restocking soon or marking it as sold out to prevent customer disappointment.\n`
        })
      } else {
        text += `✅ All inventory levels look healthy right now!\n`
      }

      const topPrice = Math.max(...menuItems.map((i) => i.price))
      const topItem = menuItems.find((i) => i.price === topPrice)
      text += `\n**💡 Profit Maximization Tip:**\nYour highest priced item is **${topItem.name}** at $${topItem.price}. Consider having waitstaff highlight this item to new tables to boost revenue.\n`
    }

    res.status(200).json({ insights: text })
  } catch (error) {
    console.error('Server Error:', error.message)
    res.status(500).json({ message: 'Failed to generate AI insights' })
  }
}
