import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = parseInt(process.env.PORT || "3000");
const TODAY = '2026-08-14';

// ─── Default call logs (original + Themba's calls from TODAY) ───
const DEFAULT_CALL_LOGS = [
  // ── Original historical calls ──
  {
    id: 'cl1', clientName: 'David Mthembu', clientPhone: '0823456789', clientEmail: 'david.m@email.co.za', clientId: 'C-001',
    agentId: '3', agentName: 'Themba Shabangu', callType: 'inbound', category: 'General Inquiry', callOutcome: 'inquiry', callStatus: 'completed',
    startTime: '2026-05-19T08:30', endTime: '2026-05-19T08:42', durationMinutes: 12,
    notes: 'Client called asking about Business Management course fees and duration. Explained the 12-month programme costs R18,500. Client said he needs to discuss with his wife and will call back. Gave him our direct line and email. He seemed interested.',
    followUpDate: '2026-05-22', followUpNotes: 'Follow up if no callback by Thursday', priority: 'medium', tags: ['course-inquiry', 'business-management'], productsInterested: [{ productId: 'p1', name: 'Business Management Course', price: 18500, category: 'Course' }], recordedAt: '2026-05-19T08:42:00',
  },
  {
    id: 'cl2', clientName: 'David Mthembu', clientPhone: '0823456789', clientEmail: 'david.m@email.co.za', clientId: 'C-001',
    agentId: '4', agentName: 'Sarah Khumalo', callType: 'outbound', category: 'Order Status', callOutcome: 'follow-up', callStatus: 'completed',
    startTime: '2026-05-22T10:15', endTime: '2026-05-22T10:28', durationMinutes: 13,
    notes: 'Follow-up call as promised. Client confirmed he discussed with his wife and wants to register. Walked him through the registration process. He will visit the office on Monday with his ID and matric certificate. Sent confirmation email with required documents list.',
    followUpDate: '2026-05-26', followUpNotes: 'Confirm if he visited office for registration', priority: 'high', tags: ['follow-up', 'registration'], productsInterested: [{ productId: 'p1', name: 'Business Management Course', price: 18500, category: 'Course' }], recordedAt: '2026-05-22T10:28:00',
  },
  {
    id: 'cl3', clientName: 'Portia Nkosi', clientPhone: '0734567890', clientEmail: 'portia.n@email.co.za', clientId: 'C-002',
    agentId: '5', agentName: 'John Mokoena', callType: 'inbound', category: 'Complaint', callOutcome: 'complaint', callStatus: 'escalated',
    startTime: '2026-05-19T11:00', endTime: '2026-05-19T11:20', durationMinutes: 20,
    notes: 'COMPLAINT: Client is unhappy with the service she received at reception yesterday. Says she was kept waiting for 45 minutes and no one attended to her. She wants to enrol in HR Management but is now considering going to a competitor. Apologised sincerely and explained the situation. Offered to schedule a priority appointment with the admissions officer. Client agreed to come in tomorrow at 10am. Escalated to supervisor Lisa Peters.',
    followUpDate: '2026-05-20', followUpNotes: 'Priority appointment at 10am with admissions officer. Ensure reception is briefed.', priority: 'urgent', tags: ['complaint', 'escalated', 'reception-issue'], productsInterested: [{ productId: 'p3', name: 'HR Management Programme', price: 16500, category: 'Course' }], recordedAt: '2026-05-19T11:20:00',
  },
  {
    id: 'cl4', clientName: 'Jacob Zondi', clientPhone: '0712345678', clientEmail: 'jacob.z@email.co.za', clientId: 'C-003',
    agentId: '3', agentName: 'Themba Shabangu', callType: 'outbound', category: 'New Sale', callOutcome: 'sale', callStatus: 'completed',
    startTime: '2026-05-19T14:00', endTime: '2026-05-19T14:25', durationMinutes: 25,
    notes: 'Outbound call to lead from website inquiry. Client interested in IT course. Did a full course walkthrough. Explained payment plans. Client signed up and paid the R2,000 registration fee over the phone via EFT. Sent receipt and welcome pack via email. Registration number assigned: CS-2026-156. Very positive call.',
    followUpDate: '', followUpNotes: '', priority: 'medium', tags: ['sale', 'it-course', 'registration'], productsInterested: [{ productId: 'p5', name: 'IT Networking Course', price: 22500, category: 'Course' }], recordedAt: '2026-05-19T14:25:00',
  },
  {
    id: 'cl5', clientName: 'Grace Mabena', clientPhone: '0767890123', clientEmail: 'grace.m@email.co.za', clientId: 'C-004',
    agentId: '4', agentName: 'Sarah Khumalo', callType: 'inbound', category: 'Billing Inquiry', callOutcome: 'callback-requested', callStatus: 'pending-follow-up',
    startTime: '2026-05-19T15:30', endTime: '2026-05-19T15:35', durationMinutes: 5,
    notes: 'Client called asking to speak to the finance department about her outstanding balance. I explained the finance team had already left for the day. She requested a callback first thing tomorrow morning. Took her details and confirmed the callback time of 8:30am.',
    followUpDate: '2026-05-20', followUpNotes: 'Callback Grace Mabena at 8:30am about outstanding balance. Transfer to finance.', priority: 'high', tags: ['callback', 'finance', 'outstanding-balance'], productsInterested: [], recordedAt: '2026-05-19T15:35:00',
  },
  {
    id: 'cl6', clientName: 'David Mthembu', clientPhone: '0823456789', clientEmail: 'david.m@email.co.za', clientId: 'C-001',
    agentId: '6', agentName: 'Lisa Peters', callType: 'inbound', category: 'Order Status', callOutcome: 'resolved', callStatus: 'completed',
    startTime: '2026-05-26T09:15', endTime: '2026-05-26T09:30', durationMinutes: 15,
    notes: 'Client came in and completed registration as discussed with Sarah. Supervisor handled the registration personally. All documents verified (ID and matric). Registration complete. Student number CS-2026-157 assigned. Client very happy with the service.',
    followUpDate: '', followUpNotes: '', priority: 'low', tags: ['registration-completed', 'in-person'], productsInterested: [{ productId: 'p1', name: 'Business Management Course', price: 18500, category: 'Course' }], recordedAt: '2026-05-26T09:30:00',
  },
  {
    id: 'cl7', clientName: 'Sipho Dladla', clientPhone: '0845678901', clientEmail: 'sipho.d@email.co.za', clientId: 'C-005',
    agentId: '5', agentName: 'John Mokoena', callType: 'inbound', category: 'General Inquiry', callOutcome: 'no-answer', callStatus: 'pending-follow-up',
    startTime: '2026-05-19T16:00', endTime: '2026-05-19T16:05', durationMinutes: 5,
    notes: 'Called back Sipho who left a voicemail yesterday. Phone rang but no answer. Left a voicemail with my name and callback number. Will try again tomorrow.',
    followUpDate: '2026-05-20', followUpNotes: 'Try calling Sipho Dladla again. 3rd attempt.', priority: 'medium', tags: ['callback', 'no-answer'], productsInterested: [], recordedAt: '2026-05-19T16:05:00',
  },

  // ── THEMBA SHABANGU'S CALLS FROM TODAY (14 Aug 2026) ──
  {
    id: 'cl-t1', clientName: 'Thabo Molefe', clientPhone: '0824567123', clientEmail: 'thabo.m@email.co.za', clientId: 'C-101',
    agentId: '3', agentName: 'Themba Shabangu', callType: 'inbound', category: 'General Inquiry', callOutcome: 'inquiry', callStatus: 'completed',
    startTime: `${TODAY}T08:15`, endTime: `${TODAY}T08:28`, durationMinutes: 13,
    notes: 'Inbound call from Facebook ad. Client wants to know about RE5 exam preparation course. Explained the 6-week programme costs R8,500 including study material. Client asked about payment plans — explained 3-month option available. He will discuss with his employer and call back Monday.',
    followUpDate: '2026-08-17', followUpNotes: 'Follow up Monday if no callback', priority: 'medium', tags: ['facebook-lead', 're5-course'], productsInterested: [{ productId: 'p10', name: 'RE5 Exam Preparation', price: 8500, category: 'Course' }], recordedAt: `${TODAY}T08:28:00`,
  },
  {
    id: 'cl-t2', clientName: 'Nomsa Dlamini', clientPhone: '0737890456', clientEmail: 'nomsa.d@email.co.za', clientId: 'C-102',
    agentId: '3', agentName: 'Themba Shabangu', callType: 'whatsapp', category: 'New Sale', callOutcome: 'sale', callStatus: 'completed',
    startTime: `${TODAY}T09:45`, endTime: `${TODAY}T10:05`, durationMinutes: 20,
    notes: 'WhatsApp message from Facebook ad enquiry. Client interested in Business Management diploma. Did full course walkthrough via voice notes. Client registered and paid R2,500 deposit via EFT. Sent welcome email and registration confirmation. Student number CS-2026-301 assigned. Very happy client.',
    followUpDate: '', followUpNotes: '', priority: 'high', tags: ['whatsapp-sale', 'business-management', 'facebook-lead'], productsInterested: [{ productId: 'p1', name: 'Business Management Course', price: 18500, category: 'Course' }], recordedAt: `${TODAY}T10:05:00`,
  },
  {
    id: 'cl-t3', clientName: 'Peter Van Wyk', clientPhone: '0713456789', clientEmail: 'peter.vw@email.co.za', clientId: 'C-103',
    agentId: '3', agentName: 'Themba Shabangu', callType: 'outbound', category: 'Follow-up', callOutcome: 'follow-up', callStatus: 'completed',
    startTime: `${TODAY}T11:20`, endTime: `${TODAY}T11:35`, durationMinutes: 15,
    notes: 'Outbound follow-up to lead from last week. Client was interested in HR Management programme. Confirmed he still wants to enrol but needs until month-end to arrange funds. Agreed to hold his spot until 31 August. Sent payment plan options via email.',
    followUpDate: '2026-08-28', followUpNotes: 'Check if funds arranged, confirm enrolment', priority: 'medium', tags: ['follow-up', 'hr-management'], productsInterested: [{ productId: 'p3', name: 'HR Management Programme', price: 16500, category: 'Course' }], recordedAt: `${TODAY}T11:35:00`,
  },
  {
    id: 'cl-t4', clientName: 'Lerato Kgosi', clientPhone: '0761234567', clientEmail: 'lerato.k@email.co.za', clientId: 'C-104',
    agentId: '3', agentName: 'Themba Shabangu', callType: 'inbound', category: 'Complaint', callOutcome: 'resolved', callStatus: 'completed',
    startTime: `${TODAY}T13:00`, endTime: `${TODAY}T13:18`, durationMinutes: 18,
    notes: 'Client called unhappy about delayed certificate delivery. Explained the backlog due to system upgrade. Apologised sincerely and escalated to finance team for priority processing. Client calmed down after assurance. Promised certificate will be ready for collection by Friday.',
    followUpDate: '2026-08-15', followUpNotes: 'Ensure certificate is ready for Lerato Kgosi collection', priority: 'high', tags: ['complaint', 'certificate-delay'], productsInterested: [], recordedAt: `${TODAY}T13:18:00`,
  },
  {
    id: 'cl-t5', clientName: 'Bongani Ndlovu', clientPhone: '0849876543', clientEmail: 'bongani.n@email.co.za', clientId: 'C-105',
    agentId: '3', agentName: 'Themba Shabangu', callType: 'inbound', category: 'Billing Inquiry', callOutcome: 'resolved', callStatus: 'completed',
    startTime: `${TODAY}T14:30`, endTime: `${TODAY}T14:42`, durationMinutes: 12,
    notes: 'Client queried double debit on his account. Checked system — confirmed duplicate payment from last month. Explained refund process. Client will receive refund within 5 business days. Sent confirmation email with refund reference RF-2026-0814-001. Client satisfied.',
    followUpDate: '2026-08-21', followUpNotes: 'Confirm refund processed for Bongani Ndlovu', priority: 'medium', tags: ['billing', 'refund'], productsInterested: [], recordedAt: `${TODAY}T14:42:00`,
  },
  {
    id: 'cl-t6', clientName: 'Faith Mokoena', clientPhone: '0821112233', clientEmail: 'faith.m@email.co.za', clientId: 'C-106',
    agentId: '3', agentName: 'Themba Shabangu', callType: 'whatsapp', category: 'General Inquiry', callOutcome: 'callback-requested', callStatus: 'pending-follow-up',
    startTime: `${TODAY}T15:10`, endTime: `${TODAY}T15:15`, durationMinutes: 5,
    notes: 'WhatsApp enquiry about course start dates for September intake. Provided all available course dates. Client wants to speak to admissions officer about entry requirements. Scheduled callback for tomorrow 9am.',
    followUpDate: '2026-08-15', followUpNotes: 'Admissions to callback Faith Mokoena at 9am', priority: 'medium', tags: ['whatsapp', 'september-intake'], productsInterested: [{ productId: 'p1', name: 'Business Management Course', price: 18500, category: 'Course' }], recordedAt: `${TODAY}T15:15:00`,
  },
  {
    id: 'cl-t7', clientName: 'Sibusiso Khumalo', clientPhone: '0734445566', clientEmail: 'sibusiso.k@email.co.za', clientId: 'C-107',
    agentId: '3', agentName: 'Themba Shabangu', callType: 'outbound', category: 'New Sale', callOutcome: 'sale', callStatus: 'completed',
    startTime: `${TODAY}T16:00`, endTime: `${TODAY}T16:22`, durationMinutes: 22,
    notes: 'Cold call from lead list. Client interested in IT Networking course. Full presentation given. Client signed up for September intake and paid registration fee of R2,000. Very excited about the programme. Sent welcome pack and orientation details. Student number CS-2026-302 assigned.',
    followUpDate: '', followUpNotes: '', priority: 'high', tags: ['sale', 'it-networking', 'september-intake'], productsInterested: [{ productId: 'p5', name: 'IT Networking Course', price: 22500, category: 'Course' }], recordedAt: `${TODAY}T16:22:00`,
  },
];

