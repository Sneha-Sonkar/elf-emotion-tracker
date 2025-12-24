document.addEventListener("DOMContentLoaded", () => {
  // Elements
  const moodBar = document.getElementById("moodBar");
  const moodText = document.getElementById("moodText");
  const moodEmoji = document.getElementById("moodEmoji");

  const nameInput = document.getElementById("elfName");
  const roleSelect = document.getElementById("elfRole");
  const lookSelect = document.getElementById("elfLook"); // Make sure this exists in your HTML

  const events = document.querySelectorAll(".event");
  const energy = document.getElementById("energy");
  const glitter = document.getElementById("glitter");
  const coziness = document.getElementById("coziness");
  const resetBtn = document.getElementById("reset");
  const snapshotBtn = document.getElementById("snapshot");
  const log = document.getElementById("log");
  const avatar = document.getElementById("avatar");

  // Profiles
  const elfSelect = document.getElementById("elfSelect");
  const newElfBtn = document.getElementById("newElf");

  // Map roles to default looks
  const roleToLook = {
    "Toy Painter": "painter",
    "Cookie Engineer": "chef",
    "Reindeer Wrangler": "reindeer",
    "Glitter Logistics": "sparkle",
    "Warm Cocoa Specialist": "cocoa"
  };

  // State: multiple elves with independent properties
  let elves = [
    { name: "Pip Glitterwhisk", role: "Toy Painter", look: "painter", mood: 55, energy: 65, glitter: 50, cozy: 70, log: [] }
  ];
  let currentElfIndex = 0;

  // Helpers
  function clamp(n, min=0, max=100){ return Math.max(min, Math.min(max, n)); }

  function moodLabel(val){
    if(val >= 85) return "Radiant joy";
    if(val >= 70) return "Warm and cheerful";
    if(val >= 55) return "Calm and cozy";
    if(val >= 40) return "Wobbly but okay";
    if(val >= 25) return "A bit frazzled";
    return "Oh dear... needs cocoa";
  }

  function moodGlyph(val){
    if(val >= 85) return "🤩";
    if(val >= 70) return "😄";
    if(val >= 55) return "🙂";
    if(val >= 40) return "😕";
    if(val >= 25) return "😟";
    return "🥺";
  }

  // Build SVG for a given look. Important: keep eye/mouth element IDs consistent (eyeL, eyeR, mouth)
  function svgForLook(look){
    switch(look){
      case "painter":
        return `
          <svg viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg" aria-label="Elf avatar">
            <circle cx="80" cy="80" r="45" fill="#ffd7a1"/>
            <path d="M30 60 C40 30, 120 30, 130 60 L30 60 Z" fill="#ff75b3"/>
            <circle cx="30" cy="60" r="6" fill="#ffffff"/>
            <circle id="eyeL" cx="65" cy="78" r="5" fill="#333"/>
            <circle id="eyeR" cx="95" cy="78" r="5" fill="#333"/>
            <path id="mouth" d="M65 98 Q80 110, 95 98" stroke="#333" stroke-width="4" fill="transparent"/>
            <rect x="120" y="100" width="6" height="30" fill="brown"/>
            <circle cx="123" cy="95" r="8" fill="red"/>
          </svg>`;
      case "chef":
        return `
          <svg viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg" aria-label="Elf avatar">
            <circle cx="80" cy="80" r="45" fill="#ffd7a1"/>
            <ellipse cx="80" cy="40" rx="40" ry="20" fill="#ffffff"/>
            <circle id="eyeL" cx="65" cy="78" r="5" fill="#333"/>
            <circle id="eyeR" cx="95" cy="78" r="5" fill="#333"/>
            <path id="mouth" d="M65 98 Q80 110, 95 98" stroke="#333" stroke-width="4" fill="transparent"/>
            <circle cx="120" cy="110" r="12" fill="#d2691e"/>
            <circle cx="118" cy="108" r="2" fill="#2b2b2b"/>
            <circle cx="122" cy="112" r="2" fill="#2b2b2b"/>
          </svg>`;
      case "reindeer":
        return `
          <svg viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg" aria-label="Elf avatar">
            <circle cx="80" cy="80" r="45" fill="#ffd7a1"/>
            <path d="M50 30 L40 10" stroke="saddlebrown" stroke-width="4"/>
            <path d="M110 30 L120 10" stroke="saddlebrown" stroke-width="4"/>
            <circle id="eyeL" cx="65" cy="78" r="5" fill="#333"/>
            <circle id="eyeR" cx="95" cy="78" r="5" fill="#333"/>
            <path id="mouth" d="M65 98 Q80 110, 95 98" stroke="#333" stroke-width="4" fill="transparent"/>
          </svg>`;
      case "sparkle":
        return `
          <svg viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg" aria-label="Elf avatar">
            <circle cx="80" cy="80" r="45" fill="#ffd7a1"/>
            <path d="M30 60 C40 30, 120 30, 130 60 L30 60 Z" fill="#7c5cf5"/>
            <circle id="eyeL" cx="65" cy="78" r="5" fill="#333"/>
            <circle id="eyeR" cx="95" cy="78" r="5" fill="#333"/>
            <path id="mouth" d="M65 98 Q80 110, 95 98" stroke="#333" stroke-width="4" fill="transparent"/>
            <!-- sparkles -->
            <circle cx="40" cy="35" r="2" fill="#ffd86b"/>
            <circle cx="120" cy="32" r="2.5" fill="#ffd86b"/>
            <circle cx="95" cy="20" r="1.8" fill="#ffd86b"/>
          </svg>`;
      case "cocoa":
        return `
          <svg viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg" aria-label="Elf avatar">
            <circle cx="80" cy="80" r="45" fill="#ffd7a1"/>
            <path d="M30 60 C40 30, 120 30, 130 60 L30 60 Z" fill="#2aa84a"/>
            <circle id="eyeL" cx="65" cy="78" r="5" fill="#333"/>
            <circle id="eyeR" cx="95" cy="78" r="5" fill="#333"/>
            <path id="mouth" d="M65 98 Q80 110, 95 98" stroke="#333" stroke-width="4" fill="transparent"/>
            <!-- mug -->
            <rect x="115" y="105" width="16" height="12" rx="2" fill="#8b5a2b"/>
            <rect x="129" y="108" width="4" height="6" rx="2" fill="#8b5a2b"/>
          </svg>`;
      default:
        return `
          <svg viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg" aria-label="Elf avatar">
            <circle cx="80" cy="80" r="45" fill="#ffd7a1"/>
            <path d="M30 60 C40 30, 120 30, 130 60 L30 60 Z" fill="#2aa84a"/>
            <circle id="eyeL" cx="65" cy="78" r="5" fill="#333"/>
            <circle id="eyeR" cx="95" cy="78" r="5" fill="#333"/>
            <path id="mouth" d="M65 98 Q80 110, 95 98" stroke="#333" stroke-width="4" fill="transparent"/>
          </svg>`;
    }
  }

  function updateAvatarSVG(look){
    avatar.innerHTML = svgForLook(look);
  }

  function updateAvatarMood(val){
    // grab current eyes/mouth from the inserted SVG
    const eyeL = avatar.querySelector("#eyeL");
    const eyeR = avatar.querySelector("#eyeR");
    const mouth = avatar.querySelector("#mouth");
    if(!eyeL || !eyeR || !mouth) return; // safety if SVG changed

    const r = clamp(3 + (val/25), 3, 7);
    eyeL.setAttribute("r", r);
    eyeR.setAttribute("r", r);
    if(val >= 55){
      mouth.setAttribute("d", "M65 98 Q80 110, 95 98");
    } else {
      mouth.setAttribute("d", "M65 104 Q80 92, 95 104");
    }
  }

  // Rendering
  function render(){
    const elf = elves[currentElfIndex];
    const label = moodLabel(elf.mood);
    const emoji = moodGlyph(elf.mood);

    moodText.textContent = label;
    moodEmoji.textContent = emoji;
    moodBar.style.width = `${clamp(elf.mood)}%`;

    // mood glow
    if(elf.mood >= 70){
      moodBar.style.filter = "drop-shadow(0 0 12px rgba(255, 220, 150, 0.6))";
    } else if(elf.mood <= 30){
      moodBar.style.filter = "drop-shadow(0 0 10px rgba(255, 100, 100, 0.5))";
    } else {
      moodBar.style.filter = "drop-shadow(0 0 10px rgba(120, 200, 200, 0.5))";
    }

    // Avatar (look + mood)
    updateAvatarSVG(elf.look);
    updateAvatarMood(elf.mood);

    // Form fields
    nameInput.value = elf.name;
    roleSelect.value = elf.role;
    if(lookSelect) lookSelect.value = elf.look;
    energy.value = elf.energy;
    glitter.value = elf.glitter;
    coziness.value = elf.cozy;

    renderLog();
  }

  // Log
  function renderLog(){
    log.innerHTML = "";
    elves[currentElfIndex].log.forEach(entry => log.prepend(entry));
  }

  function addLogEntry(title, delta=0, body=""){
    const entry = document.createElement("div");
    entry.className = "entry";

    const meta = document.createElement("div");
    meta.className = "meta";
    const time = new Date().toLocaleString();
    meta.textContent = `${time} — ${title} ${delta ? `(mood ${delta>0? "+"+delta: delta})` : ""}`;

    const text = document.createElement("pre");
    text.textContent = body || moodSummary();

    entry.appendChild(meta);
    entry.appendChild(text);

    elves[currentElfIndex].log.unshift(entry);
    renderLog();
  }

  function moodSummary(){
    const elf = elves[currentElfIndex];
    return `Mood: ${elf.mood} (${moodLabel(elf.mood)})
Energy: ${elf.energy} | Glitter: ${elf.glitter} | Coziness: ${elf.cozy}`;
  }

  // Events
  events.forEach(btn => {
    btn.addEventListener("click", () => {
      const elf = elves[currentElfIndex];
      const changeAttr = btn.getAttribute("data-change");
      const isRandom = btn.getAttribute("data-random") === "true";

      let delta = 0;
      if(isRandom){
        const mix = (elf.cozy + elf.energy + elf.glitter) / 3;
        const swing = Math.round((Math.random() - 0.5) * 40);
        delta = Math.round(swing + (mix - 50) * 0.2);
      } else {
        delta = parseInt(changeAttr, 10);
      }

      elf.mood = clamp(elf.mood + delta);

      // micro animation
      const card = document.getElementById("elfCard");
      card.classList.remove("pulse");
      void card.offsetWidth;
      card.classList.add("pulse");

      render();
      addLogEntry(btn.textContent, delta);
    });
  });

  // Sliders influence baseline mood
  function baselineAdjust(){
    const elf = elves[currentElfIndex];
    const baseline = Math.round( (elf.energy*0.35 + elf.glitter*0.25 + elf.cozy*0.4) );
    elf.mood = clamp( Math.round( (elf.mood + baseline) / 2 ) );
    render();
  }

  energy.addEventListener("input", () => {
    elves[currentElfIndex].energy = parseInt(energy.value, 10);
    baselineAdjust();
  });
  glitter.addEventListener("input", () => {
    elves[currentElfIndex].glitter = parseInt(glitter.value, 10);
    baselineAdjust();
  });
  coziness.addEventListener("input", () => {
    elves[currentElfIndex].cozy = parseInt(coziness.value, 10);
    baselineAdjust();
  });

  // Reset current elf
  resetBtn.addEventListener("click", () => {
    const elf = elves[currentElfIndex];
    elf.mood = 55;
    elf.energy = 65; elf.glitter = 50; elf.cozy = 70;
    elf.name = "Pip Glitterwhisk";
    elf.role = "Toy Painter";
    elf.look = roleToLook[elf.role] || "default";
    elf.log = [];
    render();
  });

  // Snapshot diary
  snapshotBtn.addEventListener("click", () => {
    const elf = elves[currentElfIndex];
    const label = moodLabel(elf.mood);
    const emoji = moodGlyph(elf.mood);

    const lines = [
      `${elf.name} (${elf.role}) — ${emoji} ${label}`,
      `Energy ${elf.energy} | Glitter ${elf.glitter} | Coziness ${elf.cozy}`,
      diaryLine(label)
    ];

    addLogEntry("Diary snapshot ✍️", 0, lines.join("\n"));
  });

  function diaryLine(label){
    switch(label){
      case "Radiant joy": return "I danced past the toy line humming jingle tunes. Everything is sparkling.";
      case "Warm and cheerful": return "Shared cocoa with a friend and added extra shimmer to the baubles.";
      case "Calm and cozy": return "Slow and steady. The workshop hums like a lullaby tonight.";
      case "Wobbly but okay": return "A few hiccups today, but the bells still ring sweetly.";
      case "A bit frazzled": return "Glitter in my hair, plans on the floor, but hope in my pocket.";
      default: return "Deep breaths. I’ll warm my hands by the fire and try again.";
    }
  }

  // Profiles management
  function refreshElfSelect(){
    elfSelect.innerHTML = "";
    elves.forEach((elf, i) => {
      const opt = document.createElement("option");
      opt.value = i;
      opt.textContent = elf.name;
      elfSelect.appendChild(opt);
    });
    elfSelect.value = currentElfIndex;
  }

  elfSelect.addEventListener("change", () => {
    currentElfIndex = parseInt(elfSelect.value, 10);
    render();
  });

  newElfBtn.addEventListener("click", () => {
    const name = prompt("Enter elf name:") || "Unnamed Elf";
    const role = prompt("Enter elf role:") || "Toy Painter";
    const look = roleToLook[role] || "default";

    elves.push({ name, role, look, mood: 55, energy: 65, glitter: 50, cozy: 70, log: [] });
    currentElfIndex = elves.length - 1;
    refreshElfSelect();
    render();
  });

  // Role changes auto-assign default look, but allow manual override via Look selector
  roleSelect.addEventListener("change", () => {
    const elf = elves[currentElfIndex];
    elf.role = roleSelect.value;
    elf.look = roleToLook[elf.role] || elf.look || "default";
    if(lookSelect) lookSelect.value = elf.look;
    render();
  });

  if(lookSelect){
    lookSelect.addEventListener("change", () => {
      const elf = elves[currentElfIndex];
      elf.look = lookSelect.value;
      render();
    });
  }

  // Initial setup
  refreshElfSelect();
  render();
});
