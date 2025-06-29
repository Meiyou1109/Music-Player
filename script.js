const audio = document.getElementById('audio');
const playPauseBtn = document.getElementById('play-pause');
const progressBar = document.getElementById('progress');
const volumeBar = document.getElementById('volume');
const songTitle = document.getElementById('song-title');
let repeatMode = "none"; // "none" | "all" | "one"
let shuffleMode = false;


// Đồng bộ nút biểu tượng khi dùng phím tắt hệ thống
audio.addEventListener("play", () => {
  playPauseBtn.textContent = "⏸️";
});

audio.addEventListener("pause", () => {
  playPauseBtn.textContent = "▶️";
});


const playlist = [
  'music/Chạy Trời Sao Khỏi Nắng.mp3',
  'music/Cứ yêu.mp3',
  'music/Dạ Khúc.mp3',
  'music/Đào Hoa Nặc.mp3',
  'music/Day By Day.mp3',
  'music/Done For Me.mp3',
  'music/Hoa Cúc Dại.mp3',
  'music/How Did I Fall In Love With You.mp3',
  'music/Its Not Goodbye.mp3',
  'music/Không Thể Nói.mp3',
  'music/Kimi Ga Ireba.mp3',
  'music/Lemon.mp3',
  'music/Nhắm Mắt Thấy Mùa Hè.mp3',
  'music/Once Again.mp3',
  'music/Sau Này Hãy Gặp Lại Khi Hoa Nở.mp3',
  'music/Somewhere Only We Know.mp3',
  'music/Tháng Tư Là Lời Nói Dối Của Em.mp3',
  'music/The History.mp3',
  'music/The Nights.mp3',
  'music/This Love.mp3',
  'music/To All of You.mp3',
  'music/Tôi Thấy Hoa Vàng Trên Cỏ Xanh.mp3',
  'music/Tương Hổ.mp3',
  'music/Yuki No Hana.mp3'
];

// Scroll logic
let scrollRAF = null;
let scrollOffset = 0;
let scrollSpeed = 0.5;
let isHovering = false;
let autoScrolling = false;
let currentDetailPlaylist = null;

function loadDuration(path, durationEl) {
  const tempAudio = new Audio();
  tempAudio.src = path;
  tempAudio.addEventListener("loadedmetadata", () => {
    const dur = formatTime(tempAudio.duration);
    durationEl.textContent = dur;
  });
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
  if (presentPlaylist.length === 0) {
    const first = playlist[0];
    presentPlaylist.push(first);
    presentIndex = 0;
    renderPresentPlaylist();
    playFromPresent();
    return;
  }

  if (audio.paused) {
    audio.play();
    playPauseBtn.textContent = "⏸️";
  } else {
    pauseSong();
  }
});

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

