# 🤖 Gemini AI Service Documentation

> **AI-First Development**: Complete Gemini integration with helper functions for hackathon speed

---

## 🚀 Quick Setup

### 1. Environment Configuration

Add your Gemini API key to `.env.local`:

```env
GEMINI_API_KEY=your-gemini-api-key-here
```

### 2. Service Import

```typescript
import { GeminiService } from '../core/ai/gemini.service';

// In your constructor
constructor(private readonly geminiService: GeminiService) {}
```

---

## 📋 Available Methods

### ✨ Basic Text Generation

```typescript
// Simple text generation
const result = await this.geminiService.generateText(
  "Explain quantum computing in simple terms"
);

// With custom model
const result = await this.geminiService.generateText(
  "Write a TypeScript function",
  'gemini-2.5-pro' // For complex coding tasks
);
```

### 🧩 JSON Generation with Schema

```typescript
// Generate structured JSON
const userSchema = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING, description: 'Full name' },
    age: { type: Type.NUMBER, description: 'Age in years' },
    skills: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: 'Array of skills' 
    }
  },
  required: ['name', 'age']
};

const user = await this.geminiService.generateJson<User>(
  "Create a sample user profile for a software developer",
  userSchema
);

// Result: { name: "John Doe", age: 28, skills: ["TypeScript", "React", "Node.js"] }
```

### 📝 JSON Array Generation

```typescript
// Generate arrays of structured data
const taskSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    priority: { type: Type.STRING, enum: ['high', 'medium', 'low'] },
    completed: { type: Type.BOOLEAN }
  }
};

const tasks = await this.geminiService.generateJsonArray<Task[]>(
  "Create 3 sample tasks for a todo app",
  taskSchema
);

// Result: [
//   { title: "Setup project", priority: "high", completed: false },
//   { title: "Write tests", priority: "medium", completed: false },
//   { title: "Deploy app", priority: "low", completed: false }
// ]
```

---

## 🔧 Helper Functions

### 📄 Text to Array Conversion

```typescript
// Extract lists from natural language
const items = await this.geminiService.textToArray(
  "I need to buy apples, bananas, milk, bread, and eggs from the store",
  "Extract shopping items as individual strings"
);

// Result: ["apples", "bananas", "milk", "bread", "eggs"]
```

### 🎯 Text to Object Extraction

```typescript
// Extract structured data from unstructured text
const email = `
From: john@example.com
Subject: Meeting Tomorrow
Hi team, let's meet at 2 PM in conference room A to discuss the new project.
Best regards, John
`;

const emailData = await this.geminiService.textToObject<EmailData>(
  email,
  "Extract email metadata including sender, subject, time, location, and purpose",
  {
    type: Type.OBJECT,
    properties: {
      sender: { type: Type.STRING },
      subject: { type: Type.STRING },
      time: { type: Type.STRING },
      location: { type: Type.STRING },
      purpose: { type: Type.STRING }
    }
  }
);

// Result: {
//   sender: "john@example.com",
//   subject: "Meeting Tomorrow", 
//   time: "2 PM",
//   location: "conference room A",
//   purpose: "discuss the new project"
// }
```

### 🎭 System Instructions (Role-based AI)

```typescript
// Generate content with specific AI personality/role
const codeReview = await this.geminiService.generateWithSystemInstruction(
  "Review this function: const add = (a, b) => a + b;",
  "You are a senior TypeScript developer. Provide constructive code review feedback focusing on type safety, best practices, and improvements."
);

// AI responds as a senior developer with specific expertise
```

### 🔍 JSON Extraction & Cleaning

```typescript
// Extract JSON from messy text
const messyText = `
Here's your data:
```json
{"name": "John", "age": 30}
```
Hope this helps!
`;

const extracted = this.geminiService.extractJsonFromText<User>(messyText);
// Result: { name: "John", age: 30 }

// Clean malformed JSON
const dirtyJson = `{"name": "John", "age": 30,}`;  // trailing comma
const cleaned = this.geminiService.cleanJsonText(dirtyJson);
// Result: `{"name": "John", "age": 30}`
```

### 🌊 Streaming for Real-time Responses

```typescript
// Stream text for chatbots or long content
async function streamResponse() {
  for await (const chunk of this.geminiService.generateTextStream(
    "Write a detailed explanation of REST APIs"
  )) {
    process.stdout.write(chunk); // Real-time output
  }
}
```

---

## 🛠 API Endpoints

The service includes a complete REST API for testing:

### GET `/ai/generate?prompt=your-prompt`

Simple text generation via URL parameter.

### POST `/ai/json`

```json
{
  "prompt": "Create a user profile",
  "schema": {
    "type": "OBJECT",
    "properties": {
      "name": { "type": "STRING" },
      "email": { "type": "STRING" }
    }
  }
}
```

### POST `/ai/json-array`

