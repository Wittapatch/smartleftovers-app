FROM python:3.12-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

RUN pip install --no-cache-dir uv

COPY pyproject.toml ./
COPY . .

RUN uv pip install --system --no-cache -e .

EXPOSE 5000

CMD ["python", "main.py"]
