import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsEnum, IsArray, IsString, IsBoolean } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Email verification status',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isEmailVerified?: boolean;

  @ApiProperty({
    description: 'User role',
    enum: ['ADMIN', 'MANAGER', 'STAFF'],
    example: 'STAFF',
  })
  @IsEnum(['ADMIN', 'MANAGER', 'STAFF'])
  role: 'ADMIN' | 'MANAGER' | 'STAFF';

  @ApiProperty({
    description: 'User permissions',
    type: [String],
    example: ['READ_PRODUCTS', 'CREATE_SALES'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[];
}