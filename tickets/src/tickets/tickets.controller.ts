import { Controller, Get, Post, Body, Param, Res, Req, All, HttpStatus, HttpCode, Put } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { NotFoundError } from '@er3tickets/common';
import { type Request, type Response } from 'express';

@Controller('/api/tickets/')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createTicketDto: CreateTicketDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return await this.ticketsService.create(createTicketDto, req, res);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(@Res({ passthrough: true }) res: Response) {
    return await this.ticketsService.findAll(res);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string, @Res({ passthrough: true }) res: Response) {
    return await this.ticketsService.findOne(id, res);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async update(@Param('id') id: string, @Body() updateTicketDto: UpdateTicketDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return await this.ticketsService.update(id, updateTicketDto, req, res);
  }

  @All('*')
  async handleNotFound() {
    throw new NotFoundError();
  }
}
