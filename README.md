Installation Steps

### 1. Clone the Repository
```bash
git clone "repo-url"
```

### 2. Install Dependencies
```bash
npm install
```



### 3. Run the Application

#### Development Mode (with auto-restart)
```bash
npm run dev
```

#### Production Mode
```bash
npm start
```

##  Testing the API

### Endpoints

#### Create a Patient
```bash
POST http://localhost:3000/api/patients
Content-Type: application/json

{
  "name": "Ronaldo",
  "triageLevel": 3
}
```

#### Get Current Queue
```bash
GET http://localhost:3000/api/queue
```

#### Treat a Patient
```bash
PATCH http://localhost:3000/api/patients/{patient_id}/treat
```

#### Discharge Patient
```bash
PATCH http://localhost:3000/api/patients/{patient_id}/discharge
```

#### Get Critical Patient Alerts
```bash
PATCH http://localhost:3000/api/critical-alerts
```
