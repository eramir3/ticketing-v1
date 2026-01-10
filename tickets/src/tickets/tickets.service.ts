import { Injectable } from '@nestjs/common';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Ticket, type TicketModel } from './entities/ticket.entity';
import { TicketCreatedProducer } from '../events/producers/ticket-created-producer';
import { Request, Response } from 'express';
import { BadRequestError, NotAuthorizedError, NotFoundError } from '@er3tickets/common';
import { TicketUpdatedProducer } from '../events/producers/ticket-updated-producer';

@Injectable()
export class TicketsService {
  constructor(
    @InjectModel(Ticket.name)
    private readonly ticketModel: TicketModel,
    private readonly ticketCreatedProducer: TicketCreatedProducer,
    private readonly ticketUpdatedProducer: TicketUpdatedProducer,
  ) { }

  async create(createTicketDto: CreateTicketDto, req: Request, res: Response) {
    const ticket = this.ticketModel.build({
      title: createTicketDto.title,
      price: createTicketDto.price,
      userId: req.currentUser!.id
    });

    await ticket.save()

    await this.ticketCreatedProducer.send([{
      key: ticket.id,
      value: {
        id: ticket.id,
        version: ticket.version,
        title: ticket.title,
        price: ticket.price,
        userId: ticket.userId
      }
    }])

    res.send(ticket)
  }

  async findAll(res: Response) {
    const tickets = await this.ticketModel.find({}).lean().exec()

    res.send(tickets)
  }

  async findOne(id: string, res: Response) {
    const ticket = await this.ticketModel.findById(id).lean().exec()

    if (!ticket) {
      throw new NotFoundError();
    }

    res.send(ticket)
  }

  async update(id: string, updateTicketDto: UpdateTicketDto, req: Request, res: Response) {
    const ticket = await this.ticketModel.findById(id).exec();
    if (!ticket) {
      throw new NotFoundError();
    }

    if (ticket.orderId) {
      throw new BadRequestError('Cannot edit a reserved ticket')
    }

    if (ticket.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    ticket.set({
      title: updateTicketDto.title,
      price: updateTicketDto.price,
    });
    await ticket.save();

    await this.ticketUpdatedProducer.send([{
      key: ticket.id,
      value: {
        id: ticket.id,
        version: ticket.version,
        title: ticket.title,
        price: ticket.price,
        userId: ticket.userId
      }
    }])

    res.send(ticket);
  }

  async assignOrder(ticketId: string, orderId: string) {
    // Find the ticket that the order is reserving
    const ticket = await this.ticketModel.findById(ticketId);

    // If no ticket, throw error
    if (!ticket) {
      throw new Error('Ticket not found');
    }

    // Mark the ticket as being reserved by setting its orderId property
    ticket.set({ orderId })

    // Save the ticket
    await ticket.save()

    await this.ticketUpdatedProducer.send([{
      key: ticket.id,
      value: {
        id: ticket.id,
        version: ticket.version,
        title: ticket.title,
        price: ticket.price,
        userId: ticket.userId,
        orderId: ticket.orderId,
      }
    }])
  }

  async cancel(ticketId: string) {
    // Find the ticket that the order is reserving
    const ticket = await this.ticketModel.findById(ticketId);

    if (!ticket) {
      throw new Error('Ticket not found');
    }

    ticket.set({ orderId: undefined });
    await ticket.save();

    await this.ticketUpdatedProducer.send([{
      key: ticket.id,
      value: {
        id: ticket.id,
        version: ticket.version,
        title: ticket.title,
        price: ticket.price,
        userId: ticket.userId,
        orderId: ticket.orderId,
      }
    }])
  }
}
