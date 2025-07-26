import * as accountModel from '@/db/models/accounts'
import * as portfolioModel from '@/db/models/portfolio'
import * as transactionModel from '@/db/models/transactions'

/**
 * Sells a specified quantity of a stock from the user's portfolio.
 *
 * - Checks for valid input.
 * - Verifies the user owns enough shares.
 * - Updates or removes the holding.
 * - Increases user's cash balance.
 * - Logs the transaction.
 */
export async function sellStock(
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
  } | null
}> {
  // Validate inputs
  if (!symbol || quantity <= 0 || pricePerUnit <= 0) {
    throw new Error('Invalid sell input')
  }

  // Fetch current holding
  const holding = await portfolioModel.getHolding(userId, symbol)
  if (!holding) {
    throw new Error('Stock not found in portfolio')
  }

  // Ensure user owns enough shares
  if (holding.quantity < quantity) {
    throw new Error('Not enough shares to sell')
  }

  // Calculate sale proceeds and new quantity
  const proceeds = quantity * pricePerUnit
  const updatedQuantity = holding.quantity - quantity

  if (updatedQuantity === 0) {
    // If no shares remain, remove the holding
    await portfolioModel.deleteHolding(userId, symbol)
  } else {
    // Update holding with reduced quantity (average price remains)
    await portfolioModel.updateHoldingQuantityAndPrice(
      userId,
      symbol,
      updatedQuantity,
      holding.average_price
    )
  }

  // Fetch the user's account
  const account = await accountModel.getAccountByUserId(userId)
  if (!account) {
    throw new Error('Account not found')
  }

  // Increase the cash balance with the proceeds
  const newCashBalance = account.cash_balance + proceeds
  await accountModel.updateCashBalance(userId, newCashBalance)

  // Record the sell transaction
  await transactionModel.insertTransaction({
    user_id: userId,
    type: 'sell',
    symbol,
    quantity,
    price: pricePerUnit,
    created_at: new Date(),
  })

  // Return updated account balance and updated (or nullified) portfolio entry
  return {
    cash_balance: newCashBalance,
    portfolio: updatedQuantity === 0
      ? null
      : {
          symbol,
          quantity: updatedQuantity,
          average_price: holding.average_price,
        },
  }
}
