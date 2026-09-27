import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import { ContactsService } from './contacts.service.js';
import { CreateContactDto } from './dto/create-contact.dto.js';
import { UpdateContactDto } from './dto/update-contact.dto.js';

@Controller()
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Post('clients/:clientId/contacts')
  create(
    @Param('clientId') clientId: string,
    @Body() createContactDto: CreateContactDto,
  ) {
    return this.contactsService.create(clientId, createContactDto);
  }

  @Get('clients/:clientId/contacts')
  findByClient(@Param('clientId') clientId: string) {
    return this.contactsService.findByClient(clientId);
  }

 @Patch('contacts/:id')
update(
  @Param('id') id: string,
  @Body() updateContactDto: UpdateContactDto,
) {
  return this.contactsService.update(id, updateContactDto);
}

  @Delete('contacts/:id')
  remove(@Param('id') id: string) {
    return this.contactsService.remove(id);
  }
}