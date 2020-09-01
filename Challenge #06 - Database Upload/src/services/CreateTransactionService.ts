import { getRepository, getCustomRepository } from 'typeorm';
import TransactionsRepository from '../repositories/TransactionsRepository';
import AppError from '../errors/AppError';

import Category from '../models/Category';
import Transaction from '../models/Transaction';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    if (type !== 'income' && type !== 'outcome') {
      throw new AppError(
        `Expected 'income' or 'outcome' and received ${type}`,
        401,
      );
    }

    const categoryRepo = getRepository(Category);

    let categoryExists = await categoryRepo.findOne({
      where: { title: category },
    });

    if (!categoryExists) {
      categoryExists = categoryRepo.create({ title: category });

      await categoryRepo.save(categoryExists);
    }

    const transactionRepo = getCustomRepository(TransactionsRepository);

    const { total } = await transactionRepo.getBalance();

    if (type === 'outcome' && value > total) {
      throw new AppError(
        "Can't do a outcome transaction without a valid balance",
        400,
      );
    }

    const transaction = transactionRepo.create({
      title,
      value,
      type,
      category: categoryExists,
    });

    await transactionRepo.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
