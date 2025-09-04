# Cron Job Test Endpoint

## Overview
Created a dedicated test endpoint to execute and verify the cron job function with detailed results and performance metrics.

## Test Endpoint Details

### **POST** `/api/health-check/test-cron`

**Purpose**: Executes the same function that runs in the cron job every 12 minutes and returns detailed results for verification.

### Request
```bash
curl -X POST http://localhost:5099/api/health-check/test-cron
```

### Response Example
```json
{
  "message": "Cron job function executed successfully",
  "success": true,
  "executionTime": 125,
  "results": {
    "newRecordId": 42,
    "newRecord": {
      "id": 42,
      "service": "cron-health-check",
      "status": "HEALTHY", 
      "message": "Automated health check completed successfully",
      "details": {
        "timestamp": "2025-04-09T19:00:00.000Z",
        "systemInfo": {
          "nodeVersion": "v18.17.0",
          "platform": "win32",
          "arch": "x64",
          "uptime": "15 minutes",
          "memoryUsage": {
            "rss": "45 MB",
            "heapUsed": "32 MB",
            "heapTotal": "38 MB"
          }
        },
        "cronJobType": "scheduled-health-check"
      },
      "createdAt": "2025-04-09T19:00:00.123Z"
    },
    "deletedCount": 3,
    "systemInfo": {
      "nodeVersion": "v18.17.0",
      "platform": "win32", 
      "arch": "x64",
      "uptime": "15 minutes",
      "memoryUsage": {
        "rss": "45 MB",
        "heapUsed": "32 MB",
        "heapTotal": "38 MB"
      },
      "timestamp": "2025-04-09T19:00:00.123Z"
    },
    "executionDetails": {
      "addRecordTime": 45,
      "cleanupTime": 67,
      "totalTime": 125
    },
    "recordsBeforeCleanup": 15,
    "recordsAfterCleanup": 13
  },
  "timestamp": "2025-04-09T19:00:00.123Z",
  "duration": "125ms"
}
```

## What The Test Does

### 1. **Record Addition** ✅
- Creates a new health check record with system information
- Records the time taken to add the record
- Returns the complete new record details

### 2. **Old Record Cleanup** ✅  
- Deletes records older than 2 hours (120 minutes)
- Records the time taken for cleanup
- Returns count of deleted records

### 3. **Performance Metrics** ✅
- Measures execution time for each step
- Provides total execution time
- Shows before/after record counts

### 4. **System Information** ✅
- Node.js version and platform details
- Memory usage (RSS, heap used/total)
- Application uptime
- Timestamp information

## Testing Instructions

### 1. **Basic Test**
```bash
# Test the cron job function
curl -X POST http://localhost:5099/api/health-check/test-cron

# Expected: Returns detailed execution results
```

### 2. **Verify Records Were Created**
```bash
# Check recent records
curl -X GET http://localhost:5099/api/health-check/records

# Should show the newly created record
```

### 3. **Check Overall Status**
```bash
# Get health check statistics  
curl -X GET http://localhost:5099/api/health-check/status

# Should show updated counts and latest record
```

## Error Response Example
```json
{
  "message": "Cron job function test failed",
  "success": false,
  "executionTime": 67,
  "error": {
    "message": "Database connection failed",
    "stack": "Error: Database connection failed\n    at ..."
  },
  "timestamp": "2025-04-09T19:00:00.123Z", 
  "duration": "67ms"
}
```

## Comparison with Other Endpoints

| Endpoint | Purpose | Response Detail | Use Case |
|----------|---------|-----------------|-----------|
| `POST /test-cron` | **Test function with details** | **Full execution metrics** | **Development/debugging** |
| `POST /trigger` | Manual trigger | Simple success message | Production manual trigger |
| `GET /status` | Current statistics | Summary stats | Monitoring |
| `GET /records` | View records | Recent records list | Data inspection |

## Validation Checklist

After running the test endpoint, verify:

- ✅ `success: true` in response
- ✅ `newRecordId` is a valid number  
- ✅ `deletedCount` >= 0 (depends on existing old records)
- ✅ `executionTime` is reasonable (usually < 500ms)
- ✅ `newRecord` has proper structure and data
- ✅ `systemInfo` contains current system metrics
- ✅ Database record counts updated correctly

## Integration with Swagger UI

The endpoint is documented in Swagger and can be tested via:
```
http://localhost:5099/api/docs
```

Look for the "Health Check" section and find the "Test the cron job function" endpoint.

## Next Steps

1. **Run the test** to verify everything works
2. **Check the logs** for detailed execution information  
3. **Inspect the database** to confirm records are added/deleted
4. **Monitor performance** using the execution metrics
5. **Set up monitoring** for the actual cron job using these same metrics

The test endpoint provides the same functionality as the cron job but with comprehensive feedback for development and debugging purposes!