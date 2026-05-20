const adminLogin = document.getElementById("adminLogin");
const adminKey = document.getElementById("adminKey");
const adminMessage = document.getElementById("adminMessage");
const adminContent = document.getElementById("adminContent");
const responseList = document.getElementById("responseList");
const acceptCount = document.getElementById("acceptCount");
const declineCount = document.getElementById("declineCount");
const plusOneCount = document.getElementById("plusOneCount");
const refreshAdmin = document.getElementById("refreshAdmin");
const downloadCsv = document.getElementById("downloadCsv");

let currentAdminKey = sessionStorage.getItem("rsvpAdminKey") || "";
let currentRsvps = [];

if (currentAdminKey) {
  adminKey.value = currentAdminKey;
  loadAdmin();
}

adminLogin.addEventListener("submit", (event) => {
  event.preventDefault();
  currentAdminKey = adminKey.value.trim();
  sessionStorage.setItem("rsvpAdminKey", currentAdminKey);
  loadAdmin();
});

refreshAdmin.addEventListener("click", loadAdmin);
downloadCsv.addEventListener("click", downloadCsvFile);

async function loadAdmin() {
  if (!currentAdminKey) {
    adminMessage.textContent = "Enter your admin key.";
    return;
  }

  adminMessage.textContent = "Loading...";

  try {
    const response = await fetch("/api/rsvps", {
      headers: { "x-admin-key": currentAdminKey }
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Unable to load RSVPs.");
    }

    currentRsvps = data.rsvps || [];
    acceptCount.textContent = data.summary.accept;
    declineCount.textContent = data.summary.decline;
    plusOneCount.textContent = data.summary.plusOnes;
    adminContent.hidden = false;
    adminMessage.textContent = "";

    if (!currentRsvps.length) {
      responseList.innerHTML = "<p>No replies yet.</p>";
      return;
    }

    responseList.innerHTML = currentRsvps
      .slice()
      .reverse()
      .map((item) => {
        const status = item.attendance === "accept" ? "Coming" : "Not coming";
        const plusOne = item.plusOne === "yes"
          ? `Plus one: ${escapeHtml(item.plusOneName || "Yes")}`
          : "No plus one";
        const diet = item.dietaryRestrictions
          ? `<p class="note">Dietary: ${escapeHtml(item.dietaryRestrictions)}</p>`
          : "";
        const note = item.note ? `<p class="note">Note: ${escapeHtml(item.note)}</p>` : "";
        const submitted = item.submittedAt
          ? new Date(item.submittedAt).toLocaleString()
          : "";
        return `
          <article data-id="${escapeHtml(item.id)}">
            <div>
              <h3>${escapeHtml(item.name)}</h3>
              <p>${escapeHtml(item.email)}</p>
              <p>${plusOne}</p>
              <p class="small">${escapeHtml(submitted)}</p>
            </div>
            <div class="response-meta">
              <p class="status">${status}</p>
              <button class="delete-rsvp" type="button" data-id="${escapeHtml(item.id)}" aria-label="Delete RSVP">×</button>
            </div>
            ${diet}
            ${note}
          </article>
        `;
      })
      .join("");

    responseList.querySelectorAll(".delete-rsvp").forEach((btn) => {
      btn.addEventListener("click", (event) => deleteRsvp(event.currentTarget.dataset.id));
    });
  } catch (error) {
    adminContent.hidden = true;
    adminMessage.textContent = error.message;
  }
}

async function deleteRsvp(id) {
  if (!id || !confirm("Delete this RSVP? This can't be undone.")) return;
  try {
    const response = await fetch(`/api/rsvps/${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: { "x-admin-key": currentAdminKey }
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Could not delete RSVP");
    loadAdmin();
  } catch (error) {
    adminMessage.textContent = error.message;
  }
}

function downloadCsvFile() {
  if (!currentRsvps.length) return;
  const headers = [
    "Name",
    "Email",
    "Attendance",
    "Plus One",
    "Plus One Name",
    "Dietary Restrictions",
    "Note",
    "Submitted"
  ];
  const rows = currentRsvps.map((r) => [
    r.name || "",
    r.email || "",
    r.attendance || "",
    r.plusOne || "no",
    r.plusOneName || "",
    r.dietaryRestrictions || "",
    r.note || "",
    r.submittedAt || ""
  ]);
  const csv = [headers, ...rows]
    .map((row) =>
      row
        .map((cell) => {
          const s = String(cell || "");
          return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
        })
        .join(",")
    )
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `rsvps-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    }[character];
  });
}
