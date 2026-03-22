// ─── Industry Verticals ───────────────────────────────────────────────────────
export const VERTICALS = [
  { id: 'hospitality',   label: 'Hospitality',        icon: '🏨', color: 'bg-blue-100 text-blue-800' },
  { id: 'restaurant',    label: 'Restaurant & Chef',  icon: '👨‍🍳', color: 'bg-orange-100 text-orange-800' },
  { id: 'spa',           label: 'Spa / Salons',        icon: '💆', color: 'bg-pink-100 text-pink-800' },
  { id: 'healthcare',    label: 'Healthcare',          icon: '🏥', color: 'bg-red-100 text-red-800' },
  { id: 'airline',       label: 'Airline',             icon: '✈️', color: 'bg-sky-100 text-sky-800' },
  { id: 'corporate',     label: 'Corporate',           icon: '🏢', color: 'bg-slate-100 text-slate-800' },
  { id: 'schools',       label: 'Schools',             icon: '🎓', color: 'bg-yellow-100 text-yellow-800' },
]

// ─── Preset Departments per Vertical ─────────────────────────────────────────
export const DEPT_PRESETS = {
  hospitality: [
    'Front Desk', 'Concierge', 'Housekeeping', 'Bell Staff',
    'Restaurant (In-house)', 'Security', 'Management', 'Valet',
  ],
  restaurant: [
    'Kitchen – Head Chef', 'Kitchen – Sous Chef', 'Kitchen – Line Cook',
    'Serving Staff', 'Bar Staff', 'Host / Hostess', 'Management',
  ],
  spa: [
    'Therapist', 'Receptionist', 'Cleaning & Housekeeping', 'Management',
  ],
  healthcare: [
    'Doctors', 'Nurses', 'Ward Staff', 'Administrative Staff',
    'Housekeeping', 'Security', 'Lab Technicians',
  ],
  airline: [
    'Cabin Crew', 'Ground Staff', 'Check-in Staff', 'Security',
    'Cargo Handling', 'Management',
  ],
  corporate: [
    'C-Suite / Management', 'Executive Staff', 'Administrative Staff',
    'Security', 'Housekeeping', 'Receptionists',
  ],
  schools: [
    'Teaching Staff', 'Administrative Staff', 'Housekeeping',
    'Security', 'Sports & Physical Education', 'Canteen Staff',
  ],
}

// ─── Uniform Types ─────────────────────────────────────────────────────────────
export const UNIFORM_TYPES = [
  { id: 'shirt',     label: 'Shirt / Blouse' },
  { id: 'blazer',    label: 'Blazer / Jacket' },
  { id: 'trousers',  label: 'Trousers / Skirt' },
  { id: 'apron',     label: 'Apron' },
  { id: 'chef_coat', label: 'Chef Coat' },
  { id: 'suit',      label: 'Full Suit' },
  { id: 'saree',     label: 'Saree / Salwar' },
  { id: 'shoes',     label: 'Shoes' },
  { id: 'cap',       label: 'Cap / Hat' },
]

// ─── Measurement Fields per Uniform Type ─────────────────────────────────────
export const MEASUREMENT_FIELDS = {
  shirt:     ['Chest', 'Shoulder Width', 'Sleeve Length', 'Collar / Neck', 'Shirt Length'],
  blazer:    ['Chest', 'Shoulder Width', 'Sleeve Length', 'Collar / Neck', 'Jacket Length', 'Waist'],
  trousers:  ['Waist', 'Hip', 'Inseam', 'Outseam', 'Thigh', 'Bottom Width'],
  apron:     ['Apron Length', 'Waist Tie Length', 'Bib Width'],
  chef_coat: ['Chest', 'Shoulder Width', 'Sleeve Length', 'Collar / Neck', 'Coat Length', 'Waist'],
  suit:      ['Chest', 'Shoulder Width', 'Sleeve Length', 'Collar / Neck', 'Jacket Length', 'Waist', 'Hip', 'Inseam', 'Outseam', 'Thigh'],
  saree:     ['Blouse Chest', 'Blouse Length', 'Sleeve Length', 'Shoulder Width', 'Waist', 'Hip', 'Petticoat Length'],
  shoes:     ['UK Size', 'Foot Length'],
  cap:       ['Head Circumference'],
}

