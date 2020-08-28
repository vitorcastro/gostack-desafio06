// import AppError from '../errors/AppError';

import { getRepository, getCustomRepository } from 'typeorm';
import Transaction from '../models/Transaction';
import Category from '../models/Category';
import TransactionsRepository from '../repositories/TransactionsRepository';
import AppError from '../errors/AppError';

interface Request {
  title: string;
  value: number;
  category: string;
  type: 'income' | 'outcome';
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    category,
    type,
  }: Request): Promise<Transaction> {
    const categoryRepository = getRepository(Category);
    const transactionRepository = getCustomRepository(TransactionsRepository);

    const balance = await transactionRepository.getBalance();

    if (type === 'outcome' && value > balance.total)
      throw new AppError(
        'Transação não possível pois o saldo não pode ser negativo',
      );

    const findCategory = await categoryRepository.findOne({ title: category });

    let categoryObject = new Category();

    if (!findCategory) {
      const categoryNew = categoryRepository.create({
        title: category,
      });

      categoryObject = await categoryRepository.save(categoryNew);
    } else {
      categoryObject = findCategory;
    }

    const transaction = transactionRepository.create({
      title,
      value,
      type,
      category: categoryObject,
    });

    const transactionPersist = await transactionRepository.save(transaction);

    return transactionPersist;
  }
}

export default CreateTransactionService;
