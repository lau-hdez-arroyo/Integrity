#!/bin/bash
# Complete Database Reset Script
# Run: bash scripts/full-reset.sh or node scripts/full-reset-cli.js

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                  INTEGRITY DATABASE RESET                      ║"
echo "║              ⚠️  THIS WILL DELETE ALL DATA ⚠️                   ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

read -p "⚠️  Are you SURE you want to reset the database? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Reset cancelled."
    exit 0
fi

echo ""
echo "Step 1: Deleting test users from Supabase Auth..."
node scripts/delete-test-users.js

echo ""
echo "Step 2: Resetting database tables..."
node scripts/reset-database.js

echo ""
echo "Step 3: Creating fresh test users..."
node scripts/create-test-users.js

echo ""
echo "Step 4: Seeding dummy data for each project..."
node scripts/seed-dummy-data.js

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                    ✅ RESET COMPLETE ✅                        ║"
echo "╠════════════════════════════════════════════════════════════════╣"
echo "║ Database is now clean and ready for development!               ║"
echo "║                                                                ║"
echo "║ To start the app, run:                                         ║"
echo "║   npm run dev                                                  ║"
echo "║                                                                ║"
echo "║ Test credentials are ready at the same locations              ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
