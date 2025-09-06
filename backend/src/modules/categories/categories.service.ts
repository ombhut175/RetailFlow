import { 
  Injectable, 
  Logger, 
  BadRequestException, 
  NotFoundException, 
  ConflictException 
} from '@nestjs/common';
import { CategoriesRepository } from '../../core/database/repositories/categories.repository';
import { MESSAGES, API_MESSAGES } from '../../common/constants/string-const';
import { CreateCategoryDto, UpdateCategoryDto, CategoryResponseDto } from './dto';
import { plainToClass } from 'class-transformer';

@Injectable()
export class CategoriesService {
  private readonly logger = new Logger(CategoriesService.name);

  constructor(
    private readonly categoriesRepository: CategoriesRepository,
  ) {}

  //#region ==================== CRUD OPERATIONS ====================

  async create(createCategoryDto: CreateCategoryDto, createdBy: string): Promise<CategoryResponseDto> {
    this.logger.log(`Creating category: ${createCategoryDto.name}`);
    
    try {
      // Check if category name already exists
      const existingCategory = await this.categoriesRepository.findByName(createCategoryDto.name);
      if (existingCategory) {
        this.logger.warn(`Category name already exists: ${createCategoryDto.name}`);
        throw new ConflictException(MESSAGES.CATEGORY_NAME_EXISTS);
      }

      // Create the category
      const categoryData = {
        ...createCategoryDto,
        created_by: createdBy,
      };

      const createdCategory = await this.categoriesRepository.create(categoryData);
      
      this.logger.log(`Category created successfully: ${createdCategory.name} (ID: ${createdCategory.id})`);
      
      return plainToClass(CategoryResponseDto, createdCategory, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      
      this.logger.error(`Failed to create category: ${createCategoryDto.name}`, error.stack);
      
      // Handle database constraint errors
      if (error.message?.includes('unique constraint')) {
        throw new ConflictException(MESSAGES.CATEGORY_NAME_EXISTS);
      }
      
      throw new BadRequestException('Failed to create category');
    }
  }

  async findAll(filters: {
    name?: string;
    is_active?: boolean;
    withDeleted?: boolean;
  } = {}): Promise<CategoryResponseDto[]> {
    this.logger.log('Fetching all categories with filters', { filters });
    
    try {
      const categories = await this.categoriesRepository.findAll(filters);
      
      this.logger.log(`Retrieved ${categories.length} categories`);
      
      return categories.map(category => 
        plainToClass(CategoryResponseDto, category, {
          excludeExtraneousValues: true,
        })
      );
    } catch (error) {
      this.logger.error('Failed to fetch categories', error.stack);
      throw new BadRequestException('Failed to fetch categories');
    }
  }

  async findOne(id: string, withDeleted = false): Promise<CategoryResponseDto> {
    this.logger.log(`Finding category by ID: ${id}`);
    
    try {
      const category = await this.categoriesRepository.findCategoryByIdOrThrow(id, withDeleted);
      
      this.logger.log(`Category found: ${category.name} (ID: ${id})`);
      
      return plainToClass(CategoryResponseDto, category, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      if (error.message === MESSAGES.CATEGORY_NOT_FOUND) {
        this.logger.warn(`Category not found: ${id}`);
        throw new NotFoundException(MESSAGES.CATEGORY_NOT_FOUND);
      }
      
      this.logger.error(`Failed to find category: ${id}`, error.stack);
      throw new BadRequestException('Failed to find category');
    }
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto, updatedBy: string): Promise<CategoryResponseDto> {
    this.logger.log(`Updating category: ${id}`);
    
    try {
      // Check if category exists
      await this.categoriesRepository.findCategoryByIdOrThrow(id);
      
      // If name is being updated, check for uniqueness
      if (updateCategoryDto.name) {
        const existingCategory = await this.categoriesRepository.findByName(updateCategoryDto.name);
        if (existingCategory && existingCategory.id !== id) {
          this.logger.warn(`Category name already exists: ${updateCategoryDto.name}`);
          throw new ConflictException(MESSAGES.CATEGORY_NAME_EXISTS);
        }
      }

      // Update the category
      const updateData = {
        ...updateCategoryDto,
        updated_by: updatedBy,
      };

      const updatedCategory = await this.categoriesRepository.update(id, updateData);
      
      this.logger.log(`Category updated successfully: ${id}`);
      
      return plainToClass(CategoryResponseDto, updatedCategory, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      
      this.logger.error(`Failed to update category: ${id}`, error.stack);
      
      // Handle database constraint errors
      if (error.message?.includes('unique constraint')) {
        throw new ConflictException(MESSAGES.CATEGORY_NAME_EXISTS);
      }
      
      throw new BadRequestException('Failed to update category');
    }
  }

  async remove(id: string, deletedBy: string): Promise<void> {
    this.logger.log(`Soft deleting category: ${id}`);
    
    try {
      // Check if category exists
      await this.categoriesRepository.findCategoryByIdOrThrow(id);
      
      // TODO: Check if category has associated products
      // This should be implemented when products service is ready
      // const hasProducts = await this.productsService.hasCategoryProducts(id);
      // if (hasProducts) {
      //   throw new BadRequestException('Cannot delete category with associated products');
      // }
      
      await this.categoriesRepository.softDelete(id, deletedBy);
      
      this.logger.log(`Category soft deleted successfully: ${id}`);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      
      this.logger.error(`Failed to soft delete category: ${id}`, error.stack);
      throw new BadRequestException('Failed to delete category');
    }
  }

  async hardDelete(id: string): Promise<void> {
    this.logger.log(`Hard deleting category: ${id}`);
    
    try {
      // Check if category exists (including soft deleted)
      await this.categoriesRepository.findCategoryByIdOrThrow(id, true);
      
      // TODO: Check if category has associated products
      // This should be implemented when products service is ready
      
      await this.categoriesRepository.hardDelete(id);
      
      this.logger.log(`Category hard deleted successfully: ${id}`);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      
      this.logger.error(`Failed to hard delete category: ${id}`, error.stack);
      throw new BadRequestException('Failed to permanently delete category');
    }
  }

  async restore(id: string): Promise<CategoryResponseDto> {
    this.logger.log(`Restoring category: ${id}`);
    
    try {
      const restoredCategory = await this.categoriesRepository.restore(id);
      
      this.logger.log(`Category restored successfully: ${id}`);
      
      return plainToClass(CategoryResponseDto, restoredCategory, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      if (error.message === MESSAGES.CATEGORY_NOT_FOUND) {
        this.logger.warn(`Category not found for restoration: ${id}`);
        throw new NotFoundException(MESSAGES.CATEGORY_NOT_FOUND);
      }
      
      this.logger.error(`Failed to restore category: ${id}`, error.stack);
      throw new BadRequestException('Failed to restore category');
    }
  }

  //#endregion

  //#region ==================== UTILITY OPERATIONS ====================

  async getActiveCategories(): Promise<CategoryResponseDto[]> {
    this.logger.log('Fetching active categories');
    
    try {
      const categories = await this.categoriesRepository.getActiveCategories();
      
      this.logger.log(`Retrieved ${categories.length} active categories`);
      
      return categories.map(category => 
        plainToClass(CategoryResponseDto, category, {
          excludeExtraneousValues: true,
        })
      );
    } catch (error) {
      this.logger.error('Failed to fetch active categories', error.stack);
      throw new BadRequestException('Failed to fetch active categories');
    }
  }

  async getCategoriesCount(withDeleted = false): Promise<number> {
    this.logger.log('Getting categories count');
    
    try {
      const count = await this.categoriesRepository.getCategoriesCount(withDeleted);
      
      this.logger.log(`Categories count: ${count}`);
      
      return count;
    } catch (error) {
      this.logger.error('Failed to get categories count', error.stack);
      throw new BadRequestException('Failed to get categories count');
    }
  }

  async validateCategoryExists(id: string): Promise<boolean> {
    this.logger.log(`Validating category exists: ${id}`);
    
    try {
      const category = await this.categoriesRepository.findById(id);
      const exists = !!category;
      
      this.logger.log(`Category exists validation for ${id}: ${exists}`);
      
      return exists;
    } catch (error) {
      this.logger.error(`Failed to validate category exists: ${id}`, error.stack);
      return false;
    }
  }

  async validateCategoryActive(id: string): Promise<boolean> {
    this.logger.log(`Validating category is active: ${id}`);
    
    try {
      const category = await this.categoriesRepository.findById(id);
      const isActive = category?.is_active || false;
      
      this.logger.log(`Category active validation for ${id}: ${isActive}`);
      
      return isActive;
    } catch (error) {
      this.logger.error(`Failed to validate category is active: ${id}`, error.stack);
      return false;
    }
  }

  async searchCategories(searchTerm: string): Promise<CategoryResponseDto[]> {
    this.logger.log(`Searching categories with term: ${searchTerm}`);
    
    try {
      const categories = await this.categoriesRepository.findAll({
        name: searchTerm,
        is_active: true,
      });
      
      this.logger.log(`Found ${categories.length} categories matching search term: ${searchTerm}`);
      
      return categories.map(category => 
        plainToClass(CategoryResponseDto, category, {
          excludeExtraneousValues: true,
        })
      );
    } catch (error) {
      this.logger.error(`Failed to search categories with term: ${searchTerm}`, error.stack);
      throw new BadRequestException('Failed to search categories');
    }
  }

  //#endregion

  //#region ==================== VALIDATION HELPERS ====================

  private async validateCategoryName(name: string, excludeId?: string): Promise<void> {
    const exists = await this.categoriesRepository.nameExists(name, excludeId);
    if (exists) {
      throw new ConflictException(MESSAGES.CATEGORY_NAME_EXISTS);
    }
  }

  //#endregion
}