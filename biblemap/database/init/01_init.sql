-- Enable PostGIS extension for geographic data
CREATE EXTENSION IF NOT EXISTS postgis;

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create database schema
CREATE SCHEMA IF NOT EXISTS biblemap;

-- Set search path
SET search_path TO biblemap, public;

-- Add comments to database
COMMENT ON SCHEMA biblemap IS 'BibleMap application schema for biblical geographic and historical data';

-- Create indexes for better performance (will be handled by Prisma, but good for reference)
-- These will be created automatically by Prisma migrations