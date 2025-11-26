/**
 * BOOKING MODAL - DEFERRED INITIALIZATION
 *
 * This script only runs when the modal is first opened,
 * saving ~150-300ms of main-thread time on initial page load.
 *
 * The modal HTML/CSS is already in the DOM (from BookingModal.astro),
 * this script handles all the interactivity.
 */

'use strict';

let bookingModalInitialized = false;

function initBookingModal() {
  if (bookingModalInitialized) return;
  bookingModalInitialized = true;

  const calendarGrid = document.getElementById("calendarGrid");
  const monthLabel = document.getElementById("calendarMonthLabel");
  const summaryMain = document.getElementById("summaryMain");
  const summarySecondary = document.getElementById("summarySecondary");
  const summaryMessage = document.getElementById("summaryMessage");
  const confirmBtn = document.getElementById("confirmBtn");
  const clearBtn = document.getElementById("clearBtn");
  const slotsContainer = document.getElementById("slotsContainer");
  const timezoneSelect = document.getElementById("timezoneSelect");

  const userNameInput = document.getElementById("userName");
  const companyNameInput = document.getElementById("companyName");
  const userEmailInput = document.getElementById("userEmail");
  const userPhoneInput = document.getElementById("userPhone");
  const contactMethodHidden = document.getElementById("contactMethod");
  const contactMethodGroup = document.getElementById("contactMethodGroup");
  const extraInfoInput = document.getElementById("extraInfo");

  if (!calendarGrid || !slotsContainer) {
    console.error('Booking modal elements not found');
    return;
  }

  // Contact method buttons logic
  if (contactMethodGroup) {
    const buttons = contactMethodGroup.querySelectorAll('.method-btn');
    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        const method = btn.dataset.method || '';
        if (contactMethodHidden) contactMethodHidden.value = method;
        buttons.forEach(function (b) { b.classList.remove('selected'); });
        btn.classList.add('selected');
      });
    });
  }

  // Basic state
  const today = new Date();
  let currentMonth = today.getMonth();
  let currentYear = today.getFullYear();
  let selectedDate = null;
  let selectedTime = null;

  // Get translations from window object
  const t = window.bookingTranslations || {};

  const weekdayNames = [
    t.weekdaysFull?.sunday || "Sunday",
    t.weekdaysFull?.monday || "Monday",
    t.weekdaysFull?.tuesday || "Tuesday",
    t.weekdaysFull?.wednesday || "Wednesday",
    t.weekdaysFull?.thursday || "Thursday",
    t.weekdaysFull?.friday || "Friday",
    t.weekdaysFull?.saturday || "Saturday"
  ];
  const monthNames = [
    t.months?.january || "January",
    t.months?.february || "February",
    t.months?.march || "March",
    t.months?.april || "April",
    t.months?.may || "May",
    t.months?.june || "June",
    t.months?.july || "July",
    t.months?.august || "August",
    t.months?.september || "September",
    t.months?.october || "October",
    t.months?.november || "November",
    t.months?.december || "December"
  ];

  const slots = [
    "09:00","09:30","10:00","10:30",
    "11:00","11:30","12:00","12:30",
    "13:00","13:30",
    "14:00","14:30","15:00","15:30",
    "16:00","16:30","17:00","17:30",
    "18:00","18:30","19:00","19:30",
    "20:00"
  ];

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function toISODate(year, monthIndex, day) {
    return year + "-" + pad(monthIndex + 1) + "-" + pad(day);
  }

  function renderCalendar() {
    calendarGrid.innerHTML = "";
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    const totalDays = lastDayOfMonth.getDate();

    let startDay = firstDayOfMonth.getDay();
    startDay = (startDay + 6) % 7;

    monthLabel.textContent = monthNames[currentMonth] + " " + currentYear;

    for (let i = 0; i < startDay; i++) {
      const emptyBtn = document.createElement("button");
      emptyBtn.className = "calendar-day calendar-day--empty";
      emptyBtn.disabled = true;
      calendarGrid.appendChild(emptyBtn);
    }

    for (let day = 1; day <= totalDays; day++) {
      const btn = document.createElement("button");
      btn.className = "calendar-day";
      const dateISO = toISODate(currentYear, currentMonth, day);

      const dateObj = new Date(currentYear, currentMonth, day);
      const isPast = dateObj < new Date(today.getFullYear(), today.getMonth(), today.getDate());

      if (isPast) {
        btn.classList.add("calendar-day--empty");
        btn.disabled = true;
        btn.style.opacity = "0.4";
      }

      const isToday = dateObj.toDateString() === new Date().toDateString();
      if (isToday && !isPast) {
        btn.classList.add("calendar-day--today");
      }

      if (selectedDate === dateISO) {
        btn.classList.add("calendar-day--selected");
      }

      btn.dataset.date = dateISO;
      btn.innerHTML = "<span>" + day + "</span>";

      btn.addEventListener("click", function () {
        if (btn.classList.contains("calendar-day--empty")) return;
        selectedDate = dateISO;
        selectedTime = null;
        document.querySelectorAll(".calendar-day--selected").forEach(function (el) {
          el.classList.remove("calendar-day--selected");
        });
        btn.classList.add("calendar-day--selected");
        document.querySelectorAll(".slot-btn--selected").forEach(function (el) {
          el.classList.remove("slot-btn--selected");
        });
        updateLabels();
      });

      calendarGrid.appendChild(btn);
    }
  }

  function renderSlots() {
    slotsContainer.innerHTML = "";
    slots.forEach(function (timeStr) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "slot-btn";
      btn.dataset.time = timeStr;

      if (selectedTime === timeStr) {
        btn.classList.add("slot-btn--selected");
      }

      btn.innerHTML = "<span>" + timeStr + "</span>";

      btn.addEventListener("click", function () {
        selectedTime = timeStr;
        document.querySelectorAll(".slot-btn--selected").forEach(function (el) {
          el.classList.remove("slot-btn--selected");
        });
        btn.classList.add("slot-btn--selected");
        updateLabels();
      });

      slotsContainer.appendChild(btn);
    });
  }

  function formatReadableDate(iso) {
    if (!iso) return "No date selected";
    const parts = iso.split("-");
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const d = new Date(year, month, day);
    const weekday = weekdayNames[d.getDay()];
    return weekday + ", " + d.getDate() + " " + monthNames[month] + " " + year;
  }

  function updateLabels() {
    const hasDate = !!selectedDate;
    const hasTime = !!selectedTime;

    if (!hasDate && !hasTime) {
      summaryMain.textContent = t.chooseDateAndTime || "Choose a date & time";
      summarySecondary.textContent = t.calendarInviteMessage ||
        "You'll receive the calendar invite & meeting link right after confirming.";
      confirmBtn.disabled = true;
      hideMessage();
      return;
    }

    if (hasDate && !hasTime) {
      summaryMain.textContent = formatReadableDate(selectedDate);
      summarySecondary.textContent = t.messages?.awaitingTimeSelection ||
        "Now choose a time slot to complete your booking.";
      confirmBtn.disabled = true;
      hideMessage();
      return;
    }

    if (hasDate && hasTime) {
      summaryMain.textContent = formatReadableDate(selectedDate) + " • " + selectedTime;
      const timezoneLabel = timezoneSelect.options[timezoneSelect.selectedIndex].textContent;
      summarySecondary.textContent = (t.messages?.scheduledInTimezone || "Your meeting will be scheduled in ") + timezoneLabel + ".";
      confirmBtn.disabled = false;
      hideMessage();
    }
  }

  function showMessage(text, type) {
    summaryMessage.textContent = text;
    summaryMessage.className = "booking-message visible " + type;
  }

  function hideMessage() {
    summaryMessage.textContent = "";
    summaryMessage.className = "booking-message";
  }

  function clearSelection() {
    selectedDate = null;
    selectedTime = null;
    document.querySelectorAll('.calendar-day--selected').forEach(function (el) {
      el.classList.remove('calendar-day--selected');
    });
    document.querySelectorAll('.slot-btn--selected').forEach(function (el) {
      el.classList.remove('slot-btn--selected');
    });
    if (userNameInput) userNameInput.value = '';
    if (companyNameInput) companyNameInput.value = '';
    if (userEmailInput) userEmailInput.value = '';
    if (userPhoneInput) userPhoneInput.value = '';
    if (contactMethodHidden) contactMethodHidden.value = '';
    if (contactMethodGroup) {
      contactMethodGroup.querySelectorAll('.method-btn.selected').forEach(function (btn) {
        btn.classList.remove('selected');
      });
    }
    if (extraInfoInput) extraInfoInput.value = '';
    hideMessage();
    updateLabels();
  }

  // Email validation
  if (userEmailInput) {
    userEmailInput.addEventListener('blur', function() {
      const email = this.value.trim();
      if (email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          this.style.borderColor = 'rgba(239, 68, 68, 0.5)';
          showMessage('Please enter a valid email address (e.g., name@example.com)', 'error');
        } else {
          this.style.borderColor = 'rgba(34, 197, 94, 0.5)';
          hideMessage();
        }
      } else {
        this.style.borderColor = '';
      }
    });

    userEmailInput.addEventListener('input', function() {
      hideMessage();
    });
  }

  const prevMonthBtn = document.getElementById("prevMonthBtn");
  const nextMonthBtn = document.getElementById("nextMonthBtn");

  if (prevMonthBtn) {
    prevMonthBtn.addEventListener("click", function () {
      currentMonth--;
      if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
      }
      renderCalendar();
    });
  }

  if (nextMonthBtn) {
    nextMonthBtn.addEventListener("click", function () {
      currentMonth++;
      if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
      }
      renderCalendar();
    });
  }

  if (confirmBtn) {
    confirmBtn.addEventListener("click", async function () {
      if (!selectedDate || !selectedTime) {
        showMessage(t.messages?.selectBoth || "Please choose both a date and a time slot.", 'error');
        return;
      }

      const name = userNameInput.value.trim();
      const email = userEmailInput.value.trim();
      const company = companyNameInput.value.trim();
      const phone = userPhoneInput.value.trim();
      const contactMethod = contactMethodHidden.value;
      const extraInfo = extraInfoInput.value.trim();

      if (!name || !email || !contactMethod) {
        showMessage(t.messages?.fillRequired || "Please add your name, email and preferred contact method to confirm.", 'error');
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showMessage("Please enter a valid email address (e.g., name@example.com)", 'error');
        return;
      }

      const timezoneValue = timezoneSelect.value;

      const payload = {
        date: selectedDate,
        time: selectedTime,
        timezone: timezoneValue,
        name,
        email,
        company,
        phone,
        contactMethod,
        extraInfo
      };

      showMessage(t.messages?.creating || "Creating your calendar event…", 'info');

      try {
        const res = await fetch("/api/book", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        if (!res.ok) {
          let errMsg = t.messages?.errorCreate || "Failed to create calendar event.";
          try {
            const err = await res.json();
            if (err && err.message) errMsg = err.message;
            else if (err && err.error) errMsg = err.error;
          } catch (_) {}
          throw new Error(errMsg);
        }

        const data = await res.json();

        let successMsg = (t.messages?.confirmationPrefix || "Booking confirmed for ") +
          formatReadableDate(selectedDate) +
          (t.messages?.confirmationAt || " at ") +
          selectedTime +
          (t.messages?.confirmationVia || " via ") +
          contactMethod + ". ";

        if (data.emailSent) {
          successMsg += "A confirmation email has been sent to " + email + ".";
        } else {
          successMsg += "Calendar event created. Please check " + email + " for the calendar invite.";
        }
        showMessage(successMsg, 'success');

        setTimeout(() => {
          clearSelection();
          setTimeout(() => {
            window.closeBookingModal();
          }, 1500);
        }, 2000);
      } catch (err) {
        console.error(err);
        showMessage(t.messages?.errorSave || "We couldn't save this to the calendar. Please try again or contact support.", 'error');
      }
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener("click", clearSelection);
  }

  if (timezoneSelect) {
    timezoneSelect.addEventListener("change", updateLabels);
  }

  // Auto-select today's date and default time
  const todayStr = toISODate(today.getFullYear(), today.getMonth(), today.getDate());
  selectedDate = todayStr;
  selectedTime = "14:00";

  renderCalendar();
  renderSlots();
  updateLabels();
}

// Modal open/close functions
window.openBookingModal = function() {
  // Lazy initialize modal on first open
  initBookingModal();

  const overlay = document.getElementById('bookingModalOverlay');
  if (overlay) {
    overlay.style.display = 'flex';
    requestAnimationFrame(() => {
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.height = '100%';
    });
  }
};

window.closeBookingModal = function() {
  const overlay = document.getElementById('bookingModalOverlay');
  if (overlay) {
    overlay.classList.remove('active');
    setTimeout(() => {
      overlay.style.display = 'none';
    }, 300);
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.width = '';
    document.body.style.height = '';
  }
};

// Setup modal close handlers - deferred
function setupModalCloseHandlers() {
  const closeBtn = document.getElementById('bookingModalClose');
  if (closeBtn) {
    closeBtn.addEventListener('click', window.closeBookingModal);
  }

  const overlay = document.getElementById('bookingModalOverlay');
  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        window.closeBookingModal();
      }
    });
  }

  // Auto-open modal if URL hash is #book-consultation
  if (window.location.hash === '#book-consultation') {
    setTimeout(() => {
      window.openBookingModal();
      history.replaceState(null, '', window.location.pathname);
    }, 500);
  }
}

// Schedule close handlers setup during idle time
if ('requestIdleCallback' in window) {
  requestIdleCallback(setupModalCloseHandlers, { timeout: 3000 });
} else {
  setTimeout(setupModalCloseHandlers, 100);
}
