import * as Joi from 'joi';
import { ENV } from '../common/constants/string-const';

export const envValidationSchema = Joi.object({
  // Supabase Configuration
  [ENV.SUPABASE_URL]: Joi.string().uri().required(),
  [ENV.SUPABASE_ANON_KEY]: Joi.string().required(),
  [ENV.SUPABASE_SERVICE_ROLE_KEY]: Joi.string().required(),
  
  // Application Configuration
  [ENV.NODE_ENV]: Joi.string().valid('development', 'production', 'test').default('development'),
  [ENV.PORT]: Joi.number().port().default(3000),
  
  // Swagger Configuration (Optional)
  [ENV.SWAGGER_USER]: Joi.string().optional(),
  [ENV.SWAGGER_PASSWORD]: Joi.string().optional(),
});
