# Frontend Setup

## Connect to the deployed backend

Create a file named `.env` in the frontend folder and add your backend URL:

```env
VITE_API_URL=https://your-backend-url.com
```

You can also use:

```env
VITE_BACKEND_URL=https://your-backend-url.com
```

If your backend is deployed at a path like `https://your-backend-url.com/api`, the app will use it directly. If it is deployed without `/api`, the helper will automatically append `/api`.

## Run locally

```bash
npm install
npm run dev
```

## Build for production

```bash
npm run build
```
