- Now let's use enums for these extinguisher fields:
type: Water, C02, Foam, Dry Chemical
size: 2.5 lbs, 5lbs, 9 lbs, 12 lbs

- let's also add email OTP using smtp, require env vars for smtp to work
environment vars added are to be passed also in docker-compose.yml for that service (where it imports from .env)