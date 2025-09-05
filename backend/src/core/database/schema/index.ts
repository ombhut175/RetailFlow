import { healthChecking } from './health-checking';
import { users } from './users';
import { posts } from './posts';

// Schema exports
export const schema = {
  healthChecking,
  users,
  posts,
};

// Export individual tables for convenience
export { healthChecking, users, posts };
