# import pandas as pd
# import joblib
# from sklearn.preprocessing import LabelEncoder

# # โหลดข้อมูลจากไฟล์ CSV
# csv_path = r'/app/data/newvenue.csv'
# df = pd.read_csv(csv_path)

# # ตรวจสอบว่ามีคอลัมน์ที่ต้องใช้หรือไม่
# required_columns = {'category', 'bookings'}
# if not required_columns.issubset(df.columns):
#     raise ValueError(f"CSV ต้องมีคอลัมน์ {required_columns} แต่พบ {set(df.columns)}")

# joblib.dump(df, "models/data.pkl")
# print("✅ บันทึก data.pkl ใหม่สำเร็จ")

# # โหลดและตรวจสอบข้อมูลจาก data.pkl
# df_loaded = joblib.load("models/data.pkl")
# print("\n📌 ตรวจสอบข้อมูลจาก data.pkl:")
# print(df_loaded.head())  # แสดง 5 แถวแรก
# print("\n📌 คอลัมน์ที่มีอยู่:", df_loaded.columns)

# # โหลดโมเดลที่บันทึกไว้
# model = joblib.load('models/popular_venue_model.pkl')

# # แปลงหมวดหมู่ให้เป็นตัวเลขด้วย LabelEncoder
# encoder = LabelEncoder()
# encoder.fit(df['category'])

# def recommend_venues_for_all_categories():
#     """ ฟังก์ชันแนะนำสถานที่สำหรับทุกหมวดหมู่ในข้อมูล """
#     results = []
    
#     for category_name in df['category'].unique():
#         # ใช้ค่าการจองเฉลี่ยของหมวดหมู่นั้นเป็นค่าทำนาย
#         avg_bookings = df[df['category'] == category_name]['bookings'].mean()
        
#         # แปลงหมวดหมู่เป็นตัวเลข
#         category_encoded = encoder.transform([category_name])[0]
        
#         # สร้าง DataFrame สำหรับทำนาย
#         test_data = pd.DataFrame({'category_encoded': [category_encoded], 'bookings': [avg_bookings]})
        
#         # ทำนาย
#         prediction = model.predict(test_data)
        
#         # เพิ่มผลลัพธ์ลงใน list
#         results.append({
#             "category": category_name,
#             "is_popular": "ใช่" if prediction[0] == 1 else "ไม่ใช่"
#         })
    
#     # แสดงผลลัพธ์
#     for result in results:
#         print(f"หมวดหมู่ '{result['category']}': {result['is_popular']}")

# if __name__ == "__main__":
#     recommend_venues_for_all_categories()
