# NeonDB to Supabase Migration Guide

This document outlines the steps to migrate your application from NeonDB to Supabase.

## Prerequisites

1. A Supabase account and project
2. Access to your existing NeonDB database
3. CSV exports of your data (if available)

## Step 1: Set Up Supabase Environment Variables

1. Copy the `.env.example` file to `.env.local`:

   ```bash
   cp .env.example .env.local
   ```

2. Update the Supabase configuration in your `.env.local` file:

   ```
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_KEY=your-service-role-key
   ```

   You can find these values in your Supabase dashboard under Project Settings > API.

## Step 2: Create Database Schema in Supabase

1. Navigate to the SQL Editor in your Supabase dashboard
2. Copy the contents of `app/lib/db/supabase-schema.sql`
3. Paste and execute the SQL in the Supabase SQL Editor

## Step 3: Import Data

If you have CSV exports of your data:

```bash
npm run db:import-csv-supabase
```

This script will:

- Check if tables exist
- Import data from CSV files
- Log detailed information about the import process

## Step 4: Test the Connection

Run the Supabase connection test:

```bash
npm run db:test-supabase
```

This will verify that:

- The connection to Supabase is working
- All required tables are accessible
- Basic queries can be executed

## Step 5: Update Your Application

The migration includes:

1. New Supabase client setup in `app/lib/db/supabase.ts`
2. TypeScript types for Supabase in `app/lib/db/supabase-types.ts`
3. Updated database configuration in `app/lib/db/config.ts`
4. Helper functions for common database operations

Your application should now be using Supabase instead of NeonDB.

## Troubleshooting

### Connection Issues

If you encounter connection issues:

1. Verify your Supabase URL and API keys
2. Check that your IP is allowed in Supabase's network restrictions
3. Ensure your Supabase project is active

### Import Errors

If data import fails:

1. Check the CSV file format and structure
2. Verify that the CSV files match the expected schema
3. Look for detailed error messages in the console output

### Query Errors

If queries fail:

1. Check that the tables were created correctly
2. Verify that the data was imported successfully
3. Test simple queries directly in the Supabase SQL Editor

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
