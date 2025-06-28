const audio = document.getElementById('audio');
const playPauseBtn = document.getElementById('play-pause');
const progressBar = document.getElementById('progress');
const volumeBar = document.getElementById('volume');
const songTitle = document.getElementById('song-title');

// Đồng bộ nút biểu tượng khi dùng phím tắt hệ thống
audio.addEventListener("play", () => {
  playPauseBtn.textContent = "⏸️";
});

audio.addEventListener("pause", () => {
  playPauseBtn.textContent = "▶️";
});


const playlist = [
  'music/Cứ yêu.mp3',
  'music/DaKhuc.mp3',
  'music/DaoHoaNacThuongCoTinhCaOST-GEMDangTuKy-5011028.mp3',
  'music/DapAn-DuongKhon-4771785.mp3',
  'music/DayByDay-Tara-1856855.mp3',
  'music/DemToTinh-Violin-5978849.mp3',
  'music/DoneForMe.mp3',
  'music/HoaCucDai.mp3',
  'music/HowDidIFallInLoveWithYou.mp3',
  'music/ItsNotGoodbye.mp3',
  'music/KhongTheNoi-TruongTinhDinh_3dk5b.mp3',
  'music/KimigaIrebaOSTDetectiveConan-Lori_4377.mp3',
  'music/Lemon-KenshiYonezu-5411306.mp3',
  'music/OnceAgain.mp3',
  'music/TheNightsAvicii.mp3',
  'music/ThisLove.mp3',
  'music/YukiNoHana-SaoriHayami-2863199.mp3'
];

let currentIndex = 0;

// Scroll logic
let scrollRAF = null;
let scrollOffset = 0;
let scrollSpeed = 0.5;
let isHovering = false;
let autoScrolling = false;
let currentDetailPlaylist = null;

// Duration of each music
function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function loadDuration(path, durationEl) {
  const tempAudio = new Audio();
  tempAudio.src = path;
  tempAudio.addEventListener("loadedmetadata", () => {
    const dur = formatTime(tempAudio.duration);
    durationEl.textContent = dur;
  });
}


function playSong() {
  const songPath = playlist[currentIndex];
  const fileName = songPath.split('/').pop().replace(/\.mp3$/i, '');

  if (audio.src.endsWith(songPath)) {
    audio.play();
    playPauseBtn.textContent = "⏸️";
    return;
  }

  audio.src = songPath;
  progressBar.disabled = false;
  songTitle.textContent = fileName;
  audio.play();
  playPauseBtn.textContent = "⏸️";

  stopScrolling();

  setTimeout(() => {
    const container = songTitle.parentElement;
    if (songTitle.scrollWidth > container.clientWidth) {
      autoScrolling = true;
      scrollOffset = 0;
      startScrolling(() => {
        autoScrolling = false;
      });
    }
  }, 100);
}

function startScrolling(onComplete = null) {
  cancelAnimationFrame(scrollRAF);

  function scrollStep() {
    const containerWidth = songTitle.parentElement.clientWidth;
    const contentWidth = songTitle.scrollWidth;

    scrollOffset -= scrollSpeed;

    if (-scrollOffset > contentWidth) {
      scrollOffset = containerWidth;
      if (!isHovering && !autoScrolling) {
        stopScrolling();
        return;
      }
    }

    songTitle.style.transform = `translateX(${scrollOffset}px)`;
    scrollRAF = requestAnimationFrame(scrollStep);
  }

  scrollRAF = requestAnimationFrame(scrollStep);

  if (onComplete) {
    const durationMs = ((songTitle.scrollWidth + songTitle.parentElement.clientWidth) / scrollSpeed / 60) * 1000;
    setTimeout(() => {
      onComplete();
    }, durationMs);
  }
}

function stopScrolling() {
  cancelAnimationFrame(scrollRAF);
  scrollOffset = 0;
  songTitle.style.transform = `translateX(0)`;
}

songTitle.parentElement.addEventListener("mouseenter", () => {
  if (songTitle.scrollWidth > songTitle.parentElement.clientWidth) {
    isHovering = true;
    startScrolling();
  }
});

songTitle.parentElement.addEventListener("mouseleave", () => {
  isHovering = false;
});

function pauseSong() {
  audio.pause();
  playPauseBtn.textContent = "▶️";
}

playPauseBtn.addEventListener("click", () => {
  // Nếu chưa phát bài nào thì tự động phát bài đầu tiên
  const hasSong = playlist.some(song => audio.src.includes(song));
  if (!hasSong) {
    currentIndex = 0;
    playSong();
    return;
  }

  if (audio.paused) {
    audio.play();
    playPauseBtn.textContent = "⏸️";
  } else {
    pauseSong();
  }
});


