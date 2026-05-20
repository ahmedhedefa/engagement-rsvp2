const envelope = document.getElementById("envelope");
const scrollCue = document.getElementById("scrollCue");
const form = document.getElementById("rsvpForm");
const message = document.getElementById("formMessage");
const thanksPanel = document.getElementById("thanksPanel");
const thanksText = document.getElementById("thanksText");
const attendanceAccept = document.getElementById("attendanceAccept");
const attendanceDecline = document.getElementById("attendanceDecline");
const plusOneFieldset = document.getElementById("plusOneFieldset");
const plusOneYes = document.getElementById("plusOneYes");
const plusOneNo = document.getElementById("plusOneNo");
const plusOneDetails = document.getElementById("plusOneDetails");
const dietaryField = document.getElementById("dietaryField");

function openEnvelope() {
  if (envelope.classList.contains("is-open")) return;
  envelope.classList.add("is-open");
  scrollCue.classList.add("is-visible");

  window.setTimeout(() => {
    envelope.classList.add("is-flap-behind");
  }, 620);

  window.setTimeout(() => {
    envelope.classList.add("is-card-visible");
  }, 980);

  // Total animation is ~2.7s (flap + card slide)
  setTimeout(() => {
    document.getElementById("rsvp").scrollIntoView({ behavior: "smooth", block: "start" });
  }, 2800);
}

envelope.addEventListener("click", openEnvelope);

envelope.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" && event.key !== " ") return;
  event.preventDefault();
  openEnvelope();
});

function updateAttendingFields() {
  const accepting = attendanceAccept.checked;
  const declining = attendanceDecline.checked;

  plusOneFieldset.hidden = !accepting;
  dietaryField.hidden = !accepting;
  plusOneYes.required = accepting;
  plusOneNo.required = accepting;

  if (!accepting) {
    plusOneYes.checked = false;
    plusOneNo.checked = false;
    dietaryField.querySelector("textarea").value = "";
  }

  if (declining) {
    plusOneDetails.hidden = true;
    plusOneDetails.querySelector("input").required = false;
    plusOneDetails.querySelector("input").value = "";
  }

  updatePlusOneDetails();
}

function updatePlusOneDetails() {
  const showName = plusOneYes.checked && attendanceAccept.checked;
  plusOneDetails.hidden = !showName;
  plusOneDetails.querySelector("input").required = showName;
  if (!showName) {
    plusOneDetails.querySelector("input").value = "";
  }
}

attendanceAccept.addEventListener("change", updateAttendingFields);
attendanceDecline.addEventListener("change", updateAttendingFields);
plusOneYes.addEventListener("change", updatePlusOneDetails);
plusOneNo.addEventListener("change", updatePlusOneDetails);
updateAttendingFields();

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  message.textContent = "Sending...";

  const submitBtn = form.querySelector("button[type=submit]");
  submitBtn.disabled = true;

  const formData = new FormData(form);
  const payload = Object.fromEntries(formData.entries());

  if (payload.attendance === "decline") {
    payload.plusOne = "no";
    payload.plusOneName = "";
    payload.dietaryRestrictions = "";
  }

  try {
    const response = await fetch("/api/rsvps", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Unable to send your RSVP.");
    }

    form.hidden = true;
    thanksPanel.hidden = false;
    if (payload.attendance === "accept") {
      thanksText.innerHTML =
        "We can't wait to celebrate with you on August 8th.<br><br>" +
        "Your response has been received with so much love.";
    } else {
      thanksText.innerHTML =
        "We'll miss you, but we understand.<br><br>" +
        "Thank you for letting us know — your kind wishes mean the world.";
    }
    thanksPanel.scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (error) {
    message.textContent = error.message;
    submitBtn.disabled = false;
  }
});
