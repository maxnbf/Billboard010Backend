To deploy the function to firebase:

```
firebase deploy ---only functions
```

To debug locally with emulator

```
firebase emulators:start
```

Common issues

- If you get the error "Failed to list Firebase projects."
  **Try the command `firebase login --reauth`**
- You may need to run `npm install` in the _functions_ directory
