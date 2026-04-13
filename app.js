const STORAGE_KEYS = {
  session: "cleargov_session",
  reports: "cleargov_reports",
  alerts: "cleargov_alerts",
};

const budgetData = {
  labels: ["Health", "Transport", "Education", "Housing", "Security", "Other"],
  values: [530, 340, 410, 220, 300, 180],
};

const monthlySpend = [110, 125, 132, 144, 138, 151, 162, 157, 168, 176, 170, 183];

const recentActivities = [
  "Treasury uploaded Q1 procurement report.",
  "Public Works contract flagged for review.",
  "3 new whistleblower reports received in last 24h.",
  "Audit trail synced with provincial oversight office.",
];

const alertTemplates = [
  {
    title: "Suspicious Transactions",
    severity: "High",
    messages: [
      "Large transfer split into repeated micro-payments.",
      "Vendor account changed 2 times within 48 hours.",
    ],
  },
  {
    title: "Duplicate Payments",
    severity: "Medium",
    messages: [
      "Invoice INV-3381 paid to two suppliers.",
      "Duplicate line item detected in municipal purchase batch.",
    ],
  },
  {
    title: "Budget Anomaly",
    severity: "High",
    messages: [
      "Department spend exceeds monthly forecast by 24%.",
      "Unexpected overtime costs linked to a single contractor.",
    ],
  },
];

const state = {
  pieChart: null,
  barChart: null,
};

const sidebar = document.querySelector(".sidebar");
const mobileNavToggle = document.getElementById("mobileNavToggle");
const loginPanel = document.getElementById("loginPanel");
const appPanel = document.getElementById("appPanel");
const sessionUserLabel = document.getElementById("sessionUserLabel");

function init() {
  registerEvents();
  renderActivities();
  renderTotalBudget();
  renderReportHistory();
  renderAlerts();

  const session = getFromStorage(STORAGE_KEYS.session, null);
  if (session?.username) {
    showApp(session.username);
  } else {
    showLogin();
  }
}

function registerEvents() {
  document.getElementById("loginForm").addEventListener("submit", handleLogin);
  document.getElementById("signOutBtn").addEventListener("click", handleSignOut);
  document.getElementById("reportForm").addEventListener("submit", handleReportSubmission);
  document.getElementById("runAiScanBtn").addEventListener("click", handleAiScan);
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", () => switchView(link.dataset.target));
  });
  mobileNavToggle.addEventListener("click", () => sidebar.classList.toggle("open"));
}

function handleLogin(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const username = form.username.value.trim();
  const password = form.password.value.trim();

  if (!username || password.length < 6) return;

  saveToStorage(STORAGE_KEYS.session, { username, loggedInAt: new Date().toISOString() });
  showApp(username);
  form.reset();
}

function handleSignOut() {
  localStorage.removeItem(STORAGE_KEYS.session);
  showLogin();
}

function showApp(username) {
  loginPanel.classList.remove("visible");
  appPanel.classList.add("visible");
  sessionUserLabel.textContent = `Signed in as ${username}`;

  if (!state.pieChart || !state.barChart) {
    createCharts();
  }
}

function showLogin() {
  loginPanel.classList.add("visible");
  appPanel.classList.remove("visible");
  sessionUserLabel.textContent = "Not signed in";
}

function switchView(targetId) {
  document.querySelectorAll(".view").forEach((view) => view.classList.remove("visible"));
  document.querySelectorAll(".nav-link").forEach((item) => item.classList.remove("active"));

  document.getElementById(targetId).classList.add("visible");
  document.querySelector(`.nav-link[data-target='${targetId}']`).classList.add("active");

  if (window.innerWidth <= 820) sidebar.classList.remove("open");
}

