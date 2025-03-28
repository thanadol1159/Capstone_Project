from flask import Flask, request, jsonify
import pandas as pd
import joblib
import tensorflow as tf
import os

app = Flask(__name__)

# ตรวจสอบว่าไฟล์โมเดลมีอยู่หรือไม่
MODEL_PATH = "models/popular_venue_model.pkl"
VECTORIZER_PATH = "models/vectorizer.pkl"
COSINE_SIM_PATH = "models/cosine_sim.pkl"
DATA_PATH = "models/data.pkl"
USER_CSV_PATH = "data/user.csv"
VENUE_CSV_PATH = "data/venue_data.csv"

for path in [MODEL_PATH, VECTORIZER_PATH, COSINE_SIM_PATH, DATA_PATH, USER_CSV_PATH, VENUE_CSV_PATH]:
    if not os.path.exists(path):
        raise FileNotFoundError(f"ไม่พบไฟล์ {path}")

# โหลดโมเดล
model = joblib.load(MODEL_PATH)
vectorizer = joblib.load(VECTORIZER_PATH)
cosine_sim = joblib.load(COSINE_SIM_PATH)
df = joblib.load(DATA_PATH)
venues_df = pd.read_csv(VENUE_CSV_PATH)
users_df = pd.read_csv(USER_CSV_PATH)

# โหลดโมเดล TensorFlow (ถ้ามี)
TF_MODEL_PATH = "models/tf_model.h5"
if os.path.exists(TF_MODEL_PATH):
    tf_model = tf.keras.models.load_model(TF_MODEL_PATH)
else:
    tf_model = None

@app.route("/predict", methods=["GET"])
def predict():
    categories = ['staycation', 'wedding', 'workshop', 'co-working space', 'film', 'private party']
    results = []

    for category_name in categories:
        if category_name not in df["category"].values:
            results.append({"category": category_name, "error": f"หมวดหมู่ '{category_name}' ไม่มีในข้อมูล"})
            continue

        category_encoded = df[df['category'] == category_name].index[0]
        bookings = df[df['category'] == category_name]['bookings'].values[0]

        test_data = pd.DataFrame({"category_encoded": [category_encoded], "bookings": [bookings]})

        prediction = model.predict(test_data)[0]

        results.append({
            "category": category_name,
            "popular": bool(prediction)
        })

    return jsonify({"results": results})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
