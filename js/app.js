const storedLanguage = localStorage.getItem("language") || "en";
let language = storedLanguage;

async function loadData() {
    const response = await fetch(`data/${language}.json`);
    const data = await response.json();
    renderPage(data);
    applyTranslations(data);
    setupLanguageToggle();
    updateActiveNav();
}

function renderPage(data) {
    if (document.getElementById("announcementContainer")) {
        renderAnnouncements(data);
        renderRecurring(data);
        renderLesson(data);
    }

    if (document.getElementById("calendarEvents")) {
        renderCalendar(data);
    }

    if (document.getElementById("prayerRequests")) {
        renderPrayerRoll(data);
    }
}

function renderLesson(data) {
    const lessonLink = document.getElementById("lessonLink");
    const lessonTitle = document.getElementById("lessonTitle");
    const lessonSubtitle = document.getElementById("lessonSubtitle");
    const lessonImage = document.getElementById("lessonImage");

    if (!lessonLink || !lessonTitle || !lessonSubtitle || !lessonImage) return;

    lessonTitle.textContent = data.todayLesson.title;
    lessonSubtitle.textContent = data.todayLesson.subtitle;
    lessonImage.src = data.todayLesson.image;
    lessonImage.alt = data.todayLesson.title;
    lessonLink.href = data.todayLesson.link;
}

function renderAnnouncements(data) {
    const container = document.getElementById("announcementContainer");
    if (!container) return;

    container.innerHTML = "";

    if (!data.announcements || !data.announcements.length) {
        container.innerHTML = `<div class="empty-state"><span class="material-symbols-outlined empty-icon">campaign</span><h3>No Announcements</h3><p>There are no announcements available.</p></div>`;
        return;
    }

    data.announcements.slice(0, 3).forEach((item) => {
        const card = document.createElement("article");
        card.className = "card announcement-card";
        card.innerHTML = `
            <div class="image">
                <img src="${item.image}" alt="${item.title}">
            </div>
            <div class="content">
                <a href="#">
                    <span class="title">${item.title}</span>
                </a>
                <p class="desc">${item.date} · ${item.time} · ${item.where}</p>
            </div>
        `;
        container.appendChild(card);
    });
}

function renderRecurring(data) {
    const container = document.getElementById("recurringContainer");
    if (!container) return;

    container.innerHTML = "";

    if (!data.recurringActivities || !data.recurringActivities.length) {
        container.innerHTML = `<div class="empty-state"><span class="material-symbols-outlined empty-icon">event_repeat</span><h3>No Activities</h3><p>There are no recurring activities.</p></div>`;
        return;
    }

    data.recurringActivities.forEach((item) => {
        const card = document.createElement("article");
        card.className = "card recurring-card";
        card.innerHTML = `
            <div class="image">
                <img src="${item.image}" alt="${item.title}">
            </div>
            <div class="content">
                <a href="#">
                    <span class="title">${item.title}</span>
                </a>
                <p class="desc">${item.date} · ${item.time} · ${item.where}</p>
            </div>
        `;
        container.appendChild(card);
    });
}

function renderCalendar(data) {
    const container = document.getElementById("calendarEvents");
    if (!container) return;

    const month = data.calendar?.[0];
    if (!month) {
        container.innerHTML = '<div class="empty-state"><span class="material-symbols-outlined empty-icon">calendar_month</span><h3>No Events</h3><p>No calendar events available.</p></div>';
        return;
    }

    container.innerHTML = `
        <div class="calendar-item">
            <h3>${month.month}</h3>
        </div>
    `;

    month.events.forEach((event) => {
        const item = document.createElement("div");
        item.className = "calendar-item";
        item.innerHTML = `
            <h3>${event.title}</h3>
            <p>${event.date}</p>
            <p>${event.time}</p>
            <p>${event.location}</p>
        `;
        container.appendChild(item);
    });
}

function renderPrayerRoll(data) {
    const requestsContainer = document.getElementById("prayerRequests");
    const risingContainer = document.getElementById("risingGeneration");

    if (requestsContainer) {
        requestsContainer.innerHTML = "";
        data.prayerRequests.forEach((request) => {
            const item = document.createElement("div");
            item.className = "list-item";
            item.innerHTML = `<h3>${request.name}</h3><p>${request.reason}</p>`;
            requestsContainer.appendChild(item);
        });
    }

    if (risingContainer) {
        risingContainer.innerHTML = "";
        data.risingGeneration.forEach((name) => {
            const item = document.createElement("div");
            item.className = "list-item";
            item.innerHTML = `<h3>${name}</h3>`;
            risingContainer.appendChild(item);
        });
    }
}

function applyTranslations(data) {
    document.documentElement.lang = language === "es" ? "es" : "en";

    const translationTargets = document.querySelectorAll("[data-i18n]");
    translationTargets.forEach((element) => {
        const key = element.getAttribute("data-i18n");
        if (data[key]) {
            element.textContent = data[key];
        }
    });

    const pageTitle = document.getElementById("pageTitle");
    if (pageTitle) {
        const titleKey = pageTitle.getAttribute("data-i18n");
        if (data[titleKey]) {
            pageTitle.textContent = data[titleKey];
        }
    }
}

function updateActiveNav() {
    const currentPage = document.body.getAttribute("data-page");
    document.querySelectorAll(".bottom-nav a").forEach((link) => {
        const linkPage = link.getAttribute("data-nav");
        link.classList.toggle("active", linkPage === currentPage);
    });
}

function setupLanguageToggle() {
    const toggle = document.getElementById("languageSwitch");
    if (!toggle) return;

    toggle.checked = language === "es";
    toggle.addEventListener("change", () => {
        language = toggle.checked ? "es" : "en";
        localStorage.setItem("language", language);
        location.reload();
    });
}

loadData();
