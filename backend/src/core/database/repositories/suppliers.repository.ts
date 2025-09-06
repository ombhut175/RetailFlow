import { Injectable } from '@nestjs/common';
import { BaseRepository } from './base.repository';
import { suppliers } from '../schema/suppliers';
import { eq, and, isNull, ilike, desc, or, not } from 'drizzle-orm';
import { DrizzleService } from '../drizzle.service';
import { MESSAGES } from '../../../common/constants/string-const';

export interface CreateSupplierDto {
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  is_active?: boolean;
  created_by: string; // UUID of the user creating the supplier
}

export interface UpdateSupplierDto {
  name?: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  is_active?: boolean;
  updated_by: string; // UUID of the user updating the supplier
}

export interface SupplierEntity {
  id: string; // UUID
  name: string;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  is_active: boolean;
  created_by: string;
  created_at: Date;
  updated_by: string | null;
  updated_at: Date | null;
  deleted_by: string | null;
  deleted_at: Date | null;
}

export interface SupplierFilters {
  name?: string;
  email?: string;
  phone?: string;
  is_active?: boolean;
  withDeleted?: boolean;
}

@Injectable()
export class SuppliersRepository extends BaseRepository<SupplierEntity> {
  constructor(drizzleService: DrizzleService) {
    super(drizzleService);
  }

  //#region ==================== CRUD OPERATIONS ====================

  async create(supplierData: CreateSupplierDto): Promise<SupplierEntity> {
    this.logger.log(`Creating supplier: ${supplierData.name}`);
    
    try {
      const result = await this.db
        .insert(suppliers)
        .values({
          name: supplierData.name,
          contact_person: supplierData.contact_person || null,
          email: supplierData.email || null,
          phone: supplierData.phone || null,
          address: supplierData.address || null,
          is_active: supplierData.is_active ?? true,
          created_by: supplierData.created_by,
          created_at: new Date(),
        })
        .returning();

      this.logger.log(`Supplier created successfully: ${supplierData.name} (ID: ${result[0].id})`);
      return result[0] as SupplierEntity;
    } catch (error) {
      this.logger.error(`Failed to create supplier: ${supplierData.name}`, error.stack);
      throw error;
    }
  }

  async findById(id: string, withDeleted = false): Promise<SupplierEntity | null> {
    this.logger.log(`Finding supplier by ID: ${id}`);
    
    const condition = withDeleted 
      ? eq(suppliers.id, id)
      : and(eq(suppliers.id, id), isNull(suppliers.deleted_at));
    
    const result = await this.findOne(suppliers, condition);
    if (result) {
      this.logger.log(`Supplier found: ${result.name} (ID: ${id})`);
    } else {
      this.logger.log(`Supplier not found with ID: ${id}`);
    }
    return result;
  }

  async findSupplierByIdOrThrow(id: string, withDeleted = false): Promise<SupplierEntity> {
    const condition = withDeleted 
      ? eq(suppliers.id, id)
      : and(eq(suppliers.id, id), isNull(suppliers.deleted_at));
    
    return super.findOneOrThrow(suppliers, condition, MESSAGES.SUPPLIER_NOT_FOUND);
  }

  async findByName(name: string, withDeleted = false): Promise<SupplierEntity | null> {
    this.logger.log(`Finding supplier by name: ${name}`);
    
    const condition = withDeleted 
      ? eq(suppliers.name, name)
      : and(eq(suppliers.name, name), isNull(suppliers.deleted_at));
    
    const result = await this.findOne(suppliers, condition);
    if (result) {
      this.logger.log(`Supplier found: ${result.name}`);
    } else {
      this.logger.log(`Supplier not found with name: ${name}`);
    }
    return result;
  }

  async findByEmail(email: string, withDeleted = false): Promise<SupplierEntity | null> {
    this.logger.log(`Finding supplier by email: ${email}`);
    
    const condition = withDeleted 
      ? eq(suppliers.email, email)
      : and(eq(suppliers.email, email), isNull(suppliers.deleted_at));
    
    const result = await this.findOne(suppliers, condition);
    if (result) {
      this.logger.log(`Supplier found: ${result.name} with email: ${email}`);
    } else {
      this.logger.log(`Supplier not found with email: ${email}`);
    }
    return result;
  }

  async update(id: string, updateData: UpdateSupplierDto): Promise<SupplierEntity> {
    this.logger.log(`Updating supplier: ${id}`);
    
    // First verify supplier exists
    await this.findSupplierByIdOrThrow(id);
    
    try {
      const result = await this.db
        .update(suppliers)
        .set({
          ...updateData,
          updated_at: new Date(),
        })
        .where(and(eq(suppliers.id, id), isNull(suppliers.deleted_at)))
        .returning();

      if (!result.length) {
        this.logger.error(`No supplier updated with ID: ${id}`);
        throw new Error(MESSAGES.SUPPLIER_NOT_FOUND);
      }

      this.logger.log(`Supplier updated successfully: ${id}`);
      return result[0] as SupplierEntity;
    } catch (error) {
      this.logger.error(`Failed to update supplier: ${id}`, error.stack);
      throw error;
    }
  }

