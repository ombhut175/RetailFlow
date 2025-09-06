import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsEnum, IsArray, IsString, IsBoolean } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    description: 'Email verification status',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isEmailVerified?: boolean;

  @ApiProperty({
    description: 'User role',
    enum: ['ADMIN', 'MANAGER', 'STAFF'],
    example: 'MANAGER',
    required: false,
  })
  @IsOptional()
  @IsEnum(['ADMIN', 'MANAGER', 'STAFF'])
  role?: 'ADMIN' | 'MANAGER' | 'STAFF';

  @ApiProperty({
    description: 'User permissions',
    type: [String],
    example: ['READ_PRODUCTS', 'CREATE_SALES', 'MANAGE_INVENTORY'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[];

  @ApiProperty({
    description: 'Role active status',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isRoleActive?: boolean;
}