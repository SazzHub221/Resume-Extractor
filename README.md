<div align="center">
  <img width="100%" src="https://capsule-render.vercel.app/api?type=waving&color=gradient&height=200&section=header&text=PDF%20Extractor&fontSize=80&fontAlignY=35&animation=twinkling&fontColor=white" alt="PDF Extractor Banner"/>
  
  <h1>PDF Extractor</h1>
  
  <div>
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React"/>
    <img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js"/>
    <img src="https://img.shields.io/badge/Express.js-404D59?style=for-the-badge" alt="Express.js"/>
    <img src="https://img.shields.io/badge/Material--UI-0081CB?style=for-the-badge&logo=material-ui&logoColor=white" alt="Material-UI"/>
    <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python"/>
  </div>
</div>

## ✨ Features

- 📤 Easy PDF file upload and processing
- 📝 Accurate text extraction from PDF documents
- 🎨 Modern, user-friendly interface
- 🔒 Secure file handling
- ⬇️ Download extracted text
- 🔍 Search within extracted text
- 📱 Responsive design for all devices

## 🛠️ Tech Stack

### Frontend
- React.js
- Material-UI
- Axios
- PDF.js

### Backend
- Node.js
- Express.js
- Multer
- pdf-parse

## 🚀 Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Git

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/SazzHub221/pdf-extractor.git
   cd pdf-extractor
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd frontend
   npm install
   ```


## 💻 Running the Application

1. **Start the Backend Server**
   ```bash
   cd backend
   npm start
   ```

2. **Start the Frontend Development Server**
   ```bash
   cd frontend
   npm start
   ```

Visit `http://localhost:3000` in your browser to use the application.

## 🔗 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload` | Upload PDF file |
| GET | `/api/extract/:fileId` | Extract text from PDF |
| GET | `/api/files` | Get uploaded files list |
| DELETE | `/api/files/:fileId` | Delete a file |

## 📸 Screenshots

<div align="center">
  <img src="assets/Homepage.png" alt="Homepage" width="600"/>
   <br><br>
  <img src="assets/Extraction.png" alt="Text Extraction" width="600"/>
</div>

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create your feature branch
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. Commit your changes
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```
4. Push to the branch
   ```bash
   git push origin feature/AmazingFeature
   ```
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Contact

Sahil Mittal - [sahilmit2002@gmail.com](mailto:sahilmit2002@gmail.com)

Project Link: [https://github.com/SazzHub221/pdf-extractor](https://github.com/SazzHub221/pdf-extractor)

## 🙏 Acknowledgments

- [pdf-parse](https://www.npmjs.com/package/pdf-parse) for PDF processing
- [React](https://reactjs.org/) for the frontend framework
- [Material-UI](https://material-ui.com/) for the UI components
- All our contributors and supporters

---

<div align="center">
  Made with ❤️ by Sahil Mittal
</div>

## 🚀 Deployment

This project is deployed on Vercel. You can access it at:
[https://your-vercel-deployment-url.vercel.app](https://your-vercel-deployment-url.vercel.app)

### Environment Variables Required for Deployment

```bash
GEMINI_API_KEY=your_gemini_api_key
MONGODB_URI=your_mongodb_uri
FRONTEND_URL=${VERCEL_URL}
```

### Deployment Steps

1. Fork this repository
2. Sign up for Vercel
3. Import your forked repository
4. Configure the environment variables
5. Deploy!

For detailed deployment instructions, see [Vercel's documentation](https://vercel.com/docs).
