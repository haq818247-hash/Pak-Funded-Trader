/**
 * ============================================================================
 * PAK FUNDED TRADER - ACCOUNTS.JS
 * Shared package data & localStorage persistence (demonstration only).
 * ============================================================================
 *
 * PRODUCTION NOTE: localStorage is not a secure database, does not sync across
 * devices, and must not be used for administrator authentication or payments.
 */

const STORAGE_KEY = "pak_funded_accounts_v1";

const DEFAULT_BINARY_ACCOUNTS = [
  {
    id: "if-2k",
    name: "Starter Instant Account",
    balance: "$2,000",
    numericSize: 2000,
    price: "$30",
    currency: "USD",
    profitSplit: "90%",
    accountType: "Instant Funding",
    dailyLossLimit: "$250 (5%)",
    maxDrawdown: "$500 (10%)",
    payoutTerms: "Bi-Weekly payout schedule",
    description: "Entry-level instant funding package for reviewing account terms and risk parameters.",
    platformsSupported: ["quotex", "iqoption", "pocketoption"],
    active: true,
    featured: false,
    badgeText: "Starter",
    priceNote: "",
    rulesNote: ""
  },
  {
    id: "if-5k",
    name: "Starter Instant Account",
    balance: "$5,000",
    numericSize: 5000,
    price: "$49",
    currency: "USD",
    profitSplit: "80%",
    accountType: "Instant Funding Account",
    dailyLossLimit: "$250 (5%)",
    maxDrawdown: "$500 (10%)",
    payoutTerms: "Bi-Weekly payout schedule",
    description: "Entry-level instant funding package for reviewing account terms and risk parameters.",
    platformsSupported: ["quotex", "iqoption", "pocketoption"],
    active: true,
    featured: false,
    badgeText: "Starter",
    priceNote: "",
    rulesNote: ""
  },
  {
    id: "if-10k",
    name: "Pro Instant Account",
    balance: "$10,000",
    numericSize: 10000,
    price: "$99",
    currency: "USD",
    profitSplit: "80%",
    accountType: "Instant Funding Account",
    dailyLossLimit: "$500 (5%)",
    maxDrawdown: "$1,000 (10%)",
    payoutTerms: "Bi-Weekly payout schedule",
    description: "Mid-tier instant funding package designed for traders seeking a higher balance option.",
    platformsSupported: ["quotex", "tradeowix", "iqoption", "pocketoption", "olymptrade"],
    active: true,
    featured: true,
    badgeText: "Featured",
    priceNote: "",
    rulesNote: ""
  },
  {
    id: "if-25k",
    name: "Executive Instant Account",
    balance: "$25,000",
    numericSize: 25000,
    price: "$199",
    currency: "USD",
    profitSplit: "85%",
    accountType: "Instant Funding Account",
    dailyLossLimit: "$1,250 (5%)",
    maxDrawdown: "$2,500 (10%)",
    payoutTerms: "Bi-Weekly payout schedule",
    description: "Higher balance tier for traders seeking a larger instant funding package.",
    platformsSupported: ["iqoption", "pocketoption", "olymptrade"],
    active: true,
    featured: false,
    badgeText: "High Balance",
    priceNote: "",
    rulesNote: ""
  }
];

function normalizeAccountRecord(acc) {
  const normalized = { ...acc };
  normalized.currency = normalized.currency || "USD";
  normalized.accountType = normalized.accountType || "Instant Funding Account";
  normalized.priceNote = normalized.priceNote || "";
  normalized.rulesNote = normalized.rulesNote || "";
  if (!Array.isArray(normalized.platformsSupported)) {
    normalized.platformsSupported = ["quotex", "iqoption", "pocketoption"];
  }
  if (!normalized.numericSize && normalized.balance) {
    const num = parseInt(String(normalized.balance).replace(/[^0-9]/g, ""), 10);
    normalized.numericSize = isNaN(num) ? 5000 : num;
  }
  return normalized;
}

function ensureRequiredDefaultAccount(accounts) {
  const normalized = (Array.isArray(accounts) ? accounts : []).map(normalizeAccountRecord);
  const existingIds = new Set(normalized.map(acc => acc.id));
  const requiredId = "if-2k";

  if (!existingIds.has(requiredId)) {
    const requiredAccount = normalizeAccountRecord({
      id: requiredId,
      name: "Starter Instant Account",
      balance: "$2,000",
      numericSize: 2000,
      price: "$30",
      currency: "USD",
      profitSplit: "90%",
      accountType: "Instant Funding",
      dailyLossLimit: "$250 (5%)",
      maxDrawdown: "$500 (10%)",
      payoutTerms: "Bi-Weekly payout schedule",
      description: "Entry-level instant funding package for reviewing account terms and risk parameters.",
      platformsSupported: ["quotex", "iqoption", "pocketoption"],
      active: true,
      featured: false,
      badgeText: "Starter",
      priceNote: "",
      rulesNote: ""
    });

    normalized.push(requiredAccount);
  }

  return normalized;
}

function getStoredAccounts(activeOnly = false) {
  try {
    const rawData = localStorage.getItem(STORAGE_KEY);
    let accounts = rawData ? JSON.parse(rawData) : null;

    if (!Array.isArray(accounts) || accounts.length === 0) {
      accounts = DEFAULT_BINARY_ACCOUNTS.map(normalizeAccountRecord);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
    } else {
      accounts = accounts.map(normalizeAccountRecord);
    }

    accounts = ensureRequiredDefaultAccount(accounts);
    if (accounts.length !== JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]").length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
    }

    if (activeOnly) {
      return accounts.filter(acc => acc.active !== false);
    }
    return accounts;
  } catch (err) {
    console.warn("LocalStorage access error, returning default accounts fallback:", err);
    const fallback = ensureRequiredDefaultAccount(DEFAULT_BINARY_ACCOUNTS.map(normalizeAccountRecord));
    return activeOnly ? fallback.filter(acc => acc.active !== false) : fallback;
  }
}

function getAccountById(id) {
  const accounts = getStoredAccounts(false);
  return accounts.find(acc => acc.id === id) || null;
}

function saveAccount(accountData) {
  let accounts = getStoredAccounts(false);

  if (!accountData.id) {
    accountData.id = "if-" + Date.now();
  }

  accountData = normalizeAccountRecord(accountData);

  const existingIndex = accounts.findIndex(acc => acc.id === accountData.id);
  if (existingIndex >= 0) {
    accounts[existingIndex] = { ...accounts[existingIndex], ...accountData };
  } else {
    accounts.push(accountData);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
  return accountData;
}

function deleteAccount(id) {
  let accounts = getStoredAccounts(false);
  accounts = accounts.filter(acc => acc.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
  return accounts;
}

function toggleAccountStatus(id) {
  const accounts = getStoredAccounts(false);
  const target = accounts.find(acc => acc.id === id);
  if (target) {
    target.active = !target.active;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
  }
  return target;
}

function resetToDefaultAccounts() {
  const defaults = DEFAULT_BINARY_ACCOUNTS.map(normalizeAccountRecord);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
  return defaults;
}

const BINARY_FUNDING_ACCOUNTS = getStoredAccounts(true);
