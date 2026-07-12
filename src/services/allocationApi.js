import { 
  INITIAL_EMPLOYEES, 
  INITIAL_ASSETS, 
  INITIAL_HISTORY, 
  INITIAL_TRANSFERS, 
  INITIAL_NOTIFICATIONS 
} from "../data/mockData";
import { apiClient } from "./apiClient";

// Seed local storage if not already seeded
const initLocalStorage = () => {
  if (!localStorage.getItem("af_employees")) {
    localStorage.setItem("af_employees", JSON.stringify(INITIAL_EMPLOYEES));
  }
  if (!localStorage.getItem("af_assets")) {
    localStorage.setItem("af_assets", JSON.stringify(INITIAL_ASSETS));
  }
  if (!localStorage.getItem("af_history")) {
    localStorage.setItem("af_history", JSON.stringify(INITIAL_HISTORY));
  }
  if (!localStorage.getItem("af_transfers")) {
    localStorage.setItem("af_transfers", JSON.stringify(INITIAL_TRANSFERS));
  }
  if (!localStorage.getItem("af_notifications")) {
    localStorage.setItem("af_notifications", JSON.stringify(INITIAL_NOTIFICATIONS));
  }
};

initLocalStorage();

// Helper to get raw data
const getStored = (key) => JSON.parse(localStorage.getItem(key));
const setStored = (key, data) => localStorage.setItem(key, JSON.stringify(data));

const formatDate = (value) => {
  if (!value) return null;
  return new Date(value).toISOString().split("T")[0];
};

const normalizeEmployee = (employee) => ({
  ...employee,
  department: employee.department?.name || employee.department || "Unassigned"
});

const normalizeAsset = (asset) => ({
  ...asset,
  department: asset.department || asset.currentHolder?.department?.name || "Unassigned",
  allocatedDate: formatDate(asset.allocatedDate),
  expectedReturnDate: formatDate(asset.expectedReturnDate)
});

const normalizeHistory = (item) => ({
  id: item.id,
  assetId: item.assetId,
  assetName: item.asset?.name || item.assetId,
  employeeName: item.user?.name || "Unknown Employee",
  department: item.user?.department?.name || "Unassigned",
  allocatedDate: formatDate(item.allocatedDate),
  returnedDate: formatDate(item.returnedDate),
  status: item.status
});

const normalizeTransfer = (item) => ({
  id: item.id,
  assetId: item.assetId,
  assetName: item.asset?.name || item.assetId,
  fromEmployeeName: item.fromUser?.name || "Unknown Employee",
  toEmployeeName: item.toUser?.name || "Unknown Employee",
  reason: item.reason,
  priority: item.priority,
  status: item.status,
  date: formatDate(item.createdAt)
});

