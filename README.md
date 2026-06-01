Jarvis AI — Asistente IA Personal
Jarvis AI es un asistente personal full stack inspirado en una interfaz tipo comando. El proyecto integra chat conversacional, agentes especializados, memoria por sesión, voz, análisis de documentos PDF y análisis de imágenes desde una experiencia visual futurista construida con Next.js y FastAPI.
> Proyecto en desarrollo para explorar integración de IA aplicada a productividad, estudio, programación y análisis multimodal.
---
Vista general
El sistema está dividido en dos capas principales:
Frontend: interfaz web en Next.js, React, Tailwind CSS y Framer Motion.
Backend: API en FastAPI para orquestar chat, memoria, agentes, voz, documentos, visión y automatización.
```txt
iaAsistente/
├── backend/
│   ├── agents/              # Lógica de agentes especializados
│   ├── api/routes/           # Endpoints REST del asistente
│   ├── core/                 # Configuración, base de datos y modelos
│   ├── knowledge/            # Base de conocimiento / recursos RAG
│   └── main.py               # Entrada principal de FastAPI
│
└── frontend/
    ├── app/                  # App Router de Next.js
    ├── componets/            # Componentes visuales del asistente
    ├── hooks/                # Hooks de chat, voz y memoria
    └── public/               # Recursos estáticos
```
---
Funcionalidades
Chat IA
Interfaz principal para conversar con el asistente, enviar mensajes y recibir respuestas desde el backend.
Agentes especializados
Selector de agentes para diferentes tipos de tareas:
Chat general
Investigación
Programación
Creación de contenido
Productividad
Carrera profesional
Memoria conversacional
Persistencia de mensajes por sesión para mantener contexto básico durante la interacción.
RAG con documentos
Carga de archivos PDF y consultas sobre el contenido del documento.
Visión artificial
Carga de imágenes para análisis y descripción mediante IA.
Voz
Soporte para transcripción de audio y respuesta hablada usando capacidades del navegador y endpoints del backend.
---
Stack técnico
Frontend
Next.js 16
React 19
TypeScript
Tailwind CSS 4
Framer Motion
Web Speech API
Backend
Python
FastAPI
SQLAlchemy
Pydantic Settings
Arquitectura modular por rutas
Variables de entorno con `.env`
---
Endpoints principales
```txt
POST   /api/chat
POST   /api/agents/run
POST   /api/voice/transcribe
GET    /api/memory/conversation/{session_id}
POST   /api/memory/conversation
DELETE /api/memory/conversation/{session_id}
POST   /api/documents/upload/{session_id}
POST   /api/documents/query/{session_id}
POST   /api/vision/analyze
```
---
Instalación local
1. Clonar el repositorio
```bash
git clone https://github.com/Manu9099/iaAsistente.git
cd iaAsistente
```
2. Configurar backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
Crea un archivo `.env` dentro de `backend/`:
```env
GROQ_API_KEY=tu_api_key
DATABASE_URL=sqlite:///./jarvis.db
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:8000/api/auth/callback
```
3. Configurar frontend
```bash
cd ../frontend
npm install
npm run dev
```
La aplicación estará disponible en:
```txt
http://localhost:3000
```
El backend debe estar activo en:
```txt
http://localhost:8000
```
---
Diseño de interfaz
La interfaz está pensada como un panel de trabajo de IA:
Chat principal al centro.
Barra lateral derecha con módulos de documentos, visión y estado del sistema.
Estética oscura tipo HUD/Jarvis.
Componentes reutilizables para escalar futuras funciones.
---
Roadmap
[ ] Normalizar variables de entorno para la URL del backend.
[ ] Completar `requirements.txt` del backend.
[ ] Agregar historial visual de conversaciones.
[ ] Mejorar manejo de errores en streaming.
[ ] Agregar autenticación persistente.
[ ] Preparar deploy del frontend y backend.
[ ] Agregar capturas y demo en el README.
---
Aprendizajes del proyecto
Este proyecto permite practicar integración full stack con IA, diseño de interfaces modernas, consumo de APIs, manejo de estado en React, arquitectura modular en FastAPI y construcción de features multimodales como voz, documentos e imágenes.
---
Autor
Desarrollado por Manu9099.
