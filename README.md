# FairPrice – Used Electronics Price Estimator

A React + FastAPI + Random Forest based prototype for estimating a fair resale price range for used electronics.

## Technologies

- React.js + Vite
- HTML/CSS/JavaScript
- Python
- FastAPI
- REST API
- Pandas
- NumPy
- Scikit-learn
- Random Forest Regressor
- Joblib

MySQL and AWS are planned next-stage components and are not required to run the current local ML prototype.

## Project structure

```text
FairPrice_Project/
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── backend/
    ├── main.py
    ├── train_model.py
    ├── dataset.csv
    ├── requirements.txt
    └── fairprice_model.pkl
```

## Run backend

Open PowerShell:

```powershell
cd "backend"
pip install -r requirements.txt
python train_model.py
python -m uvicorn main:app --reload
```

Backend:
`http://127.0.0.1:8000`

Swagger:
`http://127.0.0.1:8000/docs`

## Run frontend

Open a second PowerShell:

```powershell
cd "frontend"
npm install
npm run dev
```

Open:
`http://localhost:5173/`

## Important dataset note

The included CSV is a small demonstration dataset for development/testing. It is not a representative market dataset and should not be used to claim real-world pricing accuracy. For the final academic project, replace it with a larger, credible dataset and report MAE, RMSE and R² on a proper held-out test set.

## Current limitations

- MySQL persistence is not included yet.
- AWS deployment is not included yet.
- The current dataset is small and illustrative.