```json
{
  "prompt": "Generate 3 product categories",
  "itemSchema": {
    "type": "OBJECT", 
    "properties": {
      "name": { "type": "STRING" },
      "description": { "type": "STRING" }
    }
  }
}
```

### POST `/ai/text-to-array`

```json
{
  "text": "Buy milk, bread, eggs, apples",
  "instruction": "Extract individual shopping items"
}
```

### POST `/ai/text-to-object`

```json
{
  "text": "John Doe, 28 years old, software engineer at Google",
  "instruction": "Extract person details as structured object"
}
```

### POST `/ai/system-prompt`

```json
{
  "prompt": "Explain JavaScript closures",
  "systemInstruction": "You are a patient teacher explaining complex concepts to beginners"
}
```

### POST `/ai/extract-json`

```json
{
  "text": "Here's your data: {\"name\": \"John\"} - hope this helps!"
}
```

### POST `/ai/clean-json`

```json
{
  "jsonText": "{\"name\": \"John\", \"age\": 30,}"
}
```

---

## 🎯 Best Practices

### 1. Error Handling

```typescript
try {
  const result = await this.geminiService.generateJson(prompt, schema);
  return successResponse(result);
} catch (error) {
  this.logger.error(`AI generation failed: ${error.message}`);
  return errorResponse(500, 'AI service temporarily unavailable');
}
```

### 2. Schema Design

```typescript
// ✅ GOOD: Clear, specific schemas
const productSchema = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING, description: 'Product name' },
    price: { type: Type.NUMBER, description: 'Price in USD' },
    category: { type: Type.STRING, enum: ['electronics', 'clothing', 'books'] }
  },
  required: ['name', 'price'],
  propertyOrdering: ['name', 'price', 'category']
};
```

### 3. Prompt Engineering

```typescript
// ✅ GOOD: Specific, clear prompts
const prompt = `
Generate 5 realistic e-commerce products for a tech store.
Include: name, price (in USD), category, and brief description.
Focus on popular items under $500.
`;

// ❌ BAD: Vague prompts
const prompt = "give me some products";
```

### 4. Performance Optimization

```typescript
// For hackathon speed - disable thinking
const config = {
  thinkingConfig: {
    thinkingBudget: 0  // Faster responses
  }
};

// For production - enable thinking for better quality
const config = {
  thinkingConfig: {
    thinkingBudget: 1024  // Better quality responses
  }
};
```

---

## 🔥 Hackathon Tips

### Speed Development

```typescript
// Quick JSON generation for mock data
const mockUsers = await this.geminiService.generateJsonArray(
  "Generate 10 realistic user profiles with name, email, and role",
  userSchema
);

// Instant API documentation from code
const apiDocs = await this.geminiService.generateText(`
Analyze this controller and generate API documentation:
${controllerCode}
`);
```

### Data Transformation

```typescript
// Convert CSV to JSON
const csvData = "name,age,city\nJohn,25,NYC\nJane,30,LA";
const jsonData = await this.geminiService.textToObject(
  csvData,
  "Convert this CSV data to JSON array format"
);

// Generate test data
const testData = await this.geminiService.generateJsonArray(
  "Create 20 realistic test users for an e-commerce app",
  userSchema
);
```

### Smart Content Generation

```typescript
// Generate README files
const readme = await this.geminiService.generateWithSystemInstruction(
  "Create a README for a NestJS API with Gemini integration",
  "You are a technical writer creating clear, comprehensive documentation"
);

// Generate unit tests
const tests = await this.geminiService.generateWithSystemInstruction(
  `Write Jest tests for: ${functionCode}`,
  "You are a senior developer writing comprehensive unit tests with good coverage"
);
```

---

## 🚨 Error Messages & Troubleshooting

| Error | Cause | Solution |
|-------|-------|----------|
| `GEMINI_API_KEY_MISSING` | API key not set | Add `GEMINI_API_KEY=xxx` to `.env.local` |
| `GEMINI_JSON_PARSE_FAILED` | Invalid JSON response | Check prompt clarity, add schema |
| `GEMINI_API_ERROR` | API quota/network issues | Check API limits, retry with backoff |
| `GEMINI_GENERATION_FAILED` | General AI failure | Check prompt format, model availability |

---

## 📊 Models Available

- **gemini-2.5-flash** (default) - Fast, general-purpose
- **gemini-2.5-pro** - Complex reasoning, coding tasks
- **gemini-2.0-flash** - Latest generation model
- **gemini-2.0-pro** - Latest pro model

---

## 🎉 Ready to Ship!

This Gemini service is production-ready with:

- ✅ Comprehensive error handling
- ✅ TypeScript type safety
- ✅ Structured logging
- ✅ Schema validation
- ✅ Helper functions for common tasks
- ✅ Real-world API endpoints
- ✅ Hackathon-optimized performance

**Start building amazing AI features in minutes, not hours! 🚀**
