import { getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  id: string;
}

class DeleteTransactionService {
  public async execute({ id }: Request): Promise<void> {
    const transactionRepo = getCustomRepository(TransactionsRepository);
    const transactionExists = await transactionRepo.findOne(id);

    if (!transactionExists) {
      throw new AppError('Transaction does note exists', 400);
    }

    await transactionRepo.delete(id);
  }
}

export default DeleteTransactionService;