// ─── Default call tasks ───
const DEFAULT_CALL_TASKS = [
  {
    id: 'ct1', title: 'Follow up David Mthembu registration', description: 'Confirm David visited office for registration. Check if documents were submitted.', relatedCallId: 'cl2',
    clientName: 'David Mthembu', clientPhone: '0823456789', assignedTo: '4', assignedToName: 'Sarah Khumalo',
    status: 'completed', priority: 'high', category: 'follow-up', dueDate: '2026-05-26', completedDate: '2026-05-26T09:30:00',
    notes: 'Client came in and completed registration successfully.', createdBy: 'Sarah Khumalo', createdAt: '2026-05-22T10:30:00', updatedAt: '2026-05-26T09:30:00',
  },
  {
    id: 'ct2', title: 'Priority appointment for Portia Nkosi', description: 'Ensure reception is briefed about Portia Nkosi appointment at 10am. Admissions officer must be ready.', relatedCallId: 'cl3',
    clientName: 'Portia Nkosi', clientPhone: '0734567890', assignedTo: '6', assignedToName: 'Lisa Peters',
    status: 'in-progress', priority: 'urgent', category: 'complaint-resolution', dueDate: '2026-05-20', completedDate: '',
    notes: 'Reception briefed. Admissions officer confirmed availability.', createdBy: 'John Mokoena', createdAt: '2026-05-19T11:25:00', updatedAt: '2026-05-19T11:25:00',
  },
  {
    id: 'ct3', title: 'Callback Grace Mabena 8:30am', description: 'Transfer call to finance department about outstanding balance. Client expects callback at 8:30am sharp.', relatedCallId: 'cl5',
    clientName: 'Grace Mabena', clientPhone: '0767890123', assignedTo: '3', assignedToName: 'Themba Shabangu',
    status: 'pending', priority: 'high', category: 'callback', dueDate: '2026-05-20', completedDate: '',
    notes: '', createdBy: 'Sarah Khumalo', createdAt: '2026-05-19T15:35:00', updatedAt: '2026-05-19T15:35:00',
  },
  {
    id: 'ct4', title: '3rd callback attempt Sipho Dladla', description: 'Call Sipho Dladla again. Previous two attempts had no answer.', relatedCallId: 'cl7',
    clientName: 'Sipho Dladla', clientPhone: '0845678901', assignedTo: '5', assignedToName: 'John Mokoena',
    status: 'pending', priority: 'medium', category: 'callback', dueDate: '2026-05-20', completedDate: '',
    notes: 'Try alternate number if available.', createdBy: 'John Mokoena', createdAt: '2026-05-19T16:05:00', updatedAt: '2026-05-19T16:05:00',
  },
  {
    id: 'ct5', title: 'Send welcome pack to Jacob Zondi', description: 'Email welcome pack and course timetable to newly registered student CS-2026-156.', relatedCallId: 'cl4',
    clientName: 'Jacob Zondi', clientPhone: '0712345678', assignedTo: '4', assignedToName: 'Sarah Khumalo',
    status: 'pending', priority: 'medium', category: 'documentation', dueDate: '2026-05-20', completedDate: '',
    notes: 'Include payment plan schedule.', createdBy: 'Themba Shabangu', createdAt: '2026-05-19T14:30:00', updatedAt: '2026-05-19T14:30:00',
  },
  // ── Themba's tasks from TODAY ──
  {
    id: 'ct-t1', title: 'Follow up Thabo Molefe RE5 enquiry', description: 'Client from Facebook ad asked about RE5 course. Follow up Monday to confirm enrolment decision.', relatedCallId: 'cl-t1',
    clientName: 'Thabo Molefe', clientPhone: '0824567123', assignedTo: '3', assignedToName: 'Themba Shabangu',
    status: 'pending', priority: 'medium', category: 'follow-up', dueDate: '2026-08-17', completedDate: '',
    notes: 'Employer needs to approve funds first.', createdBy: 'Themba Shabangu', createdAt: `${TODAY}T08:30:00`, updatedAt: `${TODAY}T08:30:00`,
  },
  {
    id: 'ct-t2', title: 'Process Nomsa Dlamini registration', description: 'New student registered via WhatsApp. Need to process deposit and send official registration docs.', relatedCallId: 'cl-t2',
    clientName: 'Nomsa Dlamini', clientPhone: '0737890456', assignedTo: '3', assignedToName: 'Themba Shabangu',
    status: 'in-progress', priority: 'high', category: 'documentation', dueDate: `${TODAY}`, completedDate: '',
    notes: 'Deposit of R2,500 confirmed received.', createdBy: 'Themba Shabangu', createdAt: `${TODAY}T10:10:00`, updatedAt: `${TODAY}T10:10:00`,
  },
  {
    id: 'ct-t3', title: 'Prepare Lerato Kgosi certificate', description: 'Client complained about delayed certificate. Finance team must prioritise and have ready by Friday.', relatedCallId: 'cl-t4',
    clientName: 'Lerato Kgosi', clientPhone: '0761234567', assignedTo: '6', assignedToName: 'Lisa Peters',
    status: 'in-progress', priority: 'urgent', category: 'complaint-resolution', dueDate: '2026-08-15', completedDate: '',
    notes: 'Escalated to supervisor. Client expecting collection Friday.', createdBy: 'Themba Shabangu', createdAt: `${TODAY}T13:20:00`, updatedAt: `${TODAY}T13:20:00`,
  },
  {
    id: 'ct-t4', title: 'Admissions callback Faith Mokoena', description: 'WhatsApp enquiry about September intake. Admissions officer to call at 9am tomorrow.', relatedCallId: 'cl-t6',
    clientName: 'Faith Mokoena', clientPhone: '0821112233', assignedTo: '3', assignedToName: 'Themba Shabangu',
    status: 'pending', priority: 'medium', category: 'callback', dueDate: '2026-08-15', completedDate: '',
    notes: 'Call scheduled for 9am.', createdBy: 'Themba Shabangu', createdAt: `${TODAY}T15:20:00`, updatedAt: `${TODAY}T15:20:00`,
  },
];

