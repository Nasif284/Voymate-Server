FROM pgvector/pgvector:0.8.6-pg15-bookworm

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
    postgresql-15-postgis-3 \
    postgresql-15-postgis-3-scripts \
    && rm -rf /var/lib/apt/lists/*

COPY init-extensions.sql /docker-entrypoint-initdb.d/