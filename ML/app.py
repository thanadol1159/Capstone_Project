# from flask import Flask, request, jsonify
# import pandas as pd
# import joblib
# import os
# import subprocess

# app = Flask(__name__)

# # เรียกใช้งาน test.py ก่อนโหลดโมเดล
# # TEST_SCRIPT_PATH = "test.py"

# # print("🔄 กำลังรัน test.py เพื่อเตรียมไฟล์ .pkl ...")
# # try:
# #     subprocess.run(["python", TEST_SCRIPT_PATH], check=True)
# #     print("✅ test.py รันสำเร็จ!")
# # except subprocess.CalledProcessError as e:
# #     print(f"❌ เกิดข้อผิดพลาดในการรัน test.py: {e}")
# #     exit(1) 

# # ตรวจสอบไฟล์โมเดล
# MODEL_PATH = "models/popular_venue_model.pkl"
# VECTORIZER_PATH = "models/vectorizer.pkl"
# COSINE_SIM_PATH = "models/cosine_sim.pkl"
# DATA_PATH = "models/data.pkl"
# USER_CSV_PATH = "data/user.csv"
# VENUE_CSV_PATH = "data/venue_data.csv"

# for path in [MODEL_PATH, VECTORIZER_PATH, COSINE_SIM_PATH, DATA_PATH, USER_CSV_PATH, VENUE_CSV_PATH]:
#     if not os.path.exists(path):
#         raise FileNotFoundError(f"ไม่พบไฟล์ {path}")

# # โหลดโมเดลหลัก (โหลดแค่ครั้งเดียว)
# model = joblib.load(MODEL_PATH)
# vectorizer = joblib.load(VECTORIZER_PATH)
# cosine_sim = joblib.load(COSINE_SIM_PATH)

# @app.route("/predict", methods=["GET"])
# def predict():
#     TEST_SCRIPT_PATH = "test.py"

#     print("🔄 กำลังรัน test.py เพื่อเตรียมไฟล์ .pkl ...")
#     try:
#         subprocess.run(["python", TEST_SCRIPT_PATH], check=True)
#         print("✅ test.py รันสำเร็จ!")
#     except subprocess.CalledProcessError as e:
#         print(f"❌ เกิดข้อผิดพลาดในการรัน test.py: {e}")

#     """โหลด data.pkl ใหม่ทุกครั้งที่มีการเรียก API เพื่อให้แน่ใจว่าข้อมูลล่าสุดถูกนำมาใช้"""
#     df = joblib.load(DATA_PATH)
#     model = joblib.load(MODEL_PATH)
#     vectorizer = joblib.load(VECTORIZER_PATH)
#     cosine_sim = joblib.load(COSINE_SIM_PATH)
#     venues_df = pd.read_csv(VENUE_CSV_PATH)
#     users_df = pd.read_csv(USER_CSV_PATH)

#     categories = ['staycation', 'wedding', 'party', 'workshop', 'co-working space', 'film', 'private party']
#     results = []

#     for category_name in categories:
#         if category_name not in df["category"].values:
#             results.append({"category": category_name, "error": f"หมวดหมู่ '{category_name}' ไม่มีในข้อมูล"})
#             continue

#         category_encoded = df[df['category'] == category_name].index[0]
#         bookings = df[df['category'] == category_name]['bookings'].values[0]

#         test_data = pd.DataFrame({"category_encoded": [category_encoded], "bookings": [bookings]})
#         prediction = model.predict(test_data)[0]

#         results.append({
#             "category": category_name,
#             "popular": bool(prediction)
#         })

#     return jsonify({"results" : results})


# if __name__ == "__main__":
#     app.run(host="0.0.0.0", port=5000, debug=True)
from flask import Flask, request, jsonify
import pandas as pd
import joblib
import tensorflow as tf
import os
from sklearn.preprocessing import LabelEncoder

app = Flask(__name__)

# กำหนดพาธไฟล์
CSV_PATH = "/app/data/newvenue.csv"
MODEL_PATH = "models/popular_venue_model.pkl"
DATA_PATH = "models/data.pkl"
TF_MODEL_PATH = "models/tf_model.h5"

# ฟังก์ชันโหลดข้อมูลใหม่จาก CSV ทุกครั้งที่มีการเรียก API
def load_data():
    if not os.path.exists(CSV_PATH):
        raise FileNotFoundError(f"❌ ไม่พบไฟล์ {CSV_PATH}")

    df = pd.read_csv(CSV_PATH)

    required_columns = {'category', 'bookings'}
    if not required_columns.issubset(df.columns):
        raise ValueError(f"CSV ต้องมีคอลัมน์ {required_columns} แต่พบ {set(df.columns)}")

    # บันทึกข้อมูลเป็นไฟล์ pickle
    os.makedirs("models", exist_ok=True)
    joblib.dump(df, DATA_PATH)

    return df

# ฟังก์ชันโหลดโมเดล
def load_models():
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(f"❌ ไม่พบไฟล์โมเดล {MODEL_PATH}")

    model = joblib.load(MODEL_PATH)

    # โหลด TensorFlow Model ถ้ามี
    tf_model = None
    if os.path.exists(TF_MODEL_PATH):
        tf_model = tf.keras.models.load_model(TF_MODEL_PATH)

    return model, tf_model

# โหลดโมเดลตอนเริ่มต้น
model, tf_model = load_models()

@app.route("/predict", methods=["GET"])
def predict():
    """โหลด CSV ใหม่และทำนายข้อมูล"""
    df = load_data()

    # โหลด LabelEncoder ใหม่
    encoder = LabelEncoder()
    encoder.fit(df["category"])

    categories = request.args.get("categories", "").split(",")

    # ถ้าไม่ได้กำหนดหมวดหมู่ ให้ใช้ทุกหมวดหมู่
    if not categories or categories[0] == "":
        categories = df["category"].unique().tolist()

    results = []
    for category_name in categories:
        if category_name not in df["category"].values:
            results.append({"category": category_name, "error": f"หมวดหมู่ '{category_name}' ไม่มีในข้อมูล"})
            continue

        avg_bookings = df[df["category"] == category_name]["bookings"].mean()
        category_encoded = encoder.transform([category_name])[0]

        # สร้าง DataFrame สำหรับทำนาย
        test_data = pd.DataFrame({"category_encoded": [category_encoded], "bookings": [avg_bookings]})

        # ทำนาย
        prediction = model.predict(test_data)[0]

        results.append({
            "category": category_name,
            "popular": bool(prediction)
        })

    return jsonify({"results": results})

@app.route("/recommend_all", methods=["GET"])
def recommend_all():
    """โหลดข้อมูลใหม่และแนะนำสถานที่ทั้งหมด"""
    df = load_data()

    encoder = LabelEncoder()
    encoder.fit(df["category"])

    results = []
    for category_name in df["category"].unique():
        avg_bookings = df[df["category"] == category_name]["bookings"].mean()
        category_encoded = encoder.transform([category_name])[0]

        test_data = pd.DataFrame({"category_encoded": [category_encoded], "bookings": [avg_bookings]})

        prediction = model.predict(test_data)

        results.append({
            "category": category_name,
            "is_popular": bool(prediction[0] == 1)
        })

    return jsonify({"results": results})

if __name__ == "__main__":
    print("\n🚀 กำลังเริ่มต้น API server...")
    app.run(host="0.0.0.0", port=5000, debug=True)
