#!/bin/bash
set -e

echo "Waiting for database to be ready..."
python - <<'PY'
import asyncio, os, sys
import asyncpg
from urllib.parse import urlparse

dsn = os.environ.get('DATABASE_URL')
if not dsn:
    print('DATABASE_URL is not set', file=sys.stderr)
    sys.exit(1)

def parse_sqlalchemy_url_to_asyncpg_params(url: str):
    # Convert SQLAlchemy DSN (postgresql+asyncpg://...) to asyncpg params
    if url.startswith('postgresql+asyncpg://'):
        url = url.replace('+asyncpg', '', 1)
    parsed = urlparse(url)
    return {
        'user': parsed.username,
        'password': parsed.password,
        'host': parsed.hostname or 'localhost',
        'port': parsed.port or 5432,
        'database': (parsed.path or '').lstrip('/') or None,
    }

params = parse_sqlalchemy_url_to_asyncpg_params(dsn)

async def wait_for_db():
    for i in range(60):
        try:
            conn = await asyncpg.connect(**params)
            await conn.close()
            print('Database is ready')
            return
        except Exception as e:
            print(f'Waiting for DB... attempt {i+1}/60: {e}')
            await asyncio.sleep(2)
    print('Database not ready after retries', file=sys.stderr)
    sys.exit(1)

asyncio.run(wait_for_db())
PY

alembic upgrade head

exec uvicorn main:app --host 0.0.0.0 --port 8000
