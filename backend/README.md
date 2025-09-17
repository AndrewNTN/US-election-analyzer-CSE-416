# Backend README — US Election Analyzer (Team LAKERS)

This README is for **any teammate** who wants to run the **backend** locally and hit a couple endpoints so the GUI/preprocessing/server people can start wiring things up.

---

## Whats done right now

A tiny Spring Boot + MongoDB API that:

- boots on **port 8080**
- seeds **3 states** (CA, OR, FL)
- exposes:
  - `GET /api/health` → `"ok"`
  - `GET /api/states/team/LAKERS` → `[{id:"CA"...},{id:"OR"...},{id:"FL"...}]`

---

## Prereqs (everyone)

- **Java 17+** (JDK)
- **Gradle wrapper** (included; no global Gradle needed)
- **MongoDB 7.x** running locally (no auth) on `mongodb://localhost:27017`
  - DB name: `cse416`

### Install Java 17 (macOS)
```bash
brew install openjdk@17
sudo ln -sfn /opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk /Library/Java/JavaVirtualMachines/openjdk-17.jdk
# in your shell
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
export PATH="$JAVA_HOME/bin:$PATH"
java -version  # should show 17.x
```

### Install MongoDB (pick one)

**A) Homebrew service (macOS)**
```bash
brew tap mongodb/brew
brew install mongodb-community@7.0
brew services start mongodb-community@7.0
mongosh --eval 'db.runCommand({ ping: 1 })'  # expect { ok: 1 }
```

**B) Docker (if you have Docker Desktop)**
```bash
docker run -d --name mongo -p 27017:27017 mongo:7
```

---

## Project layout (backend only)

```
backend/
  build.gradle
  settings.gradle
  src/main/java/edu/sbu/cse416/app/
    Application.java
    ApiController.java    # /api/health, /api/states/team/{team}
    State.java            # simple @Document("states")
  src/main/resources/
    application.yml       # Mongo URI + server.port
```

---

## Configure (optional)

`backend/src/main/resources/application.yml`
```yaml
server:
  port: 8080
spring:
  data:
    mongodb:
      uri: ${MONGODB_URI:mongodb://localhost:27017/cse416}
```

You can override the DB via env var:
```bash
MONGODB_URI="mongodb://localhost:27017/cse416" ./gradlew bootRun
```

---

## Run it

From the repo root (or `cd backend` first):

```bash
cd backend
./gradlew clean bootRun
```

You should see Spring Boot start and connect to `localhost:27017`.

---

## Verify it works

In a new terminal:

```bash
curl http://localhost:8080/api/health
# -> ok

curl http://localhost:8080/api/states/team/LAKERS
# -> [{"id":"CA","name":"California","teamTag":"LAKERS"}, {"id":"OR",...}, {"id":"FL",...}]
```

If you get `[]` for the states endpoint, see “Troubleshooting” below to seed manually.

## Seeding data (if needed)

The app auto-seeds CA/OR/FL on first run **if the collection is empty**.  
If you need to seed manually:

```bash
mongosh "mongodb://localhost:27017/cse416" --eval '
db.states.insertMany([
  { _id:"CA", name:"California", teamTag:"LAKERS" },
  { _id:"OR", name:"Oregon",     teamTag:"LAKERS" },
  { _id:"FL", name:"Florida",    teamTag:"LAKERS" }
])'
```

> If your DB has a **unique index on `usps`**, either drop it:
> ```js
> db.states.dropIndex("usps_1") // or: db.states.dropIndex({ usps: 1 })
> ```
> …or insert with `usps` populated:
> ```js
> { _id:"CA", usps:"CA", name:"California", teamTag:"LAKERS" }
> ```

---

## How to stop

```bash
# stop Spring Boot
Ctrl+C    # in the terminal running bootRun

# stop Mongo (Homebrew)
brew services stop mongodb-community@7.0

# stop Mongo (Docker)
docker stop mongo && docker rm mongo
```

---

## Support / Ownership

- **Backend owner(s):** add names here
- **Expected next endpoints:** `/api/states`, `/api/regions/{stateId}?year=2024`, `/api/eavs/{stateId}/{year}`
- **Contact:** Slack channel / group DM