// ─── Database ───
const DB = {
  call_logs: [...DEFAULT_CALL_LOGS],
  call_tasks: [...DEFAULT_CALL_TASKS],
  users: [], messages: [], sales_records: [], visitors: [], appointments: [], learners: [],
  invoices: [], quotes: [], products: [], customers: [], suppliers: [],
  attendance_records: [], leave_requests: [], meetings: [], journal_entries: [],
  gl_accounts: [], bank_accounts: [], vat_entries: [], bank_statements: [],
  criminal_records: [], psychometry_results: [], interview_evaluations: [], "business-settings": [],
};

function createId() { return Date.now() + Math.floor(Math.random() * 1000); }

const app = new Hono();

app.use("*", async (c, next) => {
  c.header("Access-Control-Allow-Origin", "*");
  c.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  c.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (c.req.method === "OPTIONS") return c.text("", 204);
  await next();
});

app.get("/api/health", (c) => c.json({ success: true, status: "ok", timestamp: new Date().toISOString() }));

Object.keys(DB).forEach((table) => {
  const store = DB[table];
  app.get(`/api/${table}`, (c) => c.json({ data: store, success: true }));
  app.post(`/api/${table}`, async (c) => {
    try {
      const body = await c.req.json();
      const item = { id: createId(), ...body, createdAt: new Date().toISOString() };
      store.push(item);
      return c.json({ success: true, data: item }, 201);
    } catch { return c.json({ success: false, error: "Invalid JSON" }, 400); }
  });
  app.get(`/api/${table}/:id`, (c) => {
    const item = store.find((s) => String(s.id) === c.req.param("id"));
    return item ? c.json({ data: item, success: true }) : c.json({ error: "Not found" }, 404);
  });
  app.patch(`/api/${table}/:id`, async (c) => {
    try {
      const idx = store.findIndex((s) => String(s.id) === c.req.param("id"));
      if (idx === -1) return c.json({ error: "Not found" }, 404);
      store[idx] = { ...store[idx], ...await c.req.json() };
      return c.json({ success: true, data: store[idx] });
    } catch { return c.json({ success: false, error: "Invalid JSON" }, 400); }
  });
  app.delete(`/api/${table}/:id`, (c) => {
    const idx = store.findIndex((s) => String(s.id) === c.req.param("id"));
    if (idx === -1) return c.json({ error: "Not found" }, 404);
    store.splice(idx, 1);
    return c.json({ success: true });
  });
});

app.get("/api/psychometric_assessments", (c) => c.json({ data: DB.psychometry_results, success: true }));
app.post("/api/psychometric_assessments", async (c) => {
  try {
    const item = { id: createId(), ...await c.req.json(), createdAt: new Date().toISOString() };
    DB.psychometry_results.push(item);
    return c.json({ success: true, data: item }, 201);
  } catch { return c.json({ success: false, error: "Invalid JSON" }, 400); }
});

const publicDir = path.join(__dirname, "public");
if (fs.existsSync(publicDir)) {
  app.use("*", serveStatic({ root: "./public" }));
  app.notFound((c) => {
    const accept = c.req.header("accept") ?? "";
    if (accept.includes("text/html") || !c.req.path.startsWith("/api")) {
      const indexPath = path.join(publicDir, "index.html");
      if (fs.existsSync(indexPath)) return c.html(fs.readFileSync(indexPath, "utf-8"));
    }
    return c.json({ error: "Not Found" }, 404);
  });
}

serve({ fetch: app.fetch, port: PORT }, () => {
  console.log(`Cornerstone ERP running on http://localhost:${PORT}/`);
});
