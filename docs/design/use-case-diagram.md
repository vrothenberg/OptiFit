# Use Case Diagram

## **Overview**
Use case diagrams illustrate the interactions between users and the OptiFit AI system, highlighting the key functionalities and user roles.

## **Actors**
- **User:** Any individual using the OptiFit AI app for health optimization.
- **Coach/Trainer:** A professional using the app to monitor and guide their clients.
- **Admin:** Responsible for managing the app’s content, user data, and system configurations.

## **Use Cases**
1. **Register/Log In**
   - Users can create an account or log into the app using email/password or social logins via Firebase Authentication.

2. **Log Food**
   - Users can log their meals by taking photos (image recognition) or manually entering food items and quantities.

3. **Log Sleep**
   - Users can track their sleep automatically through wearables or manually input sleep data.

4. **Log Exercise**
   - Users can log workout sessions via wearables or manual entry, including exercise type, duration, and intensity.

5. **View Dashboard**
   - Users can view their key health metrics, trends, and AI-driven insights on the Dashboard.

6. **Receive Recommendations**
   - Users receive personalized recommendations for training, nutrition, and sleep based on their data and Circadian Score.

7. **Interact with AI Assistant**
   - Users can ask questions and receive personalized insights through the AI assistant.

8. **Join Community**
   - Users can participate in community forums, join groups, and engage in challenges.

9. **Access Profile and Settings**
   - Users can manage their profile information, preferences, and app settings.

10. **Monitor Clients (Coach/Trainer)**
    - Coaches can monitor their clients’ progress, access their data, and provide personalized guidance.

11. **Manage Content (Admin)**
    - Admins can manage the app’s content, including research databases, AI models, and user data.

## **Diagram Description**
TODO: *(Create a UML use case diagram using a tool like Lucidchart, draw.io, or similar, mapping the actors to the use cases.)*

---

This document outlines the key interactions between different user roles and the system, helping to clarify functional requirements and guide feature development.

---

## **5. Data Flow Diagrams (DFD)**

**File Path:** `docs/design/data-flow-diagram.md`

### **Content:**

```markdown
# Data Flow Diagram (DFD)

## **Overview**
Data Flow Diagrams illustrate how data moves within the OptiFit AI system, highlighting data sources, processing, storage, and outputs.

## **Level 1 DFD**

### **Processes**
1. **User Authentication**
   - Handles user registration, login, and authentication using Firebase Authentication.

2. **Food Logging**
   - Processes food data from image recognition or manual entry and stores it in the database.

3. **Sleep Tracking**
   - Collects sleep data from wearables or manual input and stores it in the database.

4. **Exercise Logging**
   - Processes exercise data from wearables or manual entry and stores it in the database.

5. **AI Recommendation Engine**
   - Analyzes user data to generate personalized recommendations based on circadian rhythms and health metrics.

6. **Community Management**
   - Facilitates user interactions, forums, and challenges within the app.

### **Data Stores**
1. **User Database**
   - Stores user profiles, preferences, and authentication data.

2. **Health Metrics Database**
   - Stores logged data for food, sleep, exercise, and circadian scores.

3. **Research Database**
   - Contains peer-reviewed studies and scientific research linked to recommendations.

4. **AI Models Database**
   - Stores trained AI models and algorithms used for data analysis and recommendation generation.

### **External Entities**
1. **Wearable Devices**
   - Devices like Apple Watch, Fitbit, Garmin that provide real-time health data.

2. **External APIs**
   - Food databases (USDA, Nutritionix), Google Vision API, OpenAI GPT-4 API.

### **Data Flows**
- **User Authentication Data:** Flow from User to User Authentication process, then to User Database.
- **Food Data:** Flow from User to Food Logging process, then to Health Metrics Database.
- **Sleep Data:** Flow from Wearables to Sleep Tracking process, then to Health Metrics Database.
- **Exercise Data:** Flow from Wearables to Exercise Logging process, then to Health Metrics Database.
- **AI Recommendations:** Data from Health Metrics Database and Research Database flow into AI Recommendation Engine, which outputs recommendations to the User Dashboard.
- **Community Interactions:** Data flows between Users and Community Management process, stored in Health Metrics Database.

## **Diagram Description**
TODO: *(Create a DFD using a tool like Lucidchart, draw.io, or similar, representing the data flows as described.)*
