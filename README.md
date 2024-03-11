# Multi-Lingual Speech App

## Overview
The Multi-Lingual Speech App uses AI to automate the flow from audio recording through translation to speech synthesis. This application is designed to transcribe speech into text, translate the text from English to Spanish or French, and then synthesize the translated text back into speech.

## Demo Video
https://github.com/Op27/Multi-Lingual-Speech-App/assets/39921621/2780fbf1-67fa-4e61-89f1-785770681473



## Key Features
- **Automated Audio Processing Workflow:** Streamlines the process of converting spoken words into another language's speech output.
- **Speech-to-Text Transcription:** Utilizes [Google Speech-to-Text](https://cloud.google.com/speech-to-text?hl=en) API to accurately transcribe audio recordings into text.
- **Multi-Language Translation:** Employs [DeepL API](https://www.deepl.com/en/docs-api) for high-quality translations from English to Spanish or French.
- **Text-to-Speech Synthesis:** Uses [Google Text-to-Speech API](https://cloud.google.com/text-to-speech?hl=en) to generate natural-sounding speech in Spanish or French from the translated text.

## How to Use
1. Choose your target language (Spanish or French) from dropdown. 
2. Start by recording your speech through the application interface.
3. The app automatically transcribes the speech into text using the Google Speech-to-Text API.
4. The app translates the text using DeepL
5. Finally, listen to the translated speech, synthesized by the Google Text-to-Speech API.

## Installation
See the setion below titled "Installation Guide".

## License
This project is licensed under the [MIT License](https://opensource.org/license/mit/). See the LICENSE file for details.

--- --- ---
## Installation Guide

This section guides you through setting up the Multi-Lingual Speech App on your local machine for development and testing purposes. Follow these steps to get a copy of the project up and running.

### Prerequisites

Before installing the application, ensure you have the following:
- Python 3.6 or later installed on your system.
- Pip for installing Python packages.

### Obtaining API Keys

1. **Google Cloud Speech-to-Text and Text-to-Speech APIs:**
   - Visit the [Google Cloud Console](https://console.cloud.google.com/).
   - Create a new project or select an existing one.
   - Enable the Speech-to-Text and Text-to-Speech APIs for your project.
   - Go to the "Credentials" page and create a new API key for your application.

2. **DeepL API:**
   - Sign up for an account at [DeepL](https://www.deepl.com/pro#developer).
   - Access the API subscription page and subscribe to a plan that suits your needs.
   - Obtain your DeepL API key from the account overview or API plan details.

### Setting Up the Application

1. **Clone the Repository:**
   - Clone this repository to your local machine using `git clone https://github.com/Op27/Multi-Lingual-Speech-App.git`.

2. **Install Dependencies:**
   - Navigate to the project directory and install the required Python packages using:
     ```
     pip install -r requirements.txt
     ```

3. **Configure API Keys:**
   - For security reasons, it's best to set your API keys as environment variables. On your system, set the following variables:
     - For Windows:
       ```
       set GOOGLE_APPLICATION_CREDENTIALS="path_to_your_google_credentials_json_file"
       set DEEPL_API_KEY="your_deepl_api_key"
       ```
     - For Unix/Linux/Mac:
       ```
       export GOOGLE_APPLICATION_CREDENTIALS="path_to_your_google_credentials_json_file"
       export DEEPL_API_KEY="your_deepl_api_key"
       ```
   - Replace `path_to_your_google_credentials_json_file` with the path to the JSON file containing your Google Cloud credentials, and `your_deepl_api_key` with your actual DeepL API key.

4. **Run the Application:**
   - With the environment variables set and dependencies installed, you can now run the application. Navigate to the app's directory and execute:
     ```
     python app.py
     ```

5. **Accessing the Application:**
   - Open your web browser and go to `http://localhost:5000` (or whichever port your application runs on) to start using the app.

