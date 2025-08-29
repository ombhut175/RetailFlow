import * as Joi from 'joi';
import { ENV } from '../common/constants/string-const';

export const envValidationSchema = Joi.object({
  // Supabase Configuration
  [ENV.SUPABASE_URL]: Joi.string().uri().required(),
  [ENV.SUPABASE_ANON_KEY]: Joi.string().required(),
  [ENV.SUPABASE_SERVICE_ROLE_KEY]: Joi.string().required(),
  
  // Database Configuration
  [ENV.DATABASE_URL]: Joi.string().uri().optional(),
  [ENV.DATABASE_HOST]: Joi.string().hostname().optional(),
  [ENV.DATABASE_PORT]: Joi.number().port().optional(),
  [ENV.DATABASE_NAME]: Joi.string().optional(),
  [ENV.DATABASE_USER]: Joi.string().optional(),
  [ENV.DATABASE_PASSWORD]: Joi.string().optional(),
  
  // Application Configuration
  [ENV.NODE_ENV]: Joi.string().valid('development', 'production', 'test').default('development'),
  [ENV.PORT]: Joi.number().port().default(3000),
  
  // Swagger Configuration (Optional)
  [ENV.SWAGGER_USER]: Joi.string().optional(),
  [ENV.SWAGGER_PASSWORD]: Joi.string().optional(),
}).custom((value, helpers) => {
  // Ensure either DATABASE_URL or all individual database parameters are provided
  const hasDatabaseUrl = value[ENV.DATABASE_URL];
  const hasIndividualParams = value[ENV.DATABASE_HOST] && value[ENV.DATABASE_PORT] && 
                             value[ENV.DATABASE_NAME] && value[ENV.DATABASE_USER] && 
                             value[ENV.DATABASE_PASSWORD];
  
  if (!hasDatabaseUrl && !hasIndividualParams) {
    return helpers.error('Either DATABASE_URL or all individual database parameters must be provided');
  }
  
  return value;
});
