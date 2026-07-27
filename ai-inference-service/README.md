# AI Inference Service (AgroSamridhi)

Member 3 ka microservice. Teen AI-powered modules Gemini Vision API ka use karke:

1. **Soil Health Card OCR** — soil card image se N, P, K, pH extract
2. **Crop Suggestion** — soil + budget + season se 3-year rotation plan (rule engine + Gemini)
3. **Pest & Disease Diagnosis** — crop image se disease diagnosis + remedies

Port: **8084**

---

## Setup

### 1. Gemini API key chahiye
[Google AI Studio](https://aistudio.google.com) se free API key le lo.

### 2. Environment variable set karo
Key ko environment variable `GEMINI_API_KEY` mein daalo (code/yml mein hardcode NAHI).

**Eclipse:** Run → Run Configurations → Environment tab → Add → Name: `GEMINI_API_KEY`, Value: `<your-key>`

**Command line (Windows):**
```
set GEMINI_API_KEY=your-key-here
```

### 3. Lombok install karo (Eclipse ke liye zaroori)
```
java -jar ~/.m2/repository/org/projectlombok/lombok/<version>/lombok-<version>.jar
```
Installer window → Eclipse select → Install/Update → Eclipse restart.

### 4. Run karo
```
./mvnw spring-boot:run
```
Ya Eclipse mein: Run As → Spring Boot App

---

## API Endpoints

All under base: `http://localhost:8084`

### 1. Soil OCR
```
POST /api/ai/soil-ocr
Body: form-data, key "file" (type File), value: soil card image
```

### 2. Pest Diagnosis
```
POST /api/ai/pest-diagnosis
Body: form-data, key "file" (type File), value: diseased crop image
```

### 3. Crop Suggestion
```
POST /api/ai/crop-suggestions
Body: raw JSON
{
  "nitrogen": 200.63,
  "phosphorus": 45.19,
  "potassium": 122.85,
  "ph": 6.5,
  "budget": 40000,
  "location": "Pune, Maharashtra",
  "farmSizeAcres": 5.0,
  "season": "KHARIF"
}
```

### Swagger UI
```
http://localhost:8084/swagger-ui.html
```

---

## Architecture

```
Controller → Service → GeminiClient → Gemini API
                    ↘ CropRuleEngine (crop suggestion only)
```

- **Controller**: HTTP request/response (patla layer)
- **Service**: business logic, prompt banana, response parse
- **GeminiClient**: shared Gemini API wrapper (analyzeImage + analyzeText)
- **ImageUtils**: image → base64 helper
- **CropRuleEngine**: deterministic crop filtering (soil + season + budget rules)

---

## Notes

- Eureka abhi `enabled: false` hai (local testing). discovery-server chalu hone par `application.yml` mein `true` kar dena.
- Model: `gemini-flash-latest` (alias, hamesha latest flash pe point karta hai).
