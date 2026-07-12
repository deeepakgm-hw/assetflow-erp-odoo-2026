export const INITIAL_EMPLOYEES = [
  {
    id: "EMP-001",
    name: "Charan Tej",
    email: "charan@assetflow.com",
    role: "Administrator",
    department: "Engineering",
    avatar: "CT"
  },
  {
    id: "EMP-002",
    name: "Raj Patel",
    email: "raj@assetflow.com",
    role: "Asset Manager",
    department: "Operations",
    avatar: "RP"
  },
  {
    id: "EMP-003",
    name: "Deepa Sen",
    email: "deepa@assetflow.com",
    role: "Department Head",
    department: "Design",
    avatar: "DS"
  },
  {
    id: "EMP-004",
    name: "Nishant Sharma",
    email: "nishant@assetflow.com",
    role: "Software Engineer",
    department: "Engineering",
    avatar: "NS"
  }
];

export const INITIAL_ASSETS = [
  {
    id: "AF-0001",
    name: "MacBook Pro M3 Max",
    type: "Laptop",
    serialNumber: "SN-MBP-9872",
    specification: "64GB RAM, 2TB SSD, 16-inch, Space Black",
    department: "Engineering",
    status: "Available",
    currentHolderId: null,
    allocatedDate: null,
    expectedReturnDate: null
  },
  {
    id: "AF-0002",
    name: "Dell XPS 15",
    type: "Laptop",
    serialNumber: "SN-DELL-8832",
    specification: "32GB RAM, 1TB SSD, OLED Touch Screen",
    department: "Engineering",
    status: "Allocated",
    currentHolderId: "EMP-004", // Nishant
    allocatedDate: "2026-07-01",
    expectedReturnDate: "2026-07-31"
  },
  {
    id: "AF-0003",
    name: "ThinkPad X1 Carbon",
    type: "Laptop",
    serialNumber: "SN-THINK-4411",
    specification: "16GB RAM, 512GB SSD, Ultra-lightweight",
    department: "Design",
    status: "Overdue",
    currentHolderId: "EMP-003", // Deepa
    allocatedDate: "2026-06-10",
    expectedReturnDate: "2026-07-10" // Overdue relative to 2026-07-12
  },
  {
    id: "AF-0004",
    name: "LG UltraFine 27\" 4K",
    type: "Monitor",
    serialNumber: "SN-LG-0012",
    specification: "27-inch 4K IPS Panel, USB-C Power Delivery",
    department: "Design",
    status: "Available",
    currentHolderId: null,
    allocatedDate: null,
    expectedReturnDate: null
  },
  {
    id: "AF-0005",
    name: "LG UltraFine 27\" 4K",
    type: "Monitor",
    serialNumber: "SN-LG-0013",
    specification: "27-inch 4K IPS Panel, USB-C Power Delivery",
    department: "Engineering",
    status: "Allocated",
    currentHolderId: "EMP-001", // Charan
    allocatedDate: "2026-06-15",
    expectedReturnDate: "2026-12-15"
  },
  {
    id: "AF-0006",
    name: "iPad Pro 12.9\" M2",
    type: "Tablet",
    serialNumber: "SN-IPAD-3829",
    specification: "256GB WiFi, Space Gray, Liquid Retina XDR",
    department: "Operations",
    status: "Maintenance",
    currentHolderId: null,
    allocatedDate: null,
    expectedReturnDate: null
  },
  {
    id: "AF-0007",
    name: "Epson 4K Projector",
    type: "Projector",
    serialNumber: "SN-EPSON-5522",
    specification: "3000 Lumens, Wireless HDR, Smart TV apps",
    department: "Operations",
    status: "Available",
    currentHolderId: null,
    allocatedDate: null,
    expectedReturnDate: null
  },
  {
    id: "AF-0008",
    name: "Aeron Office Chair",
    type: "Furniture",
    serialNumber: "SN-AERON-9921",
    specification: "Size B, Graphite Color, Fully Adjustable Arms",
    department: "Engineering",
    status: "Available",
    currentHolderId: null,
    allocatedDate: null,
    expectedReturnDate: null
  }
];

export const INITIAL_RESOURCES = [
  {
    id: "RES-001",
    name: "Boardroom Alpha",
    type: "Room",
    capacity: "14 people",
    location: "Floor 4, West Wing",
    status: "Available"
  },
  {
    id: "RES-002",
    name: "Meeting Room Beta",
    type: "Room",
    capacity: "6 people",
    location: "Floor 2, East Wing",
    status: "Available"
  },
  {
    id: "RES-003",
    name: "Focus Pod Gamma",
    type: "Room",
    capacity: "2 people",
    location: "Floor 1, Quiet Zone",
    status: "Available"
  },
  {
    id: "RES-004",
    name: "Tesla Model Y",
    type: "Vehicle",
    capacity: "5 seats",
    location: "Parking Slot B-12",
    status: "Available"
  },
  {
    id: "RES-005",
    name: "Quest 3 VR Headset",
    type: "Equipment",
    capacity: "1 device",
    location: "IT Storage Cabinet 3",
    status: "Available"
  }
];