  async delete(id: string, deletedBy: string): Promise<boolean> {
    this.logger.log(`Soft deleting supplier: ${id}`);
    
    // First verify supplier exists
    await this.findSupplierByIdOrThrow(id);
    
    try {
      const result = await this.db
        .update(suppliers)
        .set({
          deleted_by: deletedBy,
          deleted_at: new Date(),
          updated_by: deletedBy,
          updated_at: new Date(),
        })
        .where(and(eq(suppliers.id, id), isNull(suppliers.deleted_at)))
        .returning();

      const success = result.length > 0;
      if (success) {
        this.logger.log(`Supplier soft deleted successfully: ${id}`);
      } else {
        this.logger.error(`Failed to soft delete supplier: ${id}`);
      }
      return success;
    } catch (error) {
      this.logger.error(`Failed to soft delete supplier: ${id}`, error.stack);
      throw error;
    }
  }

  async restore(id: string, updatedBy: string): Promise<boolean> {
    this.logger.log(`Restoring supplier: ${id}`);
    
    try {
      const result = await this.db
        .update(suppliers)
        .set({
          deleted_by: null,
          deleted_at: null,
          updated_by: updatedBy,
          updated_at: new Date(),
        })
        .where(eq(suppliers.id, id))
        .returning();

      const success = result.length > 0;
      if (success) {
        this.logger.log(`Supplier restored successfully: ${id}`);
      } else {
        this.logger.error(`Failed to restore supplier: ${id}`);
      }
      return success;
    } catch (error) {
      this.logger.error(`Failed to restore supplier: ${id}`, error.stack);
      throw error;
    }
  }

  //#region ==================== QUERY OPERATIONS ====================

  async findAll(filters: SupplierFilters = {}, page = 1, limit = 10): Promise<{
    data: SupplierEntity[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    this.logger.log(`Finding all suppliers with filters:`, filters);
    
    // Build where conditions
    const conditions: any[] = [];
    
    if (!filters.withDeleted) {
      conditions.push(isNull(suppliers.deleted_at));
    }
    
    if (filters.name) {
      conditions.push(ilike(suppliers.name, `%${filters.name}%`));
    }
    
    if (filters.email) {
      conditions.push(ilike(suppliers.email, `%${filters.email}%`));
    }
    
    if (filters.phone) {
      conditions.push(ilike(suppliers.phone, `%${filters.phone}%`));
    }
    
    if (typeof filters.is_active === 'boolean') {
      conditions.push(eq(suppliers.is_active, filters.is_active));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const total = await this.count(suppliers, whereClause);
    
    // Get paginated results
    const offset = (page - 1) * limit;
    const data = await this.db
      .select()
      .from(suppliers)
      .where(whereClause)
      .orderBy(desc(suppliers.created_at))
      .limit(limit)
      .offset(offset);

    const totalPages = Math.ceil(total / limit);

    this.logger.log(`Found ${data.length} suppliers out of ${total} total`);
    
    return {
      data: data as SupplierEntity[],
      total,
      page,
      totalPages,
    };
  }

  async findActiveSuppliers(): Promise<SupplierEntity[]> {
    this.logger.log('Finding all active suppliers');
    
    const result = await this.db
      .select()
      .from(suppliers)
      .where(and(
        eq(suppliers.is_active, true),
        isNull(suppliers.deleted_at)
      ))
      .orderBy(suppliers.name);

    this.logger.log(`Found ${result.length} active suppliers`);
    return result as SupplierEntity[];
  }

  async searchSuppliers(searchTerm: string, limit = 10): Promise<SupplierEntity[]> {
    this.logger.log(`Searching suppliers with term: ${searchTerm}`);
    
    const result = await this.db
      .select()
      .from(suppliers)
      .where(and(
        or(
          ilike(suppliers.name, `%${searchTerm}%`),
          ilike(suppliers.contact_person, `%${searchTerm}%`),
          ilike(suppliers.email, `%${searchTerm}%`),
          ilike(suppliers.phone, `%${searchTerm}%`)
        ),
        isNull(suppliers.deleted_at)
      ))
      .orderBy(suppliers.name)
      .limit(limit);

    this.logger.log(`Found ${result.length} suppliers matching: ${searchTerm}`);
    return result as SupplierEntity[];
  }

  async getSupplierStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    deleted: number;
  }> {
    this.logger.log('Getting supplier statistics');
    
    const total = await this.count(suppliers);
    const active = await this.count(suppliers, and(eq(suppliers.is_active, true), isNull(suppliers.deleted_at)));
    const inactive = await this.count(suppliers, and(eq(suppliers.is_active, false), isNull(suppliers.deleted_at)));
    const deleted = await this.count(suppliers, not(isNull(suppliers.deleted_at)));

    const stats = {
      total,
      active,
      inactive,
      deleted,
    };

    this.logger.log('Supplier statistics:', stats);
    return stats;
  }
}