from flask import Flask, request, jsonify
import ssl
import pandas as pd
import joblib
import os
from sklearn.preprocessing import LabelEncoder





app = Flask(__name__)

# กำหนดพาธไฟล์
MODEL_PATH = "/app/models/predict_category_model.pkl"
DATA_PATH = "/app/data/test_precategory.csv"
LABEL_ENCODER_PATHS = {
    'age': "/app/models/label_encoder_age.pkl",
    'interested': "/app/models/label_encoder_interested.pkl",
    'category': "/app/models/label_encoder_category.pkl",
    'gender': "/app/models/label_encoder_gender.pkl"
}

# ฟังก์ชันโหลดข้อมูล
def load_data():
    if not os.path.exists(DATA_PATH):
        raise FileNotFoundError(f"❌ ไม่พบไฟล์ {DATA_PATH}")
    
    df = pd.read_csv(DATA_PATH)
    
    required_columns = {'age', 'interested', 'gender', 'user_id'}
    if not required_columns.issubset(df.columns):
        raise ValueError(f"CSV ต้องมีคอลัมน์ {required_columns} แต่พบ {set(df.columns)}")
    
    return df

# ฟังก์ชันโหลดโมเดลและ LabelEncoders
def load_models():
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(f"❌ ไม่พบไฟล์โมเดล {MODEL_PATH}")
    
    model = joblib.load(MODEL_PATH)
    
    # โหลด LabelEncoders
    label_encoders = {}
    for name, path in LABEL_ENCODER_PATHS.items():
        if not os.path.exists(path):
            raise FileNotFoundError(f"❌ ไม่พบไฟล์ LabelEncoder {path}")
        label_encoders[name] = joblib.load(path)
    
    return model, label_encoders

# โหลดโมเดลและ LabelEncoders ตอนเริ่มต้น
model, label_encoders = load_models()

UPLOAD_FOLDER = "/app/data"  # กำหนดตำแหน่งเก็บไฟล์
os.makedirs(UPLOAD_FOLDER, exist_ok=True)  # สร้างโฟลเดอร์ถ้ายังไม่มี

@app.route("/predict_category", methods=["GET"])
def predict_category():
    """ทำนายหมวดหมู่จากข้อมูลผู้ใช้"""
    try:
        df = load_data()
        
        # ตรวจสอบว่ามีคอลัมน์ที่จำเป็น
        if 'age' not in df.columns or 'interested' not in df.columns or 'gender' not in df.columns:
            raise ValueError("DataFrame must contain 'age', 'interested', and 'gender' columns")
        
        # จัดการข้อมูลที่ขาดหายไป
        df.dropna(subset=['age', 'interested', 'gender'], inplace=True)
        
        # จัดกลุ่มช่วงอายุ
        age_bins = [18, 29, 39, float('inf')]
        age_labels = ['18-29', '30-39', '40+']
        df['age_group'] = pd.cut(df['age'], bins=age_bins, labels=age_labels, right=True)
        
        # แปลงข้อมูลด้วย LabelEncoders
        df['interested_encoded'] = label_encoders['interested'].transform(df['interested'])
        df['age_group_encoded'] = label_encoders['age'].transform(df['age_group'])
        df['gender_encoded'] = label_encoders['gender'].transform(df['gender'])
        
        # สร้าง DataFrame สำหรับการทำนาย
        X_test = df[['age_group_encoded', 'interested_encoded', 'gender_encoded']]
        
        # ทำนาย category
        predicted_category_encoded = model.predict(X_test)
        predicted_category = label_encoders['category'].inverse_transform(predicted_category_encoded)
        
        # สร้างผลลัพธ์
        results = []
        for _, row in df.iterrows():
            results.append({
                "user_id": row['user_id'],
                "age": row['age'],
                "gender": row['gender'],
                "interested": row['interested'],
                "predicted_category": predicted_category[_]
            })
        
        return jsonify({"results": results})
    
    except Exception as e:
        return jsonify({"error": str(e)}), 400
    

@app.route("/upload_csv", methods=["POST"])
def upload_csv():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    file_path = os.path.join(UPLOAD_FOLDER, "test_precategory.csv")
    file.save(file_path)

    return jsonify({"message": "CSV uploaded successfully", "file_path": file_path})


# กำหนด path ไปยังไฟล์ SSL (ใช้ os.path เพื่อความเข้ากันได้ข้ามระบบปฏิบัติการ)

SSL_CERT_PATH = "../ssl/fullchain.pem"
SSL_KEY_PATH = "../ssl/privkey.pem"

# ตรวจสอบว่าไฟล์ SSL มีอยู่จริง
if not os.path.exists(SSL_CERT_PATH) or not os.path.exists(SSL_KEY_PATH):
    raise FileNotFoundError("❌ ไม่พบไฟล์ SSL certificate หรือ private key")

# สร้าง SSL context
context = ssl.SSLContext(ssl.PROTOCOL_TLSv1_2)
context.load_cert_chain(SSL_CERT_PATH, SSL_KEY_PATH)

if __name__ == "__main__":
    print("\n🚀 กำลังเริ่มต้น API server สำหรับทำนายหมวดหมู่...")
    app.run(host="0.0.0.0", port=5000, debug=False,ssl_context=context)