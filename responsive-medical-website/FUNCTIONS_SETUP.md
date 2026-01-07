# Firebase Cloud Functions Setup

This guide explains how to set up and deploy the Cloud Functions needed to list all Firebase Authentication users in the admin portal.

## Prerequisites

1. **Firebase CLI** installed globally:
   ```bash
   npm install -g firebase-tools
   ```

2. **Firebase login**:
   ```bash
   firebase login
   ```

3. **Node.js** version 18 or higher (required for Cloud Functions)

## Setup Steps

### 1. Initialize Firebase Functions (if not already done)

Navigate to the project root and initialize Firebase (if you haven't already):
```bash
cd responsive-medical-website
firebase init functions
```

**Note:** If asked, choose:
- Use an existing project: `mentalmed-8bd8c`
- Language: JavaScript
- ESLint: Yes (optional)
- Install dependencies: Yes

### 2. Install Dependencies

Navigate to the functions directory and install dependencies:
```bash
cd functions
npm install
cd ..
```

### 3. Deploy Cloud Functions

Deploy the functions to Firebase:
```bash
firebase deploy --only functions
```

This will deploy:
- `listUsers` - Callable function to list all users
- `listUsersHTTP` - HTTP endpoint to list all users

### 4. Verify Deployment

After deployment, Firebase will provide URLs for your functions:
```
✔  functions[listUsers(us-central1)] Successful create operation.
✔  functions[listUsersHTTP(us-central1)] Successful create operation.

Function URL (listUsersHTTP): https://us-central1-mentalmed-8bd8c.cloudfunctions.net/listUsersHTTP
```

### 5. Update Admin Portal

The admin portal will automatically detect and use the Cloud Function. If you need to manually set the function URL, you can edit `assets/js/admin.js` and update the `httpFunctionUrl` variable in the `fetchAllFirebaseUsers` function.

## Testing

1. Open the admin portal (`admin.html`)
2. Log in with your admin account (`kamaleshmotamarri@gmail.com`)
3. Click "Refresh" or the page should automatically load all Firebase Auth users

## Troubleshooting

### Function Not Found Error

If you see "Cloud Function not available" error:
- Verify the function is deployed: `firebase functions:list`
- Check the function logs: `firebase functions:log`
- Ensure you're using the correct project ID

### Permission Denied Error

If you see "Only administrators can list users":
- Verify you're logged in with the admin email (`kamaleshmotamarri@gmail.com`)
- Check the `ADMIN_EMAIL` constant in `functions/index.js` matches your admin email

### CORS Errors

If you see CORS errors:
- The HTTP function already includes CORS headers
- Make sure you're calling the function from an authorized domain
- Check Firebase Console → Functions → Settings for allowed domains

## Security Notes

⚠️ **Important:**
- The Cloud Functions verify that only the admin email can access the user list
- Never expose service account keys in client-side code
- The functions use Firebase Admin SDK which has elevated permissions
- Always verify admin access on the server side (which the functions do)

## Local Development

To test functions locally:

```bash
firebase emulators:start --only functions
```

Then update the function URL in `admin.js` to use:
```
http://localhost:5001/mentalmed-8bd8c/us-central1/listUsersHTTP
```

## Updating Functions

After making changes to `functions/index.js`:

```bash
firebase deploy --only functions
```

## Additional Resources

- [Firebase Functions Documentation](https://firebase.google.com/docs/functions)
- [Firebase Admin SDK Documentation](https://firebase.google.com/docs/admin/setup)
- [Cloud Functions Pricing](https://firebase.google.com/pricing)

