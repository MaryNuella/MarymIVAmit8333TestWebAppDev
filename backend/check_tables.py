import psycopg2
import os

# Database connection
DATABASE_URL = "postgresql://postgres.tpemrxixbugzjfrcgday:xeZIOJhUY67SIQW4@aws-0-eu-west-3.pooler.supabase.com:5432/postgres"

try:
    conn = psycopg2.connect(DATABASE_URL)
    cursor = conn.cursor()
    
    # Get all tables
    cursor.execute("""
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name;
    """)
    
    tables = cursor.fetchall()
    
    print('=== Existing Tables in Supabase ===')
    if tables:
        for table in tables:
            print(f'  ✓ {table[0]}')
    else:
        print('  No tables found')
    
    cursor.close()
    conn.close()
    
except Exception as e:
    print(f'Error: {e}')