function createCharts() {
  state.pieChart = new Chart(document.getElementById("budgetPieChart"), {
    type: "pie",
    data: {
      labels: budgetData.labels,
      datasets: [
        {
          label: "Budget Allocation",
          data: budgetData.values,
          borderWidth: 1,
          hoverOffset: 16,
          backgroundColor: ["#5f8bff", "#5cc8ff", "#9f7cff", "#5bd8a6", "#f5bd3a", "#f48fb1"],
        },
      ],
    },
    options: {
      plugins: {
        legend: { labels: { color: "#dbe6ff" } },
      },
    },
  });

  state.barChart = new Chart(document.getElementById("spendingBarChart"), {
    type: "bar",
    data: {
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      datasets: [
        {
          label: "Spend (R millions)",
          data: monthlySpend,
          borderRadius: 8,
          backgroundColor: "rgba(95, 139, 255, 0.8)",
          hoverBackgroundColor: "rgba(124, 160, 255, 0.95)",
        },
      ],
    },
    options: {
      scales: {
        x: { ticks: { color: "#dbe6ff" }, grid: { color: "rgba(255,255,255,0.06)" } },
        y: { ticks: { color: "#dbe6ff" }, grid: { color: "rgba(255,255,255,0.06)" } },
      },
      plugins: {
        legend: { labels: { color: "#dbe6ff" } },
      },
    },
  });
}

function renderTotalBudget() {
  const total = budgetData.values.reduce((sum, value) => sum + value, 0);
  document.getElementById("totalBudget").textContent = `R ${total.toLocaleString()} M`;
}

function renderActivities() {
  const list = document.getElementById("activityList");
  list.innerHTML = recentActivities.map((item) => `<li>${item}</li>`).join("");
}

function handleReportSubmission(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const report = {
    id: crypto.randomUUID(),
    department: form.department.value.trim(),
    description: form.description.value.trim(),
    fileName: form.evidence.files[0]?.name || "No attachment",
    createdAt: new Date().toISOString(),
  };

  const reports = getFromStorage(STORAGE_KEYS.reports, []);
  reports.unshift(report);
  saveToStorage(STORAGE_KEYS.reports, reports);

  document.getElementById("reportConfirmation").textContent =
    "Report submitted securely. Thank you for helping fight corruption.";

  form.reset();
  renderReportHistory();
}

function renderReportHistory() {
  const reports = getFromStorage(STORAGE_KEYS.reports, []);
  const list = document.getElementById("reportHistory");

  if (!reports.length) {
    list.innerHTML = "<li>No reports submitted yet.</li>";
    return;
  }

  list.innerHTML = reports
    .map(
      (report) => `
      <li>
        <strong>${report.department}</strong><br />
        <span>${report.description}</span><br />
        <small>${new Date(report.createdAt).toLocaleString()} • ${report.fileName}</small>
      </li>
    `
    )
    .join("");
}

function handleAiScan() {
  const generated = alertTemplates.map((template) => ({
    id: crypto.randomUUID(),
    title: template.title,
    severity: template.severity,
    message: template.messages[Math.floor(Math.random() * template.messages.length)],
    createdAt: new Date().toISOString(),
  }));

  const existing = getFromStorage(STORAGE_KEYS.alerts, []);
  const merged = [...generated, ...existing].slice(0, 12);
  saveToStorage(STORAGE_KEYS.alerts, merged);

  renderAlerts();
}

function renderAlerts() {
  const alerts = getFromStorage(STORAGE_KEYS.alerts, []);
  const container = document.getElementById("alertsContainer");
  const badge = document.getElementById("alertBadge");

  badge.textContent = alerts.length;

  if (!alerts.length) {
    container.innerHTML = "<p class='helper'>No alerts yet. Run a scan to generate risk insights.</p>";
    return;
  }

  container.innerHTML = alerts
    .map(
      (alert) => `
      <article class="alert-card">
        <p class="alert-${alert.severity.toLowerCase()}"><strong>${alert.severity} Risk</strong></p>
        <p><strong>${alert.title}</strong></p>
        <p>${alert.message}</p>
        <small>${new Date(alert.createdAt).toLocaleString()}</small>
      </article>
    `
    )
    .join("");
}

function getFromStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    console.error(`Unable to parse storage key: ${key}`, error);
    return fallback;
  }
}

function saveToStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

init();