export const INITIAL_BOOKINGS = [
  {
    id: "BKG-001",
    resourceId: "RES-001", // Boardroom Alpha
    employeeId: "EMP-003", // Deepa
    employeeName: "Deepa Sen",
    date: "2026-07-12",
    startTime: "08:00",
    endTime: "10:00",
    purpose: "Q3 Design Review & Planning Session",
    status: "Completed"
  },
  {
    id: "BKG-002",
    resourceId: "RES-001", // Boardroom Alpha
    employeeId: "EMP-004", // Nishant
    employeeName: "Nishant Sharma",
    date: "2026-07-12",
    startTime: "10:00",
    endTime: "11:00",
    purpose: "Daily Frontend standup",
    status: "Completed"
  },
  {
    id: "BKG-003",
    resourceId: "RES-002", // Meeting Room Beta
    employeeId: "EMP-001", // Charan
    employeeName: "Charan Tej",
    date: "2026-07-12",
    startTime: "09:00",
    endTime: "11:00",
    purpose: "Prisma Schema Review & Setup",
    status: "Completed"
  },
  {
    id: "BKG-004",
    resourceId: "RES-002", // Meeting Room Beta
    employeeId: "EMP-002", // Raj
    employeeName: "Raj Patel",
    date: "2026-07-12",
    startTime: "11:30",
    endTime: "13:00",
    purpose: "Asset Supplier Coordination Sync",
    status: "Ongoing"
  },
  {
    id: "BKG-005",
    resourceId: "RES-004", // Tesla Model Y
    employeeId: "EMP-001", // Charan
    employeeName: "Charan Tej",
    date: "2026-07-12",
    startTime: "14:00",
    endTime: "16:00",
    purpose: "Client On-site Consultation Visit",
    status: "Upcoming"
  },
  {
    id: "BKG-006",
    resourceId: "RES-005", // Quest 3
    employeeId: "EMP-004", // Nishant
    employeeName: "Nishant Sharma",
    date: "2026-07-12",
    startTime: "16:00",
    endTime: "18:00",
    purpose: "Metaverse Demo & UX Testing",
    status: "Upcoming"
  }
];

export const INITIAL_HISTORY = [
  {
    id: "HIST-001",
    assetId: "AF-0003",
    assetName: "ThinkPad X1 Carbon",
    employeeName: "Deepa Sen",
    department: "Design",
    allocatedDate: "2026-06-10",
    returnedDate: null,
    status: "Overdue"
  },
  {
    id: "HIST-002",
    assetId: "AF-0002",
    assetName: "Dell XPS 15",
    employeeName: "Nishant Sharma",
    department: "Engineering",
    allocatedDate: "2026-07-01",
    returnedDate: null,
    status: "Allocated"
  },
  {
    id: "HIST-003",
    assetId: "AF-0005",
    assetName: "LG UltraFine 27\" 4K",
    employeeName: "Charan Tej",
    department: "Engineering",
    allocatedDate: "2026-06-15",
    returnedDate: null,
    status: "Allocated"
  },
  {
    id: "HIST-004",
    assetId: "AF-0001",
    assetName: "MacBook Pro M3 Max",
    employeeName: "Raj Patel",
    department: "Operations",
    allocatedDate: "2026-05-01",
    returnedDate: "2026-06-30",
    status: "Returned"
  },
  {
    id: "HIST-005",
    assetId: "AF-0007",
    assetName: "Epson 4K Projector",
    employeeName: "Deepa Sen",
    department: "Design",
    allocatedDate: "2026-07-01",
    returnedDate: "2026-07-05",
    status: "Returned"
  }
];

export const INITIAL_TRANSFERS = [
  {
    id: "TRF-001",
    assetId: "AF-0002",
    assetName: "Dell XPS 15",
    fromEmployeeName: "Nishant Sharma",
    toEmployeeName: "Charan Tej",
    reason: "Need Windows/Linux machine for cross-platform container builds",
    priority: "High",
    status: "Pending",
    date: "2026-07-11"
  },
  {
    id: "TRF-002",
    assetId: "AF-0005",
    assetName: "LG UltraFine 27\" 4K",
    fromEmployeeName: "Charan Tej",
    toEmployeeName: "Deepa Sen",
    reason: "Design layout comparison needs dual-screen setup",
    priority: "Medium",
    status: "Pending",
    date: "2026-07-12"
  }
];

export const INITIAL_NOTIFICATIONS = [
  {
    id: "NOTIF-001",
    title: "Asset Overdue Warning",
    message: "ThinkPad X1 Carbon (AF-0003) checked out by Deepa Sen is overdue by 2 days.",
    type: "danger",
    time: "2 hours ago",
    read: false
  },
  {
    id: "NOTIF-002",
    title: "New Transfer Request",
    message: "Charan Tej requested to transfer Dell XPS 15 from Nishant Sharma.",
    type: "warning",
    time: "3 hours ago",
    read: false
  },
  {
    id: "NOTIF-003",
    title: "Booking Confirmed",
    message: "Meeting Room Beta is booked today for Q3 Design Review.",
    type: "success",
    time: "5 hours ago",
    read: true
  }
];
