import csvParse from 'csv-parse';
import fs from 'fs';

import { getRepository, In, getCustomRepository } from 'typeorm';
import Transaction from '../models/Transaction';
import Category from '../models/Category';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  filepath: string;
}

interface CSVTransaction {
  title: string;
  type: 'income' | 'outcome';
  category: string;
  value: number;
}

class ImportTransactionsService {
  async execute({ filepath }: Request): Promise<Transaction[]> {
    const file = fs.createReadStream(filepath);

    const parse = csvParse({
      from_line: 2,
    });

    const parseCSV = file.pipe(parse);

    const transactions: CSVTransaction[] = [];
    const categories: string[] = [];

    parseCSV.on('data', async line => {
      const [title, type, value, category] = line.map((cell: string) =>
        cell.trim(),
      );

      if (!title || !type || !value || !category) return;

      categories.push(category);
      transactions.push({ title, type, value, category });
    });

    await new Promise(resolve => parseCSV.on('end', resolve));

    const categoriesRepo = getRepository(Category);

    const existentCategories = await categoriesRepo.find({
      where: {
        title: In(categories),
      },
    });

    const categoriesTitle = existentCategories.map(category => category.title);

    const addCategories = categories
      .filter(category => !categoriesTitle.includes(category))
      .filter((value, index, category) => category.indexOf(value) === index);

    const newCategories = categoriesRepo.create(
      addCategories.map(title => ({ title })),
    );

    await categoriesRepo.save(newCategories);

    const allCategories = [...newCategories, ...existentCategories];

    const transactionsRepo = getCustomRepository(TransactionsRepository);

    const createdTransactions = transactionsRepo.create(
      transactions.map(transaction => ({
        title: transaction.title,
        value: transaction.value,
        type: transaction.type,
        category: allCategories.find(
          category => category.title === transaction.category,
        ),
      })),
    );

    await transactionsRepo.save(createdTransactions);

    await fs.promises.unlink(filepath);

    return createdTransactions;
  }
}

export default ImportTransactionsService;
