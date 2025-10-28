import { ApiProperty } from '@nestjs/swagger';

export class AuthResponseDto {
  @ApiProperty({
    description: 'JWT access token for API authentication',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'User information',
    example: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'user@example.com',
      displayName: 'John Doe',
      photoUrl: 'https://example.com/photo.jpg',
    },
  })
  user: {
    id: string;
    email: string;
    displayName: string | null;
    photoUrl: string | null;
    firebaseUid: string;
  };
}
