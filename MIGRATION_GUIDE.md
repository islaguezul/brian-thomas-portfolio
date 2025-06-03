# Data Migration Guide

## Overview
This guide explains how to migrate your hardcoded portfolio data to the database-driven admin system.

## Migration Strategy
The migration follows a safe, non-destructive approach:
1. **Extract** all hardcoded data from components
2. **Populate** the database with this data
3. **Connect** components to read from the database
4. **Verify** everything works before removing hardcoded values

## Steps to Migrate

### 1. Initialize Database
Go to `/admin/database` and click "Initialize Database" to create all tables.

### 2. Run Migration
Click "Migrate Hardcoded Data" to import:
- **Personal Info**: Name, contact details, bio, executive summary
- **Work Experience**: All 5 positions with responsibilities
- **Education**: MBA and BS degrees with courses
- **Skills**: 3 categories with all individual skills
- **Projects**: All 6 projects with features, tech stacks, and impacts
- **Tech Stack**: 20 technologies with proficiency levels
- **Process Strategies**: 4 key strategies

### 3. Verify Data
Navigate through the admin panel to verify all data imported correctly:
- `/admin/personal` - Check personal information
- `/admin/projects` - Review all projects
- `/admin/resume/experience` - Verify work history
- `/admin/resume/education` - Check education details
- `/admin/content` - Review skills and tech stack

### 4. Connect Components (Next Step)
Once data is verified, we'll update:
- `Resume.tsx` to pull from database instead of hardcoded values
- `Portfolio.tsx` to use database projects
- `PDFResume.tsx` to generate from database data

## What Gets Migrated

### Personal Information
- Brian Thomas
- Technical Product Manager
- Contact details (email, phone, location)
- LinkedIn URL
- Professional bio and executive summary

### Work Experience (5 positions)
1. Blue Origin - Business Process Analyst (2022-Present)
2. Chelan P.U.D. - Business Process Analyst (2017-2021)
3. Microsoft - Technical Product/Project Manager (2016-2017)
4. Mosaic - Technical Product/Project Manager (2011-2016)
5. U.S. Coast Guard - Multiple Positions (2002-2011)

### Education
- MBA from UW Foster School of Business (2018)
- BS from Central Washington University (2009)
- All relevant coursework

### Skills (3 categories)
- Process Management (5 skills)
- Leadership & Management (5 skills)
- Technical & Analytical (5 skills)

### Projects (6 total)
- Crypto Trading Bot (MVP, 75%)
- Konnosaur Social Platform (Backend, 70%)
- Ecco Stream Global Search (Concept, 35%)
- Enterprise Process Analytics (Research, 25%)
- This Portfolio Site (Production, 95%)
- Enterprise Process Knowledge System (Legacy, 100%)

### Tech Stack (20 technologies)
Frontend, Backend, Database, Cloud, DevOps, AI/ML, Process, and Product technologies

## Important Notes
- Migration is **additive** - it won't delete existing data
- Run migration only once to avoid duplicates
- Always backup your database before major operations
- Test in development before production deployment