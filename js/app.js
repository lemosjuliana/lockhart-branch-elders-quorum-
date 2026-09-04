const storedLanguage = localStorage.getItem("language") || "en";
let language = storedLanguage;
let lastModalTrigger = null;

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
        card.className = "card announcement-card activity-card";
        card.tabIndex = 0;
        card.setAttribute("role", "button");
        card.setAttribute("aria-label", `View details for ${item.title}`);
        card.innerHTML = `
            <div class="image">
                <img src="${item.image}" alt="${item.title}">
            </div>
            <div class="content">
                <a href="#">
                    <span class="title">${item.title}</span>
                </a>
                <p class="desc">${item.date} · ${item.time}</p>
            </div>
        `;
        setupActivityCard(card, item);
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
        card.className = "card recurring-card activity-card";
        card.tabIndex = 0;
        card.setAttribute("role", "button");
        card.setAttribute("aria-label", `View details for ${item.title}`);
        card.innerHTML = `
            <div class="image">
                <img src="${item.image}" alt="${item.title}">
            </div>
            <div class="content">
                <a href="#">
                    <span class="title">${item.title}</span>
                </a>
                <p class="desc">${item.date} · ${item.time}</p>
            </div>
        `;
        setupActivityCard(card, item);
        container.appendChild(card);
    });
}

function setupActivityCard(card, item) {
    card.addEventListener("click", (event) => {
        event.preventDefault();
        openActivityModal(item, card);
    });
    card.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openActivityModal(item, card);
        }
    });
}

function openActivityModal(item, trigger) {
    const modal = document.getElementById("activityModal");
    if (!modal) return;

    lastModalTrigger = trigger;
    document.getElementById("activityModalTitle").textContent = item.title;
    document.getElementById("activityModalDescription").textContent = item.description || "";
    document.getElementById("activityModalDate").textContent = item.date;
    document.getElementById("activityModalTime").textContent = item.time;
    document.getElementById("activityModalWhere").textContent = item.where;
    modal.hidden = false;
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    document.getElementById("activityModalClose").focus();
}

function closeActivityModal() {
    const modal = document.getElementById("activityModal");
    if (!modal || modal.hidden) return;

    modal.hidden = true;
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    lastModalTrigger?.focus();
}

function setupActivityModal() {
    const modal = document.getElementById("activityModal");
    if (!modal) return;

    document.getElementById("activityModalClose").addEventListener("click", closeActivityModal);
    modal.querySelector("[data-modal-close]").addEventListener("click", closeActivityModal);
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") closeActivityModal();
    });
}

function renderCalendar(data) {
    const container = document.getElementById("calendarEvents");
    if (!container) return;

    const announcements = data.announcements || [];
    if (!announcements.length) {
        container.innerHTML = '<div class="empty-state"><span class="material-symbols-outlined empty-icon">calendar_month</span><h3>No Events</h3><p>No calendar events available.</p></div>';
        return;
    }

    const activitiesByMonth = announcements.reduce((groups, activity) => {
        const month = activity.month || "Upcoming Activities";
        (groups[month] ||= []).push(activity);
        return groups;
    }, {});

    container.innerHTML = "";
    Object.entries(activitiesByMonth).forEach(([month, activities]) => {
        const monthSection = document.createElement("section");
        monthSection.className = "calendar-month";
        monthSection.innerHTML = `<h2 class="section-heading">${month}</h2><div class="list-card"></div>`;

        const list = monthSection.querySelector(".list-card");
        activities.forEach((activity) => {
            const item = document.createElement("div");
            item.className = "list-item";
            item.innerHTML = `
                <h4>${activity.title}</h4>
                <p>${activity.date}</p>
                <p>${activity.time}</p>
            `;
            list.appendChild(item);
        });

        container.appendChild(monthSection);
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

setupActivityModal();
loadData();