// ─── Employee Status Options ───────────────────────────────────────────────────
export const STATUS_OPTIONS = [
  { value: 'pending',    label: 'Pending',       className: 'badge-pending' },
  { value: 'measured',   label: 'Measured',      className: 'badge-measured' },
  { value: 'production', label: 'In Production', className: 'badge-production' },
  { value: 'completed',  label: 'Completed',     className: 'badge-completed' },
]

// ─── Gender Options ────────────────────────────────────────────────────────────
export const GENDER_OPTIONS = ['Male', 'Female', 'Other']

// ─── Unit Options ──────────────────────────────────────────────────────────────
export const UNIT_OPTIONS = [
  { value: 'in', label: 'Inches (in)' },
  { value: 'cm', label: 'Centimetres (cm)' },
]

// ─── Seed Data ─────────────────────────────────────────────────────────────────
export const SEED_HOTELS = [
  {
    id: 'h1',
    name: 'The Oberoi Grand',
    address: '15, Jawaharlal Nehru Road, Kolkata',
    contact: '+91 33 2249 2323',
    vertical: 'hospitality',
    isActive: true,
    createdAt: '2026-01-10',
  },
  {
    id: 'h2',
    name: 'Taj Mahal Palace',
    address: 'Apollo Bunder, Colaba, Mumbai',
    contact: '+91 22 6665 3366',
    vertical: 'hospitality',
    isActive: true,
    createdAt: '2026-01-15',
  },
  {
    id: 'h3',
    name: 'Spice Garden Restaurant',
    address: '22 MG Road, Bangalore',
    contact: '+91 80 4111 2233',
    vertical: 'restaurant',
    isActive: true,
    createdAt: '2026-02-01',
  },
  {
    id: 'h4',
    name: 'Apollo Hospitals',
    address: 'Greams Road, Chennai',
    contact: '+91 44 2829 0200',
    vertical: 'healthcare',
    isActive: true,
    createdAt: '2026-02-10',
  },
  {
    id: 'h5',
    name: 'IndiGo Airlines – BOM',
    address: 'Terminal 1, CSIA, Mumbai',
    contact: '+91 22 6100 6100',
    vertical: 'airline',
    isActive: true,
    createdAt: '2026-02-20',
  },
]

export const SEED_DEPARTMENTS = [
  { id: 'd1', hotelId: 'h1', name: 'Front Desk',    isActive: true },
  { id: 'd2', hotelId: 'h1', name: 'Housekeeping',  isActive: true },
  { id: 'd3', hotelId: 'h1', name: 'Security',      isActive: true },
  { id: 'd4', hotelId: 'h1', name: 'Management',    isActive: true },
  { id: 'd5', hotelId: 'h2', name: 'Front Desk',    isActive: true },
  { id: 'd6', hotelId: 'h2', name: 'Concierge',     isActive: true },
  { id: 'd7', hotelId: 'h2', name: 'Housekeeping',  isActive: true },
  { id: 'd8', hotelId: 'h3', name: 'Kitchen – Head Chef', isActive: true },
  { id: 'd9', hotelId: 'h3', name: 'Serving Staff', isActive: true },
  { id: 'd10', hotelId: 'h4', name: 'Doctors',      isActive: true },
  { id: 'd11', hotelId: 'h4', name: 'Nurses',       isActive: true },
  { id: 'd12', hotelId: 'h5', name: 'Cabin Crew',   isActive: true },
  { id: 'd13', hotelId: 'h5', name: 'Ground Staff', isActive: true },
]

