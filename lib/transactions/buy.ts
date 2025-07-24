import * as accountModel from '@/db/models/accounts'
import * as portfolioModel from '@/db/models/portfolio'
import * as transactionModel from '@/db/models/transactions'

/**
 * Executes a stock purchase for a user.
 * 
 * Validates input, checks cash balance, updates holdings and cash,
 * then records the transaction.
 * 
 * @param userId - The ID of the user buying the stock
 * @param symbol - The stock symbol
 * @param quantity - Number of shares to buy
 * @param pricePerUnit - Price per share
 * @returns Updated cash balance and portfolio entry
 */
export async function buyStock(
  userId: number,
  symbol: string,
  quantity: number,
  pricePerUnit: number
): Promise<{
  cash_balance: number
  portfolio: {
    symbol: string
    quantity: number
    average_price: number
  }
}> {
  // Validate input
  if (!symbol || quantity <= 0 || pricePerUnit <= 0) {
    throw new Error('Invalid purchase input')
  }

  const totalCost = quantity * pricePerUnit

  // Retrieve the user's account
  const account = await accountModel.getAccountByUserId(userId)
  if (!account) {
    throw new Error('Account not found')
  }

  // Check if the user has enough funds
  if (account.cash_balance < totalCost) {
    throw new Error('Insufficient funds')
  }

  // Check if the user already owns this stock
  const existingHolding = await portfolioModel.getHolding(userId, symbol)

  let updatedQuantity: number
  let updatedAvgPrice: number

  if (!existingHolding) {
    // First-time purchase: insert new holding
    updatedQuantity = quantity
    updatedAvgPrice = pricePerUnit

    await portfolioModel.insertHolding(userId, symbol, quantity, pricePerUnit)
  } else {
    // Update existing holding with new average price
    updatedQuantity = existingHolding.quantity + quantity
    const totalValue =
      existingHolding.quantity * existingHolding.average_price +
      quantity * pricePerUnit
    updatedAvgPrice = totalValue / updatedQuantity

    await portfolioModel.updateHoldingQuantityAndPrice(
      userId,
      symbol,
      updatedQuantity,
      updatedAvgPrice
    )
  }

  // Deduct total cost from user's cash balance
  const newCashBalance = account.cash_balance - totalCost
  await accountModel.updateCashBalance(userId, newCashBalance)

  // Record the transaction
  await transactionModel.insertTransaction({
    user_id: userId,
    type: 'buy',
    symbol,
    quantity,
    price: pricePerUnit,
    created_at: new Date(),
  })

  // Return updated account and portfolio info
  return {
    cash_balance: newCashBalance,
    portfolio: {
      symbol,
      quantity: updatedQuantity,
      average_price: updatedAvgPrice,
    },
  }
}
