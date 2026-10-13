import os

import joblib
import pandas as pd
import mysql.connector

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from pydantic import BaseModel


# =========================================================
# LOAD ENVIRONMENT VARIABLES
# =========================================================

load_dotenv()


# =========================================================
# FASTAPI APP
# =========================================================

app = FastAPI(
    title="Fair Price Used Electronics API",
    description="API for estimating fair resale prices of used electronics",
    version="1.0.0"
)

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        [ "http://localhost:5173",
           "http://localhost:5174", 
           "http://127.0.0.1:5173",
           "http://127.0.0.1:5174",
            "http://localhost:5500",
             "http://127.0.0.1:5500" ]
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_oriaaaaaaaaaaaaaaaaaaaaaaaaagins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# LOAD ML MODEL
# =========================================================

MODEL_PATH = os.path.join(
    os.path.dirname(__file__),
    "fairprice_model.pkl"
)

try:
    model = joblib.load(MODEL_PATH)
    print("ML model loaded successfully!")

except Exception as e:
    print("Error loading ML model:", e)
    model = None


# =========================================================
# DATABASE CONNECTION
# =========================================================

def get_db_connection():

    try:

        connection = mysql.connector.connect(
            host=os.getenv("DB_HOST", "localhost"),
            port=int(os.getenv("DB_PORT", "3306")),
            user=os.getenv("DB_USER", "root"),
            password=os.getenv("DB_PASSWORD"),
            database=os.getenv("DB_NAME", "fair_price_db")
        )

        return connection

    except mysql.connector.Error as e:

        print("Database connection error:", e)

        return None


# =========================================================
# REQUEST MODEL
# =========================================================

class PredictionRequest(BaseModel):

    device_type: str
    brand: str
    model: str

    original_price: float
    age: float
    ram: float
    storage: float
    battery_health: float

    condition: str
    repair_history: str
    warranty: str


# =========================================================
# ROOT API
# =========================================================

@app.get("/")
def root():

    return {
        "message": "Fair Price Used Electronics API is running"
    }


# =========================================================
# HEALTH CHECK
# =========================================================

@app.get("/health")
def health():

    connection = get_db_connection()

    if connection:

        connection.close()

        return {
            "api": "running",
            "database": "connected"
        }

    return {
        "api": "running",
        "database": "not connected"
    }


# =========================================================
# PREDICT PRICE
# =========================================================

@app.post("/predict")
def predict_price(data: PredictionRequest):

    try:

        # -------------------------------------------------
        # Check ML model
        # -------------------------------------------------

        if model is None:

            raise HTTPException(
                status_code=500,
                detail="ML model is not loaded"
            )


        # -------------------------------------------------
        # Validate input
        # -------------------------------------------------

        if data.original_price <= 0:

            raise HTTPException(
                status_code=400,
                detail="Original price must be greater than 0"
            )


        if data.age < 0:

            raise HTTPException(
                status_code=400,
                detail="Age cannot be negative"
            )


        if data.ram < 0:

            raise HTTPException(
                status_code=400,
                detail="RAM cannot be negative"
            )


        if data.storage < 0:

            raise HTTPException(
                status_code=400,
                detail="Storage cannot be negative"
            )


        if data.battery_health < 0 or data.battery_health > 100:

            raise HTTPException(
                status_code=400,
                detail="Battery health must be between 0 and 100"
            )


        # -------------------------------------------------
        # Prepare input as Pandas DataFrame
        # -------------------------------------------------
        # IMPORTANT:
        # The trained model expects column names.
        # Therefore DataFrame is used instead of normal list.
        # -------------------------------------------------

        input_data = pd.DataFrame([
            {
                "device_type": data.device_type,
                "brand": data.brand,
                "model": data.model,
                "original_price": data.original_price,
                "age": data.age,
                "ram": data.ram,
                "storage": data.storage,
                "battery_health": data.battery_health,
                "condition": data.condition,
                "repair_history": data.repair_history,
                "warranty": data.warranty
            }
        ])


        # -------------------------------------------------
        # ML Prediction
        # -------------------------------------------------

        predicted_price = float(
            model.predict(input_data)[0]
        )


        # -------------------------------------------------
        # Make sure price is not negative
        # -------------------------------------------------

        predicted_price = round(
            max(predicted_price, 0),
            2
        )


        # -------------------------------------------------
        # Calculate price range
        # -------------------------------------------------

        low_price = round(
            predicted_price * 0.90,
            2
        )

        high_price = round(
            predicted_price * 1.10,
            2
        )


        midpoint = round(
            (low_price + high_price) / 2,
            2
        )


        # -------------------------------------------------
        # Save prediction to MySQL
        # -------------------------------------------------

        database_saved = False

        connection = get_db_connection()

        if connection:

            try:

                cursor = connection.cursor()

                query = """
                    INSERT INTO predictions
                    (
                        device_type,
                        brand,
                        model,
                        original_price,
                        age,
                        ram,
                        storage,
                        battery_health,
                        device_condition,
                        repair_history,
                        warranty,
                        estimated_price
                    )
                    VALUES
                    (
                        %s,
                        %s,
                        %s,
                        %s,
                        %s,
                        %s,
                        %s,
                        %s,
                        %s,
                        %s,
                        %s,
                        %s
                    )
                """


                values = (
                    data.device_type,
                    data.brand,
                    data.model,
                    data.original_price,
                    data.age,
                    data.ram,
                    data.storage,
                    data.battery_health,
                    data.condition,
                    data.repair_history,
                    data.warranty,
                    predicted_price
                )


                cursor.execute(
                    query,
                    values
                )

                connection.commit()

                database_saved = True

                cursor.close()

            except mysql.connector.Error as db_error:

                print(
                    "Database insert error:",
                    db_error
                )

            finally:

                connection.close()


        # -------------------------------------------------
        # Final Response
        # -------------------------------------------------

        return {

            "estimated_price": predicted_price,

            "price_range": {
                "low": low_price,
                "high": high_price
            },

            "midpoint": midpoint,

            "currency": "INR",

            "database_saved": database_saved,

            "message": "Price estimated successfully"

        }


    except HTTPException:

        raise


    except Exception as e:

        print(
            "Prediction Error:",
            str(e)
        )

        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {str(e)}"
        )


# =========================================================
# GET PREDICTION HISTORY
# =========================================================

@app.get("/predictions")
def get_predictions():

    connection = get_db_connection()

    if not connection:

        raise HTTPException(
            status_code=500,
            detail="Database connection failed"
        )


    try:

        cursor = connection.cursor(
            dictionary=True
        )


        query = """
            SELECT
                id,
                device_type,
                brand,
                model,
                original_price,
                age,
                ram,
                storage,
                battery_health,
                device_condition,
                repair_history,
                warranty,
                estimated_price,
                created_at
            FROM predictions
            ORDER BY created_at DESC
        """


        cursor.execute(query)

        results = cursor.fetchall()


        cursor.close()

        connection.close()


        return {
            "total_predictions": len(results),
            "predictions": results
        }


    except mysql.connector.Error as e:

        connection.close()

        raise HTTPException(
            status_code=500,
            detail=f"Database error: {str(e)}"
        )