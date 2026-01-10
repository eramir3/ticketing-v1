import { Resolver, Query, Mutation, Args, Int, Context } from '@nestjs/graphql';
import { OrdersService } from './orders.service';
import { Order } from './entities/order.entity';
import { CreateOrderInput } from './dto/create-order.input';
import { UpdateOrderInput } from './dto/update-order.input';
import { Request } from 'express';

@Resolver(() => Order)
export class OrdersResolver {
  constructor(private readonly ordersService: OrdersService) { }

  @Mutation(() => Order)
  createOrder(@Args('createOrderInput') createOrderInput: CreateOrderInput, @Context() { req }: { req: Request }) {
    return this.ordersService.create(createOrderInput, req);
  }

  @Query(() => [Order], { name: 'orders' })
  findAll(@Context() { req }: { req: Request }) {
    return this.ordersService.findAll(req);
  }

  @Query(() => Order, { name: 'order' })
  findOne(@Args('id', { type: () => String }) id: string, @Context() { req }: { req: Request }) {
    return this.ordersService.findOne(id, req);
  }

  @Mutation(() => Order)
  cancelOrder(@Args('id', { type: () => String }) id: string, @Context() { req }: { req: Request }) {
    return this.ordersService.cancel(id, req);
  }
}
