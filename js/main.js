(function () {
  if (typeof data === "undefined" || !data.results || !data.results.length) {
    console.warn("No data found. Paste JSON into js/data.js as const data = { ... }");
    return;
  }

  // Shuffle users for randomized order each time
  const users = data.results.slice();
  for (let i = users.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [users[i], users[j]] = [users[j], users[i]];
  }

  let index = 0;             // start with first (now randomized) user
  let currentField = "name"; // default field shown

  // DOM elements
  const avatarEl = document.getElementById("avatar");
  const labelEl = document.getElementById("label");
  const valueEl = document.getElementById("value");
  const thumbsEl = document.getElementById("thumbs");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");

  const fieldLabels = {
    name: "Hi, my name is",
    email: "My email address is",
    dob: "My birthday is",
    location: "My address is",
    phone: "My phone is",
    password: "My password is"
  };

  function cap(s) {
    return s ? s[0].toUpperCase() + s.slice(1) : "";
  }

  function fullName(u) {
    const title = u.name?.title ? cap(u.name.title) + " " : "";
    return `${title}${cap(u.name.first)} ${cap(u.name.last)}`;
  }

  function formatDOB(u) {
    const date = new Date(u.dob?.date);
    if (isNaN(date)) return "N/A";
    const pretty = date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
    const age = u.dob?.age != null ? ` (Age ${u.dob.age})` : "";
    return pretty + age;
  }

  function formatLocation(u) {
    const st = u.location?.street;
    const street = st ? `${st.number} ${st.name}` : "";
    const city = u.location?.city || "";
    const state = u.location?.state || "";
    const country = u.location?.country || "";
    const code = u.location?.postcode != null ? String(u.location.postcode) : "";
    return [street, city, state, country, code].filter(Boolean).join(", ");
  }

  function formatPhone(u) {
    const phones = [u.phone, u.cell].filter(Boolean);
    return phones.length ? phones.join(" / ") : "N/A";
  }

  function fieldValue(u, field) {
    switch (field) {
      case "name": return fullName(u);
      case "email": return u.email || "N/A";
      case "dob": return formatDOB(u);
      case "location": return formatLocation(u);
      case "phone": return formatPhone(u);
      case "password": return u.login?.password || "N/A";
      default: return fullName(u);
    }
  }

  function setAriaSelected(field) {
    document.querySelectorAll(".icon-btn").forEach(btn => {
      btn.setAttribute("aria-selected", btn.dataset.type === field ? "true" : "false");
    });
  }

  function renderMain(u, field = currentField) {
    avatarEl.src = u.picture?.large || u.picture?.medium || u.picture?.thumbnail || "";
    avatarEl.alt = `${fullName(u)} portrait`;
    labelEl.textContent = fieldLabels[field] || "Hi, my …";
    valueEl.textContent = fieldValue(u, field);
    setAriaSelected(field);
  }

  function renderThumbs() {
    thumbsEl.innerHTML = "";
    users.forEach((u, i) => {
      const btn = document.createElement("button");
      btn.className = "thumb";
      btn.type = "button";
      btn.setAttribute("aria-label", `Select ${fullName(u)}`);
      btn.innerHTML = `
        <img src="${u.picture?.thumbnail}" alt="" />
        <span class="meta">
          <span class="name">${cap(u.name.first)} ${cap(u.name.last)}</span>
          <span class="sub">${u.location?.country || ""}</span>
        </span>
      `;
      btn.addEventListener("click", () => {
        index = i;
        currentField = "name";
        renderMain(users[index], currentField);
        scrollCardIntoView();
      });
      thumbsEl.appendChild(btn);
    });
  }

  function scrollCardIntoView() {
    document.querySelector(".card")?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function prev() {
    index = (index - 1 + users.length) % users.length;
    currentField = "name";
    renderMain(users[index], currentField);
  }

  function next() {
    index = (index + 1) % users.length;
    currentField = "name";
    renderMain(users[index], currentField);
  }

  // Icon interaction
  document.querySelectorAll(".icon-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      currentField = btn.dataset.type;
      renderMain(users[index], currentField);
    });
    btn.addEventListener("keyup", e => {
      if (e.key === "Enter" || e.key === " ") btn.click();
    });
  });

  prevBtn.addEventListener("click", prev);
  nextBtn.addEventListener("click", next);

  // Initial render
  renderThumbs();
  renderMain(users[index], currentField);
})();