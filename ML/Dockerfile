FROM python:3.9

WORKDIR /app
COPY . .

RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 5000

CMD ["python", "app.py"]
# CMD ["gunicorn", "--certfile=/ssl/fullchain.pem", "--keyfile=/ssl/privkey.pem", "--bind", "0.0.0.0:5000", "app:app"]

