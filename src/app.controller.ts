import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({
    status: 200,
    description: 'API is healthy and running',
  })
  getHealth() {
    return this.appService.getHealth();
  }

  @Get()
  @ApiOperation({ summary: 'Welcome message' })
  getHello(): string {
    return this.appService.getHello();
  }
}
