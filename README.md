¡# InvestCol — Interfaz web

Interfaz web de **InvestCol**, la Plataforma de Gestión Colaborativa de Proyectos de Investigación. Proyecto académico del **TCC, Centro Tutorial Cereté**, orientado por el docente **Ing. D. Galeano P.** — **Entrega 4**.

La aplicación permite crear una cuenta e iniciar sesión, consultar un panel de actividad y conversar en un canal público o mediante chats privados. La comunicación en tiempo real y la persistencia de los mensajes dependen del [backend](https://github.com/jcontrerasy-blip/investcol-backend).

**Aplicación en línea:** [https://investcol-frontend.vercel.app](https://investcol-frontend.vercel.app)

## Contenido

1. [Funcionalidades](#funcionalidades)
2. [Tecnologías](#tecnologías)
3. [Estructura del proyecto](#estructura-del-proyecto)
4. [Configuración de VITE_API_URL](#configuración-de-vite_api_url)
5. [Instalación y ejecución local](#instalación-y-ejecución-local-powershell)
6. [Build de producción](#build-de-producción)
7. [Despliegue en Vercel](#despliegue-en-vercel)
8. [Cómo probar el chat y el historial](#cómo-probar-el-chat-y-el-historial)
9. [Autor y repositorio](#autor-y-repositorio)

## Funcionalidades

- **Registro e inicio de sesión:** registro con nombre, usuario, contraseña y rol (coordinador, investigador principal o coinvestigador). Al terminar el registro, la aplicación inicia sesión automáticamente. Las rutas del panel y del chat requieren autenticación.
- **Panel:** muestra usuarios conectados, contadores de mensajes de la sesión, actividad de los últimos diez minutos y actividad reciente.
- **Chat público en tiempo real:** recibe mensajes y avisos de entrada y salida, y muestra el estado de conexión.
- **Chats privados:** lista de usuarios registrados, indicador de presencia, contador de mensajes no leídos y conversaciones individuales.
- **Historial persistente:** al conectar se solicita el historial del canal público; al abrir una conversación privada, se solicita el de esa conversación. El backend devuelve hasta los 50 mensajes más recientes de cada historial.
- **Avisos:** notificaciones dentro de la aplicación para mensajes nuevos, opción para activar o silenciar el sonido y recuperación de la conexión.

## Tecnologías

| Tecnología | Uso |
|---|---|
| React y React DOM | Interfaz de usuario |
| TypeScript | Tipado y código de la aplicación |
| Vite y `@vitejs/plugin-react` | Desarrollo y compilación |
| react-router-dom | Navegación y rutas protegidas |
| socket.io-client | Chat, presencia e historial en tiempo real |
| framer-motion | Animaciones |
| lucide-react | Iconos |
| recharts | Gráfica de actividad del panel |
| ESLint y `typescript-eslint` | Análisis estático, con complementos de React Hooks y React Refresh |

## Estructura del proyecto

```text
src/
├── api/                 # Cliente HTTP y llamadas de autenticación
├── components/
│   ├── auth/            # Campos y presentación de acceso y registro
│   ├── chat/            # Conversaciones, mensajes, conexión y avisos
│   └── layout/          # Estructura y navegación de páginas privadas
├── config/              # Configuración del entorno (VITE_API_URL)
├── context/             # Contextos de sesión y chat
├── hooks/               # Hooks de autenticación y chat
├── lib/                 # Animaciones y sonido
├── pages/               # Login, registro, panel y chat
├── styles/              # Estilos globales y tokens visuales
├── types/               # Tipos de autenticación y chat
└── utils/               # Formato y almacenamiento local de sesión
```

- `src/App.tsx` define las rutas.
- `src/hooks/useChat.ts` administra la conexión Socket.IO, los mensajes públicos y privados, la presencia y las solicitudes de historial.
- `src/api/auth.api.ts` realiza las solicitudes HTTP de registro e inicio de sesión.

## Configuración de VITE_API_URL

La aplicación necesita `VITE_API_URL` para iniciar y compilar. Su valor es la URL base del backend, **sin barra final**. Vite incorpora las variables `VITE_*` en el código del cliente durante el build, por lo que no debes guardar secretos en ellas.

| Entorno | Valor |
|---|---|
| Local | `VITE_API_URL=http://localhost:4000` |
| Producción | `VITE_API_URL=https://investcol-backend.onrender.com` |

El archivo `.env.example` contiene el valor local.

## Instalación y ejecución local (PowerShell)

**Requisitos:** Node.js y npm. Para desarrollar en local, el backend debe estar ejecutándose en `http://localhost:4000`; este proyecto no lo inicia.

1. Sitúate en la carpeta del proyecto:

   ```powershell
   Set-Location "C:\ruta\al\proyecto\investcol-frontend"
   ```

2. Instala las dependencias respetando `package-lock.json`:

   ```powershell
   npm ci
   ```

3. Crea el archivo `.env` a partir del ejemplo:

   ```powershell
   Copy-Item .env.example .env
   ```

   Comprueba que contenga `VITE_API_URL=http://localhost:4000`, sin barra final.

4. Inicia el servidor de desarrollo:

   ```powershell
   npm run dev
   ```

   Abre la dirección que indique Vite, normalmente `http://localhost:5173`, y asegúrate de que el backend local esté activo.

## Build de producción

Con `VITE_API_URL` apuntando al backend deseado:

```powershell
npm run build
```

El comando ejecuta `tsc -b` y luego `vite build`; el resultado se genera en `dist/`. Otros comandos útiles:

```powershell
npm run preview   # vista previa local del build
npm run lint      # revisión con ESLint
```

> Al compilar puede aparecer un aviso de que un archivo supera los 500 kB. Es informativo y no impide el despliegue.

## Despliegue en Vercel

1. Importa el repositorio `jcontrerasy-blip/investcol-frontend` en Vercel.
2. En **Settings → Environment Variables**, define `VITE_API_URL` con el valor `https://investcol-backend.onrender.com` para producción.
3. Usa el comando de build `npm run build` y el directorio de salida `dist`.
4. Vuelve a desplegar tras cualquier cambio de variables, porque se aplican durante el build.
5. `vercel.json` reescribe todas las rutas hacia `index.html`, de modo que las rutas de la aplicación funcionen al abrirlas directamente.

### Conexión con el backend

El frontend usa el backend para la autenticación HTTP y para la conexión Socket.IO, ambas en la URL base de `VITE_API_URL`. Para que el navegador permita esas peticiones, la variable `CORS_ORIGIN` del backend debe ser el origen exacto del frontend, con `https://` y sin barra final ni ruta:

```text
[https://investcol-frontend.vercel.app](https://investcol-frontend.vercel.app)
```

Para desarrollo local, usa `http://localhost:5173`.

### URLs

| Servicio | URL |
|---|---|
| Frontend (Vercel) | [https://investcol-frontend.vercel.app](https://investcol-frontend.vercel.app) |
| Backend (Render) | [https://investcol-backend.onrender.com](https://investcol-backend.onrender.com) |

> **Arranque en frío:** el backend está en el plan gratuito de Render y, tras un periodo de inactividad, la primera petición puede tardar cerca de 1 minuto. Si la aplicación muestra "No se pudo conectar con el servidor", espera y vuelve a intentarlo.

## Cómo probar el chat y el historial

1. Abre la aplicación y registra el primer usuario.
2. En una ventana de incógnito, abre de nuevo la aplicación y registra un segundo usuario con otro nombre de usuario.
3. En ambas sesiones, entra al chat y espera a que el estado de conexión indique que está conectado.
4. En la lista de personas, selecciona al otro usuario y envía mensajes privados en ambas direcciones. Comprueba que aparecen en las dos sesiones.
5. Cierra sesión o recarga la página y vuelve a iniciar sesión con la misma cuenta.
6. Abre la conversación privada y comprueba que el historial se carga. Repite en el canal público.

## Autor y repositorio

- **Autor:** jcontrerasy-blip
- **Repositorio:** [jcontrerasy-blip/investcol-frontend](https://github.com/jcontrerasy-blip/investcol-frontend)