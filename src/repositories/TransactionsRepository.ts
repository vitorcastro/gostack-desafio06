import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const totalIncomes = await this.getTotalTransactionByType('income');
    const totalOutcomes = await this.getTotalTransactionByType('outcome');
    const total = totalIncomes - totalOutcomes;

    return { income: totalIncomes, outcome: totalOutcomes, total };
  }

  private async getTotalTransactionByType(
    type: 'income' | 'outcome',
  ): Promise<number> {
    const transactionsByType = await this.find({ type });

    if (transactionsByType.length > 0) {
      const reducer = (accumulator: number, value: number) => Number(accumulator) + Number(value);
      const value = transactionsByType.map(t => t.value).reduce(reducer);
      return Number(value);
    }
    return 0;
  }
}

export default TransactionsRepository;
