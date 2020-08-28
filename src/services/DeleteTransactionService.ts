// import AppError from '../errors/AppError';

import { getRepository } from 'typeorm';
import Transaction from '../models/Transaction';
import AppError from '../errors/AppError';

interface Request {
  id: string;
}

class DeleteTransactionService {
  public async execute({ id }: Request): Promise<void> {
    const transactionRepository = getRepository(Transaction);

    const transactionFind = await transactionRepository.findOne({ id });

    if (transactionFind) {
      await transactionRepository.remove(transactionFind);
    } else {
      throw new AppError('Transação não encontrada');
    }
  }
}

export default DeleteTransactionService;
