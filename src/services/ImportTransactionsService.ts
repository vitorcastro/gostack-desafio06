/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
import csvParse from 'csv-parse';
import fs from 'fs';
import path from 'path';
import Transaction from '../models/Transaction';
import uploadConfig from '../config/upload';
import CreateTransactionService from './CreateTransactionService';

interface Request {
  fileName: string;
}

interface TransactionImportCSV {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class ImportTransactionsService {
  private async loadFile({
    fileName,
  }: Request): Promise<TransactionImportCSV[]> {
    const csvImportPath = path.resolve(uploadConfig.directory, fileName);

    const readCSVStream = fs.createReadStream(csvImportPath);

    const parseStream = csvParse({
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });

    const parseCSV = readCSVStream.pipe(parseStream);

    const lines: TransactionImportCSV[] = [];

    parseCSV.on('data', line => {
      lines.push({
        title: line[0],
        type: line[1],
        value: line[2],
        category: line[3],
      });
    });

    await new Promise(resolve => {
      parseCSV.on('end', resolve);
    });

    return lines;
  }

  async execute({ fileName }: Request): Promise<Transaction[]> {
    const lines = await this.loadFile({ fileName });

    const createTransactionService = new CreateTransactionService();

    const transactionsImport: Transaction[] | PromiseLike<Transaction[]> = [];

    // eslint-disable-next-line guard-for-in
    for (const index in lines) {
      const transaction = lines[Number(index)];
      const transactionCreated = await createTransactionService.execute({
        title: transaction.title,
        type: transaction.type,
        value: transaction.value,
        category: transaction.category,
      });
      transactionsImport.push(transactionCreated);
    }

    // const transactionSaved = lines.map(async (line, index) => {
    //   transactionsImport.push(
    //     await createTransactionService.execute({
    //       title: line.title,
    //       type: line.type,
    //       value: line.value,
    //       category: line.category,
    //     }),
    //   );
    // });
    // await Promise.all(transactionSaved);

    return transactionsImport;
  }
}

export default ImportTransactionsService;
