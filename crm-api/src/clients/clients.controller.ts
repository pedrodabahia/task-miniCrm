import { Body, Controller, Post, Get, Param , Patch, Delete, Query} from '@nestjs/common';
import { ClientsService } from './clients.service.js';
import { CreateClientDto } from './dto/create-client.dto.js';
import { ClientFilterDto } from './dto/client-filter.dto.js';
import { UpdateClientDto } from './dto/update-client.dto.js';

@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  create(@Body() createClientDto: CreateClientDto) {
    return this.clientsService.create(createClientDto);
  }

 @Get()
findAll(@Query() filters: ClientFilterDto) {
  return this.clientsService.findAll(filters);
}

  @Get(':id')
findOne(@Param('id') id: string) {
  return this.clientsService.findOne(id);
}

  @Patch(':id')
update(
  @Param('id') id: string,
  @Body() updateClientDto: UpdateClientDto,
) {
  return this.clientsService.update(id, updateClientDto);
}

@Delete(':id')
remove(@Param('id') id: string) {
  return this.clientsService.remove(id);
}
}