export const SEED_EMPLOYEES = [
  { id: 'e1',  deptId: 'd1', hotelId: 'h1', name: 'Priya Sharma',     gender: 'Female', role: 'Receptionist',  empCode: 'FF-H1-001', status: 'measured' },
  { id: 'e2',  deptId: 'd1', hotelId: 'h1', name: 'Rahul Mehta',      gender: 'Male',   role: 'Receptionist',  empCode: 'FF-H1-002', status: 'completed' },
  { id: 'e3',  deptId: 'd2', hotelId: 'h1', name: 'Sunita Devi',      gender: 'Female', role: 'Housekeeper',   empCode: 'FF-H1-003', status: 'pending' },
  { id: 'e4',  deptId: 'd2', hotelId: 'h1', name: 'Rajan Kumar',      gender: 'Male',   role: 'Housekeeper',   empCode: 'FF-H1-004', status: 'measured' },
  { id: 'e5',  deptId: 'd3', hotelId: 'h1', name: 'Vikram Singh',     gender: 'Male',   role: 'Security Guard',empCode: 'FF-H1-005', status: 'production' },
  { id: 'e6',  deptId: 'd5', hotelId: 'h2', name: 'Anjali Nair',      gender: 'Female', role: 'Front Desk Exec',empCode: 'FF-H2-001', status: 'measured' },
  { id: 'e7',  deptId: 'd6', hotelId: 'h2', name: 'David Thomas',     gender: 'Male',   role: 'Concierge',     empCode: 'FF-H2-002', status: 'pending' },
  { id: 'e8',  deptId: 'd8', hotelId: 'h3', name: 'Chef Ramesh Iyer', gender: 'Male',   role: 'Head Chef',     empCode: 'FF-H3-001', status: 'completed' },
  { id: 'e9',  deptId: 'd9', hotelId: 'h3', name: 'Meena Pillai',     gender: 'Female', role: 'Server',        empCode: 'FF-H3-002', status: 'measured' },
  { id: 'e10', deptId: 'd10', hotelId: 'h4', name: 'Dr. Sneha Kapoor', gender: 'Female', role: 'Physician',   empCode: 'FF-H4-001', status: 'pending' },
  { id: 'e11', deptId: 'd11', hotelId: 'h4', name: 'Nurse Preeti',    gender: 'Female', role: 'Staff Nurse',   empCode: 'FF-H4-002', status: 'measured' },
  { id: 'e12', deptId: 'd12', hotelId: 'h5', name: 'Kavita Rao',      gender: 'Female', role: 'Cabin Crew',    empCode: 'FF-H5-001', status: 'production' },
]

export const SEED_MEASUREMENTS = [
  {
    id: 'm1', employeeId: 'e1', uniformType: 'shirt', unit: 'in',
    values: { 'Chest': '36', 'Shoulder Width': '14', 'Sleeve Length': '23', 'Collar / Neck': '14', 'Shirt Length': '26' },
    recordedBy: 'staff1', recordedAt: '2026-03-10T10:30:00',
  },
  {
    id: 'm2', employeeId: 'e1', uniformType: 'trousers', unit: 'in',
    values: { 'Waist': '28', 'Hip': '36', 'Inseam': '30', 'Outseam': '40', 'Thigh': '20', 'Bottom Width': '16' },
    recordedBy: 'staff1', recordedAt: '2026-03-10T10:35:00',
  },
  {
    id: 'm3', employeeId: 'e2', uniformType: 'shirt', unit: 'in',
    values: { 'Chest': '40', 'Shoulder Width': '17', 'Sleeve Length': '25', 'Collar / Neck': '16', 'Shirt Length': '29' },
    recordedBy: 'staff1', recordedAt: '2026-03-11T09:15:00',
  },
  {
    id: 'm4', employeeId: 'e8', uniformType: 'chef_coat', unit: 'in',
    values: { 'Chest': '44', 'Shoulder Width': '18', 'Sleeve Length': '26', 'Collar / Neck': '17', 'Coat Length': '32', 'Waist': '38' },
    recordedBy: 'staff2', recordedAt: '2026-03-12T14:00:00',
  },
]

// ─── Seed Users ────────────────────────────────────────────────────────────────
export const SEED_USERS = [
  { id: 'admin1', email: 'admin@fashionfabric.in', password: 'admin123', role: 'admin',  name: 'Piyush Desai',     assignedHotelId: null },
  { id: 'staff1', email: 'staff@fashionfabric.in', password: 'staff123', role: 'staff',  name: 'Ravi Tiwari',      assignedHotelId: 'h1' },
  { id: 'staff2', email: 'staff2@fashionfabric.in',password: 'staff123', role: 'staff',  name: 'Pooja Verma',      assignedHotelId: 'h3' },
]