const formatRelativeTime = (value) => {
  if (!value) return "";

  const diffMs = Date.now() - new Date(value).getTime();
  const minutes = Math.max(0, Math.floor(diffMs / 60000));

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const notificationTypeMap = {
  Alerts: "warning",
  Approvals: "info",
  Bookings: "success"
};

const normalizeNotification = (item) => ({
  id: item.id,
  title: item.type || "Notification",
  message: item.message,
  type: notificationTypeMap[item.type] || "info",
  time: formatRelativeTime(item.createdAt),
  read: Boolean(item.isRead)
});

export const allocationApi = {
  async fetchEmployees() {
    const result = await apiClient.get("/employees?limit=100");
    return (result.employees || []).map(normalizeEmployee);
  },

  async fetchAssets() {
    const assets = await apiClient.get("/assets");
    return (assets || []).map(normalizeAsset);
  },

  async fetchHistory(assetId = "") {
    const query = assetId ? `?assetId=${encodeURIComponent(assetId)}` : "";
    const history = await apiClient.get(`/allocations${query}`);
    return (history || []).map(normalizeHistory);
  },

  async fetchTransfers() {
    const transfers = await apiClient.get("/transfer-requests");
    return (transfers || []).map(normalizeTransfer);
  },

  async fetchNotifications() {
    const notifications = await apiClient.get("/notifications");
    return (notifications || []).map(normalizeNotification);
  },

  async allocateAssetRemote(assetId, employeeId, expectedReturnDate) {
    await apiClient.post("/allocations", {
      assetId,
      employeeId: Number(employeeId),
      expectedReturnDate
    });
    return { success: true };
  },

  async createTransferRequestRemote(assetId, fromEmployeeId, toEmployeeId, reason, priority) {
    await apiClient.post("/transfer-requests", {
      assetId,
      fromEmployeeId: Number(fromEmployeeId),
      toEmployeeId: Number(toEmployeeId),
      reason,
      priority
    });
    return { success: true };
  },

  async approveTransferRemote(transferId) {
    await apiClient.patch(`/transfer-requests/${transferId}/approve`);
    return { success: true };
  },

  async rejectTransferRemote(transferId) {
    await apiClient.patch(`/transfer-requests/${transferId}/reject`);
    return { success: true };
  },

  async returnAssetRemote(assetId, condition = "Good", notes = "") {
    await apiClient.post(`/allocations/${assetId}/return`, { condition, notes });
    return { success: true };
  },

  async markNotificationReadRemote(id) {
    await apiClient.patch(`/notifications/${id}/read`);
    return { success: true };
  },

  async markAllNotificationsReadRemote(notifications) {
    await Promise.all(
      (notifications || [])
        .filter((notification) => !notification.read)
        .map((notification) => allocationApi.markNotificationReadRemote(notification.id))
    );
    return { success: true };
  },

  getEmployees: () => getStored("af_employees"),
  
  getAssets: () => getStored("af_assets"),
  
  getHistory: () => getStored("af_history"),
  
  getTransfers: () => getStored("af_transfers"),
  
  getNotifications: () => getStored("af_notifications"),

  allocateAsset: (assetId, employeeId, expectedReturnDate) => {
    const assets = getStored("af_assets");
    const employees = getStored("af_employees");
    const history = getStored("af_history");

    const assetIdx = assets.findIndex(a => a.id === assetId);
    const employee = employees.find(e => e.id === employeeId);

    if (assetIdx === -1 || !employee) return { success: false, message: "Asset or Employee not found" };

    const asset = assets[assetIdx];

    if (asset.status === "Allocated" || asset.status === "Overdue") {
      const holder = employees.find(e => e.id === asset.currentHolderId);
      const holderName = holder ? holder.name : "another employee";
      return {
        success: false,
        conflict: true,
        message: `Asset is currently held by ${holderName}`,
        currentHolder: holder || null
      };
    }
    
    // Update asset info
    asset.status = "Allocated";
    asset.currentHolderId = employeeId;
    asset.allocatedDate = new Date().toISOString().split("T")[0];
    asset.expectedReturnDate = expectedReturnDate;

    // Create history record
    const historyRecord = {
      id: `HIST-${Date.now()}`,
      assetId: asset.id,
      assetName: asset.name,
      employeeName: employee.name,
      department: employee.department,
      allocatedDate: asset.allocatedDate,
      returnedDate: null,
      status: "Allocated"
    };

    history.unshift(historyRecord);

    setStored("af_assets", assets);
    setStored("af_history", history);

    // Trigger system notification
    allocationApi.addNotification(
      "Asset Allocated",
      `${asset.name} has been allocated to ${employee.name} (${employee.department}).`,
      "success"
    );

    return { success: true, asset, historyRecord };
  },

  returnAsset: (assetId) => {
    const assets = getStored("af_assets");
    const history = getStored("af_history");

    const assetIdx = assets.findIndex(a => a.id === assetId);
    if (assetIdx === -1) return { success: false, message: "Asset not found" };

    const asset = assets[assetIdx];
    
    // Update asset
    asset.status = "Available";
    asset.currentHolderId = null;
    asset.allocatedDate = null;
    asset.expectedReturnDate = null;

    // Find the unreturned history record for this asset and close it
    const histIdx = history.findIndex(h => h.assetId === assetId && h.returnedDate === null);
    if (histIdx !== -1) {
      history[histIdx].returnedDate = new Date().toISOString().split("T")[0];
      history[histIdx].status = "Returned";
    }

    setStored("af_assets", assets);
    setStored("af_history", history);

    allocationApi.addNotification(
      "Asset Returned",
      `${asset.name} has been successfully returned and is now available.`,
      "info"
    );

    return { success: true, asset };
  },

  createTransferRequest: (assetId, fromEmployeeId, toEmployeeId, reason, priority) => {
    const assets = getStored("af_assets");
    const employees = getStored("af_employees");
    const transfers = getStored("af_transfers");

    const asset = assets.find(a => a.id === assetId);
    const fromEmp = employees.find(e => e.id === fromEmployeeId);
    const toEmp = employees.find(e => e.id === toEmployeeId);

    if (!asset || !fromEmp || !toEmp) {
      return { success: false, message: "Required records not found" };
    }

    const newTransfer = {
      id: `TRF-${Date.now()}`,
      assetId: asset.id,
      assetName: asset.name,
      fromEmployeeName: fromEmp.name,
      toEmployeeName: toEmp.name,
      reason,
      priority,
      status: "Pending",
      date: new Date().toISOString().split("T")[0]
    };

    transfers.unshift(newTransfer);
    setStored("af_transfers", transfers);

    // Create Notification
    allocationApi.addNotification(
      "Transfer Request Submitted",
      `${toEmp.name} requested to transfer ${asset.name} from ${fromEmp.name}.`,
      "warning"
    );

    return { success: true, transfer: newTransfer };
  },

  approveTransfer: (transferId) => {
    const transfers = getStored("af_transfers");
    const assets = getStored("af_assets");
    const employees = getStored("af_employees");
    const history = getStored("af_history");

    const transferIdx = transfers.findIndex(t => t.id === transferId);
    if (transferIdx === -1) return { success: false, message: "Transfer request not found" };
    
    const transfer = transfers[transferIdx];
    transfer.status = "Approved";

    const assetIdx = assets.findIndex(a => a.id === transfer.assetId);
    if (assetIdx === -1) return { success: false, message: "Asset not found" };
    const asset = assets[assetIdx];

    // Find the receiver's employee profile
    const toEmp = employees.find(e => e.name === transfer.toEmployeeName);
    if (!toEmp) return { success: false, message: "Receiver employee profile not found" };

    const today = new Date().toISOString().split("T")[0];

    // Close the old holder's history record
    const oldHistIdx = history.findIndex(h => h.assetId === asset.id && h.returnedDate === null);
    if (oldHistIdx !== -1) {
      history[oldHistIdx].returnedDate = today;
      history[oldHistIdx].status = "Returned";
    }

    // Update Asset checkout details
    asset.currentHolderId = toEmp.id;
    asset.allocatedDate = today;
    // Keep expected return date or extend by 30 days
    const nextMonth = new Date();
    nextMonth.setDate(nextMonth.getDate() + 30);
    asset.expectedReturnDate = nextMonth.toISOString().split("T")[0];
    asset.status = "Allocated";

    // Add new holder history record
    const historyRecord = {
      id: `HIST-${Date.now()}`,
      assetId: asset.id,
      assetName: asset.name,
      employeeName: toEmp.name,
      department: toEmp.department,
      allocatedDate: today,
      returnedDate: null,
      status: "Allocated"
    };
    history.unshift(historyRecord);

    setStored("af_transfers", transfers);
    setStored("af_assets", assets);
    setStored("af_history", history);

    allocationApi.addNotification(
      "Transfer Approved",
      `Transfer of ${asset.name} to ${toEmp.name} has been approved and completed.`,
      "success"
    );

    return { success: true };
  },

  rejectTransfer: (transferId) => {
    const transfers = getStored("af_transfers");
    const transferIdx = transfers.findIndex(t => t.id === transferId);
    if (transferIdx === -1) return { success: false, message: "Transfer request not found" };

    transfers[transferIdx].status = "Rejected";
    setStored("af_transfers", transfers);

    allocationApi.addNotification(
      "Transfer Rejected",
      `Transfer request for ${transfers[transferIdx].assetName} was declined.`,
      "danger"
    );

    return { success: true };
  },

  addNotification: (title, message, type = "info") => {
    const notifications = getStored("af_notifications") || [];
    const newNotif = {
      id: `NOTIF-${Date.now()}`,
      title,
      message,
      type,
      time: "Just now",
      read: false
    };
    notifications.unshift(newNotif);
    setStored("af_notifications", notifications);
    return newNotif;
  },

  markNotificationRead: (id) => {
    const notifications = getStored("af_notifications") || [];
    const idx = notifications.findIndex(n => n.id === id);
    if (idx !== -1) {
      notifications[idx].read = true;
      setStored("af_notifications", notifications);
    }
  },

  markAllNotificationsRead: () => {
    const notifications = getStored("af_notifications") || [];
    const updated = notifications.map(n => ({ ...n, read: true }));
    setStored("af_notifications", updated);
  }
};