audio.addEventListener("ended", () => {
  if (repeatMode === "one") {
    // Phát lại chính nó
    audio.currentTime = 0;
    audio.play();
  } else if (shuffleMode && repeatMode === "none") {
    // Phát ngẫu nhiên bài khác
    const remaining = presentPlaylist.filter((_, i) => i !== presentIndex);
    if (remaining.length === 0) return;
    const random = Math.floor(Math.random() * remaining.length);
    presentIndex = presentPlaylist.findIndex(p => p === remaining[random]);
    playFromPresent();
  } else {
    // Chuyển bài tiếp theo
    presentIndex++;
    if (presentIndex >= presentPlaylist.length) {
      if (repeatMode === "all") {
        presentIndex = 0;
        playFromPresent();
      } else {
        audio.pause();
        playPauseBtn.textContent = "▶️";
      }
    } else {
      playFromPresent();
    }
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
  document.querySelectorAll(".nav-item").forEach(i => i.classList.remove("active"));
  document.querySelectorAll(".nav-item")[0].classList.add("active");
}

function showPlaylist() {
  document.getElementById("section-title").textContent = "Danh sách phát";
  document.getElementById("library-list").style.display = "none";
  document.getElementById("playlist-list").style.display = "grid";
  document.getElementById("playlist-detail").style.display = "none";
  renderPlaylists();
  setTimeout(clearSelections, 0);
  document.querySelectorAll(".nav-item").forEach(i => i.classList.remove("active"));
  document.querySelectorAll(".nav-item")[1].classList.add("active");
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
    li.className = "present-item";
    li.innerHTML = `
      <span class="song-name">${fileName}</span>
      <button class="more-btn">⋯</button>
      <div class="more-menu hidden">
        <div class="more-item remove-item">✖️ Xóa khỏi danh sách</div>
      </div>
    `;

    li.querySelector(".song-name").onclick = () => {
      presentIndex = index;
      playFromPresent();
    };

    const moreBtn = li.querySelector(".more-btn");
    const moreMenu = li.querySelector(".more-menu");
    const removeItem = li.querySelector(".remove-item");

    moreBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      document.querySelectorAll(".more-menu").forEach(menu => menu.classList.add("hidden"));
      moreMenu.classList.toggle("hidden");
    });

    removeItem.addEventListener("click", (e) => {
  e.stopPropagation();

  if (index === presentIndex && !audio.paused) {
    alert("Không thể xóa bài đang phát. Vui lòng dừng phát trước.");
    return;
  }

  presentPlaylist.splice(index, 1);

  if (presentPlaylist.length === 0) {
    // Nếu xóa xong không còn bài nào, reset trình phát
    presentIndex = 0;
    playFromPresent(); // sẽ tự xử lý hiển thị "Chưa chọn bài hát"
  } else if (index === presentIndex) {
    // Nếu đang phát bài bị xóa → chuyển sang bài khác (ví dụ bài đầu)
    presentIndex = presentIndex >= presentPlaylist.length ? 0 : presentIndex;
    playFromPresent();
  } else if (index < presentIndex) {
    presentIndex--;
  }

  renderPresentPlaylist();
});


    presentListUI.appendChild(li);
  });
}

// Thêm trực tiếp vào Play list present
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
  if (presentPlaylist.length === 0) {
    // Không còn bài nào: reset UI
    audio.pause();
    audio.src = "";
    songTitle.textContent = "Chưa chọn bài hát";
    progressBar.value = 0;
    progressBar.disabled = true;
    progressBar.style.setProperty('--progress', `0%`);
    document.getElementById('current-time').textContent = "00:00";
    document.getElementById('duration').textContent = "00:00";
    playPauseBtn.textContent = "▶️";
    stopScrolling();
    highlightNowPlaying();
    return;
  }

  const songPath = presentPlaylist[presentIndex];
  audio.src = songPath;
  progressBar.disabled = false;
  audio.play();
  const fileName = songPath.split('/').pop().replace(/\.mp3$/, "");
  songTitle.textContent = fileName;
  setTimeout(highlightNowPlaying, 50);
 
  setTimeout(() => {
    const container = songTitle.parentElement;
    if (songTitle.scrollWidth > container.clientWidth) {
      autoScrolling = true;
      scrollOffset = 0;
      startScrolling(() => {
        autoScrolling = false;
      });
    } else {
      stopScrolling();
    }
  }, 100);
}


