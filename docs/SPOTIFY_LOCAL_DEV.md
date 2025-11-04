# Spotify Local Development - Important

## Use 127.0.0.1, NOT localhost

Spotify requires explicit loopback addresses for local development.

### WRONG:
- http://localhost:3000
- http://localhost:5500

### CORRECT:
- http://127.0.0.1:3000
- http://127.0.0.1:5500

## Spotify Redirect URIs to Add:

Production:
```
https://omegaterminalupdated-rose.vercel.app/pages/spotify-callback.html
```

Local Development:
```
http://127.0.0.1:3000/pages/spotify-callback.html
http://127.0.0.1:5500/pages/spotify-callback.html
http://127.0.0.1:8080/pages/spotify-callback.html
```

Remove any localhost URLs from Spotify Dashboard!

## How to Access:

Instead of:
```
http://localhost:5500
```

Use:
```
http://127.0.0.1:5500
```

Reference: Spotify Authorization Guide


