import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'Firebase ID token from the Flutter app',
    example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjFmOD...',
  })
  @IsNotEmpty()
  @IsString()
  firebaseToken: string;
}
