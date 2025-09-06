import { Injectable, Logger, ConflictException, NotFoundException } from '@nestjs/common';
import { SuppliersRepository, SupplierEntity } from '../../core/database/repositories/suppliers.repository';
import { CreateSupplierDto, UpdateSupplierDto, SupplierFiltersDto } from './dto';
import { MESSAGES, API_MESSAGES } from '../../common/constants/string-const';

@Injectable()
export class SuppliersService {
  private readonly logger = new Logger(SuppliersService.name);

  constructor(
    private readonly suppliersRepository: SuppliersRepository,
  ) {}

  //#region ==================== CRUD OPERATIONS ====================

  async createSupplier(createSupplierDto: CreateSupplierDto, userId: string): Promise<SupplierEntity> {
    this.logger.log(`Creating supplier: ${createSupplierDto.name} by user: ${userId}`);

    // Check if supplier name already exists
    const existingSupplier = await this.suppliersRepository.findByName(createSupplierDto.name);
    if (existingSupplier) {
      this.logger.warn(`Supplier name already exists: ${createSupplierDto.name}`);
      throw new ConflictException(MESSAGES.SUPPLIER_NAME_EXISTS);
    }

    // Check if email already exists (if provided)
    if (createSupplierDto.email) {
      const existingEmailSupplier = await this.suppliersRepository.findByEmail(createSupplierDto.email);
      if (existingEmailSupplier) {
        this.logger.warn(`Supplier email already exists: ${createSupplierDto.email}`);
        throw new ConflictException(MESSAGES.SUPPLIER_EMAIL_EXISTS);
      }
    }

    try {
      const supplier = await this.suppliersRepository.create({
        ...createSupplierDto,
        created_by: userId,
      });

      this.logger.log(`Supplier created successfully: ${supplier.name} (ID: ${supplier.id})`);
      return supplier;
    } catch (error) {
      this.logger.error(`Failed to create supplier: ${createSupplierDto.name}`, error.stack);
      throw error;
    }
  }

