# Backend README — US Election Analyzer (Team LAKERS)

This README is for **any teammate** who wants to run the **backend** locally and hit the available endpoints for the election data analysis system.

---

## Summary

A comprehensive Spring Boot + MongoDB API that:

- Runs on **port 8080**
- Implements layered architecture (Controller → Service → Repository → Model + DTOs)
- Handles **EAVS (Election Administration and Voting Survey)** data
- Includes automatic code formatting with Spotless and Palantir Java Format
- Exposes multiple REST endpoints for election data

### Available Endpoints

**Health Check:**
- `GET /api/health` → `"ok"`

**States:**
- `GET /api/states` → All states
- `GET /api/states/{id}` → Specific state by ID
- `GET /api/states/team/{team}` → States by team tag (e.g., `LAKERS`)

**EAVS Data:**
- `GET /api/eavs/states?electionYear={year}` → Aggregated state-level EAVS data
- `GET /api/eavs/states/{stateAbbr}?electionYear={year}&includeJurisdictions={true|false}` → State with optional jurisdiction details
- `GET /api/eavs/jurisdictions/{fipsCode}?electionYear={year}` → Specific jurisdiction data

---

## Prerequisites

- **Java 17+** (JDK)
- **Gradle wrapper** (included; no global Gradle needed)
- **MongoDB 7.x+** running locally (no auth) on `mongodb://localhost:27017`
  - DB name: `cse416`

### Install Java 17

**Windows:**
1. Download OpenJDK 17 from [Adoptium](https://adoptium.net/) or [Oracle](https://www.oracle.com/java/technologies/downloads/#java17)
2. Install and set JAVA_HOME environment variable
3. Add `%JAVA_HOME%\bin` to your PATH
4. Verify: `java -version` (should show 17.x)

**macOS:**
```bash
brew install openjdk@17
sudo ln -sfn /opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk /Library/Java/JavaVirtualMachines/openjdk-17.jdk
# in your shell
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
export PATH="$JAVA_HOME/bin:$PATH"
java -version  # should show 17.x
```

### Install MongoDB

**Windows:**
1. Download MongoDB Community Server 7.x from [MongoDB Downloads](https://www.mongodb.com/try/download/community)
2. Install as a Windows Service
3. Verify: `mongosh --eval "db.runCommand({ ping: 1 })"` (expect `{ ok: 1 }`)

**macOS (Homebrew):**
```bash
brew tap mongodb/brew
brew install mongodb-community@7.0
brew services start mongodb-community@7.0
mongosh --eval 'db.runCommand({ ping: 1 })'  # expect { ok: 1 }
```

**Docker (Cross-platform):**
```bash
docker run -d --name mongo -p 27017:27017 mongo:7
```

---

## Project Structure

```
backend/
  build.gradle                    # Dependencies and build config
  settings.gradle
  gradlew / gradlew.bat          # Gradle wrapper scripts
  src/main/java/edu/sbu/cse416/app/
    Application.java             # Spring Boot main class
    controller/
      ApiController.java         # State management endpoints
      EavsController.java        # EAVS data analysis endpoints
    service/
      StateService.java          # State business logic interface
      StateServiceImpl.java      # State service implementation
      EavsAggregationService.java # EAVS data aggregation logic
    repository/
      StateRepository.java       # State data access
      EavsDataRepository.java    # EAVS data access
    model/
      State.java                 # State entity
      EavsData.java             # EAVS raw data entity
      VoterRegistration.java     # Voter registration data
      VotingEquipment.java       # Voting equipment data
      EquipmentDetail.java       # Equipment details
      MailBallots.java          # Mail ballot data
      ProvisionalBallots.java    # Provisional ballot data
    dto/
      StateEavsData.java        # State-level aggregated data
      StateWithJurisdictions.java # State with jurisdiction details
      JurisdictionSummary.java   # Jurisdiction summary data
    config/
      DataSeeder.java           # Database seeding configuration
  src/main/resources/
    application.yml             # MongoDB URI + server config
```

---

## Configuration

The application is configured via `application.yml`:

```yaml
server:
  port: 8080
spring:
  data:
    mongodb:
      uri: mongodb://localhost:27017/cse416
```

You can override the database URI via environment variable:
```bash
# Windows
set MONGODB_URI=mongodb://localhost:27017/cse416
gradlew.bat bootRun

# macOS/Linux
MONGODB_URI="mongodb://localhost:27017/cse416" ./gradlew bootRun
```

---

## Running the Application

**From project root:**
```bash
cd backend
```

**Windows:**
```bash
.\gradlew.bat clean bootRun
```

**macOS/Linux:**
```bash
./gradlew clean bootRun
```

The application will:
1. Start Spring Boot on port 8080
2. Connect to MongoDB at `localhost:27017`
3. Auto-seed initial data if collections are empty
4. Apply code formatting (Spotless) during build

---

## API Usage Examples

**Health Check:**
```bash
curl http://localhost:8080/api/health
# → "ok"
```
---

## Database Seeding

The application automatically seeds sample data on first run via `DataSeeder.java`. If you need to manually seed or reset data, use MongoDB shell:

```bash
mongosh "mongodb://localhost:27017/cse416"
```

Then run seeding commands as needed for your specific data sets.

---

## Stopping the Application

```bash
# Stop Spring Boot
Ctrl+C    # in the terminal running bootRun

# Stop MongoDB (Windows Service)
net stop MongoDB

# Stop MongoDB (macOS Homebrew)
brew services stop mongodb-community@7.0

# Stop MongoDB (Docker)
docker stop mongo && docker rm mongo
```

## Development

Please run a full gradle build before committing, this will ensure code formatting is applied:

```bash
./gradlew clean build
```