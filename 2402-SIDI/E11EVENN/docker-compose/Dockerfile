FROM python:alpine
WORKDIR /app
COPY requirements.txt requirements.txt
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "e11evenn:app", "--host", "0.0.0.0", "--port", "8000"]
