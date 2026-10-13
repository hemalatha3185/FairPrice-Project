from pathlib import Path

import joblib
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder


BASE_DIR = Path(__file__).resolve().parent
DATASET_PATH = BASE_DIR / "dataset.csv"
MODEL_PATH = BASE_DIR / "fairprice_model.pkl"


df = pd.read_csv(DATASET_PATH)

print("Dataset loaded successfully!")
print("Total records:", len(df))

X = df.drop("resale_price", axis=1)
y = df["resale_price"]

categorical_columns = [
    "device_type",
    "brand",
    "model",
    "condition",
    "repair_history",
    "warranty",
]

numerical_columns = [
    "original_price",
    "age",
    "ram",
    "storage",
    "battery_health",
]

preprocessor = ColumnTransformer(
    transformers=[
        (
            "categorical",
            OneHotEncoder(handle_unknown="ignore"),
            categorical_columns,
        ),
        (
            "numerical",
            "passthrough",
            numerical_columns,
        ),
    ]
)

model = RandomForestRegressor(
    n_estimators=200,
    random_state=42,
    max_depth=10,
)

pipeline = Pipeline(
    steps=[
        ("preprocessor", preprocessor),
        ("model", model),
    ]
)

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
)

print("Training Random Forest model...")
pipeline.fit(X_train, y_train)
print("Model training completed!")

predictions = pipeline.predict(X_test)

mae = mean_absolute_error(y_test, predictions)
mse = mean_squared_error(y_test, predictions)
rmse = mse ** 0.5
r2 = r2_score(y_test, predictions)

print("\n----- MODEL PERFORMANCE -----")
print("MAE :", round(mae, 2))
print("RMSE:", round(rmse, 2))
print("R2  :", round(r2, 4))

joblib.dump(pipeline, MODEL_PATH)

print("\nModel saved successfully!")
print(f"File created: {MODEL_PATH}")