function highlightNowPlaying() {
  const current = presentPlaylist[presentIndex]?.split("/").pop().replace(/\.mp3$/, "");

  // Reset all highlights
  document.querySelectorAll(".now-playing-present, .now-playing-library").forEach(el =>
    el.classList.remove("now-playing-present", "now-playing-library")
  );

  // Highlight in present list
  const items = document.querySelectorAll("#present-playlist-list li");
  if (items[presentIndex]) items[presentIndex].classList.add("now-playing-present");

  // Highlight in library + playlist detail
  document.querySelectorAll("#library-list li, #playlist-songs li").forEach(li => {
    const name = li.querySelector(".song-name")?.textContent;
    if (name === current) li.classList.add("now-playing-library");
  });
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
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "❌";
    deleteBtn.addEventListener("click", (e) => {
      e.stopPropagation(); // Ngăn click lan tới card
      confirmDelete(index);
    });
    
    const playBtn = document.createElement("button");
    playBtn.textContent = "▶️";
    playBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      playPlaylist(index);
    });
    
    const renameBtn = document.createElement("button");
    renameBtn.textContent = "✏️";
    renameBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      renamePlaylist(index);
    });
    
    actions.appendChild(deleteBtn);
    actions.appendChild(playBtn);
    actions.appendChild(renameBtn);
    

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

  const repeatBtn = document.getElementById("repeat");
  const shuffleBtn = document.getElementById("shuffle");

  repeatBtn.addEventListener("click", () => {
    if (repeatMode === "none") {
    repeatMode = "all";
    repeatBtn.textContent = "🔁";
    repeatBtn.classList.add("active");
    } else if (repeatMode === "all") {
    repeatMode = "one";
    repeatBtn.textContent = "🔂";
    repeatBtn.classList.add("active");
    } else {
    repeatMode = "none";
    repeatBtn.textContent = "🔁";
    repeatBtn.classList.remove("active");
    }
  });


  shuffleBtn.addEventListener("click", () => {
  shuffleMode = !shuffleMode;
  shuffleBtn.classList.toggle("active", shuffleMode);
  });

  showLibrary();

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

  const addToCurrentBtn = document.getElementById("add-to-playlist-current");

  addToCurrentBtn.addEventListener("click", () => {
  if (!presentPlaylist[presentIndex]) {
    alert("Chưa có bài hát đang phát.");
    return;
  }

  // Tạo lại danh sách chọn playlist
  playlistListUI.innerHTML = "";

  // ➕ Thêm mới
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

  // Danh sách playlist
  playlists.forEach((pl, index) => {
    const li = document.createElement("li");
    li.textContent = pl.name;
    li.style.cursor = "pointer";
    li.style.padding = "6px 0";
    li.addEventListener("click", () => {
      const songPath = presentPlaylist[presentIndex];
      const name = songPath.split("/").pop();
      const songIndex = playlist.findIndex(p => p.endsWith(name));
      if (songIndex !== -1 && !pl.songs.includes(songIndex)) {
        pl.songs.push(songIndex);
        savePlaylists();
        alert(`Đã thêm "${name}" vào playlist "${pl.name}"`);
      }
      playlistPopup.style.display = "none";
    });
    playlistListUI.appendChild(li);
  });

  playlistPopup.style.display = "flex";
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
  const removeFromThisPlaylist = document.getElementById("remove-from-this-playlist");

  selectAllPlaylist.addEventListener("change", () => {
    const checkboxes = document.querySelectorAll("#playlist-songs .song-checkbox");
    checkboxes.forEach(cb => cb.checked = selectAllPlaylist.checked);
    updatePlaylistControlsVisibility();
  });

  removeFromThisPlaylist.addEventListener("click", () => {
    if (!currentDetailPlaylist) return;

    const selected = document.querySelectorAll("#playlist-songs .song-checkbox:checked");
    const removeIndices = [];

    selected.forEach(cb => {
      const li = cb.closest("li");
      const name = li.querySelector(".song-name").textContent;
      const songIndex = playlist.findIndex(p => p.includes(name));
    if (songIndex !== -1) {
      removeIndices.push(songIndex);
    }
  });

  // Cập nhật mảng songs
  currentDetailPlaylist.songs = currentDetailPlaylist.songs.filter(idx => !removeIndices.includes(idx));
  savePlaylists();
  showPlaylistDetail(playlists.indexOf(currentDetailPlaylist));
  });

  document.addEventListener("click", () => {
    document.querySelectorAll(".more-menu").forEach(menu => menu.classList.add("hidden"));
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