document.getElementById("next").onclick = () => {
  currentIndex = (currentIndex + 1) % playlist.length;
  playSong();
};

document.getElementById("prev").onclick = () => {
  currentIndex = (currentIndex - 1 + playlist.length) % playlist.length;
  playSong();
};

function selectSong(index) {
  currentIndex = index;
  playSong();
}

// button mute
const muteBtn = document.getElementById('mute-toggle');
let previousVolume = volumeBar.value;

muteBtn.addEventListener("click", () => {
  if (audio.volume > 0) {
    previousVolume = volumeBar.value;
    volumeBar.value = 0;
    audio.volume = 0;
    muteBtn.textContent = "🔇";
    volumeBar.style.setProperty('--progress', `0%`);
  } else {
    volumeBar.value = previousVolume;
    audio.volume = previousVolume / 100;
    muteBtn.textContent = "🔊";
    volumeBar.style.setProperty('--progress', `${previousVolume}%`);
  }
});

volumeBar.addEventListener("input", () => {
  const val = volumeBar.value;
  audio.volume = val / 100;
  volumeBar.style.setProperty('--progress', `${val}%`);

  if (val > 0 && muteBtn.textContent === "🔇") {
    muteBtn.textContent = "🔊";
  }
});

function formatTime(sec) {
  const m = Math.floor(sec / 60).toString().padStart(2, '0');
  const s = Math.floor(sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

audio.addEventListener("timeupdate", () => {
  if (audio.duration) {
    const value = (audio.currentTime / audio.duration) * 100;
    progressBar.value = value;
    progressBar.style.setProperty('--progress', `${value}%`);

    document.getElementById('current-time').textContent = formatTime(audio.currentTime);
    document.getElementById('duration').textContent = formatTime(audio.duration);
  }
});


progressBar.addEventListener("input", () => {
  const percent = progressBar.value;
  progressBar.style.setProperty('--progress', `${percent}%`);
  audio.currentTime = (percent / 100) * audio.duration;
});


function showLibrary() {
  document.getElementById("section-title").textContent = "Thư viện";
  document.getElementById("library-list").style.display = "block";
  document.getElementById("playlist-list").style.display = "none";
  document.getElementById("playlist-detail").style.display = "none";
  setTimeout(clearSelections, 0);
}

function showPlaylist() {
  document.getElementById("section-title").textContent = "Danh sách phát";
  document.getElementById("library-list").style.display = "none";
  document.getElementById("playlist-list").style.display = "grid";
  document.getElementById("playlist-detail").style.display = "none";
  renderPlaylists();
  setTimeout(clearSelections, 0);
}


// Playlist present
const presentPlaylist = [];
let presentIndex = 0;

const presentSidebar = document.getElementById("present-playlist-sidebar");
const togglePresentBtn = document.getElementById("toggle-present-sidebar");
const closePresentBtn = document.getElementById("close-present-sidebar");
const presentListUI = document.getElementById("present-playlist-list");

togglePresentBtn.onclick = () => {
  presentSidebar.classList.toggle("hidden");
};

closePresentBtn.onclick = () => {
  presentSidebar.classList.add("hidden");
};

// Hàm cập nhật UI danh sách đang phát
function renderPresentPlaylist() {
  presentListUI.innerHTML = "";
  presentPlaylist.forEach((path, index) => {
    const fileName = path.split("/").pop().replace(/\.mp3$/i, '');
    const li = document.createElement("li");
    li.textContent = fileName;
    li.onclick = () => {
      presentIndex = index;
      playFromPresent();
    };
    presentListUI.appendChild(li);
  });
}

// Thay vì playSong() trực tiếp → thêm vào presentPlaylist
function selectSong(index) {
  const song = playlist[index];
  if (!presentPlaylist.includes(song)) {
    presentPlaylist.push(song);
    renderPresentPlaylist();
  }
  presentIndex = presentPlaylist.indexOf(song);
  playFromPresent();
}

function playFromPresent() {
  const songPath = presentPlaylist[presentIndex];
  audio.src = songPath;
  audio.play();
  const fileName = songPath.split('/').pop().replace(/\.mp3$/, "");
  songTitle.textContent = fileName;
}

// Next/Prev cập nhật theo presentPlaylist
document.getElementById("next").onclick = () => {
  presentIndex = (presentIndex + 1) % presentPlaylist.length;
  playFromPresent();
};

document.getElementById("prev").onclick = () => {
  presentIndex = (presentIndex - 1 + presentPlaylist.length) % presentPlaylist.length;
  playFromPresent();
};


// ---------- Playlist logic ----------
let playlists = [];

function savePlaylists() {
  localStorage.setItem("userPlaylists", JSON.stringify(playlists));
}

function loadPlaylists() {
  const stored = localStorage.getItem("userPlaylists");
  if (stored) {
    playlists = JSON.parse(stored);
  } else {
    playlists = [];
  }
}

function renderPlaylists() {
  const container = document.getElementById("playlist-list");
  container.innerHTML = "";

  const addWrapper = document.createElement("div");
  addWrapper.className = "playlist-wrapper";

  const addCard = document.createElement("div");
  addCard.className = "playlist-card playlist-add";
  addCard.innerHTML = "+";
  addCard.onclick = () => {
    const popup = document.getElementById("create-popup");
    const input = document.getElementById("new-playlist-name");
    const button = document.getElementById("create-confirm");

    popup.style.display = "flex";
    input.value = "";
    input.focus();
    button.disabled = true;
  };

  const addLabel = document.createElement("div");
  addLabel.className = "playlist-name";
  addLabel.textContent = "Tạo playlist mới";

  addWrapper.appendChild(addCard);
  addWrapper.appendChild(addLabel);
  container.appendChild(addWrapper);

  playlists.forEach((pl, index) => {
    const wrapper = document.createElement("div");
    wrapper.className = "playlist-wrapper";

    const card = document.createElement("div");
    card.className = "playlist-card";

    const inner = document.createElement("div");
    inner.className = "playlist-card-inner";

    const actions = document.createElement("div");
    actions.className = "playlist-actions";
    actions.innerHTML = `
      <button onclick="confirmDelete(${index})">❌</button>
      <button onclick="playPlaylist(${index})">▶️</button>
      <button onclick="renamePlaylist(${index})">✏️</button>
    `;

    inner.appendChild(actions);
    card.appendChild(inner);

    const name = document.createElement("div");
    name.className = "playlist-name";
    name.textContent = pl.name;
    card.onclick = () => showPlaylistDetail(index);
    name.onclick = () => showPlaylistDetail(index);

    wrapper.appendChild(card);
    wrapper.appendChild(name);
    container.appendChild(wrapper);
  });
}

function clearSelections() {
  document.querySelectorAll(".song-checkbox").forEach(cb => cb.checked = false);
  document.getElementById("library-controls").style.display = "none";
  document.getElementById("playlist-controls").style.display = "none";
}


// play list detail 
function showPlaylistDetail(index) {
  const playlistObj = playlists[index];
  currentDetailPlaylist = playlistObj;

  // Ẩn danh sách chính
  document.getElementById("playlist-list").style.display = "none";
  document.getElementById("library-list").style.display = "none";

  // Hiện chi tiết
  document.getElementById("playlist-detail").style.display = "block";
  document.getElementById("section-title").textContent = "Chi tiết Playlist";

  document.getElementById("playlist-detail-title").textContent = playlistObj.name;

  const songList = document.getElementById("playlist-songs");
  songList.innerHTML = "";

  if (playlistObj.songs.length === 0) {
    songList.innerHTML = "<li class='list-group-item'>(Chưa có bài hát)</li>";
  } else {
    playlistObj.songs.forEach(songIdx => {
  const path = playlist[songIdx];
  const fileName = path.split("/").pop().replace(/\.mp3$/i, "");
  const li = document.createElement("li");
  li.className = "list-group-item";
  li.innerHTML = `
  <input type="checkbox" class="song-checkbox" />
  <span class="song-name">${fileName}</span>
  <span class="song-duration">00:00</span>
  `;
  li.onclick = (e) => {
    if (!e.target.matches("input")) selectSong(songIdx);
  };

  const durationSpan = li.querySelector(".song-duration");
  loadDuration(path, durationSpan);
  li.querySelector(".song-checkbox").addEventListener("change", () => {
  updatePlaylistControlsVisibility();
  });
  songList.appendChild(li);
});
  }
}

// Ds phát hiện tại dc thay thế khi play play list mới
document.getElementById("play-this-playlist").addEventListener("click", () => {
  if (!currentDetailPlaylist || currentDetailPlaylist.songs.length === 0) return;

  // Xoá hết present playlist cũ và thêm mới
  presentPlaylist.length = 0;

  currentDetailPlaylist.songs.forEach(idx => {
    const path = playlist[idx];
    if (!presentPlaylist.includes(path)) {
      presentPlaylist.push(path);
    }
  });

  renderPresentPlaylist();
  presentIndex = 0;
  playFromPresent();
});


document.getElementById("back-to-playlists").addEventListener("click", () => {
  document.getElementById("playlist-detail").style.display = "none";
  document.getElementById("playlist-list").style.display = "grid";
  document.getElementById("section-title").textContent = "Danh sách phát";
  clearSelections();
});


function confirmDelete(index) {
  if (confirm(`Bạn có chắc muốn xóa playlist "${playlists[index].name}"?`)) {
    playlists.splice(index, 1);
    savePlaylists();

    renderPlaylists();
  }
}

function renamePlaylist(index) {
  const newName = prompt("Đổi tên playlist:", playlists[index].name);
  if (newName) {
    playlists[index].name = newName;
    savePlaylists();
    renderPlaylists();
  }
}

function playPlaylist(index) {
  const songIndices = playlists[index].songs;
  if (songIndices.length === 0) return;

  // Xoá và thêm mới vào present playlist
  presentPlaylist.length = 0;
  songIndices.forEach(idx => {
    const path = playlist[idx];
    if (!presentPlaylist.includes(path)) {
      presentPlaylist.push(path);
    }
  });

  renderPresentPlaylist();
  presentIndex = 0;
  playFromPresent();
}

// ---------- DOM Ready ----------
window.addEventListener("DOMContentLoaded", () => { 
  loadPlaylists();
  renderPlaylists();
  volumeBar.style.setProperty('--progress', `${volumeBar.value}%`);
  // 1. Load danh sách bài hát
  const libraryList = document.getElementById("library-list");
  playlist.forEach((path, index) => {
  const fileName = path.split("/").pop().replace(/\.mp3$/i, "");
  const li = document.createElement("li");
  li.className = "list-group-item";
  li.innerHTML = `
  <input type="checkbox" class="song-checkbox" />
  <span class="song-name">${fileName}</span>
  <span class="song-duration">--:--</span>
  `;
  li.onclick = (e) => {
    if (!e.target.matches("input")) selectSong(index);
  };

  const durationSpan = li.querySelector(".song-duration");
  loadDuration(path, durationSpan);

  libraryList.appendChild(li);

  li.querySelector(".song-checkbox").addEventListener("change", () => {
  updateLibraryControlsVisibility();
});

});


  // 2. Xử lý popup tạo playlist
  const nameInput = document.getElementById("new-playlist-name");
  const createBtn = document.getElementById("create-confirm");

  nameInput.addEventListener("input", () => {
    const val = nameInput.value.trim();
    createBtn.disabled = val === "";
  });

  createBtn.addEventListener("click", () => {
    const name = nameInput.value.trim();
    if (!name) return;

    playlists.push({ name, cover: "", songs: [] });
    savePlaylists();
    document.getElementById("create-popup").style.display = "none";
    // loadPlaylists();
    renderPlaylists();
  });

  // Đóng popup 
  document.getElementById("popup-close").addEventListener("click", () => {
    document.getElementById("create-popup").style.display = "none";
  });
  document.getElementById("create-popup").addEventListener("click", (e) => {
    if (e.target.id === "create-popup") {
      document.getElementById("create-popup").style.display = "none";
    }
  });
  
const addToPlaylistLibrary = document.getElementById("add-to-playlist-library");
const playlistPopup = document.getElementById("select-playlist-popup");
const playlistListUI = document.getElementById("select-playlist-list");
const closePlaylistPopupBtn = document.getElementById("close-playlist-select");

const addToPlaylistPlaylist = document.getElementById("add-to-playlist-playlist");

addToPlaylistPlaylist.addEventListener("click", () => {
  playlistListUI.innerHTML = "";

  // Thêm dòng "➕ Thêm playlist mới" đầu tiên
  const createNewItem = document.createElement("li");
  createNewItem.textContent = "➕ Thêm playlist mới";
  createNewItem.style.cursor = "pointer";
  createNewItem.style.padding = "6px 0";
  createNewItem.style.fontWeight = "bold";
  createNewItem.addEventListener("click", () => {
    playlistPopup.style.display = "none";
    document.getElementById("create-popup").style.display = "flex";
    document.getElementById("new-playlist-name").focus();
  });
  playlistListUI.appendChild(createNewItem);

  // Hiển thị danh sách playlist để chọn thêm vào
  playlists.forEach((pl, index) => {
    const li = document.createElement("li");
    li.textContent = pl.name;
    li.style.cursor = "pointer";
    li.style.padding = "6px 0";
    li.addEventListener("click", () => {
      const selected = document.querySelectorAll("#playlist-songs .song-checkbox:checked");
      selected.forEach(cb => {
        const li = cb.closest("li");
        const name = li.querySelector(".song-name").textContent;
        const fullIndex = playlist.findIndex(p => p.includes(name));
        if (fullIndex !== -1 && !playlists[index].songs.includes(fullIndex)) {
          playlists[index].songs.push(fullIndex);
          savePlaylists();
        }
      });
      playlistPopup.style.display = "none";
      alert(`Đã thêm vào playlist "${pl.name}"`);
    });
    playlistListUI.appendChild(li);
  });

  playlistPopup.style.display = "flex";
});


addToPlaylistLibrary.addEventListener("click", () => {
  playlistListUI.innerHTML = "";

  playlists.forEach((pl, index) => {
    const li = document.createElement("li");
    li.textContent = pl.name;
    li.style.cursor = "pointer";
    li.style.padding = "6px 0";
    li.addEventListener("click", () => {
      const selected = document.querySelectorAll("#library-list .song-checkbox:checked");
      selected.forEach(cb => {
        const li = cb.closest("li");
        const name = li.querySelector(".song-name").textContent;
        const fullIndex = playlist.findIndex(p => p.includes(name));
        if (fullIndex !== -1 && !playlists[index].songs.includes(fullIndex)) {
          playlists[index].songs.push(fullIndex);
          savePlaylists();
        }
      });
      playlistPopup.style.display = "none";
      alert(`Đã thêm vào playlist "${pl.name}"`);
    });
    playlistListUI.appendChild(li);
  });

  playlistPopup.style.display = "flex";
});

closePlaylistPopupBtn.addEventListener("click", () => {
  playlistPopup.style.display = "none";
});

playlistPopup.addEventListener("click", (e) => {
  if (e.target.id === "select-playlist-popup") {
    playlistPopup.style.display = "none";
  }
});

// ==== THƯ VIỆN ============
const libraryControls = document.getElementById("library-controls");
const selectAllLibrary = document.getElementById("select-all-library");
const addToPresentLibrary = document.getElementById("add-to-present-library");

selectAllLibrary.addEventListener("change", () => {
  const checkboxes = document.querySelectorAll("#library-list .song-checkbox");
  checkboxes.forEach(cb => cb.checked = selectAllLibrary.checked);
  updateLibraryControlsVisibility();
});

addToPresentLibrary.addEventListener("click", () => {
  const selected = document.querySelectorAll("#library-list .song-checkbox:checked");
  selected.forEach(cb => {
    const li = cb.closest("li");
    const name = li.querySelector(".song-name").textContent;
    const fullPath = playlist.find(p => p.includes(name));
    if (fullPath && !presentPlaylist.includes(fullPath)) {
      presentPlaylist.push(fullPath);
    }
  });
  renderPresentPlaylist();
  presentSidebar.classList.remove("hidden");
});

document.getElementById("rewind-10").addEventListener("click", () => {
  audio.currentTime = Math.max(0, audio.currentTime - 10);
});

document.getElementById("forward-10").addEventListener("click", () => {
  if (audio.duration) {
    audio.currentTime = Math.min(audio.duration, audio.currentTime + 10);
  }
});


// Hiện/ẩn nút khi có bài hát được tick
function updateLibraryControlsVisibility() {
  const anyChecked = document.querySelectorAll("#library-list .song-checkbox:checked").length > 0;
  libraryControls.style.display = anyChecked ? "flex" : "none";
}

});

const playlistControls = document.getElementById("playlist-controls");
const selectAllPlaylist = document.getElementById("select-all-playlist");
const addToPresentPlaylist = document.getElementById("add-to-present-playlist");

selectAllPlaylist.addEventListener("change", () => {
  const checkboxes = document.querySelectorAll("#playlist-songs .song-checkbox");
  checkboxes.forEach(cb => cb.checked = selectAllPlaylist.checked);
  updatePlaylistControlsVisibility();
});

addToPresentPlaylist.addEventListener("click", () => {
  const selected = document.querySelectorAll("#playlist-songs .song-checkbox:checked");
  selected.forEach(cb => {
    const li = cb.closest("li");
    const name = li.querySelector(".song-name").textContent;
    const fullPath = playlist.find(p => p.includes(name));
    if (fullPath && !presentPlaylist.includes(fullPath)) {
      presentPlaylist.push(fullPath);
    }
  });
  renderPresentPlaylist();
  presentSidebar.classList.remove("hidden");
});

function updatePlaylistControlsVisibility() {
  const anyChecked = document.querySelectorAll("#playlist-songs .song-checkbox:checked").length > 0;
  playlistControls.style.display = anyChecked ? "flex" : "none";
}

