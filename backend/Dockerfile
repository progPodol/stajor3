FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

COPY . /app

RUN chmod +x /app/docker-entrypoint.sh

ENV FRONTEND_INTERNAL_URL=http://frontend:3000
ENV REVALIDATE_SECRET=

ENTRYPOINT ["/app/docker-entrypoint.sh"]
