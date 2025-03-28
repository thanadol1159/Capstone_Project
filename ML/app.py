from flask import Flask, request, jsonify
import pandas as pd
import joblib
from sklearn.preprocessing import LabelEncoder
import os

app = Flask(__name__)

# # ตรวจสอบว่าไฟล์ที่จำเป็นมีอยู่
# if not os.path.exists("models/popular_venue_model.pkl"):
#     raise FileNotFoundError("ไม่พบไฟล์ models/popular_venue_model.pkl")
# if not os.path.exists("models/vectorizer.pkl"):
#     raise FileNotFoundError("ไม่พบไฟล์ models/vectorizer.pkl")
# if not os.path.exists("models/cosine_sim.pkl"):
#     raise FileNotFoundError("ไม่พบไฟล์ models/cosine_sim.pkl")
# if not os.path.exists("models/data.pkl"):
#     raise FileNotFoundError("ไม่พบไฟล์ models/data.pkl")

user_csv_path = r"C:\Users\User\Desktop\ML\.venv\data\user.csv"
if not os.path.exists(user_csv_path):
    raise FileNotFoundError(f"ไม่พบไฟล์ {user_csv_path}")

venue_data_path = r"C:\Users\User\Desktop\ML\.venv\data\venue_data.csv"
if not os.path.exists(venue_data_path):
    raise FileNotFoundError(f"ไม่พบไฟล์ {venue_data_path}")

# โหลดโมเดลและข้อมูล
model = joblib.load("models/popular_venue_model.pkl")
vectorizer = joblib.load("models/vectorizer.pkl")
cosine_sim = joblib.load("models/cosine_sim.pkl")
df = joblib.load("models/data.pkl")
venues_df = pd.read_csv(venue_data_path)
users_df = pd.read_csv(user_csv_path)

# สร้าง LabelEncoder
encoder = LabelEncoder()
encoder.fit(df["category"])  # Fit encoder กับข้อมูล category

@app.route("/predict", methods=["GET"])
def predict():
    categories = ['staycation', 'wedding', 'workshop', 'co-working space', 'film', 'private party']
    results = []

    for category_name in categories:
        # ตรวจสอบว่าหมวดหมู่มีอยู่ในข้อมูลหรือไม่
        if category_name not in df["category"].values:
            results.append({"category": category_name, "error": f"หมวดหมู่ '{category_name}' ไม่มีในข้อมูล"})
            continue

        # แปลงหมวดหมู่เป็นค่า encoding
        category_encoded = encoder.transform([category_name])[0]

        # ดึงค่า bookings จาก dataset แทนการใช้ค่า 0
        category_bookings = df[df['category'] == category_name]['bookings'].values
        if len(category_bookings) == 0:
            category_bookings = [0]  # กำหนดค่าเริ่มต้นถ้าไม่มีข้อมูล
        bookings = category_bookings[0]  # ใช้ค่าจริงจาก dataset

        # สร้างข้อมูลสำหรับทำนาย
        test_data = pd.DataFrame({"category_encoded": [category_encoded], "bookings": [bookings]})

        # ทำนายว่าหมวดหมู่เป็นที่นิยมไหม
        prediction = model.predict(test_data)[0]

        # เพิ่มผลลัพธ์ลงในผลลัพธ์รวม
        results.append({
            "category": category_name,
            "popular": bool(prediction)
        })

    return jsonify({"results": results})


if __name__ == "__main__":
    app.run(debug=True)