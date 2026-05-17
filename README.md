# Smart Leftovers

![](https://i.ibb.co/QFHgnMS6/Smart-Leftovers.avif)

Smart Leftovers is a food inventory app that helps users save food items, track expiry dates, extract food information from iages, and ask ChefBot for leftover recipe ideas.
## How to run the application

### 1. Install the following:
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
	- In VS Code, install the Docker extension. Before running the program, ensure that Docker Desktop is open.
- [Node.js](https://nodejs.org/en/download)
	- In your terminal, run `npm install expo`
- On your phone, download the [Expo Go](https://expo.dev/go) application.
- [ngrok](https://ngrok.com/download/windows)
	- Add your authtoken `ngrok config add-authtoken "<YOUR_AUTHTOKEN>"`

Then, clone this GitHub repository.
## 2. Obtain the following strings:
- `GEMINI_KEY` - A Gemini API key used for image text extraction and ChefBot
- `MONGO_DB_URI` - MongoDB connection string
- Create a file named `.env` in the `frontend` folder - public Expo/Firebase config values
### 2.1 Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/api-keys).
2. Sign in with your Google account
3. Click **Create API key**
4. Choose an existing Google Cloud project or create a new one.
5. Copy the API key.
6. Use it as `GEMINI_KEY` when running the backend.

For more information, visit [Gemini API quickstart](https://ai.google.dev/gemini-api/docs/quickstart).
### 2.2 `MONGO_DB_URI`
The string follows the format `"mongodb+srv://{username}:{password}@user-data.dj9ypuo.mongodb.net/?appName=user-data"`.
You may use `"mongodb+srv://docker:docker@user-data.dj9ypuo.mongodb.net/?appName=user-data"`.

### 2.3 `frontend\.env`
For security reasons, do not put `GEMINI_KEY` or `MONGO_DB_URI` in this file.

Paste the following text into the file:

```Bash
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyCxksPua1lnVWkGvmf9bxv68QVPCrUmWQY
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=smartleftovers-bd84f.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID =smartleftovers-bd84f
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=smartleftovers-bd84f.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=467588280044
EXPO_PUBLIC_FIREBASE_APP_ID=1:467588280044:web:9068234d00757419027fc9
EXPO_PUBLIC_API_URL = https://tartly-electrostatic-adrien.ngrok-free.dev
```

## 3. Running the application

### Run on web
1. Go to the project root: `cd C:\Users\witta\Documents\smartleftovers-app`
2. Paste the following commands
```Bash
$env:GEMINI_KEY="your_gemini_key_here"
$env:MONGO_DB_URI="mongodb+srv://docker:docker@user-data.dj9ypuo.mongodb.net/?appName=user-data"

docker compose up --build
```

3. Open http://localhost:8081 in your browser.
This starts the Flask backend (`http://localhost:5000`), and the Expo web frontend (`http://localhost:8081`).

### Run on mobile
1. Go to the project root: `cd "C:\Users\winpi\Documents\GitHub\smartleftovers-app"`
2. Paste the following commands
```Bash
$env:GEMINI_KEY="your_gemini_key_here"
$env:MONGO_DB_URI="mongodb+srv://docker:docker@user-data.dj9ypuo.mongodb.net/?appName=user-data"

docker compose up --build backend
```
3. In a second terminal, expose the backend so that it is reachable via phone
```Bash
ngrok http 5000
```
This will give you the ngrok link.
4. In a third terminal, run
```Bash
$env:EXPO_PUBLIC_API_URL="your_ngrok_link_here"
cd frontend
npx expo start --tunnel --clear
```

5. Scan the QR code with your camera.
The mobile command runs Expo locally with `--tunnel` because it is more reliable than running Expo Go through Docker on Windows.

## Important Notes

- Web Docker mode is for browser testing. It does not create an Expo Go QR code.
- Mobile mode should run Expo locally with `npx expo start --tunnel --clear`.
- Firebase `EXPO_PUBLIC_*` values are public app config.

---
# About this project
The project is split into two main folders:

- `frontend/` - Expo / React Native app
- `backend/` - Flask API connected to MongoDB and Gemini

## How The App Works

1. The user logs in or signs up with Firebase Authentication.
2. The frontend sends the Firebase user id to the Flask backend.
3. The backend stores that user’s food list in MongoDB.
4. The user can add food manually or take/upload a food photo.
5. If the user extracts from an image, the frontend sends the image to the backend.
6. The backend sends the image to Gemini and returns extracted food fields.
7. The user reviews and saves the food item.
8. The Notifications tab checks saved food quantities and expiry dates.
9. The user can choose saved foods and send them to ChefBot.
10. ChefBot uses Gemini to suggest a recipe based on selected leftovers.

## Main Technologies Used

### Frontend

- Expo Router for screen navigation
- React Native for mobile/web UI
- Firebase Authentication for login and sign up
- AsyncStorage for local notification settings
- Expo Camera for taking food photos
- Expo FileSystem for converting native images to base64
- Fetch API for calling the Flask backend

### Backend

- Flask for API routes
- Flask-CORS so the Expo app can call the API
- PyMongo for MongoDB access
- Pydantic for food item validation
- Google Gemini API for image extraction and ChefBot replies
- Docker for running the backend container

## Code Structure

### `frontend/app`

This folder contains the app screens.

- `frontend/app/_layout.tsx`
  - Defines the root navigation stack.
  - Handles the web-only session reset so the browser does not automatically stay logged in after reopening.

- `frontend/app/login.tsx`
  - Lets existing users log in with Firebase.
  - Calls `/create-user` so MongoDB has a matching user document.

- `frontend/app/signUp.tsx`
  - Creates a new Firebase account.
  - Creates the matching backend user document.

- `frontend/app/(tabs)/index.tsx`
  - Main food inventory screen.
  - Loads saved foods from the backend.
  - Handles add, edit, delete, filter, image preview, image extraction, and ChefBot ingredient selection.

- `frontend/app/(tabs)/ChatScreen.tsx`
  - Chat interface for ChefBot.
  - Sends messages, selected foods, previous chat history, and servings to the backend.

- `frontend/app/(tabs)/NotificationsScreen.tsx`
  - Creates local notification cards from saved food data.
  - Checks expiry dates and zero quantity items.

- `frontend/app/(tabs)/SettingsScreen.tsx`
  - Lets users change email, change password, toggle notification settings, and log out.

### `frontend/components`

This folder contains reusable UI pieces.

- `components/home/FoodCard.tsx`
  - Displays one saved food item.
  - Handles image preview, edit menu, delete menu, and web image reattachment.

- `components/home/FoodFormModal.tsx`
  - Add/edit food form.
  - Holds inputs for name, type, expiry date, purchase date, amount, unit, and description.
  - Triggers Gemini image extraction when requested.

- `components/home/CameraFoodModal.tsx`
  - Opens the camera inside a modal.
  - Sends the captured image URI back to the Home screen.

- `components/CameraCapture.tsx`
  - Uses Expo Camera.
  - Requests camera permission.
  - Captures a photo and returns the local URI.

- `components/home/FilterModal.tsx`
  - Lets the user filter by food type and sort by name.

- `components/home/IngredientPickerModal.tsx`
  - Lets the user select saved foods and serving count before opening ChefBot.

- `components/home/ImagePreviewModal.tsx`
  - Shows a full-screen preview of a food image.

- `components/home/HomeActionButtons.tsx`
  - Bottom action buttons for filter, add food, and ChefBot.

- `components/ui/icon-symbol.tsx`
  - Maps icon names to Material Icons so the app can use consistent tab/action icons.

- `components/haptic-tab.tsx`
  - Adds light haptic feedback when pressing tabs on iOS.

### `frontend/lib`

This folder contains shared frontend logic.

- `lib/api.tsx`
  - Stores the backend URL helper.
  - Adds JSON headers.
  - Adds `ngrok-skip-browser-warning` for mobile testing through ngrok.
  - Parses backend JSON responses.

- `lib/analyzeImageWithGemini.tsx`
  - Builds image upload form data.
  - Handles web blob images and native file URI images.
  - Sends the image to `/analyze-image`.
  - Cleans and parses Gemini’s JSON response.

- `lib/chatWithGemini.tsx`
  - Sends chat messages, history, selected ingredients, and servings to `/chat`.

- `lib/imageStorage.tsx`
  - Converts images into base64 data URIs.
  - Helps make native-captured images visible later on web.

- `lib/notificationSettings.tsx`
  - Saves and loads notification preferences with AsyncStorage.

- `lib/userFriendlyError.tsx`
  - Converts technical Firebase/backend errors into readable user messages.

- `lib/webAuthSession.tsx`
  - Uses browser `sessionStorage` to prevent automatic web login after reopening the app.

### `frontend/config`

- `config/firebaseConfig.tsx`
  - Initializes Firebase using `EXPO_PUBLIC_*` values.
  - Exports the Firebase Auth instance.

### `backend`

This folder contains the Flask API.

- `backend/main.py`
  - Starts the Flask app.
  - Defines API routes.
  - Calls Gemini for image extraction and ChefBot.

- `backend/database.py`
  - Connects to MongoDB.
  - Creates users.
  - Adds, loads, updates, deletes, and filters food items.

- `backend/model.py`
  - Defines the `FoodItem` Pydantic model.
  - Generates a unique `food_id` for each food item.

- `backend/Dockerfile`
  - Builds the backend Docker image.
  - Installs Python dependencies from `backend/pyproject.toml`.
  - Runs `python main.py`.

- `backend/pyproject.toml`
  - Lists backend Python dependencies.

### Root Files

- `docker-compose.yml`
  - Runs backend and frontend for web testing.
  - Passes `GEMINI_KEY` and `MONGO_DB_URI` from the terminal into the backend container.

- `README.md`
  - Project instructions and architecture explanation.

## API Routes

- `GET /`
  - Health check route.

- `POST /create-user`
  - Creates a MongoDB user document for a Firebase user id.

- `GET /foods`
  - Loads saved foods for a user.

- `POST /add-food`
  - Adds a food item.

- `PUT /update-food`
  - Updates an existing food item.

- `DELETE /delete-food`
  - Deletes one food item.

- `DELETE /delete-account`
  - Deletes a user document.

- `POST /analyze-image`
  - Sends an uploaded food image to Gemini and returns extracted food details.

- `POST /chat`
  - Sends selected ingredients and chat context to Gemini for a recipe response.

## Environment Variables

Backend private values:

```powershell
$env:GEMINI_KEY="your_gemini_key_here"
$env:MONGO_DB_URI="your_mongodb_uri_here"
```

Frontend public values go in `frontend/.env`:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...
EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=...
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
EXPO_PUBLIC_FIREBASE_APP_ID=...
EXPO_PUBLIC_API_URL=http://localhost:5000
```

For mobile tunnel testing, set `EXPO_PUBLIC_API_URL` in the terminal to your ngrok URL before starting Expo.
- Gemini and MongoDB values are private and should only be passed to the backend.
- Do not commit `.env` files.
