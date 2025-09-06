import { ApiProperty } from '@nestjs/swagger';

export class UserRoleResponseDto {
  @ApiProperty({
    description: 'Role ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'User role',
    enum: ['ADMIN', 'MANAGER', 'STAFF'],
    example: 'STAFF',
  })
  role: 'ADMIN' | 'MANAGER' | 'STAFF';

  @ApiProperty({
    description: 'User permissions',
    type: [String],
    example: ['READ_PRODUCTS', 'CREATE_SALES'],
  })
  permissions: string[];

  @ApiProperty({
    description: 'Role active status',
    example: true,
  })
  is_active: boolean;

  @ApiProperty({
    description: 'User who assigned this role',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  assigned_by: string;

  @ApiProperty({
    description: 'Role creation timestamp',
    example: '2023-12-01T10:00:00.000Z',
  })
  created_at: string;

  @ApiProperty({
    description: 'Role last update timestamp',
    example: '2023-12-01T10:00:00.000Z',
    nullable: true,
  })
  updated_at: string | null;
}

export class UserResponseDto {
  @ApiProperty({
    description: 'User ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Email verification status',
    example: true,
  })
  isEmailVerified: boolean;

  @ApiProperty({
    description: 'User creation timestamp',
    example: '2023-12-01T10:00:00.000Z',
  })
  createdAt: string;

  @ApiProperty({
    description: 'User last update timestamp',
    example: '2023-12-01T10:00:00.000Z',
  })
  updatedAt: string;

  @ApiProperty({
    description: 'User role information',
    type: UserRoleResponseDto,
    nullable: true,
  })
  role: UserRoleResponseDto | null;
}

export class UserListResponseDto {
  @ApiProperty({
    description: 'List of users',
    type: [UserResponseDto],
  })
  users: UserResponseDto[];

  @ApiProperty({
    description: 'Total number of users',
    example: 25,
  })
  total: number;

  @ApiProperty({
    description: 'Current page number',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Number of users per page',
    example: 10,
  })
  limit: number;

  @ApiProperty({
    description: 'Total number of pages',
    example: 3,
  })
  totalPages: number;
}