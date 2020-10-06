import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';

interface IProduct {
  id: string;
  quantity: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

@injectable()
class CreateOrderService {
  constructor(
    @inject('OrdersRepository')
    private ordersRepository: IOrdersRepository,

    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,

    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ customer_id, products }: IRequest): Promise<Order> {
    const customer = await this.customersRepository.findById(customer_id);

    if (!customer) {
      throw new AppError('Customer does not exist');
    }

    const productsIds = products.map(product => ({ id: product.id }));

    const productsItems = await this.productsRepository.findAllById(
      productsIds,
    );

    if (productsItems.length < products.length) {
      throw new AppError('Invalid product id');
    }

    const productsNewQuantity: IProduct[] = [];
    const productsList = productsItems.map(productItem => {
      const product = products.find(
        productFind => productFind.id === productItem.id,
      );

      if (!product) {
        throw new AppError('Product not found');
      }

      if (product.quantity > productItem.quantity) {
        throw new AppError('Product quantity is over than stock');
      }

      productsNewQuantity.push({
        id: productItem.id,
        quantity: productItem.quantity - product.quantity,
      });

      return {
        product_id: productItem.id,
        price: productItem.price,
        quantity: product.quantity,
      };
    });

    const order = await this.ordersRepository.create({
      customer,
      products: productsList,
    });

    await this.productsRepository.updateQuantity(productsNewQuantity);

    return order;
  }
}

export default CreateOrderService;
