//------- Script para actualizar la hora y fecha en la barra de tareas ----------
function updateTime() {
  const timeElement = document.getElementById("time");
  const dateElement = document.getElementById("date");
  const now = new Date();

  // Obtener hora y minutos
  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");

  // Obtener fecha
  const day = now.getDate().toString().padStart(2, "0");
  const month = (now.getMonth() + 1).toString().padStart(2, "0"); // Mes empieza desde 0
  const year = now.getFullYear();

  // Asignar valores
  timeElement.textContent = `${hours}:${minutes}`;
  dateElement.textContent = `${day}/${month}/${year}`;
}

// Actualizar cada 60 segundos
setInterval(updateTime, 60000);
updateTime();

//------------Abrir el navegador-------
function openNewTab() {
  window.open("https://www.google.com");
}

//------------Abrir la terminal-------
function createTerminal() {
  createWindow("Terminal", "assets/icons/terminal.png", 3);
}

//-------------------Abrir menu de user
function toggleUser() {
  let userWindow = document.getElementById("userWindow");

  if (userWindow) {
    // Si la ventana ya existe, la eliminamos (cerramos)
    userWindow.remove();
    document.getElementById("toggleButton").innerText = "Abrir Ventana";
  } else {
    // Si la ventana no existe, la creamos (abrimos)
    userWindow = document.createElement("div");
    userWindow.className = "user-window";
    userWindow.id = "userWindow"; // ID para identificarlo

    userWindow.innerHTML = `
      <div class="user-content">
        <h1>Hello, World!</h1>
      </div>
    `;

    document.body.appendChild(userWindow);
    document.getElementById("toggleButton").innerText = "Cerrar Ventana";
  }
}

//---------------------------------Gestion de ventanas-----------
let windowCount = 0;
let zIndexCounter = 1; // Contador para el z-index

function windowsBody(id) {
  switch (id) {
    case 1:
      return `<h1>Papelera vacía</h1>`;
    case 2:
      return `<div class="icon">
                <button onclick="createWindow('Projects', 'assets/icons/carpeta.png')">
                  <img src="assets/icons/carpeta.png" alt="Folder" />
                </button>
                <span>Projects</span>
              </div>`;
    case 3:
      return `<div class="terminal-body"><p>Terminal iniciada...</p></div>`;
    default:
      return `<p>Vacio</p>`;
  }
}

function createWindow(title, iconPath, id) {
  windowCount++;
  let winId = "window" + windowCount;

  let windowDiv = document.createElement("div");
  windowDiv.classList.add("window");
  windowDiv.setAttribute("id", winId);
  windowDiv.style.zIndex = zIndexCounter++; // Asignar un z-index único
  windowDiv.innerHTML = `
      <div class="window-header" id="header${windowCount}">
        <span>${title}</span>
        <button onclick="minimizeWindow('${winId}')">_</button>
        <button onclick="toggleFullscreen('${winId}')">⛶</button>
        <button onclick="closeWindow('${winId}')">X</button>
      </div>
      <div class="window-body">${windowsBody(id)}</div>
    `;

  document.body.appendChild(windowDiv);
  createTaskbarIcon(winId, iconPath, title);
  makeWindowDraggable(windowDiv, "header" + windowCount);

  // Traer la ventana al frente al hacer clic en ella
  windowDiv.addEventListener("mousedown", () => {
    bringWindowToFront(windowDiv);
  });
  windowDiv.addEventListener("touchstart", () => {
    bringWindowToFront(windowDiv);
  });
}

function createTaskbarIcon(winId, iconPath, title) {
  let taskbarIcon = document.createElement("div");
  taskbarIcon.classList.add("icon-task", "active-window");
  taskbarIcon.setAttribute("id", "taskbarIcon" + winId.replace("window", ""));
  taskbarIcon.innerHTML = `<img src="${iconPath}" alt="${title}" style="width: 30px; height: 30px;">`;

  taskbarIcon.onclick = function () {
    restoreWindow(winId);
    bringWindowToFront(document.getElementById(winId)); // Traer al frente al restaurar
  };

  document.getElementById("taskbar-icons").appendChild(taskbarIcon);
}