  async findAllSuppliers(
    filters: SupplierFiltersDto = {},
    page = 1,
    limit = 10,
  ): Promise<{
    data: SupplierEntity[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    this.logger.log(`Finding suppliers with filters:`, filters);

    try {
      const result = await this.suppliersRepository.findAll(filters, page, limit);
      
      this.logger.log(`Found ${result.data.length} suppliers out of ${result.total} total`);
      return result;
    } catch (error) {
      this.logger.error('Failed to find suppliers', error.stack);
      throw error;
    }
  }

  async findSupplierById(id: string): Promise<SupplierEntity> {
    this.logger.log(`Finding supplier by ID: ${id}`);

    const supplier = await this.suppliersRepository.findById(id);
    if (!supplier) {
      this.logger.warn(`Supplier not found with ID: ${id}`);
      throw new NotFoundException(MESSAGES.SUPPLIER_NOT_FOUND);
    }

    this.logger.log(`Supplier found: ${supplier.name} (ID: ${id})`);
    return supplier;
  }

  async updateSupplier(id: string, updateSupplierDto: UpdateSupplierDto, userId: string): Promise<SupplierEntity> {
    this.logger.log(`Updating supplier: ${id} by user: ${userId}`);

    // First verify the supplier exists
    const existingSupplier = await this.findSupplierById(id);

    // Check if new name conflicts with another supplier
    if (updateSupplierDto.name && updateSupplierDto.name !== existingSupplier.name) {
      const nameConflict = await this.suppliersRepository.findByName(updateSupplierDto.name);
      if (nameConflict && nameConflict.id !== id) {
        this.logger.warn(`Supplier name already exists: ${updateSupplierDto.name}`);
        throw new ConflictException(MESSAGES.SUPPLIER_NAME_EXISTS);
      }
    }

    // Check if new email conflicts with another supplier
    if (updateSupplierDto.email && updateSupplierDto.email !== existingSupplier.email) {
      const emailConflict = await this.suppliersRepository.findByEmail(updateSupplierDto.email);
      if (emailConflict && emailConflict.id !== id) {
        this.logger.warn(`Supplier email already exists: ${updateSupplierDto.email}`);
        throw new ConflictException(MESSAGES.SUPPLIER_EMAIL_EXISTS);
      }
    }

    try {
      const updatedSupplier = await this.suppliersRepository.update(id, {
        ...updateSupplierDto,
        updated_by: userId,
      });

      this.logger.log(`Supplier updated successfully: ${updatedSupplier.name} (ID: ${id})`);
      return updatedSupplier;
    } catch (error) {
      this.logger.error(`Failed to update supplier: ${id}`, error.stack);
      throw error;
    }
  }

  async deleteSupplier(id: string, userId: string): Promise<{ message: string }> {
    this.logger.log(`Soft deleting supplier: ${id} by user: ${userId}`);

    // First verify the supplier exists
    await this.findSupplierById(id);

    try {
      const success = await this.suppliersRepository.delete(id, userId);
      if (!success) {
        this.logger.error(`Failed to delete supplier: ${id}`);
        throw new Error('Failed to delete supplier');
      }

      this.logger.log(`Supplier soft deleted successfully: ${id}`);
      return { message: API_MESSAGES.SUPPLIER_DELETED };
    } catch (error) {
      this.logger.error(`Failed to delete supplier: ${id}`, error.stack);
      throw error;
    }
  }

  async restoreSupplier(id: string, userId: string): Promise<{ message: string }> {
    this.logger.log(`Restoring supplier: ${id} by user: ${userId}`);

    try {
      const success = await this.suppliersRepository.restore(id, userId);
      if (!success) {
        this.logger.error(`Failed to restore supplier: ${id}`);
        throw new NotFoundException(MESSAGES.SUPPLIER_NOT_FOUND);
      }

      this.logger.log(`Supplier restored successfully: ${id}`);
      return { message: 'Supplier restored successfully' };
    } catch (error) {
      this.logger.error(`Failed to restore supplier: ${id}`, error.stack);
      throw error;
    }
  }

  //#region ==================== UTILITY OPERATIONS ====================

  async findActiveSuppliers(): Promise<SupplierEntity[]> {
    this.logger.log('Finding all active suppliers');

    try {
      const suppliers = await this.suppliersRepository.findActiveSuppliers();
      this.logger.log(`Found ${suppliers.length} active suppliers`);
      return suppliers;
    } catch (error) {
      this.logger.error('Failed to find active suppliers', error.stack);
      throw error;
    }
  }

  async searchSuppliers(searchTerm: string, limit = 10): Promise<SupplierEntity[]> {
    this.logger.log(`Searching suppliers with term: ${searchTerm}`);

    if (!searchTerm || searchTerm.trim().length < 2) {
      this.logger.warn('Search term too short, returning empty result');
      return [];
    }

    try {
      const suppliers = await this.suppliersRepository.searchSuppliers(searchTerm.trim(), limit);
      this.logger.log(`Found ${suppliers.length} suppliers matching: ${searchTerm}`);
      return suppliers;
    } catch (error) {
      this.logger.error(`Failed to search suppliers with term: ${searchTerm}`, error.stack);
      throw error;
    }
  }

  async getSupplierStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    deleted: number;
  }> {
    this.logger.log('Getting supplier statistics');

    try {
      const stats = await this.suppliersRepository.getSupplierStats();
      this.logger.log('Supplier statistics retrieved successfully');
      return stats;
    } catch (error) {
      this.logger.error('Failed to get supplier statistics', error.stack);
      throw error;
    }
  }

  //#region ==================== VALIDATION HELPERS ====================

  async validateSupplierExists(supplierId: string): Promise<SupplierEntity> {
    this.logger.log(`Validating supplier exists: ${supplierId}`);
    return this.findSupplierById(supplierId);
  }

  async validateSupplierActive(supplierId: string): Promise<SupplierEntity> {
    this.logger.log(`Validating supplier is active: ${supplierId}`);
    
    const supplier = await this.findSupplierById(supplierId);
    if (!supplier.is_active) {
      this.logger.warn(`Supplier is inactive: ${supplierId}`);
      throw new ConflictException('Supplier is not active');
    }

    return supplier;
  }
}
