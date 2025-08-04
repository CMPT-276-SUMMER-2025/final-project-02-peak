# TRIPINARY

## Group Members
- John Camino
- Lilian Pham
- Beverly Yen
- Renz Gabrinao

## Project Description


Tripinary is an AI-assisted trip planning tool that generates personalized itineraries based on the user's city of choice and duration of stay. Our application uses these user inputs to generate suggestions of activities that the user can pick from. For example, the user can choose from a carousel of restaurants, outdoor activities, cultural events, etc., and the website will compile an itinerary for them based on these preferences. The itinerary will contain a list of time stamped activities that the user can follow each day, consisting of selection preferences from earlier. At the bottom of this itinerary page, there is a prompt box that allows the user to regenerate their itinerary. Once users are satisfied with their itinerary, they can press on individual activities, which will take them to a slide-out page containing a map of the activity on their itinerary and the latest five reviews of that specific activity. 

Our application focuses on helping users plan trips and create daily itineraries for them to follow while on their trip. Tripinary tailors suggestions based on the users’ preferences and needs. The following are some user groups that will benefit from using this app; students looking for a budget-friendly vacation, hobbyists looking for unique experiences, local residents exploring hidden gems in their city, professionals organizing business travel schedules, and avid travellers chasing their next adventure. By leveraging AI, our application serves as a fast and simple planning tool for travelers who want to avoid the hassle of researching and organizing their trips. It generates a customizable itinerary suited for each person. For more information regarding specific user groups and stories that our application addresses, please refer to User Groups & Personas in Section 4 and User Stories in Section 5. 

Our team came up with this idea because our group consists of international students and travel enthusiasts who like to go on trips. We often have places we want to go, but planning certain activities at each destination can be time consuming and overwhelming. Tripinary is an important app because it allows travellers to plan trips all in one place without having to search through reviews and sites just to find a few good options. Our app has AI-generated itineraries and displays the activities on the map based on individual user preferences. This not only saves time but also encourages people to discover new destinations they might not have considered. 

## Links to our project website, videos, and reports

Website: https://tripinary-one.vercel.app

Videos: https://drive.google.com/file/d/1Gi2XDRzjWVgM63WsmcStREryLiFIOg21/view?usp=sharing

Reports: final-project-02-peak/docs/

## Instructions to deploy our app locally

### Run App Locally: 

#### - 1. Clone the repository locally 
  **A)** In the repository, click on the <> Code dropdown button 
  
  **B)** Under HTTPS, copy the URL to clone 
  
  **C** Open your terminal (assuming you have git and node installed), type ‘git clone [copied URL]. 

#### - 2. Once cloned, navigate to the ‘Tripinary’ folder 
  a) In the terminal, while you are in the final-project- 02-peak, type ‘cd src’ then ‘cd Tripinary’

#### 3. Add the .env file with the provided API keys
  a) Place the provided env file in both the root folder (/Tripinary) and the backend folder (/Tripinary/backend)

#### 4. Install all dependencies by typing ‘npm install’ in the terminal in both the root (/Tripinary) and the backend folder (/Tripinary/backend) 

#### 5. Run the backend server first
  a) Navigate to the backend folder in the terminal inside Tripinary using the command ‘cd backend’
  
  b) Install the dependencies inside the backend folder by typing ‘npm install’
  
  c) Run the backend server by typing  ‘npm start’ (runs on localhost: 5000) or ‘node server.js’

#### 4. Run the frontend server 
  a) Return to the Tripinary folder by typing ‘cd ..’ 
  
  b) Run the frontend server by typing ‘npm run dev’ (runs on localhost: 5173)

### Run Tests Locally: 
#### 1. Inside the repository, navigate to the Tripinary folder again, similar to the steps above. 
#### 2. Type ‘npx vitest’ to run the tests. 

