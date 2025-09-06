import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryUsersDto {
  @ApiProperty({
    description: 'Page number for pagination',
    example: 1,
    minimum: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: 'Number of users per page',
    example: 10,
    minimum: 1,
    maximum: 100,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiProperty({
    description: 'Filter by user role',
    enum: ['ADMIN', 'MANAGER', 'STAFF'],
    example: 'STAFF',
    required: false,
  })
  @IsOptional()
  @IsEnum(['ADMIN', 'MANAGER', 'STAFF'])
  role?: 'ADMIN' | 'MANAGER' | 'STAFF';

  @ApiProperty({
    description: 'Search by email (partial match)',
    example: 'john',
    required: false,
  })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({
    description: 'Filter by email verification status',
    example: true,
    required: false,
  })
  @IsOptional()
  @Type(() => Boolean)
  isEmailVerified?: boolean;

  @ApiProperty({
    description: 'Sort field',
    enum: ['email', 'createdAt', 'role'],
    example: 'createdAt',
    required: false,
  })
  @IsOptional()
  @IsEnum(['email', 'createdAt', 'role'])
  sortBy?: 'email' | 'createdAt' | 'role' = 'createdAt';

  @ApiProperty({
    description: 'Sort order',
    enum: ['asc', 'desc'],
    example: 'desc',
    required: false,
  })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}