function closeWindow(id) {
  document.getElementById(id)?.remove();
  let taskbarIcon = document.getElementById("taskbarIcon" + id.replace("window", ""));
  taskbarIcon?.classList.remove("active-window");
  taskbarIcon?.remove();
}

function minimizeWindow(id) {
  document.getElementById(id).style.display = "none";
  document.getElementById("taskbarIcon" + id.replace("window", ""))?.classList.remove("active-window");
}

function restoreWindow(id) {
  let win = document.getElementById(id);
  if (win) {
    win.style.display = "block";
    document.getElementById("taskbarIcon" + id.replace("window", ""))?.classList.add("active-window");
    bringWindowToFront(win); // Traer al frente al restaurar
  }
}

function toggleFullscreen(id) {
  let win = document.getElementById(id);
  win.classList.toggle("fullscreen");

  if (!win.classList.contains("fullscreen")) {
    win.style.width = "300px";
    win.style.height = "200px";
    win.style.top = "50%";
    win.style.left = "50%";
    win.style.transform = "translate(-50%, -50%)";
  } else {
    win.style.width = "100vw";
    win.style.height = "100vh";
    win.style.top = "0";
    win.style.left = "0";
    win.style.transform = "none";
  }

  // Si está en pantalla completa, traerla al frente
  if (win.classList.contains("fullscreen")) {
    bringWindowToFront(win);
  }
}

function bringWindowToFront(windowElement) {
  windowElement.style.zIndex = zIndexCounter++; // Asignar un nuevo z-index
}

function makeWindowDraggable(windowElement, headerId) {
  const header = document.getElementById(headerId);
  let isDragging = false;
  let offsetX, offsetY;

  // Eventos para ratón
  header.addEventListener("mousedown", (e) => {
    isDragging = true;
    offsetX = e.clientX - windowElement.offsetLeft;
    offsetY = e.clientY - windowElement.offsetTop;
    bringWindowToFront(windowElement); // Traer al frente al empezar a mover
  });

  // Eventos para pantallas táctiles
  header.addEventListener("touchstart", (e) => {
    isDragging = true;
    const touch = e.touches[0]; // Obtener el primer toque
    offsetX = touch.clientX - windowElement.offsetLeft;
    offsetY = touch.clientY - windowElement.offsetTop;
    bringWindowToFront(windowElement); // Traer al frente al empezar a mover
  });

  // Mover ventana (ratón)
  document.addEventListener("mousemove", (e) => {
    if (!isDragging) return;

    let newX = e.clientX - offsetX;
    let newY = e.clientY - offsetY;

    // Evitar que la ventana salga de la pantalla
    newX = Math.max(0, Math.min(window.innerWidth - windowElement.offsetWidth, newX));
    newY = Math.max(0, Math.min(window.innerHeight - windowElement.offsetHeight, newY));

    windowElement.style.left = `${newX}px`;
    windowElement.style.top = `${newY}px`;
  });

  // Mover ventana (toque)
  document.addEventListener("touchmove", (e) => {
    if (!isDragging) return;

    const touch = e.touches[0]; // Obtener el primer toque
    let newX = touch.clientX - offsetX;
    let newY = touch.clientY - offsetY;

    // Evitar que la ventana salga de la pantalla
    newX = Math.max(0, Math.min(window.innerWidth - windowElement.offsetWidth, newX));
    newY = Math.max(0, Math.min(window.innerHeight - windowElement.offsetHeight, newY));

    windowElement.style.left = `${newX}px`;
    windowElement.style.top = `${newY}px`;
  });

  // Detener movimiento (ratón)
  document.addEventListener("mouseup", () => {
    isDragging = false;
  });

  // Detener movimiento (toque)
  document.addEventListener("touchend", () => {
    isDragging = false;
  });
}


//PANTALLA DE CARGA
// Ocultar la pantalla de carga cuando la página esté completamente cargada
window.addEventListener("load", function () {
  const loadingScreen = document.getElementById("loading-screen");
  loadingScreen.style.opacity = "0"; // Desvanecer la pantalla de carga
  setTimeout(() => {
      loadingScreen.style.display = "none"; // Ocultar completamente después de la animación
  }, 500); // Ajusta el tiempo según la duración de la animación
});