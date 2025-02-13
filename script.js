//------- Script para actualizar la hora en la barra de tareas ----------
function updateTime() {
  const timeElement = document.getElementById("time");
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");
  timeElement.textContent = `${hours}:${minutes}`;
}
setInterval(updateTime, 1000);
updateTime();

//------------Abrir el navegador-------
function openNewTab() {
  window.open("https://www.google.com");
}

//------------Abrir la terminal-------
function createTerminal() {
  createWindow("Terminal", "assets/icons/terminal.png", 3);
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

  header.addEventListener("mousedown", (e) => {
    isDragging = true;
    offsetX = e.clientX - windowElement.offsetLeft;
    offsetY = e.clientY - windowElement.offsetTop;
    bringWindowToFront(windowElement); // Traer al frente al empezar a mover
  });

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

  document.addEventListener("mouseup", () => {
    isDragging = false;
  });
}