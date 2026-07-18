import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import {
  Search, Bell, MapPin, Star, ChevronRight, Heart,
  ShoppingCart, ArrowLeft, X, Home, LayoutGrid,
  User, MessageCircle, Clock, Zap, Camera, Video,
  Send, SlidersHorizontal, Plus, Minus, Share2, Phone,
  ChevronDown, ChevronUp, Edit3, Trash2, CheckCircle,
  Package, Gift, CreditCard, Settings, HelpCircle,
  LogOut, Shield, Award, Calendar, Wrench, Sparkles,
  Wind, Hammer, Paintbrush, Cpu, Check, Mic,
  AlertCircle, Info, RefreshCw, Navigation, Truck,
  Bookmark, TrendingUp, MessageSquare, Eye,
  Filter, Signal, Wifi, Battery, Tag, Percent,
  CalendarDays, ArrowRight, FileText, ChevronLeft,
  BookOpen, MoreHorizontal, Play, List, MapPin as MapPinFill
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────
interface Pkg { id: string; name: string; price: number; duration: string; features: string[]; }
interface Service {
  id: string; categoryId: string; name: string; provider: string;
  rating: number; reviews: number; price: number; originalPrice?: number;
  duration: string; badge?: string; images: string[];
  description: string; includes: string[]; packages: Pkg[];
}
interface Worker {
  id: string; name: string; specialty: string; rating: number; reviews: number;
  jobs: number; experience: string; verified: boolean; available: boolean;
  image: string; bio: string; skills: string[]; price: number;
}
interface Address { id: string; label: string; line1: string; line2: string; city: string; pincode: string; isDefault: boolean; }
interface PayMethod { id: string; type: "upi" | "card" | "wallet" | "netbanking"; label: string; detail: string; isDefault: boolean; }
interface Booking { id: string; serviceId: string; workerId: string; status: "upcoming" | "ongoing" | "completed" | "cancelled"; date: string; time: string; address: string; total: number; packageName: string; }
interface CartItem { serviceId: string; packageId: string; }
interface ChatMsg { id: string; sender: "user" | "worker"; text: string; time: string; }
interface Notif { id: string; type: "booking" | "offer" | "reminder" | "update"; title: string; body: string; time: string; read: boolean; }
interface UserProfile { name: string; email: string; phone: string; }
interface AppCtx {
  screen: string;
  navigate: (s: string) => void;
  goBack: () => void;
  isLoggedIn: boolean;
  setIsLoggedIn: (v: boolean) => void;
  selectedServiceId: string | null;
  setSelectedServiceId: (id: string | null) => void;
  selectedWorkerId: string | null;
  setSelectedWorkerId: (id: string | null) => void;
  selectedCategoryId: string | null;
  setSelectedCategoryId: (id: string | null) => void;
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  wishlist: Set<string>;
  toggleWishlist: (id: string) => void;
  selectedPkgId: string | null;
  setSelectedPkgId: (id: string | null) => void;
  selectedAddressId: string;
  setSelectedAddressId: (id: string) => void;
  selectedDate: string | null;
  setSelectedDate: (d: string | null) => void;
  selectedTime: string | null;
  setSelectedTime: (t: string | null) => void;
  selectedPayId: string;
  setSelectedPayId: (id: string) => void;
  appliedCoupon: { code: string; discount: number } | null;
  setAppliedCoupon: (c: { code: string; discount: number } | null) => void;
  bookings: Booking[];
  setBookings: React.Dispatch<React.SetStateAction<Booking[]>>;
  addresses: Address[];
  setAddresses: React.Dispatch<React.SetStateAction<Address[]>>;
  payMethods: PayMethod[];
  setPayMethods: React.Dispatch<React.SetStateAction<PayMethod[]>>;
  chatMsgs: ChatMsg[];
  setChatMsgs: React.Dispatch<React.SetStateAction<ChatMsg[]>>;
  aiTab: "text" | "photo" | "video";
  setAiTab: (t: "text" | "photo" | "video") => void;
  galleryIdx: number;
  setGalleryIdx: (i: number) => void;
  sortOption: string;
  setSortOption: (s: string) => void;
  requireAuth: (cb: () => void) => void;
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  currentBookingId: string | null;
  setCurrentBookingId: (id: string | null) => void;
  editingAddressId: string | null;
  setEditingAddressId: (id: string | null) => void;
  notifications: Notif[];
  markNotifsRead: () => void;
  aiQuery: string;
  setAiQuery: (q: string) => void;
  filterState: { rating: number; verified: boolean; priceMax: number };
  setFilterState: React.Dispatch<React.SetStateAction<{ rating: number; verified: boolean; priceMax: number }>>;
  isMobile: boolean;
}

// ─── Data ────────────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: "cleaning", name: "Cleaning", Icon: Sparkles, count: 45, image: "https://images.unsplash.com/photo-1563453392212-326f5e854473?w=400&h=400&fit=crop" },
  { id: "plumbing", name: "Plumbing", Icon: Wrench, count: 32, image: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&h=400&fit=crop" },
  { id: "electrical", name: "Electrical", Icon: Zap, count: 28, image: "https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=400&h=400&fit=crop" },
  { id: "ac", name: "AC Service", Icon: Wind, count: 38, image: "https://images.unsplash.com/photo-1474631245212-32dc3c8310c6?w=400&h=400&fit=crop" },
  { id: "painting", name: "Painting", Icon: Paintbrush, count: 19, image: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400&h=400&fit=crop" },
  { id: "pest", name: "Pest Control", Icon: Shield, count: 14, image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=400&fit=crop" },
  { id: "carpentry", name: "Carpentry", Icon: Hammer, count: 23, image: "https://images.unsplash.com/photo-1565372781813-52fd3e8c54ee?w=400&h=400&fit=crop" },
  { id: "appliance", name: "Appliances", Icon: Cpu, count: 56, image: "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=400&h=400&fit=crop" },
  { id: "gardening", name: "Gardening", Icon: Sparkles, count: 17, image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=400&fit=crop" },
  { id: "movers", name: "Movers", Icon: Truck, count: 12, image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop" },
  { id: "interior", name: "Interior", Icon: LayoutGrid, count: 31, image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=400&fit=crop" },
  { id: "security", name: "Security", Icon: Shield, count: 8, image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=400&fit=crop" },
];

const SERVICES: Service[] = [
  {
    id: "s1", categoryId: "cleaning", name: "Full Home Deep Cleaning", provider: "HomigoClean Pro",
    rating: 4.8, reviews: 2847, price: 1499, originalPrice: 1999, duration: "3-4 hrs", badge: "Best Seller",
    images: [
      "https://images.unsplash.com/photo-1563453392212-326f5e854473?w=800&h=500&fit=crop",
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=500&fit=crop",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=500&fit=crop",
    ],
    description: "Comprehensive deep clean for your entire home using eco-friendly products and professional equipment. Every corner, every surface — spotless and fresh.",
    includes: ["Kitchen deep clean (appliances, cabinets, countertops)", "Bathroom scrubbing and disinfection", "All rooms vacuumed and mopped", "Window cleaning (interior)", "Sofa and furniture dusting"],
    packages: [
      { id: "basic", name: "Basic", price: 999, duration: "2-3 hrs", features: ["1 BHK coverage", "Surface cleaning", "Eco products"] },
      { id: "standard", name: "Standard", price: 1499, duration: "3-4 hrs", features: ["2-3 BHK coverage", "Deep cleaning", "Premium products", "Inside appliances"] },
      { id: "premium", name: "Premium", price: 2499, duration: "5-6 hrs", features: ["4+ BHK coverage", "Steam cleaning", "Premium products", "Inside appliances", "30-day guarantee"] },
    ],
  },
  {
    id: "s2", categoryId: "cleaning", name: "Bathroom Deep Cleaning", provider: "CleanMaster",
    rating: 4.7, reviews: 1923, price: 799, originalPrice: 999, duration: "1-2 hrs", badge: "Popular",
    images: [
      "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800&h=500&fit=crop",
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&h=500&fit=crop",
    ],
    description: "Professional bathroom cleaning and sanitization. Industrial-grade products tackle stubborn stains, mold, and grime for a gleaming result.",
    includes: ["Tile and grout scrubbing", "Toilet deep disinfection", "Shower/tub descaling", "Mirror and fixtures polishing", "Exhaust fan cleaning"],
    packages: [
      { id: "basic", name: "Basic", price: 499, duration: "45 mins", features: ["1 bathroom", "Standard clean", "Eco products"] },
      { id: "standard", name: "Standard", price: 799, duration: "1.5 hrs", features: ["2 bathrooms", "Deep clean", "Anti-mold treatment"] },
      { id: "premium", name: "Premium", price: 1299, duration: "2-3 hrs", features: ["3+ bathrooms", "Steam clean", "Grout sealing", "15-day guarantee"] },
    ],
  },
  {
    id: "s3", categoryId: "ac", name: "AC Service & Repair", provider: "CoolTech Services",
    rating: 4.9, reviews: 3241, price: 599, originalPrice: 799, duration: "1-2 hrs", badge: "Top Rated",
    images: [
      "https://images.unsplash.com/photo-1474631245212-32dc3c8310c6?w=800&h=500&fit=crop",
      "https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=800&h=500&fit=crop",
    ],
    description: "Comprehensive AC servicing including filter cleaning, gas top-up check, and performance optimization. All major brands covered.",
    includes: ["Filter cleaning and replacement check", "Coil cleaning (indoor + outdoor)", "Gas pressure check", "Thermostat calibration", "Performance report"],
    packages: [
      { id: "basic", name: "Basic", price: 399, duration: "45 mins", features: ["Filter clean", "Basic check", "1 AC unit"] },
      { id: "standard", name: "Standard", price: 599, duration: "1.5 hrs", features: ["Deep clean", "Gas check", "Coil wash", "1 AC unit"] },
      { id: "premium", name: "Premium", price: 999, duration: "2-3 hrs", features: ["Full service", "Gas top-up", "PCB check", "Up to 2 AC units", "90-day warranty"] },
    ],
  },
  {
    id: "s4", categoryId: "plumbing", name: "Plumbing Repair & Fix", provider: "QuickFix Plumbers",
    rating: 4.6, reviews: 1547, price: 399, duration: "1-3 hrs",
    images: ["https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&h=500&fit=crop"],
    description: "Expert plumbers for leaks, blockages, pipe repairs, tap installation, and more. Same-day service available.",
    includes: ["Leak detection and repair", "Pipe replacement", "Tap and faucet installation", "Drain unclogging", "Water pressure optimization"],
    packages: [
      { id: "basic", name: "Basic", price: 299, duration: "1 hr", features: ["Single issue fix", "Standard parts", "Basic warranty"] },
      { id: "standard", name: "Standard", price: 599, duration: "2 hrs", features: ["Multiple fixes", "Quality parts", "30-day warranty"] },
      { id: "premium", name: "Premium", price: 999, duration: "3 hrs", features: ["Full home audit", "Premium parts", "6-month warranty", "Priority support"] },
    ],
  },
  {
    id: "s5", categoryId: "electrical", name: "Electrical Work & Wiring", provider: "PowerPro Electrical",
    rating: 4.7, reviews: 2103, price: 499, duration: "1-4 hrs",
    images: ["https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=800&h=500&fit=crop"],
    description: "Licensed electricians for all your electrical needs — from switches to full wiring. Safe, compliant, and precise.",
    includes: ["Electrical fault diagnosis", "Switch and socket installation", "MCB and fuse box work", "Fan and light installation", "Safety audit"],
    packages: [
      { id: "basic", name: "Basic", price: 349, duration: "1 hr", features: ["1-2 points", "Standard fixtures", "Basic warranty"] },
      { id: "standard", name: "Standard", price: 699, duration: "2-3 hrs", features: ["Up to 5 points", "Quality fixtures", "60-day warranty"] },
      { id: "premium", name: "Premium", price: 1499, duration: "4+ hrs", features: ["Full home wiring", "Premium fixtures", "1-year warranty", "Inspection report"] },
    ],
  },
  {
    id: "s6", categoryId: "painting", name: "Interior Wall Painting", provider: "ColorCraft Studios",
    rating: 4.8, reviews: 1876, price: 2999, originalPrice: 3999, duration: "1-3 days", badge: "Premium",
    images: ["https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=800&h=500&fit=crop"],
    description: "Transform your home with professional interior painting. Premium paints, skilled painters, and a flawless finish guaranteed.",
    includes: ["Surface preparation and priming", "Putty application (2 coats)", "Premium paint (2 coats)", "Color consultation", "Furniture protection", "Post-paint cleanup"],
    packages: [
      { id: "basic", name: "Basic", price: 1999, duration: "1 day", features: ["Up to 500 sq ft", "Economy paint", "Basic prep"] },
      { id: "standard", name: "Standard", price: 2999, duration: "1-2 days", features: ["Up to 1000 sq ft", "Premium paint", "Full prep", "Color consultation"] },
      { id: "premium", name: "Premium", price: 4999, duration: "2-3 days", features: ["Full home", "Luxury paint", "Texture options", "2-year guarantee"] },
    ],
  },
];

const WORKERS: Worker[] = [
  {
    id: "w1", name: "Rahul Sharma", specialty: "Cleaning Expert", rating: 4.9, reviews: 847, jobs: 1243,
    experience: "5 years", verified: true, available: true,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
    bio: "Certified cleaning specialist with 5 years of experience. Trained in eco-friendly protocols, deep cleaning techniques, and customer satisfaction.",
    skills: ["Deep Cleaning", "Sanitization", "Carpet Care", "Kitchen Cleaning"],
    price: 1499,
  },
  {
    id: "w2", name: "Priya Patel", specialty: "AC Technician", rating: 4.8, reviews: 623, jobs: 987,
    experience: "7 years", verified: true, available: true,
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face",
    bio: "Certified AC & HVAC technician. Specializes in all major brands including Daikin, Voltas, Blue Star, and Mitsubishi.",
    skills: ["AC Service", "HVAC Repair", "Gas Top-up", "PCB Repair"],
    price: 599,
  },
  {
    id: "w3", name: "Amit Kumar", specialty: "Master Electrician", rating: 4.7, reviews: 512, jobs: 731,
    experience: "8 years", verified: true, available: false,
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face",
    bio: "Licensed electrician with 8 years experience. Specializes in residential and commercial wiring, panel upgrades, and safety audits.",
    skills: ["Wiring", "Panel Upgrade", "Safety Audit", "Industrial Work"],
    price: 699,
  },
  {
    id: "w4", name: "Sunita Verma", specialty: "Plumbing Expert", rating: 4.8, reviews: 389, jobs: 556,
    experience: "6 years", verified: true, available: true,
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
    bio: "Expert plumber specializing in bathroom renovation, leak repairs, and pipe installations. Fast, reliable, and precise.",
    skills: ["Pipe Fitting", "Leak Repair", "Bathroom Renovation", "Water Heater"],
    price: 599,
  },
  {
    id: "w5", name: "Ravi Gupta", specialty: "Painting Specialist", rating: 4.9, reviews: 721, jobs: 892,
    experience: "10 years", verified: true, available: true,
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
    bio: "Master painter with 10 years of experience in residential and commercial painting. Specializes in textured and decorative finishes.",
    skills: ["Interior Painting", "Texture Finish", "Waterproofing", "Wood Polish"],
    price: 2999,
  },
];

const INIT_ADDRESSES: Address[] = [
  { id: "a1", label: "Home", line1: "Flat 4B, Skyline Towers", line2: "Linking Road, Bandra West", city: "Mumbai", pincode: "400050", isDefault: true },
  { id: "a2", label: "Office", line1: "12th Floor, Peninsula Corporate Park", line2: "Ganpatrao Kadam Marg, Lower Parel", city: "Mumbai", pincode: "400013", isDefault: false },
];

const INIT_PAYMETHODS: PayMethod[] = [
  { id: "pm1", type: "upi", label: "Google Pay", detail: "rahul@okicici", isDefault: true },
  { id: "pm2", type: "card", label: "HDFC Credit Card", detail: "•••• •••• •••• 4521", isDefault: false },
  { id: "pm3", type: "wallet", label: "Homigo Wallet", detail: "₹450 available", isDefault: false },
];

const INIT_BOOKINGS: Booking[] = [
  { id: "bk001", serviceId: "s3", workerId: "w2", status: "upcoming", date: "Tomorrow, 19 Jul", time: "10:00 AM", address: "Home", total: 599, packageName: "Standard" },
  { id: "bk002", serviceId: "s1", workerId: "w1", status: "completed", date: "Mon, 14 Jul", time: "9:00 AM", address: "Home", total: 1499, packageName: "Standard" },
  { id: "bk003", serviceId: "s4", workerId: "w4", status: "completed", date: "Fri, 11 Jul", time: "11:00 AM", address: "Office", total: 599, packageName: "Standard" },
  { id: "bk004", serviceId: "s5", workerId: "w3", status: "cancelled", date: "Wed, 9 Jul", time: "2:00 PM", address: "Home", total: 699, packageName: "Standard" },
];

const INIT_CHAT: ChatMsg[] = [
  { id: "cm1", sender: "worker", text: "Hello! I'm Rahul, your assigned professional. I'll arrive by 10 AM tomorrow.", time: "9:30 AM" },
  { id: "cm2", sender: "user", text: "Great! Please bring supplies for deep cleaning — we have 3 bathrooms.", time: "9:32 AM" },
  { id: "cm3", sender: "worker", text: "Of course! I'll bring all necessary equipment. Any specific areas of concern?", time: "9:35 AM" },
  { id: "cm4", sender: "user", text: "The kitchen needs extra attention. It's been a while.", time: "9:36 AM" },
  { id: "cm5", sender: "worker", text: "Understood! I'll start with the kitchen and give it a thorough clean. See you tomorrow! 👍", time: "9:38 AM" },
];

const INIT_NOTIFS: Notif[] = [
  { id: "n1", type: "booking", title: "Booking Confirmed!", body: "Your AC Service is scheduled for Tomorrow at 10:00 AM.", time: "2 min ago", read: false },
  { id: "n2", type: "offer", title: "Limited Offer", body: "Get ₹300 off your next cleaning. Use code CLEAN300", time: "1 hr ago", read: false },
  { id: "n3", type: "reminder", title: "Service Reminder", body: "Your monthly home cleaning is due next week.", time: "3 hrs ago", read: true },
  { id: "n4", type: "update", title: "Rahul is on his way", body: "Your cleaner is 20 min away. Track in real-time.", time: "Yesterday", read: true },
  { id: "n5", type: "booking", title: "Service Completed ✓", body: "Deep Cleaning completed. Rate your experience.", time: "Mon", read: true },
  { id: "n6", type: "offer", title: "Weekend Special", body: "Book any 2 services and get 20% off. This weekend only.", time: "Sun", read: true },
];

const COUPONS = [
  { code: "FIRST200", discount: 200, type: "flat", minOrder: 999, description: "₹200 off on first booking", valid: true },
  { code: "CLEAN20", discount: 20, type: "percent", minOrder: 1499, description: "20% off on cleaning services", maxDiscount: 400, valid: true },
  { code: "HOMIGO50", discount: 50, type: "percent", minOrder: 499, description: "50% off — member offer", maxDiscount: 500, valid: false },
];

const FAQS_DATA = [
  { q: "What products do you use?", a: "We use eco-friendly, hospital-grade products safe for children and pets. All products are certified and biodegradable." },
  { q: "How long does the service take?", a: "Duration depends on your chosen package and home size. Basic cleaning (1 BHK) takes 2-3 hrs. Full home deep cleaning can take 5-6 hrs." },
  { q: "Do I need to be home during service?", a: "Preferred but not required. You can arrange access via your building manager. We recommend being present for the first visit." },
  { q: "What if I'm not satisfied?", a: "We offer a 100% satisfaction guarantee. If you're unhappy, we'll send our team back within 24 hours at no extra charge." },
  { q: "Are professionals background verified?", a: "Yes, all Homigo professionals undergo police verification, ID checks, and extensive skill training before joining." },
];

const REVIEWS_DATA = [
  { id: "r1", name: "Anjali M.", rating: 5, date: "14 Jul 2025", text: "Absolutely fantastic! Professional, thorough, and left my home sparkling. Worth every rupee.", avatar: "AM" },
  { id: "r2", name: "Vikram S.", rating: 5, date: "10 Jul 2025", text: "Third time using Homigo for deep cleaning. Consistently excellent. Always on time and courteous.", avatar: "VS" },
  { id: "r3", name: "Meera K.", rating: 4, date: "8 Jul 2025", text: "Very good service overall. Kitchen came out spotless. Minor issue — arrived 15 minutes late.", avatar: "MK" },
  { id: "r4", name: "Arjun P.", rating: 5, date: "5 Jul 2025", text: "Premium package is totally worth it. Steam cleaning on tiles — they look brand new!", avatar: "AP" },
];

const AI_SUGGESTIONS = [
  { title: "Deep Cleaning Required", confidence: 92, serviceId: "s1", description: "Grease buildup detected on kitchen surfaces. A professional deep clean is strongly recommended." },
  { title: "AC Filter Maintenance", confidence: 87, serviceId: "s3", description: "Signs indicate your AC has not been serviced in 8+ months. Filter cleaning and gas check recommended." },
  { title: "Pipe Blockage Risk", confidence: 74, serviceId: "s4", description: "Slow drainage patterns indicate a partial blockage. Professional plumbing recommended to prevent overflow." },
];

const TIME_SLOTS = ["8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM"];

const REMINDER_SERVICES = [
  { name: "AC Filter Cleaning", icon: Wind, lastDone: "3 months ago", nextDue: "Aug 2025", status: "due-soon" as const },
  { name: "Pest Control", icon: Shield, lastDone: "6 months ago", nextDue: "Sep 2025", status: "ok" as const },
  { name: "Deep Cleaning", icon: Sparkles, lastDone: "Never", nextDue: "Overdue", status: "overdue" as const },
  { name: "Plumbing Inspection", icon: Wrench, lastDone: "1 year ago", nextDue: "Jul 2025", status: "overdue" as const },
  { name: "Electrical Audit", icon: Zap, lastDone: "2 years ago", nextDue: "Oct 2025", status: "ok" as const },
];

// ─── Utils ──────────────────────────────────────────────────────────────
const fp = (p: number) => `₹${p.toLocaleString("en-IN")}`;
const getSvc = (id: string | null) => SERVICES.find(s => s.id === id);
const getWorker = (id: string | null) => WORKERS.find(w => w.id === id);
const getCat = (id: string | null) => CATEGORIES.find(c => c.id === id);
const getSvcsByCategory = (cid: string) => SERVICES.filter(s => s.categoryId === cid);

// ─── Shared Components ───────────────────────────────────────────────────
function StarRow({ rating, size = 12 }: { rating: number; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} size={size} className={i <= Math.round(rating) ? "text-amber-400 fill-amber-400" : "text-[#E8E8E8] fill-[#E8E8E8]"} />
      ))}
    </div>
  );
}

function Pill({ children, active, onClick }: { children: React.ReactNode; active?: boolean; onClick?: () => void }) {
  return (
    <button onClick={onClick} className={`px-4 py-1.5 rounded-full text-[12px] font-semibold whitespace-nowrap transition-all ${active ? "bg-[#111111] text-white" : "bg-white border border-[#E8E8E8] text-[#555555]"}`}>
      {children}
    </button>
  );
}

function SvcCard({ svc, onPress, onWish, inWish }: { svc: Service; onPress: () => void; onWish?: () => void; inWish?: boolean }) {
  return (
    <button onClick={onPress} className="w-full text-left">
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-[#F0EDE8] transition-shadow duration-300 hover:shadow-lg">
        <div className="relative">
          <img src={svc.images[0]} alt={svc.name} className="w-full h-[148px] object-cover bg-[#F0EDE8]" />
          {svc.badge && <span className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-white rounded-full text-[10px] font-bold text-[#111111] shadow-sm">{svc.badge}</span>}
          {onWish && (
            <button onClick={e => { e.stopPropagation(); onWish(); }} className="absolute top-2.5 right-2.5 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md">
              <Heart size={15} className={inWish ? "fill-red-500 text-red-500" : "text-[#888888]"} />
            </button>
          )}
        </div>
        <div className="p-3">
          <p className="text-[13px] font-semibold text-[#111111] leading-tight">{svc.name}</p>
          <p className="text-[11px] text-[#888888] mt-0.5">{svc.provider}</p>
          <div className="flex items-center gap-1 mt-1.5">
            <Star size={11} className="fill-amber-400 text-amber-400" />
            <span className="text-[11px] font-semibold text-[#111111]">{svc.rating}</span>
            <span className="text-[11px] text-[#AAAAAA]">({svc.reviews.toLocaleString()})</span>
          </div>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-baseline gap-1">
              <span className="text-[15px] font-bold text-[#111111]">{fp(svc.price)}</span>
              {svc.originalPrice && <span className="text-[11px] text-[#AAAAAA] line-through">{fp(svc.originalPrice)}</span>}
            </div>
            <span className="text-[10px] text-[#AAAAAA]">{svc.duration}</span>
          </div>
        </div>
      </div>
    </button>
  );
}

function SvcCardH({ svc, onPress }: { svc: Service; onPress: () => void }) {
  return (
    <button onClick={onPress} className="text-left w-[180px] flex-shrink-0">
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-[#F0EDE8] transition-shadow duration-300 hover:shadow-lg">
        <img src={svc.images[0]} alt={svc.name} className="w-full h-[110px] object-cover bg-[#F0EDE8]" />
        <div className="p-2.5">
          <p className="text-[12px] font-semibold text-[#111111] leading-tight truncate">{svc.name}</p>
          <div className="flex items-center gap-0.5 mt-1">
            <Star size={10} className="fill-amber-400 text-amber-400" />
            <span className="text-[10px] font-semibold text-[#111111]">{svc.rating}</span>
          </div>
          <p className="text-[13px] font-bold text-[#111111] mt-1">{fp(svc.price)}</p>
        </div>
      </div>
    </button>
  );
}

function WorkerCard({ worker, onPress }: { worker: Worker; onPress: () => void }) {
  return (
    <button onClick={onPress} className="text-left w-[144px] flex-shrink-0">
      <div className="bg-white rounded-2xl p-3 shadow-sm border border-[#F0EDE8]">
        <div className="relative mb-2">
          <img src={worker.image} alt={worker.name} className="w-full h-[110px] object-cover rounded-xl bg-[#F0EDE8]" />
          {worker.available && (
            <div className="absolute bottom-1.5 left-1.5 flex items-center gap-1 bg-white rounded-full px-1.5 py-0.5 shadow-sm">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
              <span className="text-[9px] font-semibold text-green-600">Available</span>
            </div>
          )}
          {worker.verified && (
            <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-[#111111] rounded-full flex items-center justify-center shadow-sm">
              <Check size={10} className="text-white" strokeWidth={3} />
            </div>
          )}
        </div>
        <p className="text-[12px] font-semibold text-[#111111] truncate">{worker.name}</p>
        <p className="text-[10px] text-[#888888] truncate">{worker.specialty}</p>
        <div className="flex items-center gap-0.5 mt-1">
          <Star size={10} className="fill-amber-400 text-amber-400" />
          <span className="text-[11px] font-semibold text-[#111111]">{worker.rating}</span>
          <span className="text-[10px] text-[#AAAAAA]">({worker.reviews})</span>
        </div>
        <p className="text-[10px] text-[#AAAAAA] mt-0.5">{worker.jobs} jobs</p>
      </div>
    </button>
  );
}

function BackHeader({ title, onBack, right }: { title?: string; onBack: () => void; right?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <button onClick={onBack} className="w-9 h-9 flex items-center justify-center rounded-full bg-white border border-[#E8E8E8] shadow-sm">
        <ArrowLeft size={18} strokeWidth={2} />
      </button>
      {title && <h2 className="text-[15px] font-semibold text-[#111111]">{title}</h2>}
      {right || <div className="w-9" />}
    </div>
  );
}

function BottomNav({ screen, navigate, requireAuth, isMobile }: { screen: string; navigate: (s: string) => void; requireAuth: (cb: () => void) => void; isMobile?: boolean }) {
  const active = ["home"].includes(screen) ? "home"
    : ["categories", "all-categories"].includes(screen) ? "categories"
      : ["booking-history", "booking-detail"].includes(screen) ? "bookings"
        : ["profile", "edit-profile", "saved-addresses", "payment-methods", "settings"].includes(screen) ? "profile"
          : "";
  const tabs = [
    { id: "home", Icon: Home, label: "Home", to: "home" },
    { id: "categories", Icon: LayoutGrid, label: "Explore", to: "categories" },
    { id: "bookings", Icon: CalendarDays, label: "Bookings", to: "booking-history", auth: true },
    { id: "profile", Icon: User, label: "Profile", to: "profile", auth: true },
  ];
  return (
    <div className="bg-white border-t border-[#E8E8E8]" style={{ paddingBottom: isMobile ? "calc(8px + env(safe-area-inset-bottom, 0px))" : 0 }}>
      <div className="flex items-center justify-around px-2 pt-2.5 pb-1">
        {tabs.map(({ id, Icon, label, to, auth }) => (
          <button key={id} onClick={() => auth ? requireAuth(() => navigate(to)) : navigate(to)}
            className="flex flex-col items-center gap-0.5 px-4 relative">
            <Icon size={22} className={active === id ? "text-[#111111]" : "text-[#888888]"} strokeWidth={active === id ? 2.2 : 1.8} />
            <span className={`text-[10px] font-semibold ${active === id ? "text-[#111111]" : "text-[#888888]"}`}>{label}</span>
            {active === id && <div className="absolute -bottom-1 w-1 h-1 rounded-full bg-[#111111]" />}
          </button>
        ))}
      </div>
      {!isMobile && (
        <div className="flex justify-center pb-2 pt-1">
          <div className="w-[120px] h-[4px] bg-black/10 rounded-full" />
        </div>
      )}
    </div>
  );
}

// ─── SPLASH ──────────────────────────────────────────────────────────────
function SplashScreen({ ctx }: { ctx: AppCtx }) {
  useEffect(() => {
    const t = setTimeout(() => ctx.navigate("home"), 2500);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#111111]">
      <div className="flex flex-col items-center gap-7 relative">
        {/* Ripple Wave Effect */}
        <div className="relative flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1.7, opacity: [0, 0.4, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
            className="absolute w-[88px] h-[88px] rounded-[28px] border border-white/20 pointer-events-none"
          />
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 2.3, opacity: [0, 0.2, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut", delay: 0.6 }}
            className="absolute w-[88px] h-[88px] rounded-[28px] border border-white/10 pointer-events-none"
          />

          {/* Animated White logo box */}
          <motion.div 
            initial={{ scale: 0, opacity: 0, rotate: -25 }}
            animate={{ scale: [0, 1.15, 1], opacity: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 110, damping: 14, delay: 0.1 }}
            className="relative z-10 w-[88px] h-[88px] bg-white rounded-[28px] flex items-center justify-center shadow-[0_20px_50px_rgba(255,255,255,0.06)]"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 140, damping: 10, delay: 0.45 }}
            >
              <Home size={40} className="text-[#111111]" strokeWidth={1.5} />
            </motion.div>
          </motion.div>
        </div>

        {/* Animated Title & Tagline */}
        <motion.div 
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 70, damping: 14, delay: 0.5 }}
          className="text-center"
        >
          <h1 className="text-[38px] font-bold text-white tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>homigo</h1>
          <motion.p 
            initial={{ opacity: 0, letterSpacing: "0.1em" }}
            animate={{ opacity: 1, letterSpacing: "0.2em" }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="text-[13px] text-white/40 mt-1 uppercase"
          >
            Home Services
          </motion.p>
        </motion.div>
      </div>

      {/* Loading indicator bouncing dots */}
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ delay: 1.2, duration: 0.4 }} 
        className="absolute bottom-16 flex gap-2"
      >
        {[0, 1, 2].map(i => (
          <div key={i} className="w-1.5 h-1.5 bg-white/30 rounded-full animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
        ))}
      </motion.div>
    </div>
  );
}

// ─── ONBOARDING ──────────────────────────────────────────────────────────
const OB_STEPS = [
  { title: "Professional home\nservices, on demand", subtitle: "Browse 500+ services from vetted experts. Quality guaranteed, every time.", image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=640&fit=crop" },
  { title: "AI that diagnoses\nyour home problems", subtitle: "Describe an issue, upload a photo, and get instant AI-powered recommendations.", image: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&h=640&fit=crop" },
  { title: "Trusted professionals,\nverified & trained", subtitle: "Every Homigo professional is background-checked, skill-certified, and rated.", image: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&h=640&fit=crop" },
];

function OnboardingScreen({ ctx }: { ctx: AppCtx }) {
  const [step, setStep] = useState(0);
  const s = OB_STEPS[step];
  return (
    <div className="flex flex-col min-h-full bg-[#FAF8F4]">
      <div className="relative h-[370px] overflow-hidden">
        <motion.img key={step} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} src={s.image} alt="" className="w-full h-full object-cover bg-[#E8E4DC]" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 60%, #FAF8F4 100%)" }} />
        <button onClick={() => ctx.navigate("home")} className="absolute top-4 right-4 px-4 py-1.5 bg-white/85 backdrop-blur-sm rounded-full text-[12px] font-semibold text-[#111111]">Skip</button>
      </div>
      <div className="flex-1 flex flex-col px-6 pt-2 pb-8">
        <motion.div key={step} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="flex-1">
          <h2 className="text-[26px] font-bold text-[#111111] leading-tight whitespace-pre-line" style={{ fontFamily: "'Outfit', sans-serif" }}>{s.title}</h2>
          <p className="text-[14px] text-[#888888] mt-3 leading-relaxed">{s.subtitle}</p>
        </motion.div>
        <div className="flex items-center gap-1.5 mb-7">
          {OB_STEPS.map((_, i) => (
            <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i === step ? "w-7 bg-[#111111]" : "w-1 bg-[#DDDDDD]"}`} />
          ))}
        </div>
        {step < OB_STEPS.length - 1 ? (
          <button onClick={() => setStep(s => s + 1)} className="w-full bg-[#111111] text-white py-4 rounded-2xl text-[15px] font-semibold">Continue</button>
        ) : (
          <div className="flex gap-3">
            <button onClick={() => ctx.navigate("login")} className="flex-1 bg-[#111111] text-white py-4 rounded-2xl text-[15px] font-semibold">Get Started</button>
            <button onClick={() => ctx.navigate("home")} className="flex-1 border-2 border-[#E8E8E8] text-[#111111] py-4 rounded-2xl text-[15px] font-semibold">Browse first</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── LOGIN ───────────────────────────────────────────────────────────────
function LoginScreen({ ctx }: { ctx: AppCtx }) {
  const [phone, setPhone] = useState("");
  const [stage, setStage] = useState<"phone" | "otp">("phone");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const doLogin = () => {
    setLoading(true);
    setTimeout(() => {
      ctx.setIsLoggedIn(true);
      ctx.navigate("home");
    }, 1200);
  };
  const sendOtp = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); setStage("otp"); }, 1000);
  };
  return (
    <div className="min-h-full bg-[#FAF8F4] flex flex-col">
      <BackHeader onBack={ctx.goBack} />
      <div className="flex-1 px-6 pt-4 pb-10">
        <div className="w-14 h-14 bg-[#111111] rounded-2xl flex items-center justify-center mb-6">
          <Home size={26} className="text-white" strokeWidth={1.5} />
        </div>
        <h1 className="text-[28px] font-bold text-[#111111] leading-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
          {stage === "phone" ? "Welcome to\nHomigo" : "Verify your\nnumber"}
        </h1>
        <p className="text-[14px] text-[#888888] mt-2 mb-8">
          {stage === "phone" ? "Sign in to book services, manage bookings and more." : `We sent a 6-digit OTP to +91 ${phone}`}
        </p>
        {stage === "phone" ? (
          <>
            <div className="flex items-center bg-white border border-[#E8E8E8] rounded-xl overflow-hidden mb-4">
              <div className="px-4 py-4 border-r border-[#E8E8E8] text-[14px] font-semibold text-[#555555]">+91</div>
              <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Mobile number" type="tel" maxLength={10} className="flex-1 px-4 py-4 text-[15px] text-[#111111] bg-transparent outline-none" />
            </div>
            <button onClick={sendOtp} disabled={phone.length < 10 || loading} className="w-full bg-[#111111] text-white py-4 rounded-2xl text-[15px] font-semibold disabled:opacity-40 flex items-center justify-center gap-2">
              {loading ? <RefreshCw size={16} className="animate-spin" /> : "Send OTP"}
            </button>
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-[#E8E8E8]" />
              <span className="text-[12px] text-[#AAAAAA]">or</span>
              <div className="flex-1 h-px bg-[#E8E8E8]" />
            </div>
            <button onClick={doLogin} className="w-full border border-[#E8E8E8] bg-white text-[#111111] py-4 rounded-2xl text-[15px] font-semibold flex items-center justify-center gap-3 shadow-sm">
              <span className="text-[18px]">G</span> Continue with Google
            </button>
          </>
        ) : (
          <>
            <div className="flex gap-3 mb-6">
              {[0, 1, 2, 3, 4, 5].map(i => (
                <div key={i} className="flex-1 h-[52px] bg-white border border-[#E8E8E8] rounded-xl flex items-center justify-center text-[22px] font-bold text-[#111111]">
                  {otp[i] || ""}
                </div>
              ))}
            </div>
            <input value={otp} onChange={e => setOtp(e.target.value)} type="tel" maxLength={6} className="sr-only" autoFocus />
            <div className="flex gap-2 mb-6">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"].map((k, i) => (
                <button key={i} onClick={() => { if (k === "⌫") setOtp(o => o.slice(0, -1)); else if (k && otp.length < 6) setOtp(o => o + k); }}
                  className={`flex-1 h-12 rounded-xl text-[16px] font-semibold transition-colors ${k ? "bg-white border border-[#E8E8E8] text-[#111111] active:bg-[#F0EDE8]" : "invisible"}`}>
                  {k}
                </button>
              ))}
            </div>
            <button onClick={doLogin} disabled={otp.length < 6 || loading} className="w-full bg-[#111111] text-white py-4 rounded-2xl text-[15px] font-semibold disabled:opacity-40 flex items-center justify-center gap-2">
              {loading ? <RefreshCw size={16} className="animate-spin" /> : "Verify & Continue"}
            </button>
            <button onClick={() => setStage("phone")} className="w-full mt-3 text-center text-[13px] text-[#888888]">Didn't receive OTP? Resend in 30s</button>
          </>
        )}
        <p className="text-[11px] text-[#AAAAAA] text-center mt-8 leading-relaxed">By continuing, you agree to our Terms of Service and Privacy Policy</p>
      </div>
    </div>
  );
}

// ─── HOME ────────────────────────────────────────────────────────────────
function HomeScreen({ ctx }: { ctx: AppCtx }) {
  const [searchQ, setSearchQ] = useState("");
  const unread = ctx.notifications.filter(n => !n.read).length;
  return (
    <div className="min-h-full bg-[#FAF8F4] pb-4">
      {/* Header */}
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-center justify-between">
          <button className="flex items-center gap-1.5 text-[13px] font-medium text-[#555555]">
            <MapPin size={14} className="text-[#111111]" strokeWidth={2} />
            <span>Mumbai, Maharashtra</span>
            <ChevronDown size={14} className="text-[#888888]" />
          </button>
          <div className="flex gap-2">
            <button onClick={() => ctx.requireAuth(() => ctx.navigate("cart"))} className="relative w-9 h-9 bg-white rounded-full flex items-center justify-center border border-[#E8E8E8] shadow-sm">
              <ShoppingCart size={17} strokeWidth={1.8} />
              {ctx.cart.length > 0 && <div className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#111111] rounded-full flex items-center justify-center"><span className="text-[8px] text-white font-bold">{ctx.cart.length}</span></div>}
            </button>
            <button onClick={() => ctx.navigate("notifications")} className="relative w-9 h-9 bg-white rounded-full flex items-center justify-center border border-[#E8E8E8] shadow-sm">
              <Bell size={17} strokeWidth={1.8} />
              {unread > 0 && <div className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#111111] rounded-full flex items-center justify-center"><span className="text-[8px] text-white font-bold">{unread}</span></div>}
            </button>
          </div>
        </div>
        <div className="mt-4 mb-1">
          <h1 className="text-[24px] font-bold text-[#111111]" style={{ fontFamily: "'Outfit', sans-serif" }}>{ctx.isLoggedIn ? "Good morning, Rahul 👋" : "Welcome to Homigo"}</h1>
          <p className="text-[13px] text-[#888888]">What service do you need today?</p>
        </div>
      </div>
      {/* Search */}
      <div className="px-4 mb-5">
        <button onClick={() => ctx.navigate("search")} className="w-full flex items-center gap-3 bg-white border border-[#E8E8E8] rounded-2xl px-4 py-3.5 shadow-sm">
          <Search size={18} className="text-[#AAAAAA]" />
          <span className="text-[14px] text-[#AAAAAA]">Search for a service…</span>
        </button>
      </div>
      {/* Banner */}
      <div className="px-4 mb-5">
        <div className="relative rounded-2xl overflow-hidden h-[120px] bg-[#111111]">
          <img src="https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=300&fit=crop" alt="" className="absolute inset-0 w-full h-full object-cover opacity-40" />
          <div className="relative z-10 p-5 flex flex-col justify-between h-full">
            <span className="text-[10px] font-bold text-white/60 uppercase tracking-wider">Limited Offer</span>
            <div>
              <p className="text-[18px] font-bold text-white leading-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>₹200 off your<br />first cleaning</p>
              <p className="text-[10px] text-white/50 mt-1">Use code FIRST200</p>
            </div>
          </div>
          <button onClick={() => { ctx.setSelectedCategoryId("cleaning"); ctx.navigate("category-detail"); }} className="absolute right-4 bottom-4 bg-white text-[#111111] text-[11px] font-bold px-3 py-1.5 rounded-full">Book Now</button>
        </div>
      </div>
      {/* Categories */}
      <div className="px-4 mb-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[16px] font-bold text-[#111111]" style={{ fontFamily: "'Outfit', sans-serif" }}>Services</h2>
          <button onClick={() => ctx.navigate("all-categories")} className="text-[12px] font-semibold text-[#555555] flex items-center gap-0.5">All <ChevronRight size={14} /></button>
        </div>
        <div className="grid grid-cols-4 gap-2.5">
          {CATEGORIES.slice(0, 8).map(cat => (
            <button key={cat.id} onClick={() => { ctx.setSelectedCategoryId(cat.id); ctx.navigate("category-detail"); }} className="flex flex-col items-center gap-1.5">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center border border-[#F0EDE8] shadow-sm">
                <cat.Icon size={24} className="text-[#111111]" strokeWidth={1.5} />
              </div>
              <span className="text-[10px] font-medium text-[#555555] text-center leading-tight">{cat.name}</span>
            </button>
          ))}
        </div>
      </div>
      {/* Popular services */}
      <div className="mb-5">
        <div className="flex items-center justify-between px-4 mb-3">
          <h2 className="text-[16px] font-bold text-[#111111]" style={{ fontFamily: "'Outfit', sans-serif" }}>Popular Services</h2>
          <button onClick={() => ctx.navigate("service-listing")} className="text-[12px] font-semibold text-[#555555] flex items-center gap-0.5">All <ChevronRight size={14} /></button>
        </div>
        <div className="flex gap-3 px-4 overflow-x-auto [scrollbar-width:none]">
          {SERVICES.slice(0, 4).map(svc => (
            <SvcCardH key={svc.id} svc={svc} onPress={() => { ctx.setSelectedServiceId(svc.id); ctx.navigate("service-detail"); }} />
          ))}
        </div>
      </div>
      {/* Top professionals */}
      <div className="mb-5">
        <div className="flex items-center justify-between px-4 mb-3">
          <h2 className="text-[16px] font-bold text-[#111111]" style={{ fontFamily: "'Outfit', sans-serif" }}>Top Professionals</h2>
          <button onClick={() => ctx.navigate("worker-recommendation")} className="text-[12px] font-semibold text-[#555555] flex items-center gap-0.5">All <ChevronRight size={14} /></button>
        </div>
        <div className="flex gap-3 px-4 overflow-x-auto [scrollbar-width:none]">
          {WORKERS.map(w => <WorkerCard key={w.id} worker={w} onPress={() => { ctx.setSelectedWorkerId(w.id); ctx.navigate("worker-profile"); }} />)}
        </div>
      </div>
      {/* AI Card */}
      <div className="px-4 mb-5">
        <button onClick={() => ctx.navigate("ai-diagnosis")} className="w-full bg-[#111111] rounded-2xl p-5 text-left">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <Sparkles size={20} className="text-white" />
            </div>
            <div>
              <p className="text-[15px] font-bold text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>AI Home Diagnosis</p>
              <p className="text-[12px] text-white/50 mt-1 leading-relaxed">Describe your issue or upload a photo. Our AI finds the best solution.</p>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-white/70 text-[12px] font-semibold">
            Try AI Diagnosis <ArrowRight size={14} />
          </div>
        </button>
      </div>
      {/* Trust signals */}
      <div className="px-4 mb-2">
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: Star, label: "4.8 Rating", sub: "50K+ reviews" },
            { icon: CheckCircle, label: "Verified", sub: "Background-checked" },
            { icon: Shield, label: "Guaranteed", sub: "100% satisfaction" },
          ].map((t, i) => (
            <div key={i} className="bg-white rounded-xl p-3 text-center border border-[#F0EDE8]">
              <t.icon size={18} className="text-[#111111] mx-auto mb-1" strokeWidth={1.5} />
              <p className="text-[11px] font-bold text-[#111111]">{t.label}</p>
              <p className="text-[9px] text-[#AAAAAA] mt-0.5">{t.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── SEARCH ──────────────────────────────────────────────────────────────
function SearchScreen({ ctx }: { ctx: AppCtx }) {
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { inputRef.current?.focus(); }, []);
  const recent = ["Deep Cleaning", "AC Service", "Plumbing", "Electrician"];
  const trending = SERVICES.slice(0, 3);
  const results = q.length > 0 ? SERVICES.filter(s => s.name.toLowerCase().includes(q.toLowerCase()) || s.provider.toLowerCase().includes(q.toLowerCase()) || s.categoryId.includes(q.toLowerCase())) : [];
  return (
    <div className="min-h-full bg-[#FAF8F4]">
      <div className="px-4 py-3 flex items-center gap-3">
        <button onClick={ctx.goBack} className="w-9 h-9 flex items-center justify-center rounded-full bg-white border border-[#E8E8E8] shadow-sm">
          <ArrowLeft size={18} strokeWidth={2} />
        </button>
        <div className="flex-1 flex items-center gap-2 bg-white border border-[#E8E8E8] rounded-xl px-3 py-2.5">
          <Search size={16} className="text-[#AAAAAA]" />
          <input ref={inputRef} value={q} onChange={e => setQ(e.target.value)} placeholder="Search services, providers…" className="flex-1 text-[14px] text-[#111111] outline-none bg-transparent" />
          {q && <button onClick={() => setQ("")}><X size={15} className="text-[#AAAAAA]" /></button>}
        </div>
      </div>
      <div className="px-4">
        {q.length === 0 ? (
          <>
            <div className="mb-5">
              <h3 className="text-[13px] font-bold text-[#AAAAAA] uppercase tracking-wider mb-3">Recent Searches</h3>
              {recent.map(r => (
                <button key={r} onClick={() => setQ(r)} className="flex items-center gap-3 w-full py-2.5 border-b border-[#F5F3EF]">
                  <Clock size={15} className="text-[#AAAAAA]" />
                  <span className="text-[14px] text-[#333333]">{r}</span>
                </button>
              ))}
            </div>
            <div>
              <h3 className="text-[13px] font-bold text-[#AAAAAA] uppercase tracking-wider mb-3">Trending Now</h3>
              <div className="flex flex-col gap-3">
                {trending.map(svc => (
                  <button key={svc.id} onClick={() => { ctx.setSelectedServiceId(svc.id); ctx.navigate("service-detail"); }} className="flex items-center gap-3 bg-white rounded-xl p-3 border border-[#F0EDE8]">
                    <img src={svc.images[0]} alt="" className="w-12 h-12 rounded-lg object-cover bg-[#F0EDE8]" />
                    <div className="flex-1 text-left">
                      <p className="text-[13px] font-semibold text-[#111111]">{svc.name}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Star size={10} className="fill-amber-400 text-amber-400" />
                        <span className="text-[11px] text-[#888888]">{svc.rating} · {fp(svc.price)}</span>
                      </div>
                    </div>
                    <TrendingUp size={14} className="text-[#AAAAAA]" />
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div>
            <p className="text-[12px] text-[#888888] mb-3">{results.length} result{results.length !== 1 ? "s" : ""} for "{q}"</p>
            {results.length === 0 ? (
              <div className="text-center py-12">
                <Search size={40} className="text-[#E8E8E8] mx-auto mb-3" />
                <p className="text-[15px] font-semibold text-[#333333]">No results found</p>
                <p className="text-[13px] text-[#AAAAAA] mt-1">Try a different search term</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {results.map(svc => (
                  <SvcCard key={svc.id} svc={svc} onPress={() => { ctx.setSelectedServiceId(svc.id); ctx.navigate("service-detail"); }} onWish={() => ctx.requireAuth(() => ctx.toggleWishlist(svc.id))} inWish={ctx.wishlist.has(svc.id)} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────
function NotificationsScreen({ ctx }: { ctx: AppCtx }) {
  useEffect(() => { ctx.markNotifsRead(); }, []);
  const iconMap = { booking: CheckCircle, offer: Gift, reminder: Bell, update: Navigation };
  return (
    <div className="min-h-full bg-[#FAF8F4]">
      <BackHeader title="Notifications" onBack={ctx.goBack} />
      <div className="px-4">
        {ctx.notifications.map((n, i) => {
          const Icon = iconMap[n.type];
          return (
            <div key={n.id} className={`flex gap-3 py-4 ${i < ctx.notifications.length - 1 ? "border-b border-[#F5F3EF]" : ""} ${!n.read ? "opacity-100" : "opacity-60"}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${!n.read ? "bg-[#111111]" : "bg-[#F0EDE8]"}`}>
                <Icon size={18} className={!n.read ? "text-white" : "text-[#888888]"} strokeWidth={1.5} />
              </div>
              <div className="flex-1">
                <p className="text-[13px] font-semibold text-[#111111]">{n.title}</p>
                <p className="text-[12px] text-[#888888] mt-0.5 leading-relaxed">{n.body}</p>
                <p className="text-[10px] text-[#AAAAAA] mt-1.5">{n.time}</p>
              </div>
              {!n.read && <div className="w-2 h-2 bg-[#111111] rounded-full mt-2 flex-shrink-0" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── CATEGORIES ───────────────────────────────────────────────────────────
function CategoriesScreen({ ctx }: { ctx: AppCtx }) {
  return (
    <div className="min-h-full bg-[#FAF8F4] pb-4">
      <div className="px-4 pt-3 pb-4">
        <h1 className="text-[24px] font-bold text-[#111111]" style={{ fontFamily: "'Outfit', sans-serif" }}>Explore</h1>
        <p className="text-[13px] text-[#888888]">All home services, right here</p>
      </div>
      <div className="px-4 grid grid-cols-2 gap-3">
        {CATEGORIES.slice(0, 8).map(cat => (
          <button key={cat.id} onClick={() => { ctx.setSelectedCategoryId(cat.id); ctx.navigate("category-detail"); }}
            className="bg-white rounded-2xl overflow-hidden border border-[#F0EDE8] shadow-sm">
            <img src={cat.image} alt={cat.name} className="w-full h-28 object-cover bg-[#F0EDE8]" />
            <div className="p-3 flex items-center justify-between">
              <div>
                <p className="text-[13px] font-semibold text-[#111111]">{cat.name}</p>
                <p className="text-[11px] text-[#AAAAAA]">{cat.count} services</p>
              </div>
              <cat.Icon size={18} className="text-[#888888]" strokeWidth={1.5} />
            </div>
          </button>
        ))}
      </div>
      <button onClick={() => ctx.navigate("all-categories")} className="mx-4 mt-4 w-[calc(100%-32px)] border border-[#E8E8E8] rounded-2xl py-3.5 text-[14px] font-semibold text-[#555555]">
        See all categories
      </button>
    </div>
  );
}

// ─── ALL CATEGORIES ───────────────────────────────────────────────────────
function AllCategoriesScreen({ ctx }: { ctx: AppCtx }) {
  return (
    <div className="min-h-full bg-[#FAF8F4] pb-4">
      <BackHeader title="All Categories" onBack={ctx.goBack} />
      <div className="px-4 grid grid-cols-3 gap-3">
        {CATEGORIES.map(cat => (
          <button key={cat.id} onClick={() => { ctx.setSelectedCategoryId(cat.id); ctx.navigate("category-detail"); }}
            className="bg-white rounded-2xl p-3 flex flex-col items-center gap-2 border border-[#F0EDE8] shadow-sm">
            <div className="w-12 h-12 bg-[#F5F3EF] rounded-xl flex items-center justify-center">
              <cat.Icon size={22} className="text-[#111111]" strokeWidth={1.5} />
            </div>
            <p className="text-[11px] font-semibold text-[#333333] text-center leading-tight">{cat.name}</p>
            <p className="text-[9px] text-[#AAAAAA]">{cat.count} services</p>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── CATEGORY DETAIL ──────────────────────────────────────────────────────
function CategoryDetailScreen({ ctx }: { ctx: AppCtx }) {
  const cat = getCat(ctx.selectedCategoryId);
  const svcs = ctx.selectedCategoryId ? getSvcsByCategory(ctx.selectedCategoryId) : SERVICES;
  if (!cat) return null;
  return (
    <div className="min-h-full bg-[#FAF8F4]">
      <div className="relative h-[180px]">
        <img src={cat.image} alt={cat.name} className="w-full h-full object-cover bg-[#E8E4DC]" />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 flex flex-col justify-between p-4">
          <button onClick={ctx.goBack} className="w-9 h-9 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
            <ArrowLeft size={18} className="text-white" />
          </button>
          <div>
            <p className="text-white/70 text-[11px] font-semibold uppercase tracking-wider">{cat.count} services available</p>
            <h1 className="text-[26px] font-bold text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>{cat.name}</h1>
          </div>
        </div>
      </div>
      <div className="px-4 pt-4 pb-2 flex gap-2 overflow-x-auto [scrollbar-width:none]">
        {["All", "Top Rated", "Nearby", "Best Value"].map(f => <Pill key={f} active={f === "All"}>{f}</Pill>)}
      </div>
      <div className="px-4 pt-3 pb-4 flex flex-col gap-4">
        {(svcs.length > 0 ? svcs : SERVICES.slice(0, 3)).map(svc => (
          <SvcCard key={svc.id} svc={svc} onPress={() => { ctx.setSelectedServiceId(svc.id); ctx.navigate("service-detail"); }} onWish={() => ctx.requireAuth(() => ctx.toggleWishlist(svc.id))} inWish={ctx.wishlist.has(svc.id)} />
        ))}
      </div>
    </div>
  );
}

// ─── SERVICE LISTING ──────────────────────────────────────────────────────
function ServiceListingScreen({ ctx }: { ctx: AppCtx }) {
  const [showSort, setShowSort] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  return (
    <div className="min-h-full bg-[#FAF8F4]">
      <BackHeader title="All Services" onBack={ctx.goBack} right={
        <button onClick={() => ctx.requireAuth(() => ctx.navigate("wishlist"))} className="w-9 h-9 flex items-center justify-center rounded-full bg-white border border-[#E8E8E8] shadow-sm">
          <Heart size={17} strokeWidth={1.8} className={ctx.wishlist.size > 0 ? "fill-red-500 text-red-500" : ""} />
        </button>
      } />
      <div className="px-4 flex gap-2 mb-4">
        <button onClick={() => setShowSort(true)} className="flex items-center gap-1.5 bg-white border border-[#E8E8E8] rounded-xl px-3 py-2 text-[12px] font-semibold text-[#555555] shadow-sm">
          <SlidersHorizontal size={14} /> Sort
        </button>
        <button onClick={() => setShowFilter(true)} className="flex items-center gap-1.5 bg-white border border-[#E8E8E8] rounded-xl px-3 py-2 text-[12px] font-semibold text-[#555555] shadow-sm">
          <Filter size={14} /> Filter
        </button>
        <div className="flex gap-1.5 overflow-x-auto [scrollbar-width:none]">
          {["Top Rated", "Nearest", "Budget"].map(f => <Pill key={f}>{f}</Pill>)}
        </div>
      </div>
      <div className="px-4 flex flex-col gap-4 pb-4">
        {SERVICES.map(svc => (
          <SvcCard key={svc.id} svc={svc} onPress={() => { ctx.setSelectedServiceId(svc.id); ctx.navigate("service-detail"); }} onWish={() => ctx.requireAuth(() => ctx.toggleWishlist(svc.id))} inWish={ctx.wishlist.has(svc.id)} />
        ))}
      </div>
      {showSort && <SortModal ctx={ctx} onClose={() => setShowSort(false)} />}
      {showFilter && <FilterModal ctx={ctx} onClose={() => setShowFilter(false)} />}
    </div>
  );
}

function SortModal({ ctx, onClose }: { ctx: AppCtx; onClose: () => void }) {
  const opts = [{ id: "popular", label: "Most Popular" }, { id: "rating", label: "Highest Rated" }, { id: "price-low", label: "Price: Low to High" }, { id: "price-high", label: "Price: High to Low" }, { id: "newest", label: "Newest First" }];
  return (
    <div className="fixed inset-0 z-50 flex items-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <motion.div initial={{ y: 300 }} animate={{ y: 0 }} transition={{ type: "spring", damping: 25 }} className="relative bg-white rounded-t-3xl w-full p-6 z-10">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-[17px] font-bold text-[#111111]" style={{ fontFamily: "'Outfit', sans-serif" }}>Sort by</h3>
          <button onClick={onClose}><X size={20} className="text-[#888888]" /></button>
        </div>
        {opts.map(o => (
          <button key={o.id} onClick={() => { ctx.setSortOption(o.id); onClose(); }} className="flex items-center justify-between w-full py-3.5 border-b border-[#F5F3EF]">
            <span className={`text-[14px] ${ctx.sortOption === o.id ? "font-bold text-[#111111]" : "text-[#555555]"}`}>{o.label}</span>
            {ctx.sortOption === o.id && <div className="w-5 h-5 bg-[#111111] rounded-full flex items-center justify-center"><Check size={12} className="text-white" strokeWidth={3} /></div>}
          </button>
        ))}
      </motion.div>
    </div>
  );
}

function FilterModal({ ctx, onClose }: { ctx: AppCtx; onClose: () => void }) {
  const [local, setLocal] = useState(ctx.filterState);
  return (
    <div className="fixed inset-0 z-50 flex items-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <motion.div initial={{ y: 300 }} animate={{ y: 0 }} transition={{ type: "spring", damping: 25 }} className="relative bg-white rounded-t-3xl w-full p-6 z-10">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-[17px] font-bold text-[#111111]" style={{ fontFamily: "'Outfit', sans-serif" }}>Filters</h3>
          <button onClick={onClose}><X size={20} className="text-[#888888]" /></button>
        </div>
        <div className="mb-5">
          <p className="text-[13px] font-semibold text-[#111111] mb-2">Minimum Rating</p>
          <div className="flex gap-2">
            {[0, 3, 3.5, 4, 4.5].map(r => (
              <button key={r} onClick={() => setLocal(s => ({ ...s, rating: r }))} className={`px-3 py-1.5 rounded-full text-[12px] font-semibold border ${local.rating === r ? "bg-[#111111] text-white border-[#111111]" : "bg-white border-[#E8E8E8] text-[#555555]"}`}>
                {r === 0 ? "Any" : `${r}★`}
              </button>
            ))}
          </div>
        </div>
        <div className="mb-5">
          <p className="text-[13px] font-semibold text-[#111111] mb-2">Max Price: {fp(local.priceMax)}</p>
          <input type="range" min={499} max={5000} step={100} value={local.priceMax} onChange={e => setLocal(s => ({ ...s, priceMax: +e.target.value }))} className="w-full accent-[#111111]" />
          <div className="flex justify-between text-[10px] text-[#AAAAAA] mt-1"><span>₹499</span><span>₹5,000</span></div>
        </div>
        <div className="mb-6 flex items-center justify-between">
          <p className="text-[13px] font-semibold text-[#111111]">Verified Professionals Only</p>
          <button onClick={() => setLocal(s => ({ ...s, verified: !s.verified }))} className={`w-12 h-6 rounded-full transition-colors ${local.verified ? "bg-[#111111]" : "bg-[#E8E8E8]"} flex items-center`}>
            <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${local.verified ? "translate-x-6" : "translate-x-0.5"}`} />
          </button>
        </div>
        <div className="flex gap-3">
          <button onClick={() => { setLocal({ rating: 0, verified: false, priceMax: 5000 }); }} className="flex-1 border border-[#E8E8E8] rounded-xl py-3.5 text-[14px] font-semibold text-[#555555]">Reset</button>
          <button onClick={() => { ctx.setFilterState(local); onClose(); }} className="flex-1 bg-[#111111] text-white rounded-xl py-3.5 text-[14px] font-semibold">Apply</button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── SERVICE DETAIL ───────────────────────────────────────────────────────
function ServiceDetailScreen({ ctx }: { ctx: AppCtx }) {
  const svc = getSvc(ctx.selectedServiceId);
  const [imgIdx, setImgIdx] = useState(0);
  const [activePkg, setActivePkg] = useState(svc?.packages[1]?.id || "");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  if (!svc) return null;
  const inWish = ctx.wishlist.has(svc.id);
  const addToCart = () => {
    ctx.requireAuth(() => {
      ctx.setCart(c => [...c.filter(i => i.serviceId !== svc.id), { serviceId: svc.id, packageId: activePkg }]);
      ctx.setSelectedPkgId(activePkg);
      ctx.navigate("cart");
    });
  };
  const pkg = svc.packages.find(p => p.id === activePkg);
  return (
    <div className="min-h-full bg-[#FAF8F4] pb-28">
      {/* Image area */}
      <div className="relative h-[260px] bg-[#F0EDE8]">
        <button onClick={() => { ctx.setGalleryIdx(imgIdx); ctx.navigate("image-gallery"); }}>
          <img src={svc.images[imgIdx]} alt={svc.name} className="w-full h-full object-cover" />
        </button>
        {/* Top controls */}
        <div className="absolute top-3 left-3 right-3 flex justify-between z-10">
          <button onClick={ctx.goBack} className="w-9 h-9 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-sm">
            <ArrowLeft size={18} strokeWidth={2} />
          </button>
          <div className="flex gap-2">
            <button onClick={() => ctx.requireAuth(() => ctx.toggleWishlist(svc.id))} className="w-9 h-9 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-sm">
              <Heart size={17} className={inWish ? "fill-red-500 text-red-500" : "text-[#555555]"} />
            </button>
            <button className="w-9 h-9 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-sm">
              <Share2 size={17} className="text-[#555555]" />
            </button>
          </div>
        </div>
        {/* Dots */}
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
          {svc.images.map((_, i) => (
            <button key={i} onClick={() => setImgIdx(i)} className={`rounded-full transition-all ${i === imgIdx ? "w-5 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/50"}`} />
          ))}
        </div>
      </div>
      {/* Content */}
      <div className="px-4 pt-4">
        {svc.badge && <span className="inline-block px-2.5 py-0.5 bg-[#111111] text-white text-[10px] font-bold rounded-full mb-2 tracking-wide">{svc.badge}</span>}
        <h1 className="text-[22px] font-bold text-[#111111]" style={{ fontFamily: "'Outfit', sans-serif" }}>{svc.name}</h1>
        <p className="text-[13px] text-[#888888] mt-0.5">{svc.provider}</p>
        <div className="flex items-center gap-4 mt-3">
          <div className="flex items-center gap-1.5">
            <Star size={14} className="fill-amber-400 text-amber-400" />
            <span className="text-[14px] font-bold text-[#111111]">{svc.rating}</span>
            <span className="text-[12px] text-[#888888]">({svc.reviews.toLocaleString()} reviews)</span>
          </div>
          <div className="w-px h-4 bg-[#E8E8E8]" />
          <div className="flex items-center gap-1.5">
            <Clock size={13} className="text-[#888888]" />
            <span className="text-[12px] text-[#888888]">{svc.duration}</span>
          </div>
          <div className="w-px h-4 bg-[#E8E8E8]" />
          <div className="flex items-center gap-1 bg-[#E8F5EE] px-2 py-0.5 rounded-full">
            <Check size={11} className="text-green-600" strokeWidth={3} />
            <span className="text-[10px] font-bold text-green-700">Verified</span>
          </div>
        </div>
      </div>
      {/* Description */}
      <div className="px-4 pt-4">
        <h2 className="text-[15px] font-bold text-[#111111] mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>About this service</h2>
        <p className="text-[13px] text-[#666666] leading-relaxed">{svc.description}</p>
      </div>
      {/* Includes */}
      <div className="px-4 pt-4">
        <h2 className="text-[15px] font-bold text-[#111111] mb-3" style={{ fontFamily: "'Outfit', sans-serif" }}>What&apos;s included</h2>
        <div className="bg-white rounded-2xl p-4 border border-[#F0EDE8]">
          {svc.includes.map((item, i) => (
            <div key={i} className={`flex items-start gap-2.5 ${i < svc.includes.length - 1 ? "pb-3 border-b border-[#F5F3EF] mb-3" : ""}`}>
              <div className="w-5 h-5 bg-[#111111] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check size={11} className="text-white" strokeWidth={3} />
              </div>
              <span className="text-[13px] text-[#444444] leading-tight">{item}</span>
            </div>
          ))}
        </div>
      </div>
      {/* Packages */}
      <div className="px-4 pt-4">
        <h2 className="text-[15px] font-bold text-[#111111] mb-3" style={{ fontFamily: "'Outfit', sans-serif" }}>Choose a package</h2>
        <div className="flex flex-col gap-2.5">
          {svc.packages.map(p => (
            <button key={p.id} onClick={() => setActivePkg(p.id)} className={`rounded-2xl p-4 text-left border-2 transition-all ${activePkg === p.id ? "border-[#111111] bg-[#111111]" : "border-[#F0EDE8] bg-white"}`}>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className={`text-[14px] font-bold ${activePkg === p.id ? "text-white" : "text-[#111111]"}`}>{p.name}</span>
                  <span className={`text-[11px] ml-2 ${activePkg === p.id ? "text-white/60" : "text-[#888888]"}`}>{p.duration}</span>
                </div>
                <span className={`text-[16px] font-bold ${activePkg === p.id ? "text-white" : "text-[#111111]"}`}>{fp(p.price)}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {p.features.map(f => (
                  <span key={f} className={`text-[10px] px-2 py-0.5 rounded-full ${activePkg === p.id ? "bg-white/15 text-white/80" : "bg-[#F5F3EF] text-[#666666]"}`}>{f}</span>
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>
      {/* Reviews preview */}
      <div className="px-4 pt-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[15px] font-bold text-[#111111]" style={{ fontFamily: "'Outfit', sans-serif" }}>Reviews</h2>
          <button onClick={() => ctx.navigate("reviews")} className="text-[12px] font-semibold text-[#555555] flex items-center gap-0.5">All <ChevronRight size={14} /></button>
        </div>
        {REVIEWS_DATA.slice(0, 2).map(r => (
          <div key={r.id} className="bg-white rounded-2xl p-4 border border-[#F0EDE8] mb-2.5">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 bg-[#111111] rounded-full flex items-center justify-center">
                <span className="text-[10px] font-bold text-white">{r.avatar}</span>
              </div>
              <div>
                <p className="text-[12px] font-semibold text-[#111111]">{r.name}</p>
                <p className="text-[10px] text-[#AAAAAA]">{r.date}</p>
              </div>
              <div className="ml-auto"><StarRow rating={r.rating} /></div>
            </div>
            <p className="text-[12px] text-[#666666] leading-relaxed">{r.text}</p>
          </div>
        ))}
      </div>
      {/* FAQs preview */}
      <div className="px-4 pt-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[15px] font-bold text-[#111111]" style={{ fontFamily: "'Outfit', sans-serif" }}>FAQs</h2>
          <button onClick={() => ctx.navigate("faqs")} className="text-[12px] font-semibold text-[#555555] flex items-center gap-0.5">All <ChevronRight size={14} /></button>
        </div>
        {FAQS_DATA.slice(0, 2).map((faq, i) => (
          <div key={i} className="bg-white rounded-xl border border-[#F0EDE8] mb-2 overflow-hidden">
            <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between px-4 py-3">
              <span className="text-[13px] font-semibold text-[#111111] text-left pr-2">{faq.q}</span>
              <ChevronDown size={16} className={`text-[#888888] transition-transform flex-shrink-0 ${openFaq === i ? "rotate-180" : ""}`} />
            </button>
            {openFaq === i && <div className="px-4 pb-4"><p className="text-[12px] text-[#666666] leading-relaxed">{faq.a}</p></div>}
          </div>
        ))}
      </div>
      {/* Similar services */}
      <div className="pt-4">
        <div className="flex items-center justify-between px-4 mb-3">
          <h2 className="text-[15px] font-bold text-[#111111]" style={{ fontFamily: "'Outfit', sans-serif" }}>Similar Services</h2>
          <button onClick={() => ctx.navigate("similar-services")} className="text-[12px] font-semibold text-[#555555] flex items-center gap-0.5">All <ChevronRight size={14} /></button>
        </div>
        <div className="flex gap-3 px-4 overflow-x-auto [scrollbar-width:none]">
          {SERVICES.filter(s => s.id !== svc.id).slice(0, 3).map(s => (
            <SvcCardH key={s.id} svc={s} onPress={() => { ctx.setSelectedServiceId(s.id); ctx.navigate("service-detail"); }} />
          ))}
        </div>
      </div>
      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 flex justify-center pointer-events-none">
        <div className="w-[390px] bg-white border-t border-[#E8E8E8] px-4 pt-3 pb-6 pointer-events-auto">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-[11px] text-[#888888]">{pkg?.name} package</p>
              <p className="text-[20px] font-bold text-[#111111]">{fp(pkg?.price || svc.price)}</p>
            </div>
            <button onClick={() => ctx.navigate("packages")} className="text-[12px] font-semibold text-[#555555] border border-[#E8E8E8] px-3 py-1.5 rounded-xl">Change</button>
          </div>
          <div className="flex gap-3">
            <button onClick={() => ctx.requireAuth(() => ctx.toggleWishlist(svc.id))} className="w-12 h-12 border-2 border-[#E8E8E8] rounded-xl flex items-center justify-center flex-shrink-0">
              <Heart size={20} className={inWish ? "fill-red-500 text-red-500" : "text-[#555555]"} />
            </button>
            <button onClick={addToCart} className="flex-1 bg-[#111111] text-white rounded-xl py-3.5 text-[15px] font-semibold">Add to Cart</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── IMAGE GALLERY ────────────────────────────────────────────────────────
function ImageGalleryScreen({ ctx }: { ctx: AppCtx }) {
  const svc = getSvc(ctx.selectedServiceId);
  const [idx, setIdx] = useState(ctx.galleryIdx);
  if (!svc) return null;
  return (
    <div className="min-h-full bg-black flex flex-col">
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <button onClick={ctx.goBack} className="w-9 h-9 flex items-center justify-center rounded-full bg-white/20">
          <ArrowLeft size={18} className="text-white" />
        </button>
        <span className="text-[13px] text-white/70 font-medium">{idx + 1} / {svc.images.length}</span>
        <button className="w-9 h-9 flex items-center justify-center rounded-full bg-white/20">
          <Share2 size={16} className="text-white" />
        </button>
      </div>
      <div className="flex-1 flex items-center justify-center px-4">
        <motion.img key={idx} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.25 }} src={svc.images[idx]} alt="" className="w-full rounded-2xl object-cover" style={{ maxHeight: "500px" }} />
      </div>
      <div className="flex justify-center gap-3 px-4 py-6 overflow-x-auto [scrollbar-width:none]">
        {svc.images.map((img, i) => (
          <button key={i} onClick={() => setIdx(i)} className={`w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${i === idx ? "border-white" : "border-transparent opacity-50"}`}>
            <img src={img} alt="" className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── PACKAGES ────────────────────────────────────────────────────────────
function PackagesScreen({ ctx }: { ctx: AppCtx }) {
  const svc = getSvc(ctx.selectedServiceId);
  if (!svc) return null;
  return (
    <div className="min-h-full bg-[#FAF8F4]">
      <BackHeader title="Choose Package" onBack={ctx.goBack} />
      <div className="px-4 flex flex-col gap-4 pb-32">
        {svc.packages.map(p => {
          const isActive = ctx.selectedPkgId === p.id;
          return (
            <button key={p.id} onClick={() => ctx.setSelectedPkgId(p.id)} className={`rounded-2xl p-5 text-left border-2 transition-all ${isActive ? "border-[#111111] bg-[#111111]" : "border-[#F0EDE8] bg-white"}`}>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className={`text-[18px] font-bold ${isActive ? "text-white" : "text-[#111111]"}`} style={{ fontFamily: "'Outfit', sans-serif" }}>{p.name}</h3>
                  <p className={`text-[12px] mt-0.5 ${isActive ? "text-white/60" : "text-[#888888]"}`}>{p.duration} · {svc.name}</p>
                </div>
                <div className="text-right">
                  <p className={`text-[22px] font-bold ${isActive ? "text-white" : "text-[#111111]"}`}>{fp(p.price)}</p>
                  {isActive && <div className="mt-1 flex justify-end"><div className="w-5 h-5 bg-white rounded-full flex items-center justify-center"><Check size={12} className="text-[#111111]" strokeWidth={3} /></div></div>}
                </div>
              </div>
              {p.features.map(f => (
                <div key={f} className="flex items-center gap-2 mb-1.5">
                  <Check size={13} className={isActive ? "text-white/70" : "text-[#888888]"} strokeWidth={2.5} />
                  <span className={`text-[12px] ${isActive ? "text-white/80" : "text-[#555555]"}`}>{f}</span>
                </div>
              ))}
            </button>
          );
        })}
      </div>
      <div className="fixed bottom-0 left-0 right-0 flex justify-center pointer-events-none">
        <div className="w-[390px] bg-white border-t border-[#E8E8E8] px-4 pt-3 pb-8 pointer-events-auto">
          <button onClick={() => { ctx.requireAuth(() => { ctx.setCart(c => [...c.filter(i => i.serviceId !== svc.id), { serviceId: svc.id, packageId: ctx.selectedPkgId || svc.packages[0].id }]); ctx.navigate("cart"); }); }} className="w-full bg-[#111111] text-white py-4 rounded-2xl text-[15px] font-semibold">Continue with {svc.packages.find(p => p.id === ctx.selectedPkgId)?.name || "Basic"}</button>
        </div>
      </div>
    </div>
  );
}

// ─── FAQs ────────────────────────────────────────────────────────────────
function FAQsScreen({ ctx }: { ctx: AppCtx }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="min-h-full bg-[#FAF8F4]">
      <BackHeader title="FAQs" onBack={ctx.goBack} />
      <div className="px-4 flex flex-col gap-2 pb-8">
        {FAQS_DATA.map((faq, i) => (
          <div key={i} className="bg-white rounded-2xl border border-[#F0EDE8] overflow-hidden">
            <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between px-4 py-4">
              <span className="text-[13px] font-semibold text-[#111111] text-left pr-3">{faq.q}</span>
              <ChevronDown size={16} className={`text-[#888888] flex-shrink-0 transition-transform ${open === i ? "rotate-180" : ""}`} />
            </button>
            {open === i && (
              <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} transition={{ duration: 0.25 }} className="overflow-hidden">
                <div className="px-4 pb-4 border-t border-[#F5F3EF] pt-3">
                  <p className="text-[13px] text-[#666666] leading-relaxed">{faq.a}</p>
                </div>
              </motion.div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── REVIEWS ────────────────────────────────────────────────────────────
function ReviewsScreen({ ctx }: { ctx: AppCtx }) {
  return (
    <div className="min-h-full bg-[#FAF8F4]">
      <BackHeader title="Reviews" onBack={ctx.goBack} />
      <div className="px-4 mb-4">
        <div className="bg-white rounded-2xl p-5 border border-[#F0EDE8]">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-[48px] font-bold text-[#111111]" style={{ fontFamily: "'Outfit', sans-serif" }}>4.8</p>
              <StarRow rating={4.8} size={14} />
              <p className="text-[11px] text-[#888888] mt-1">2,847 reviews</p>
            </div>
            <div className="flex-1">
              {[5, 4, 3, 2, 1].map(r => (
                <div key={r} className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] text-[#888888] w-3">{r}</span>
                  <Star size={10} className="fill-amber-400 text-amber-400" />
                  <div className="flex-1 h-1.5 bg-[#F0EDE8] rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full" style={{ width: r === 5 ? "72%" : r === 4 ? "20%" : r === 3 ? "5%" : r === 2 ? "2%" : "1%" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="px-4 flex flex-col gap-3 pb-8">
        {REVIEWS_DATA.map(r => (
          <div key={r.id} className="bg-white rounded-2xl p-4 border border-[#F0EDE8]">
            <div className="flex items-center gap-2.5 mb-2.5">
              <div className="w-9 h-9 bg-[#111111] rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-[10px] font-bold text-white">{r.avatar}</span>
              </div>
              <div className="flex-1">
                <p className="text-[13px] font-semibold text-[#111111]">{r.name}</p>
                <p className="text-[10px] text-[#AAAAAA]">{r.date}</p>
              </div>
              <StarRow rating={r.rating} size={11} />
            </div>
            <p className="text-[12px] text-[#666666] leading-relaxed">{r.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── SIMILAR SERVICES ────────────────────────────────────────────────────
function SimilarServicesScreen({ ctx }: { ctx: AppCtx }) {
  return (
    <div className="min-h-full bg-[#FAF8F4]">
      <BackHeader title="Similar Services" onBack={ctx.goBack} />
      <div className="px-4 flex flex-col gap-4 pb-8">
        {SERVICES.filter(s => s.id !== ctx.selectedServiceId).map(svc => (
          <SvcCard key={svc.id} svc={svc} onPress={() => { ctx.setSelectedServiceId(svc.id); ctx.navigate("service-detail"); }} onWish={() => ctx.requireAuth(() => ctx.toggleWishlist(svc.id))} inWish={ctx.wishlist.has(svc.id)} />
        ))}
      </div>
    </div>
  );
}

// ─── AI DIAGNOSIS ────────────────────────────────────────────────────────
function AIDiagnosisScreen({ ctx }: { ctx: AppCtx }) {
  const [loading, setLoading] = useState(false);
  const tabs: { id: "text" | "photo" | "video"; Icon: typeof Search; label: string }[] = [
    { id: "text", Icon: FileText, label: "Describe" },
    { id: "photo", Icon: Camera, label: "Photo" },
    { id: "video", Icon: Video, label: "Video" },
  ];
  const submit = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); ctx.navigate("ai-results"); }, 2200);
  };
  return (
    <div className="min-h-full bg-[#FAF8F4]">
      <BackHeader title="AI Diagnosis" onBack={ctx.goBack} />
      <div className="px-4">
        <div className="bg-[#111111] rounded-2xl p-4 mb-5 flex items-center gap-3">
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
            <Sparkles size={20} className="text-white" />
          </div>
          <div>
            <p className="text-[13px] font-bold text-white">Homigo AI</p>
            <p className="text-[11px] text-white/50 leading-snug">Describe your home issue and I'll recommend the right service for you.</p>
          </div>
        </div>
        {/* Tabs */}
        <div className="flex bg-white rounded-2xl p-1 border border-[#F0EDE8] gap-1 mb-5">
          {tabs.map(t => (
            <button key={t.id} onClick={() => ctx.setAiTab(t.id)} className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[12px] font-semibold transition-all ${ctx.aiTab === t.id ? "bg-[#111111] text-white" : "text-[#888888]"}`}>
              <t.Icon size={14} /> {t.label}
            </button>
          ))}
        </div>
        {ctx.aiTab === "text" && (
          <div className="mb-4">
            <textarea value={ctx.aiQuery} onChange={e => ctx.setAiQuery(e.target.value)} placeholder="e.g. My kitchen sink is draining very slowly and there's a strange smell…" className="w-full bg-white border border-[#E8E8E8] rounded-2xl px-4 py-3.5 text-[13px] text-[#111111] placeholder-[#AAAAAA] outline-none resize-none leading-relaxed" rows={5} />
            <div className="flex items-center gap-2 mt-2.5">
              {["Drain issue", "AC not cooling", "Leaking tap", "Roach infestation"].map(s => (
                <button key={s} onClick={() => ctx.setAiQuery(s)} className="px-3 py-1.5 bg-white border border-[#E8E8E8] rounded-full text-[11px] font-semibold text-[#555555] whitespace-nowrap">{s}</button>
              ))}
            </div>
          </div>
        )}
        {ctx.aiTab === "photo" && (
          <div className="mb-4">
            <div className="bg-white border-2 border-dashed border-[#E8E8E8] rounded-2xl h-[200px] flex flex-col items-center justify-center gap-3">
              <div className="w-14 h-14 bg-[#F5F3EF] rounded-2xl flex items-center justify-center">
                <Camera size={26} className="text-[#888888]" strokeWidth={1.5} />
              </div>
              <div className="text-center">
                <p className="text-[13px] font-semibold text-[#333333]">Upload a photo</p>
                <p className="text-[11px] text-[#AAAAAA]">Take or upload a photo of the issue</p>
              </div>
              <div className="flex gap-3">
                <button className="px-4 py-2 bg-[#111111] text-white rounded-xl text-[12px] font-semibold">Take Photo</button>
                <button className="px-4 py-2 border border-[#E8E8E8] text-[#555555] rounded-xl text-[12px] font-semibold">Gallery</button>
              </div>
            </div>
          </div>
        )}
        {ctx.aiTab === "video" && (
          <div className="mb-4">
            <div className="bg-white border-2 border-dashed border-[#E8E8E8] rounded-2xl h-[200px] flex flex-col items-center justify-center gap-3">
              <div className="w-14 h-14 bg-[#F5F3EF] rounded-2xl flex items-center justify-center">
                <Video size={26} className="text-[#888888]" strokeWidth={1.5} />
              </div>
              <div className="text-center">
                <p className="text-[13px] font-semibold text-[#333333]">Record a video</p>
                <p className="text-[11px] text-[#AAAAAA]">A short clip helps AI diagnose better</p>
              </div>
              <button className="px-4 py-2 bg-[#111111] text-white rounded-xl text-[12px] font-semibold flex items-center gap-2">
                <div className="w-2 h-2 bg-red-400 rounded-full" /> Record
              </button>
            </div>
          </div>
        )}
        <button onClick={submit} disabled={ctx.aiTab === "text" && !ctx.aiQuery.trim()} className="w-full bg-[#111111] text-white py-4 rounded-2xl text-[15px] font-semibold disabled:opacity-40 flex items-center justify-center gap-2">
          {loading ? (
            <><RefreshCw size={18} className="animate-spin" /> Analyzing with AI…</>
          ) : (
            <><Sparkles size={18} /> Diagnose my home</>
          )}
        </button>
        <div className="mt-5 bg-[#F5F3EF] rounded-2xl p-4">
          <p className="text-[11px] text-[#888888] leading-relaxed text-center">AI-powered analysis uses machine learning to identify common home issues. Results are suggestions only — always consult a professional for critical repairs.</p>
        </div>
      </div>
    </div>
  );
}

// ─── AI RESULTS ──────────────────────────────────────────────────────────
function AIResultsScreen({ ctx }: { ctx: AppCtx }) {
  return (
    <div className="min-h-full bg-[#FAF8F4]">
      <BackHeader title="AI Analysis" onBack={ctx.goBack} />
      <div className="px-4">
        <div className="bg-[#E8F5EE] rounded-2xl p-4 mb-5 flex items-center gap-3">
          <CheckCircle size={22} className="text-green-600 flex-shrink-0" />
          <div>
            <p className="text-[13px] font-bold text-green-800">Analysis Complete</p>
            <p className="text-[11px] text-green-700 mt-0.5">Found {AI_SUGGESTIONS.length} potential issues</p>
          </div>
        </div>
        <h2 className="text-[17px] font-bold text-[#111111] mb-3" style={{ fontFamily: "'Outfit', sans-serif" }}>AI Recommendations</h2>
        <div className="flex flex-col gap-3 mb-5">
          {AI_SUGGESTIONS.map((s, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 border border-[#F0EDE8]">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <p className="text-[14px] font-bold text-[#111111]">{s.title}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <div className="h-1.5 w-24 bg-[#F0EDE8] rounded-full overflow-hidden">
                      <div className="h-full bg-[#111111] rounded-full" style={{ width: `${s.confidence}%` }} />
                    </div>
                    <span className="text-[10px] font-bold text-[#888888]">{s.confidence}% confidence</span>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${i === 0 ? "bg-red-50 text-red-600" : i === 1 ? "bg-amber-50 text-amber-600" : "bg-blue-50 text-blue-600"}`}>
                  {i === 0 ? "High" : i === 1 ? "Medium" : "Low"}
                </span>
              </div>
              <p className="text-[12px] text-[#666666] leading-relaxed mb-3">{s.description}</p>
              <button onClick={() => { ctx.setSelectedServiceId(s.serviceId); ctx.navigate("service-detail"); }} className="flex items-center gap-1.5 text-[12px] font-bold text-[#111111]">
                View recommended service <ChevronRight size={14} />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-3">
          <button onClick={() => ctx.navigate("cost-estimation")} className="flex-1 border border-[#E8E8E8] bg-white rounded-2xl py-3.5 text-[13px] font-semibold text-[#555555]">Cost Estimate</button>
          <button onClick={() => ctx.navigate("worker-recommendation")} className="flex-1 bg-[#111111] text-white rounded-2xl py-3.5 text-[13px] font-semibold">Find Professionals</button>
        </div>
      </div>
    </div>
  );
}

// ─── COST ESTIMATION ─────────────────────────────────────────────────────
function CostEstimationScreen({ ctx }: { ctx: AppCtx }) {
  const svc = getSvc(ctx.selectedServiceId) || SERVICES[0];
  const pkg = svc.packages[1];
  const labor = Math.round(pkg.price * 0.6);
  const materials = Math.round(pkg.price * 0.25);
  const platformFee = Math.round(pkg.price * 0.05);
  const gst = Math.round(pkg.price * 0.18);
  const total = labor + materials + platformFee + gst;
  return (
    <div className="min-h-full bg-[#FAF8F4]">
      <BackHeader title="Cost Estimate" onBack={ctx.goBack} />
      <div className="px-4">
        <div className="bg-white rounded-2xl border border-[#F0EDE8] overflow-hidden mb-4">
          <div className="p-4 border-b border-[#F5F3EF]">
            <p className="text-[11px] text-[#AAAAAA] font-semibold uppercase tracking-wider">Selected Service</p>
            <p className="text-[15px] font-bold text-[#111111] mt-1">{svc.name}</p>
            <p className="text-[12px] text-[#888888]">{pkg.name} package · {pkg.duration}</p>
          </div>
          {[
            { label: "Labour charges", amount: labor },
            { label: "Materials & supplies", amount: materials },
            { label: "Platform fee", amount: platformFee },
            { label: "GST (18%)", amount: gst },
          ].map(row => (
            <div key={row.label} className="flex justify-between px-4 py-3.5 border-b border-[#F5F3EF]">
              <span className="text-[13px] text-[#555555]">{row.label}</span>
              <span className="text-[13px] font-semibold text-[#111111]">{fp(row.amount)}</span>
            </div>
          ))}
          <div className="flex justify-between px-4 py-4 bg-[#F5F3EF]">
            <span className="text-[15px] font-bold text-[#111111]">Total estimate</span>
            <span className="text-[15px] font-bold text-[#111111]">{fp(total)}</span>
          </div>
        </div>
        <div className="bg-[#FFF5E8] rounded-2xl p-4 mb-5 flex gap-3">
          <AlertCircle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-[12px] text-amber-800 leading-relaxed">Prices are estimates. Final cost may vary based on site inspection and actual materials needed.</p>
        </div>
        <button onClick={() => ctx.navigate("worker-recommendation")} className="w-full bg-[#111111] text-white py-4 rounded-2xl text-[15px] font-semibold">Find Professionals</button>
      </div>
    </div>
  );
}

// ─── WORKER RECOMMENDATION ────────────────────────────────────────────────
function WorkerRecommendationScreen({ ctx }: { ctx: AppCtx }) {
  return (
    <div className="min-h-full bg-[#FAF8F4]">
      <BackHeader title="Professionals" onBack={ctx.goBack} />
      <p className="text-[13px] text-[#888888] px-4 mb-4">Top verified professionals for this service</p>
      <div className="px-4 flex flex-col gap-3 pb-6">
        {WORKERS.map(w => (
          <button key={w.id} onClick={() => { ctx.setSelectedWorkerId(w.id); ctx.navigate("worker-profile"); }} className="bg-white rounded-2xl p-4 border border-[#F0EDE8] shadow-sm text-left">
            <div className="flex items-center gap-3 mb-3">
              <img src={w.image} alt={w.name} className="w-14 h-14 rounded-2xl object-cover bg-[#F0EDE8]" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-[14px] font-bold text-[#111111]">{w.name}</p>
                  {w.verified && <div className="w-4 h-4 bg-[#111111] rounded-full flex items-center justify-center"><Check size={9} className="text-white" strokeWidth={3} /></div>}
                </div>
                <p className="text-[12px] text-[#888888]">{w.specialty}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Star size={11} className="fill-amber-400 text-amber-400" />
                  <span className="text-[12px] font-bold text-[#111111]">{w.rating}</span>
                  <span className="text-[11px] text-[#AAAAAA]">({w.reviews})</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[14px] font-bold text-[#111111]">{fp(w.price)}</p>
                <p className="text-[10px] text-[#AAAAAA]">per visit</p>
                {w.available ? (
                  <span className="text-[9px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full mt-1 inline-block">Available</span>
                ) : (
                  <span className="text-[9px] font-bold text-[#AAAAAA] bg-[#F5F3EF] px-1.5 py-0.5 rounded-full mt-1 inline-block">Booked</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={12} className="text-[#AAAAAA]" />
              <span className="text-[11px] text-[#888888]">{w.experience} exp · {w.jobs} jobs completed</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── WORKER PROFILE ───────────────────────────────────────────────────────
function WorkerProfileScreen({ ctx }: { ctx: AppCtx }) {
  const w = getWorker(ctx.selectedWorkerId);
  if (!w) return null;
  return (
    <div className="min-h-full bg-[#FAF8F4] pb-32">
      <div className="relative h-[220px] bg-[#F0EDE8]">
        <img src={w.image} alt={w.name} className="w-full h-full object-cover object-top" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-[#FAF8F4]" />
        <div className="absolute top-3 left-3 right-3 flex justify-between">
          <button onClick={ctx.goBack} className="w-9 h-9 flex items-center justify-center rounded-full bg-white/90"><ArrowLeft size={18} strokeWidth={2} /></button>
          <button className="w-9 h-9 flex items-center justify-center rounded-full bg-white/90"><Share2 size={16} /></button>
        </div>
      </div>
      <div className="px-4 -mt-2">
        <div className="flex items-end justify-between mb-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-[22px] font-bold text-[#111111]" style={{ fontFamily: "'Outfit', sans-serif" }}>{w.name}</h1>
              {w.verified && <div className="w-5 h-5 bg-[#111111] rounded-full flex items-center justify-center"><Check size={11} className="text-white" strokeWidth={3} /></div>}
            </div>
            <p className="text-[13px] text-[#888888]">{w.specialty}</p>
          </div>
          <div className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${w.available ? "bg-[#E8F5EE] text-green-700" : "bg-[#F5F3EF] text-[#888888]"}`}>
            {w.available ? "Available Today" : "Booked Today"}
          </div>
        </div>
        {/* Stats */}
        <div className="grid grid-cols-3 gap-2.5 mb-4">
          {[
            { label: "Rating", value: w.rating.toString() },
            { label: "Reviews", value: w.reviews.toLocaleString() },
            { label: "Jobs", value: w.jobs.toLocaleString() },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl p-3 text-center border border-[#F0EDE8]">
              <p className="text-[18px] font-bold text-[#111111]" style={{ fontFamily: "'Outfit', sans-serif" }}>{s.value}</p>
              <p className="text-[10px] text-[#AAAAAA]">{s.label}</p>
            </div>
          ))}
        </div>
        {/* Bio */}
        <div className="bg-white rounded-2xl p-4 border border-[#F0EDE8] mb-3">
          <h3 className="text-[13px] font-bold text-[#111111] mb-2">About</h3>
          <p className="text-[12px] text-[#666666] leading-relaxed">{w.bio}</p>
        </div>
        {/* Skills */}
        <div className="bg-white rounded-2xl p-4 border border-[#F0EDE8] mb-3">
          <h3 className="text-[13px] font-bold text-[#111111] mb-2.5">Skills</h3>
          <div className="flex flex-wrap gap-2">
            {w.skills.map(s => <span key={s} className="px-3 py-1.5 bg-[#F5F3EF] rounded-full text-[11px] font-semibold text-[#555555]">{s}</span>)}
          </div>
        </div>
        {/* Reviews */}
        <h3 className="text-[15px] font-bold text-[#111111] mb-3" style={{ fontFamily: "'Outfit', sans-serif" }}>Reviews</h3>
        {REVIEWS_DATA.slice(0, 2).map(r => (
          <div key={r.id} className="bg-white rounded-2xl p-4 border border-[#F0EDE8] mb-2.5">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 bg-[#111111] rounded-full flex items-center justify-center"><span className="text-[10px] font-bold text-white">{r.avatar}</span></div>
              <div>
                <p className="text-[12px] font-semibold text-[#111111]">{r.name}</p>
                <p className="text-[10px] text-[#AAAAAA]">{r.date}</p>
              </div>
              <StarRow rating={r.rating} size={11} />
            </div>
            <p className="text-[12px] text-[#666666] leading-relaxed">{r.text}</p>
          </div>
        ))}
      </div>
      <div className="fixed bottom-0 left-0 right-0 flex justify-center pointer-events-none">
        <div className="w-[390px] bg-white border-t border-[#E8E8E8] px-4 pt-3 pb-8 pointer-events-auto">
          <div className="flex gap-3">
            <button onClick={() => ctx.requireAuth(() => ctx.navigate("chat"))} className="w-12 h-12 border border-[#E8E8E8] rounded-xl flex items-center justify-center flex-shrink-0">
              <MessageCircle size={20} className="text-[#555555]" />
            </button>
            <button onClick={() => ctx.requireAuth(() => { ctx.setSelectedPkgId(null); ctx.navigate("packages"); })} className="flex-1 bg-[#111111] text-white rounded-xl py-3.5 text-[15px] font-semibold">Book {w.name}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── WISHLIST ────────────────────────────────────────────────────────────
function WishlistScreen({ ctx }: { ctx: AppCtx }) {
  const items = SERVICES.filter(s => ctx.wishlist.has(s.id));
  return (
    <div className="min-h-full bg-[#FAF8F4]">
      <BackHeader title="Wishlist" onBack={ctx.goBack} />
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center pt-20 px-8 text-center">
          <div className="w-20 h-20 bg-[#F0EDE8] rounded-full flex items-center justify-center mb-4">
            <Heart size={32} className="text-[#CCCCCC]" strokeWidth={1.5} />
          </div>
          <p className="text-[18px] font-bold text-[#111111]" style={{ fontFamily: "'Outfit', sans-serif" }}>Your wishlist is empty</p>
          <p className="text-[13px] text-[#888888] mt-2">Save services you love by tapping the heart icon.</p>
          <button onClick={() => ctx.navigate("home")} className="mt-6 bg-[#111111] text-white px-6 py-3 rounded-xl text-[14px] font-semibold">Explore Services</button>
        </div>
      ) : (
        <div className="px-4 grid grid-cols-1 gap-4 pb-8">
          {items.map(svc => (
            <SvcCard key={svc.id} svc={svc} onPress={() => { ctx.setSelectedServiceId(svc.id); ctx.navigate("service-detail"); }} onWish={() => ctx.toggleWishlist(svc.id)} inWish />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── CART ────────────────────────────────────────────────────────────────
function CartScreen({ ctx }: { ctx: AppCtx }) {
  const subtotal = ctx.cart.reduce((sum, item) => {
    const svc = getSvc(item.serviceId);
    const pkg = svc?.packages.find(p => p.id === item.packageId) || svc?.packages[0];
    return sum + (pkg?.price || 0);
  }, 0);
  const discount = ctx.appliedCoupon?.discount || 0;
  const total = subtotal - discount;
  return (
    <div className="min-h-full bg-[#FAF8F4]">
      <BackHeader title={`Cart (${ctx.cart.length})`} onBack={ctx.goBack} />
      {ctx.cart.length === 0 ? (
        <div className="flex flex-col items-center justify-center pt-20 text-center px-8">
          <div className="w-20 h-20 bg-[#F0EDE8] rounded-full flex items-center justify-center mb-4">
            <ShoppingCart size={32} className="text-[#CCCCCC]" strokeWidth={1.5} />
          </div>
          <p className="text-[18px] font-bold text-[#111111]" style={{ fontFamily: "'Outfit', sans-serif" }}>Your cart is empty</p>
          <p className="text-[13px] text-[#888888] mt-2">Add services to get started.</p>
          <button onClick={() => ctx.navigate("home")} className="mt-6 bg-[#111111] text-white px-6 py-3 rounded-xl text-[14px] font-semibold">Browse Services</button>
        </div>
      ) : (
        <div className="pb-32">
          <div className="px-4 flex flex-col gap-3 mb-4">
            {ctx.cart.map(item => {
              const svc = getSvc(item.serviceId);
              const pkg = svc?.packages.find(p => p.id === item.packageId) || svc?.packages[0];
              if (!svc || !pkg) return null;
              return (
                <div key={item.serviceId} className="bg-white rounded-2xl p-4 border border-[#F0EDE8] flex gap-3">
                  <img src={svc.images[0]} alt={svc.name} className="w-16 h-16 rounded-xl object-cover bg-[#F0EDE8]" />
                  <div className="flex-1">
                    <p className="text-[13px] font-semibold text-[#111111]">{svc.name}</p>
                    <p className="text-[11px] text-[#888888]">{pkg.name} package · {pkg.duration}</p>
                    <p className="text-[14px] font-bold text-[#111111] mt-1.5">{fp(pkg.price)}</p>
                  </div>
                  <button onClick={() => ctx.setCart(c => c.filter(i => i.serviceId !== item.serviceId))} className="w-7 h-7 flex items-center justify-center">
                    <X size={16} className="text-[#AAAAAA]" />
                  </button>
                </div>
              );
            })}
          </div>
          {/* Coupon */}
          <div className="px-4 mb-4">
            <button onClick={() => ctx.navigate("coupons")} className="w-full flex items-center gap-3 bg-white border border-dashed border-[#CCCCCC] rounded-2xl px-4 py-3.5">
              <Tag size={17} className={ctx.appliedCoupon ? "text-green-600" : "text-[#AAAAAA]"} />
              <span className={`flex-1 text-[13px] font-semibold ${ctx.appliedCoupon ? "text-green-700" : "text-[#AAAAAA]"}`}>
                {ctx.appliedCoupon ? `${ctx.appliedCoupon.code} — ₹${ctx.appliedCoupon.discount} off` : "Apply coupon or promo code"}
              </span>
              <ChevronRight size={16} className="text-[#AAAAAA]" />
            </button>
          </div>
          {/* Summary */}
          <div className="px-4 mb-4">
            <div className="bg-white rounded-2xl border border-[#F0EDE8] overflow-hidden">
              <div className="px-4 py-3.5 flex justify-between border-b border-[#F5F3EF]">
                <span className="text-[13px] text-[#555555]">Subtotal</span>
                <span className="text-[13px] font-semibold text-[#111111]">{fp(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="px-4 py-3.5 flex justify-between border-b border-[#F5F3EF]">
                  <span className="text-[13px] text-green-700">Coupon discount</span>
                  <span className="text-[13px] font-semibold text-green-700">- {fp(discount)}</span>
                </div>
              )}
              <div className="px-4 py-4 flex justify-between bg-[#F5F3EF]">
                <span className="text-[15px] font-bold text-[#111111]">Total</span>
                <span className="text-[15px] font-bold text-[#111111]">{fp(total)}</span>
              </div>
            </div>
          </div>
          <div className="fixed bottom-0 left-0 right-0 flex justify-center pointer-events-none">
            <div className="w-[390px] bg-white border-t border-[#E8E8E8] px-4 pt-3 pb-8 pointer-events-auto">
              <button onClick={() => ctx.navigate("address")} className="w-full bg-[#111111] text-white py-4 rounded-2xl text-[15px] font-semibold">Proceed to Checkout</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ADDRESS SELECTION ────────────────────────────────────────────────────
function AddressScreen({ ctx }: { ctx: AppCtx }) {
  return (
    <div className="min-h-full bg-[#FAF8F4]">
      <BackHeader title="Select Address" onBack={ctx.goBack} />
      <div className="px-4">
        <div className="flex flex-col gap-3 mb-4">
          {ctx.addresses.map(addr => (
            <button key={addr.id} onClick={() => ctx.setSelectedAddressId(addr.id)} className={`bg-white rounded-2xl p-4 border-2 text-left transition-all ${ctx.selectedAddressId === addr.id ? "border-[#111111]" : "border-[#F0EDE8]"}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${ctx.selectedAddressId === addr.id ? "bg-[#111111]" : "bg-[#F0EDE8]"}`}>
                    <MapPin size={13} className={ctx.selectedAddressId === addr.id ? "text-white" : "text-[#888888]"} />
                  </div>
                  <span className="text-[12px] font-bold text-[#111111]">{addr.label}</span>
                  {addr.isDefault && <span className="text-[9px] bg-[#F0EDE8] text-[#888888] px-1.5 py-0.5 rounded-full font-semibold">Default</span>}
                </div>
                {ctx.selectedAddressId === addr.id && <div className="w-5 h-5 bg-[#111111] rounded-full flex items-center justify-center flex-shrink-0"><Check size={11} className="text-white" strokeWidth={3} /></div>}
              </div>
              <p className="text-[12px] text-[#555555]">{addr.line1}</p>
              <p className="text-[12px] text-[#888888]">{addr.line2}, {addr.city} {addr.pincode}</p>
            </button>
          ))}
        </div>
        <button onClick={() => { ctx.setEditingAddressId(null); ctx.navigate("add-edit-address"); }} className="w-full flex items-center gap-3 border-2 border-dashed border-[#CCCCCC] rounded-2xl px-4 py-3.5 mb-6">
          <div className="w-7 h-7 bg-[#F0EDE8] rounded-lg flex items-center justify-center"><Plus size={14} className="text-[#555555]" /></div>
          <span className="text-[13px] font-semibold text-[#555555]">Add new address</span>
        </button>
        <button onClick={() => ctx.navigate("schedule")} className="w-full bg-[#111111] text-white py-4 rounded-2xl text-[15px] font-semibold">Continue</button>
      </div>
    </div>
  );
}

// ─── ADD / EDIT ADDRESS ───────────────────────────────────────────────────
function AddEditAddressScreen({ ctx }: { ctx: AppCtx }) {
  const editing = ctx.addresses.find(a => a.id === ctx.editingAddressId);
  const [form, setForm] = useState({ label: editing?.label || "Home", line1: editing?.line1 || "", line2: editing?.line2 || "", city: editing?.city || "Mumbai", pincode: editing?.pincode || "" });
  const save = () => {
    if (editing) {
      ctx.setAddresses(a => a.map(addr => addr.id === editing.id ? { ...addr, ...form } : addr));
    } else {
      ctx.setAddresses(a => [...a, { id: `a${Date.now()}`, ...form, isDefault: false }]);
    }
    ctx.goBack();
  };
  return (
    <div className="min-h-full bg-[#FAF8F4]">
      <BackHeader title={editing ? "Edit Address" : "Add Address"} onBack={ctx.goBack} />
      <div className="px-4">
        <div className="flex gap-2 mb-5">
          {["Home", "Office", "Other"].map(l => (
            <button key={l} onClick={() => setForm(f => ({ ...f, label: l }))} className={`flex-1 py-2.5 rounded-xl text-[13px] font-semibold border ${form.label === l ? "bg-[#111111] text-white border-[#111111]" : "bg-white border-[#E8E8E8] text-[#555555]"}`}>{l}</button>
          ))}
        </div>
        {["line1", "line2", "city", "pincode"].map(field => (
          <div key={field} className="mb-3">
            <label className="text-[11px] font-bold text-[#888888] uppercase tracking-wider mb-1.5 block">{field === "line1" ? "Flat/House No., Building" : field === "line2" ? "Street, Area, Landmark" : field === "city" ? "City" : "Pincode"}</label>
            <input value={(form as Record<string, string>)[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))} className="w-full bg-white border border-[#E8E8E8] rounded-xl px-4 py-3.5 text-[14px] text-[#111111] outline-none" type={field === "pincode" ? "tel" : "text"} maxLength={field === "pincode" ? 6 : undefined} />
          </div>
        ))}
        <button onClick={save} className="w-full bg-[#111111] text-white py-4 rounded-2xl text-[15px] font-semibold mt-4">Save Address</button>
      </div>
    </div>
  );
}

// ─── SCHEDULE ────────────────────────────────────────────────────────────
function ScheduleScreen({ ctx }: { ctx: AppCtx }) {
  const today = new Date();
  const days = Array.from({ length: 10 }, (_, i) => {
    const d = new Date(today); d.setDate(today.getDate() + i);
    const day = d.toLocaleDateString("en-US", { weekday: "short" });
    const date = d.getDate().toString();
    const full = d.toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short" });
    return { day, date, full, isToday: i === 0 };
  });
  return (
    <div className="min-h-full bg-[#FAF8F4]">
      <BackHeader title="Schedule Service" onBack={ctx.goBack} />
      <div className="px-4">
        <h2 className="text-[15px] font-bold text-[#111111] mb-3" style={{ fontFamily: "'Outfit', sans-serif" }}>Choose a date</h2>
        <div className="flex gap-2 overflow-x-auto [scrollbar-width:none] pb-1 mb-5">
          {days.map(d => (
            <button key={d.full} onClick={() => ctx.setSelectedDate(d.full)} className={`flex-shrink-0 flex flex-col items-center gap-1 px-3.5 py-3 rounded-2xl border-2 transition-all ${ctx.selectedDate === d.full ? "border-[#111111] bg-[#111111]" : "border-[#F0EDE8] bg-white"}`}>
              <span className={`text-[10px] font-semibold ${ctx.selectedDate === d.full ? "text-white/60" : "text-[#888888]"}`}>{d.isToday ? "Today" : d.day}</span>
              <span className={`text-[20px] font-bold ${ctx.selectedDate === d.full ? "text-white" : "text-[#111111]"}`} style={{ fontFamily: "'Outfit', sans-serif" }}>{d.date}</span>
            </button>
          ))}
        </div>
        <h2 className="text-[15px] font-bold text-[#111111] mb-3" style={{ fontFamily: "'Outfit', sans-serif" }}>Choose a time</h2>
        <div className="grid grid-cols-3 gap-2.5 mb-6">
          {TIME_SLOTS.map(t => (
            <button key={t} onClick={() => ctx.setSelectedTime(t)} className={`py-3 rounded-xl text-[13px] font-semibold border-2 transition-all ${ctx.selectedTime === t ? "bg-[#111111] text-white border-[#111111]" : "bg-white border-[#F0EDE8] text-[#555555]"}`}>{t}</button>
          ))}
        </div>
        <div className="bg-[#F5F3EF] rounded-2xl p-4 mb-6 flex gap-3">
          <Info size={16} className="text-[#888888] flex-shrink-0 mt-0.5" />
          <p className="text-[12px] text-[#888888] leading-relaxed">Professional will arrive within 30 minutes of selected time. You will receive a confirmation call before arrival.</p>
        </div>
        <button onClick={() => ctx.navigate("checkout")} disabled={!ctx.selectedDate || !ctx.selectedTime} className="w-full bg-[#111111] text-white py-4 rounded-2xl text-[15px] font-semibold disabled:opacity-40">Confirm Schedule</button>
      </div>
    </div>
  );
}

// ─── CHECKOUT ────────────────────────────────────────────────────────────
function CheckoutScreen({ ctx }: { ctx: AppCtx }) {
  const addr = ctx.addresses.find(a => a.id === ctx.selectedAddressId);
  const subtotal = ctx.cart.reduce((sum, item) => {
    const svc = getSvc(item.serviceId);
    const pkg = svc?.packages.find(p => p.id === item.packageId) || svc?.packages[0];
    return sum + (pkg?.price || 0);
  }, 0);
  const discount = ctx.appliedCoupon?.discount || 0;
  const platformFee = 49;
  const total = subtotal - discount + platformFee;
  return (
    <div className="min-h-full bg-[#FAF8F4] pb-32">
      <BackHeader title="Checkout" onBack={ctx.goBack} />
      <div className="px-4 flex flex-col gap-4">
        {/* Services */}
        <div className="bg-white rounded-2xl p-4 border border-[#F0EDE8]">
          <h3 className="text-[13px] font-bold text-[#111111] mb-3">Services ({ctx.cart.length})</h3>
          {ctx.cart.map(item => {
            const svc = getSvc(item.serviceId);
            const pkg = svc?.packages.find(p => p.id === item.packageId) || svc?.packages[0];
            if (!svc || !pkg) return null;
            return (
              <div key={item.serviceId} className="flex items-center gap-2.5 mb-2 last:mb-0">
                <img src={svc.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover bg-[#F0EDE8]" />
                <div className="flex-1">
                  <p className="text-[12px] font-semibold text-[#111111]">{svc.name}</p>
                  <p className="text-[10px] text-[#AAAAAA]">{pkg.name}</p>
                </div>
                <p className="text-[13px] font-bold text-[#111111]">{fp(pkg.price)}</p>
              </div>
            );
          })}
        </div>
        {/* Address */}
        <div className="bg-white rounded-2xl p-4 border border-[#F0EDE8]">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-[13px] font-bold text-[#111111] mb-1">Service Address</h3>
              {addr ? (
                <div>
                  <p className="text-[12px] font-semibold text-[#555555]">{addr.label}</p>
                  <p className="text-[11px] text-[#888888]">{addr.line1}, {addr.line2}</p>
                  <p className="text-[11px] text-[#888888]">{addr.city} - {addr.pincode}</p>
                </div>
              ) : <p className="text-[12px] text-[#888888]">No address selected</p>}
            </div>
            <button onClick={() => ctx.navigate("address")} className="text-[11px] font-bold text-[#111111] bg-[#F5F3EF] px-2.5 py-1.5 rounded-lg">Change</button>
          </div>
        </div>
        {/* Schedule */}
        <div className="bg-white rounded-2xl p-4 border border-[#F0EDE8]">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-[13px] font-bold text-[#111111] mb-1">Schedule</h3>
              {ctx.selectedDate && ctx.selectedTime ? (
                <div className="flex items-center gap-2">
                  <Calendar size={13} className="text-[#888888]" />
                  <p className="text-[12px] text-[#555555]">{ctx.selectedDate} at {ctx.selectedTime}</p>
                </div>
              ) : <p className="text-[12px] text-[#888888]">Not selected</p>}
            </div>
            <button onClick={() => ctx.navigate("schedule")} className="text-[11px] font-bold text-[#111111] bg-[#F5F3EF] px-2.5 py-1.5 rounded-lg">Change</button>
          </div>
        </div>
        {/* Payment method */}
        <div className="bg-white rounded-2xl p-4 border border-[#F0EDE8]">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-[13px] font-bold text-[#111111] mb-1">Payment</h3>
              {ctx.payMethods.find(p => p.id === ctx.selectedPayId) ? (
                <p className="text-[12px] text-[#555555]">{ctx.payMethods.find(p => p.id === ctx.selectedPayId)?.label}</p>
              ) : null}
            </div>
            <button onClick={() => ctx.navigate("payment")} className="text-[11px] font-bold text-[#111111] bg-[#F5F3EF] px-2.5 py-1.5 rounded-lg">Change</button>
          </div>
        </div>
        {/* Price summary */}
        <div className="bg-white rounded-2xl border border-[#F0EDE8] overflow-hidden">
          {[
            { label: "Subtotal", val: fp(subtotal) },
            ...(discount ? [{ label: "Coupon discount", val: `- ${fp(discount)}`, green: true }] : []),
            { label: "Platform fee", val: fp(platformFee) },
          ].map(row => (
            <div key={row.label} className={`flex justify-between px-4 py-3.5 border-b border-[#F5F3EF]`}>
              <span className={`text-[13px] ${(row as { green?: boolean }).green ? "text-green-700" : "text-[#555555]"}`}>{row.label}</span>
              <span className={`text-[13px] font-semibold ${(row as { green?: boolean }).green ? "text-green-700" : "text-[#111111]"}`}>{row.val}</span>
            </div>
          ))}
          <div className="flex justify-between px-4 py-4 bg-[#F5F3EF]">
            <span className="text-[15px] font-bold text-[#111111]">Total</span>
            <span className="text-[15px] font-bold text-[#111111]">{fp(total)}</span>
          </div>
        </div>
      </div>
      <div className="fixed bottom-0 left-0 right-0 flex justify-center pointer-events-none">
        <div className="w-[390px] bg-white border-t border-[#E8E8E8] px-4 pt-3 pb-8 pointer-events-auto">
          <button onClick={() => ctx.navigate("booking-success")} className="w-full bg-[#111111] text-white py-4 rounded-2xl text-[15px] font-semibold flex items-center justify-center gap-2">
            <Shield size={18} /> Place Order · {fp(total)}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── COUPONS ─────────────────────────────────────────────────────────────
function CouponsScreen({ ctx }: { ctx: AppCtx }) {
  const [code, setCode] = useState("");
  return (
    <div className="min-h-full bg-[#FAF8F4]">
      <BackHeader title="Coupons & Offers" onBack={ctx.goBack} />
      <div className="px-4">
        <div className="flex gap-2 mb-5">
          <input value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="Enter promo code" className="flex-1 bg-white border border-[#E8E8E8] rounded-xl px-4 py-3.5 text-[14px] text-[#111111] outline-none uppercase tracking-widest" />
          <button onClick={() => { const c = COUPONS.find(cp => cp.code === code && cp.valid); if (c) { ctx.setAppliedCoupon({ code: c.code, discount: c.type === "flat" ? c.discount : Math.min(c.discount * 10, (c as typeof c & { maxDiscount?: number }).maxDiscount || 9999) }); ctx.goBack(); } }} className="px-4 bg-[#111111] text-white rounded-xl text-[13px] font-bold">Apply</button>
        </div>
        <h3 className="text-[13px] font-bold text-[#AAAAAA] uppercase tracking-wider mb-3">Available Offers</h3>
        <div className="flex flex-col gap-3">
          {COUPONS.map(c => (
            <div key={c.code} className={`bg-white rounded-2xl border ${c.valid ? "border-[#F0EDE8]" : "border-[#F5F3EF] opacity-50"} p-4`}>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-[#F5F3EF] rounded-lg flex items-center justify-center">
                    <Percent size={14} className="text-[#888888]" />
                  </div>
                  <span className="text-[15px] font-bold text-[#111111] tracking-widest">{c.code}</span>
                </div>
                {c.valid && (
                  <button onClick={() => { ctx.setAppliedCoupon({ code: c.code, discount: c.type === "flat" ? c.discount : 300 }); ctx.goBack(); }} className="text-[12px] font-bold text-[#111111] bg-[#F0EDE8] px-3 py-1.5 rounded-xl">Apply</button>
                )}
              </div>
              <p className="text-[12px] text-[#666666]">{c.description}</p>
              <p className="text-[10px] text-[#AAAAAA] mt-1">Min. order {fp(c.minOrder)}{!c.valid ? " · Expired" : ""}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── PAYMENT ─────────────────────────────────────────────────────────────
function PaymentScreen({ ctx }: { ctx: AppCtx }) {
  const icons: Record<string, typeof CreditCard> = { upi: Zap, card: CreditCard, wallet: Package, netbanking: Shield };
  return (
    <div className="min-h-full bg-[#FAF8F4]">
      <BackHeader title="Payment Method" onBack={ctx.goBack} />
      <div className="px-4">
        <div className="flex flex-col gap-3 mb-5">
          {ctx.payMethods.map(pm => {
            const Icon = icons[pm.type] || CreditCard;
            return (
              <button key={pm.id} onClick={() => ctx.setSelectedPayId(pm.id)} className={`bg-white rounded-2xl p-4 border-2 text-left transition-all ${ctx.selectedPayId === pm.id ? "border-[#111111]" : "border-[#F0EDE8]"}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${ctx.selectedPayId === pm.id ? "bg-[#111111]" : "bg-[#F0EDE8]"}`}>
                    <Icon size={18} className={ctx.selectedPayId === pm.id ? "text-white" : "text-[#888888]"} strokeWidth={1.5} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[13px] font-semibold text-[#111111]">{pm.label}</p>
                    <p className="text-[11px] text-[#888888]">{pm.detail}</p>
                  </div>
                  {ctx.selectedPayId === pm.id && <div className="w-5 h-5 bg-[#111111] rounded-full flex items-center justify-center"><Check size={11} className="text-white" strokeWidth={3} /></div>}
                </div>
              </button>
            );
          })}
        </div>
        <button className="w-full flex items-center gap-3 border-2 border-dashed border-[#CCCCCC] rounded-2xl px-4 py-3.5 mb-6">
          <div className="w-7 h-7 bg-[#F0EDE8] rounded-lg flex items-center justify-center"><Plus size={14} className="text-[#555555]" /></div>
          <span className="text-[13px] font-semibold text-[#555555]">Add payment method</span>
        </button>
        <div className="bg-[#F5F3EF] rounded-2xl p-4 flex gap-3">
          <Lock size={16} className="text-[#888888] flex-shrink-0 mt-0.5" />
          <p className="text-[11px] text-[#888888] leading-relaxed">Your payment information is encrypted and processed securely. We never store your card details.</p>
        </div>
      </div>
    </div>
  );
}

// Helper icon used in PaymentScreen (inline since it's referenced)
function Lock({ size, className }: { size?: number; className?: string }) {
  return <Shield size={size} className={className} strokeWidth={1.5} />;
}

// ─── BOOKING SUCCESS ──────────────────────────────────────────────────────
function BookingSuccessScreen({ ctx }: { ctx: AppCtx }) {
  const bookingId = "HMG" + Math.floor(100000 + Math.random() * 900000);
  const svc = getSvc(ctx.cart[0]?.serviceId) || SERVICES[0];
  useEffect(() => {
    ctx.setCart([]);
  }, []);
  return (
    <div className="min-h-full bg-[#FAF8F4] flex flex-col items-center pt-12 pb-8 px-6">
      <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", damping: 15 }} className="w-24 h-24 bg-[#111111] rounded-full flex items-center justify-center mb-6">
        <Check size={44} className="text-white" strokeWidth={2.5} />
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-center mb-8">
        <h1 className="text-[28px] font-bold text-[#111111]" style={{ fontFamily: "'Outfit', sans-serif" }}>Booking Confirmed!</h1>
        <p className="text-[14px] text-[#888888] mt-2 leading-relaxed">Your service has been booked. We'll send a confirmation to your phone.</p>
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="w-full bg-white rounded-2xl border border-[#F0EDE8] p-5 mb-6">
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-[#F5F3EF]">
          <div>
            <p className="text-[11px] text-[#AAAAAA] font-semibold uppercase tracking-wider mb-1">Booking ID</p>
            <p className="text-[16px] font-bold text-[#111111]" style={{ fontFamily: "'Outfit', sans-serif" }}>{bookingId}</p>
          </div>
          <div className="px-3 py-1.5 bg-[#E8F5EE] rounded-full">
            <span className="text-[11px] font-bold text-green-700">Confirmed</span>
          </div>
        </div>
        {[
          { icon: Sparkles, label: "Service", val: svc.name },
          { icon: Calendar, label: "Date & Time", val: `${ctx.selectedDate} · ${ctx.selectedTime}` },
          { icon: MapPin, label: "Address", val: ctx.addresses.find(a => a.id === ctx.selectedAddressId)?.line1 || "—" },
          { icon: Zap, label: "Payment", val: ctx.payMethods.find(p => p.id === ctx.selectedPayId)?.label || "—" },
        ].map(row => (
          <div key={row.label} className="flex items-center gap-3 mb-3 last:mb-0">
            <div className="w-8 h-8 bg-[#F5F3EF] rounded-lg flex items-center justify-center flex-shrink-0">
              <row.icon size={14} className="text-[#888888]" />
            </div>
            <div>
              <p className="text-[10px] text-[#AAAAAA] font-semibold">{row.label}</p>
              <p className="text-[12px] font-semibold text-[#333333]">{row.val}</p>
            </div>
          </div>
        ))}
      </motion.div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="w-full flex flex-col gap-3">
        <button onClick={() => ctx.navigate("live-tracking")} className="w-full bg-[#111111] text-white py-4 rounded-2xl text-[15px] font-semibold flex items-center justify-center gap-2"><Navigation size={18} /> Track in Real-time</button>
        <div className="flex gap-3">
          <button onClick={() => ctx.navigate("chat")} className="flex-1 border border-[#E8E8E8] bg-white py-3.5 rounded-2xl text-[13px] font-semibold text-[#555555] flex items-center justify-center gap-2"><MessageCircle size={16} /> Chat</button>
          <button onClick={() => ctx.navigate("home")} className="flex-1 border border-[#E8E8E8] bg-white py-3.5 rounded-2xl text-[13px] font-semibold text-[#555555]">Home</button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── LIVE TRACKING ────────────────────────────────────────────────────────
function LiveTrackingScreen({ ctx }: { ctx: AppCtx }) {
  const worker = WORKERS[0];
  return (
    <div className="min-h-full bg-[#FAF8F4]">
      <BackHeader title="Live Tracking" onBack={ctx.goBack} right={
        <button onClick={() => ctx.navigate("chat")} className="w-9 h-9 flex items-center justify-center rounded-full bg-white border border-[#E8E8E8] shadow-sm">
          <MessageCircle size={17} strokeWidth={1.8} />
        </button>
      } />
      {/* Fake map */}
      <div className="mx-4 mb-4 h-[280px] bg-[#E8EFF0] rounded-2xl overflow-hidden relative">
        {/* Grid lines */}
        {[20, 40, 60, 80].map(p => <div key={p} className="absolute left-0 right-0 border-b border-[#D4DFE0]" style={{ top: `${p}%` }} />)}
        {[20, 40, 60, 80].map(p => <div key={p} className="absolute top-0 bottom-0 border-r border-[#D4DFE0]" style={{ left: `${p}%` }} />)}
        {/* Roads */}
        <div className="absolute top-[48%] left-0 right-0 h-7 bg-white/50" />
        <div className="absolute left-[38%] top-0 bottom-0 w-7 bg-white/50" />
        {/* Route dots */}
        {[15, 25, 35].map(p => <div key={p} className="absolute w-2 h-2 bg-[#111111]/30 rounded-full" style={{ left: `${p}%`, top: "48%" }} />)}
        {/* Worker marker (animated) */}
        <motion.div animate={{ left: ["10%", "35%"] }} transition={{ duration: 8, ease: "linear", repeat: Infinity, repeatType: "reverse" }} className="absolute top-[40%]" style={{ left: "10%" }}>
          <div className="w-10 h-10 bg-[#111111] rounded-full flex items-center justify-center shadow-xl">
            <Navigation size={16} className="text-white" />
          </div>
          <div className="absolute inset-0 bg-[#111111]/20 rounded-full animate-ping" />
          <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-white text-[10px] font-bold text-[#111111] px-2 py-0.5 rounded-full whitespace-nowrap shadow-sm">Rahul S.</div>
        </motion.div>
        {/* Destination */}
        <div className="absolute right-[20%] top-[38%]">
          <div className="w-8 h-8 bg-white border-2 border-[#111111] rounded-full flex items-center justify-center shadow-md">
            <Home size={14} className="text-[#111111]" />
          </div>
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[9px] font-bold text-[#111111] whitespace-nowrap">Your Home</div>
        </div>
        {/* ETA badge */}
        <div className="absolute top-3 right-3 bg-white rounded-xl px-3 py-2 shadow-md">
          <p className="text-[10px] text-[#888888]">ETA</p>
          <p className="text-[16px] font-bold text-[#111111]" style={{ fontFamily: "'Outfit', sans-serif" }}>18 min</p>
        </div>
      </div>
      {/* Worker card */}
      <div className="mx-4 bg-white rounded-2xl p-4 border border-[#F0EDE8] mb-3">
        <div className="flex items-center gap-3">
          <img src={worker.image} alt={worker.name} className="w-14 h-14 rounded-2xl object-cover bg-[#F0EDE8]" />
          <div className="flex-1">
            <p className="text-[14px] font-bold text-[#111111]">{worker.name}</p>
            <p className="text-[12px] text-[#888888]">{worker.specialty}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <Star size={11} className="fill-amber-400 text-amber-400" />
              <span className="text-[12px] font-bold text-[#111111]">{worker.rating}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="w-10 h-10 border border-[#E8E8E8] rounded-xl flex items-center justify-center">
              <Phone size={18} className="text-[#555555]" strokeWidth={1.5} />
            </button>
            <button onClick={() => ctx.navigate("chat")} className="w-10 h-10 border border-[#E8E8E8] rounded-xl flex items-center justify-center">
              <MessageCircle size={18} className="text-[#555555]" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </div>
      {/* Steps */}
      <div className="mx-4 bg-white rounded-2xl p-4 border border-[#F0EDE8]">
        <h3 className="text-[13px] font-bold text-[#111111] mb-3">Service Progress</h3>
        {[
          { label: "Booking confirmed", done: true },
          { label: "Professional assigned", done: true },
          { label: "En route to your location", done: true, active: true },
          { label: "Service in progress", done: false },
          { label: "Completed", done: false },
        ].map((step, i) => (
          <div key={i} className="flex items-center gap-3 mb-2 last:mb-0">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${step.done ? "bg-[#111111]" : "bg-[#F0EDE8]"} ${step.active ? "ring-2 ring-[#111111] ring-offset-2" : ""}`}>
              {step.done && <Check size={10} className="text-white" strokeWidth={3} />}
            </div>
            <span className={`text-[12px] ${step.active ? "font-bold text-[#111111]" : step.done ? "text-[#555555]" : "text-[#AAAAAA]"}`}>{step.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── CHAT ────────────────────────────────────────────────────────────────
function ChatScreen({ ctx }: { ctx: AppCtx }) {
  const [msg, setMsg] = useState("");
  const worker = WORKERS[0];
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [ctx.chatMsgs]);
  const send = () => {
    if (!msg.trim()) return;
    ctx.setChatMsgs(m => [...m, { id: `cm${Date.now()}`, sender: "user", text: msg, time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) }]);
    setMsg("");
    setTimeout(() => {
      ctx.setChatMsgs(m => [...m, { id: `cm${Date.now()}`, sender: "worker", text: "Got it! I'll take care of that. See you soon.", time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) }]);
    }, 1200);
  };
  return (
    <div className="min-h-full bg-[#FAF8F4] flex flex-col">
      <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-[#E8E8E8]">
        <button onClick={ctx.goBack} className="w-9 h-9 flex items-center justify-center rounded-full bg-[#F5F3EF]"><ArrowLeft size={18} strokeWidth={2} /></button>
        <img src={worker.image} alt="" className="w-10 h-10 rounded-full object-cover bg-[#F0EDE8]" />
        <div className="flex-1">
          <p className="text-[14px] font-semibold text-[#111111]">{worker.name}</p>
          <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 bg-green-500 rounded-full" /><p className="text-[11px] text-green-600">Online</p></div>
        </div>
        <button><Phone size={18} className="text-[#555555]" strokeWidth={1.5} /></button>
      </div>
      <div className="flex-1 px-4 py-3 overflow-y-auto [scrollbar-width:none] flex flex-col gap-3" style={{ minHeight: 0 }}>
        {ctx.chatMsgs.map(m => (
          <div key={m.id} className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${m.sender === "user" ? "bg-[#111111] text-white rounded-br-sm" : "bg-white border border-[#F0EDE8] text-[#333333] rounded-bl-sm"}`}>
              <p className="text-[13px] leading-relaxed">{m.text}</p>
              <p className={`text-[10px] mt-1 ${m.sender === "user" ? "text-white/50 text-right" : "text-[#AAAAAA]"}`}>{m.time}</p>
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <div className="px-4 py-3 bg-white border-t border-[#E8E8E8]">
        <div className="flex items-center gap-2">
          <button className="w-9 h-9 flex items-center justify-center text-[#AAAAAA]"><Camera size={20} /></button>
          <div className="flex-1 bg-[#F5F3EF] rounded-2xl px-4 py-2.5 flex items-center gap-2">
            <input value={msg} onChange={e => setMsg(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="Type a message…" className="flex-1 text-[14px] text-[#111111] outline-none bg-transparent" />
            <button className="text-[#AAAAAA]"><Mic size={18} /></button>
          </div>
          <button onClick={send} className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${msg.trim() ? "bg-[#111111]" : "bg-[#E8E8E8]"}`}>
            <Send size={16} className={msg.trim() ? "text-white" : "text-[#AAAAAA]"} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── BOOKING DETAIL ───────────────────────────────────────────────────────
function BookingDetailScreen({ ctx }: { ctx: AppCtx }) {
  const bk = ctx.bookings[0];
  if (!bk) return null;
  const svc = getSvc(bk.serviceId) || SERVICES[0];
  const worker = getWorker(bk.workerId) || WORKERS[0];
  const statusColors: Record<string, string> = { upcoming: "text-blue-700 bg-blue-50", ongoing: "text-amber-700 bg-amber-50", completed: "text-green-700 bg-green-50", cancelled: "text-red-700 bg-red-50" };
  return (
    <div className="min-h-full bg-[#FAF8F4]">
      <BackHeader title="Booking Details" onBack={ctx.goBack} />
      <div className="px-4">
        {/* Status */}
        <div className="bg-white rounded-2xl p-4 border border-[#F0EDE8] mb-3">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[11px] text-[#AAAAAA] font-semibold uppercase tracking-wider mb-1">Booking ID</p>
              <p className="text-[16px] font-bold text-[#111111]" style={{ fontFamily: "'Outfit', sans-serif" }}>{bk.id}</p>
            </div>
            <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full capitalize ${statusColors[bk.status]}`}>{bk.status}</span>
          </div>
        </div>
        {/* Service */}
        <div className="bg-white rounded-2xl p-4 border border-[#F0EDE8] mb-3">
          <h3 className="text-[12px] font-bold text-[#AAAAAA] uppercase tracking-wider mb-3">Service</h3>
          <div className="flex gap-3">
            <img src={svc.images[0]} alt="" className="w-14 h-14 rounded-xl object-cover bg-[#F0EDE8]" />
            <div>
              <p className="text-[14px] font-bold text-[#111111]">{svc.name}</p>
              <p className="text-[12px] text-[#888888]">{bk.packageName} package</p>
              <p className="text-[14px] font-bold text-[#111111] mt-1">{fp(bk.total)}</p>
            </div>
          </div>
        </div>
        {/* Professional */}
        <div className="bg-white rounded-2xl p-4 border border-[#F0EDE8] mb-3">
          <h3 className="text-[12px] font-bold text-[#AAAAAA] uppercase tracking-wider mb-3">Professional</h3>
          <div className="flex items-center gap-3">
            <img src={worker.image} alt="" className="w-12 h-12 rounded-xl object-cover bg-[#F0EDE8]" />
            <div className="flex-1">
              <p className="text-[14px] font-bold text-[#111111]">{worker.name}</p>
              <div className="flex items-center gap-1"><Star size={11} className="fill-amber-400 text-amber-400" /><span className="text-[12px] text-[#555555]">{worker.rating}</span></div>
            </div>
            <div className="flex gap-2">
              <button className="w-9 h-9 border border-[#E8E8E8] rounded-xl flex items-center justify-center"><Phone size={16} strokeWidth={1.5} /></button>
              <button onClick={() => ctx.navigate("chat")} className="w-9 h-9 border border-[#E8E8E8] rounded-xl flex items-center justify-center"><MessageCircle size={16} strokeWidth={1.5} /></button>
            </div>
          </div>
        </div>
        {/* Schedule */}
        <div className="bg-white rounded-2xl p-4 border border-[#F0EDE8] mb-3">
          {[
            { Icon: Calendar, label: "Date & Time", val: `${bk.date} at ${bk.time}` },
            { Icon: MapPin, label: "Address", val: bk.address },
          ].map(row => (
            <div key={row.label} className="flex items-center gap-3 mb-3 last:mb-0">
              <div className="w-9 h-9 bg-[#F5F3EF] rounded-xl flex items-center justify-center flex-shrink-0"><row.Icon size={16} className="text-[#888888]" strokeWidth={1.5} /></div>
              <div>
                <p className="text-[10px] text-[#AAAAAA] font-semibold">{row.label}</p>
                <p className="text-[13px] font-semibold text-[#333333]">{row.val}</p>
              </div>
            </div>
          ))}
        </div>
        {bk.status === "upcoming" && (
          <div className="flex gap-3">
            <button onClick={() => ctx.navigate("live-tracking")} className="flex-1 bg-[#111111] text-white py-3.5 rounded-2xl text-[14px] font-semibold flex items-center justify-center gap-2"><Navigation size={16} /> Track</button>
            <button className="flex-1 border border-[#E8E8E8] bg-white py-3.5 rounded-2xl text-[14px] font-semibold text-[#D94040]">Cancel</button>
          </div>
        )}
        {bk.status === "completed" && (
          <button onClick={() => ctx.navigate("reviews")} className="w-full bg-[#111111] text-white py-4 rounded-2xl text-[15px] font-semibold">Rate this Service</button>
        )}
      </div>
    </div>
  );
}

// ─── BOOKING HISTORY ─────────────────────────────────────────────────────
function BookingHistoryScreen({ ctx }: { ctx: AppCtx }) {
  const [tab, setTab] = useState<"upcoming" | "completed">("upcoming");
  const filtered = ctx.bookings.filter(b => tab === "upcoming" ? ["upcoming", "ongoing"].includes(b.status) : ["completed", "cancelled"].includes(b.status));
  const statusColors: Record<string, string> = { upcoming: "text-blue-700 bg-blue-50", ongoing: "text-amber-700 bg-amber-50", completed: "text-green-700 bg-green-50", cancelled: "text-red-700 bg-red-50" };
  return (
    <div className="min-h-full bg-[#FAF8F4] pb-4">
      <div className="px-4 pt-3 pb-4">
        <h1 className="text-[24px] font-bold text-[#111111]" style={{ fontFamily: "'Outfit', sans-serif" }}>Bookings</h1>
      </div>
      <div className="flex gap-1 mx-4 bg-white rounded-2xl p-1 border border-[#F0EDE8] mb-4">
        {(["upcoming", "completed"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`flex-1 py-2.5 rounded-xl text-[13px] font-semibold transition-all capitalize ${tab === t ? "bg-[#111111] text-white" : "text-[#888888]"}`}>{t}</button>
        ))}
      </div>
      <div className="px-4 flex flex-col gap-3">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <CalendarDays size={40} className="text-[#E8E8E8] mx-auto mb-3" />
            <p className="text-[15px] font-semibold text-[#333333]">No {tab} bookings</p>
            <p className="text-[13px] text-[#AAAAAA] mt-1">Book a service to get started</p>
            <button onClick={() => ctx.navigate("home")} className="mt-5 bg-[#111111] text-white px-6 py-3 rounded-xl text-[14px] font-semibold">Browse Services</button>
          </div>
        ) : filtered.map(bk => {
          const svc = getSvc(bk.serviceId) || SERVICES[0];
          const worker = getWorker(bk.workerId) || WORKERS[0];
          return (
            <button key={bk.id} onClick={() => ctx.navigate("booking-detail")} className="bg-white rounded-2xl p-4 border border-[#F0EDE8] shadow-sm text-left">
              <div className="flex items-start gap-3">
                <img src={svc.images[0]} alt="" className="w-14 h-14 rounded-xl object-cover bg-[#F0EDE8]" />
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-[13px] font-bold text-[#111111]">{svc.name}</p>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full capitalize flex-shrink-0 ${statusColors[bk.status]}`}>{bk.status}</span>
                  </div>
                  <p className="text-[11px] text-[#888888]">{bk.date} · {bk.time}</p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <img src={worker.image} alt="" className="w-4 h-4 rounded-full object-cover bg-[#F0EDE8]" />
                    <p className="text-[11px] text-[#555555]">{worker.name}</p>
                    <span className="text-[#CCCCCC]">·</span>
                    <p className="text-[11px] font-semibold text-[#111111]">{fp(bk.total)}</p>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── PROFILE ─────────────────────────────────────────────────────────────
function ProfileScreen({ ctx }: { ctx: AppCtx }) {
  const menuSections = [
    {
      items: [
        { Icon: Heart, label: "Wishlist", to: "wishlist", count: ctx.wishlist.size },
        { Icon: CalendarDays, label: "My Bookings", to: "booking-history", count: ctx.bookings.filter(b => b.status === "upcoming").length },
      ]
    },
    {
      items: [
        { Icon: MapPin, label: "Saved Addresses", to: "saved-addresses" },
        { Icon: CreditCard, label: "Payment Methods", to: "payment-methods" },
        { Icon: Sparkles, label: "AI Reminders", to: "ai-reminder" },
      ]
    },
    {
      items: [
        { Icon: Settings, label: "Settings", to: "settings" },
        { Icon: HelpCircle, label: "Help & Support", to: "help-support" },
      ]
    },
  ];
  return (
    <div className="min-h-full bg-[#FAF8F4] pb-6">
      <div className="px-4 pt-4 pb-5">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-[#111111] rounded-2xl flex items-center justify-center">
            <span className="text-[22px] font-bold text-white">R</span>
          </div>
          <div className="flex-1">
            <h2 className="text-[20px] font-bold text-[#111111]" style={{ fontFamily: "'Outfit', sans-serif" }}>{ctx.profile.name}</h2>
            <p className="text-[12px] text-[#888888]">{ctx.profile.phone}</p>
            <p className="text-[12px] text-[#888888]">{ctx.profile.email}</p>
          </div>
          <button onClick={() => ctx.navigate("edit-profile")} className="w-9 h-9 bg-white border border-[#E8E8E8] rounded-xl flex items-center justify-center shadow-sm">
            <Edit3 size={15} className="text-[#555555]" />
          </button>
        </div>
        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          {[
            { label: "Bookings", val: ctx.bookings.length },
            { label: "Reviews", val: "12" },
            { label: "Saved", val: ctx.wishlist.size },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl p-3 text-center border border-[#F0EDE8]">
              <p className="text-[20px] font-bold text-[#111111]" style={{ fontFamily: "'Outfit', sans-serif" }}>{s.val}</p>
              <p className="text-[10px] text-[#AAAAAA]">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="px-4 flex flex-col gap-3">
        {menuSections.map((section, si) => (
          <div key={si} className="bg-white rounded-2xl border border-[#F0EDE8] overflow-hidden">
            {section.items.map((item, ii) => (
              <button key={item.to} onClick={() => ctx.navigate(item.to)} className={`w-full flex items-center gap-3 px-4 py-3.5 ${ii < section.items.length - 1 ? "border-b border-[#F5F3EF]" : ""}`}>
                <div className="w-8 h-8 bg-[#F5F3EF] rounded-lg flex items-center justify-center">
                  <item.Icon size={16} className="text-[#555555]" strokeWidth={1.5} />
                </div>
                <span className="flex-1 text-[14px] font-medium text-[#333333] text-left">{item.label}</span>
                {(item as { count?: number }).count !== undefined && (item as { count?: number }).count! > 0 && (
                  <span className="w-5 h-5 bg-[#111111] rounded-full text-[10px] font-bold text-white flex items-center justify-center">{(item as { count?: number }).count}</span>
                )}
                <ChevronRight size={16} className="text-[#CCCCCC]" />
              </button>
            ))}
          </div>
        ))}
        <button onClick={() => { ctx.setIsLoggedIn(false); ctx.navigate("onboarding"); }} className="bg-white rounded-2xl border border-[#F0EDE8] px-4 py-3.5 flex items-center gap-3">
          <div className="w-8 h-8 bg-[#FFF0F0] rounded-lg flex items-center justify-center">
            <LogOut size={16} className="text-[#D94040]" strokeWidth={1.5} />
          </div>
          <span className="flex-1 text-[14px] font-medium text-[#D94040] text-left">Sign Out</span>
        </button>
      </div>
    </div>
  );
}

// ─── EDIT PROFILE ────────────────────────────────────────────────────────
function EditProfileScreen({ ctx }: { ctx: AppCtx }) {
  const [form, setForm] = useState({ ...ctx.profile });
  return (
    <div className="min-h-full bg-[#FAF8F4]">
      <BackHeader title="Edit Profile" onBack={ctx.goBack} />
      <div className="px-4">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-20 h-20 bg-[#111111] rounded-2xl flex items-center justify-center">
              <span className="text-[28px] font-bold text-white">{form.name[0]}</span>
            </div>
            <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-white border border-[#E8E8E8] rounded-full flex items-center justify-center shadow-sm">
              <Camera size={13} className="text-[#555555]" />
            </button>
          </div>
        </div>
        {[
          { key: "name", label: "Full Name", type: "text" },
          { key: "email", label: "Email", type: "email" },
          { key: "phone", label: "Phone", type: "tel" },
        ].map(f => (
          <div key={f.key} className="mb-4">
            <label className="text-[11px] font-bold text-[#888888] uppercase tracking-wider mb-1.5 block">{f.label}</label>
            <input value={(form as Record<string, string>)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} type={f.type} className="w-full bg-white border border-[#E8E8E8] rounded-xl px-4 py-3.5 text-[14px] text-[#111111] outline-none" />
          </div>
        ))}
        <button onClick={() => { ctx.setProfile(form); ctx.goBack(); }} className="w-full bg-[#111111] text-white py-4 rounded-2xl text-[15px] font-semibold mt-4">Save Changes</button>
      </div>
    </div>
  );
}

// ─── SAVED ADDRESSES ─────────────────────────────────────────────────────
function SavedAddressesScreen({ ctx }: { ctx: AppCtx }) {
  return (
    <div className="min-h-full bg-[#FAF8F4]">
      <BackHeader title="Saved Addresses" onBack={ctx.goBack} />
      <div className="px-4 flex flex-col gap-3">
        {ctx.addresses.map(addr => (
          <div key={addr.id} className="bg-white rounded-2xl p-4 border border-[#F0EDE8]">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 bg-[#F0EDE8] rounded-lg flex items-center justify-center"><MapPin size={13} className="text-[#888888]" /></div>
                <span className="text-[13px] font-bold text-[#111111]">{addr.label}</span>
                {addr.isDefault && <span className="text-[9px] bg-[#E8F5EE] text-green-700 px-1.5 py-0.5 rounded-full font-bold">Default</span>}
              </div>
              <div className="flex gap-2">
                <button onClick={() => { ctx.setEditingAddressId(addr.id); ctx.navigate("add-edit-address"); }} className="w-7 h-7 flex items-center justify-center"><Edit3 size={14} className="text-[#888888]" /></button>
                <button onClick={() => ctx.setAddresses(a => a.filter(x => x.id !== addr.id))} className="w-7 h-7 flex items-center justify-center"><Trash2 size={14} className="text-[#D94040]" /></button>
              </div>
            </div>
            <p className="text-[12px] text-[#555555]">{addr.line1}</p>
            <p className="text-[12px] text-[#888888]">{addr.line2}, {addr.city} — {addr.pincode}</p>
          </div>
        ))}
        <button onClick={() => { ctx.setEditingAddressId(null); ctx.navigate("add-edit-address"); }} className="flex items-center gap-3 border-2 border-dashed border-[#CCCCCC] rounded-2xl px-4 py-3.5">
          <div className="w-7 h-7 bg-[#F0EDE8] rounded-lg flex items-center justify-center"><Plus size={14} className="text-[#555555]" /></div>
          <span className="text-[13px] font-semibold text-[#555555]">Add new address</span>
        </button>
      </div>
    </div>
  );
}

// ─── PAYMENT METHODS ─────────────────────────────────────────────────────
function PaymentMethodsScreen({ ctx }: { ctx: AppCtx }) {
  const icons: Record<string, typeof CreditCard> = { upi: Zap, card: CreditCard, wallet: Package, netbanking: Shield };
  return (
    <div className="min-h-full bg-[#FAF8F4]">
      <BackHeader title="Payment Methods" onBack={ctx.goBack} />
      <div className="px-4 flex flex-col gap-3">
        {ctx.payMethods.map(pm => {
          const Icon = icons[pm.type] || CreditCard;
          return (
            <div key={pm.id} className="bg-white rounded-2xl p-4 border border-[#F0EDE8] flex items-center gap-3">
              <div className="w-10 h-10 bg-[#F0EDE8] rounded-xl flex items-center justify-center flex-shrink-0">
                <Icon size={18} className="text-[#888888]" strokeWidth={1.5} />
              </div>
              <div className="flex-1">
                <p className="text-[13px] font-semibold text-[#111111]">{pm.label}</p>
                <p className="text-[11px] text-[#888888]">{pm.detail}</p>
              </div>
              {pm.isDefault && <span className="text-[9px] bg-[#E8F5EE] text-green-700 px-1.5 py-0.5 rounded-full font-bold">Default</span>}
              <button onClick={() => ctx.setPayMethods(m => m.filter(x => x.id !== pm.id))}><Trash2 size={15} className="text-[#D94040]" /></button>
            </div>
          );
        })}
        <button className="flex items-center gap-3 border-2 border-dashed border-[#CCCCCC] rounded-2xl px-4 py-3.5">
          <div className="w-7 h-7 bg-[#F0EDE8] rounded-lg flex items-center justify-center"><Plus size={14} className="text-[#555555]" /></div>
          <span className="text-[13px] font-semibold text-[#555555]">Add payment method</span>
        </button>
      </div>
    </div>
  );
}

// ─── SETTINGS ────────────────────────────────────────────────────────────
function SettingsScreen({ ctx }: { ctx: AppCtx }) {
  const [notifs, setNotifs] = useState(true);
  const [sms, setSms] = useState(true);
  const [location, setLocation] = useState(true);
  const [dark, setDark] = useState(false);
  const [lang, setLang] = useState("English");
  return (
    <div className="min-h-full bg-[#FAF8F4]">
      <BackHeader title="Settings" onBack={ctx.goBack} />
      <div className="px-4 flex flex-col gap-3">
        {[
          { label: "Push Notifications", val: notifs, set: setNotifs },
          { label: "SMS Alerts", val: sms, set: setSms },
          { label: "Location Services", val: location, set: setLocation },
          { label: "Dark Mode", val: dark, set: setDark },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl px-4 py-3.5 border border-[#F0EDE8] flex items-center justify-between">
            <span className="text-[14px] font-medium text-[#333333]">{s.label}</span>
            <button onClick={() => s.set(!s.val)} className={`w-12 h-6 rounded-full transition-colors flex items-center ${s.val ? "bg-[#111111]" : "bg-[#E8E8E8]"}`}>
              <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ml-0.5 ${s.val ? "translate-x-6" : "translate-x-0"}`} />
            </button>
          </div>
        ))}
        <div className="bg-white rounded-2xl px-4 py-3.5 border border-[#F0EDE8] flex items-center justify-between">
          <span className="text-[14px] font-medium text-[#333333]">Language</span>
          <div className="flex items-center gap-2 text-[13px] font-semibold text-[#888888]">{lang} <ChevronRight size={14} /></div>
        </div>
        <div className="bg-white rounded-2xl overflow-hidden border border-[#F0EDE8]">
          {["Privacy Policy", "Terms of Service", "About Homigo"].map((item, i, arr) => (
            <button key={item} className={`w-full flex items-center justify-between px-4 py-3.5 ${i < arr.length - 1 ? "border-b border-[#F5F3EF]" : ""}`}>
              <span className="text-[14px] font-medium text-[#333333]">{item}</span>
              <ChevronRight size={14} className="text-[#CCCCCC]" />
            </button>
          ))}
        </div>
        <div className="text-center pt-2">
          <p className="text-[11px] text-[#AAAAAA]">Homigo v2.4.1 · Build 2025.07</p>
        </div>
      </div>
    </div>
  );
}

// ─── HELP & SUPPORT ───────────────────────────────────────────────────────
function HelpSupportScreen({ ctx }: { ctx: AppCtx }) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  return (
    <div className="min-h-full bg-[#FAF8F4]">
      <BackHeader title="Help & Support" onBack={ctx.goBack} />
      <div className="px-4">
        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {[
            { Icon: MessageCircle, label: "Live Chat", sub: "Avg. 2 min reply" },
            { Icon: Phone, label: "Call Support", sub: "Mon-Sat, 8AM-8PM" },
            { Icon: FileText, label: "Raise Ticket", sub: "24-48 hr response" },
            { Icon: BookOpen, label: "Help Articles", sub: "Browse all guides" },
          ].map(a => (
            <button key={a.label} className="bg-white rounded-2xl p-4 border border-[#F0EDE8] text-left">
              <div className="w-10 h-10 bg-[#F5F3EF] rounded-xl flex items-center justify-center mb-2.5">
                <a.Icon size={18} className="text-[#555555]" strokeWidth={1.5} />
              </div>
              <p className="text-[13px] font-bold text-[#111111]">{a.label}</p>
              <p className="text-[11px] text-[#888888] mt-0.5">{a.sub}</p>
            </button>
          ))}
        </div>
        <h2 className="text-[15px] font-bold text-[#111111] mb-3" style={{ fontFamily: "'Outfit', sans-serif" }}>Frequently Asked</h2>
        <div className="flex flex-col gap-2 mb-5">
          {FAQS_DATA.slice(0, 4).map((faq, i) => (
            <div key={i} className="bg-white rounded-2xl border border-[#F0EDE8] overflow-hidden">
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between px-4 py-3.5">
                <span className="text-[13px] font-semibold text-[#111111] text-left pr-2">{faq.q}</span>
                <ChevronDown size={15} className={`text-[#888888] flex-shrink-0 transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
              </button>
              {openFaq === i && <div className="px-4 pb-4 pt-1 border-t border-[#F5F3EF]"><p className="text-[12px] text-[#666666] leading-relaxed">{faq.a}</p></div>}
            </div>
          ))}
        </div>
        <div className="bg-[#F5F3EF] rounded-2xl p-4 text-center">
          <p className="text-[13px] font-semibold text-[#333333]">Still need help?</p>
          <p className="text-[11px] text-[#888888] mt-0.5">Our support team is here for you</p>
          <button className="mt-3 bg-[#111111] text-white px-6 py-2.5 rounded-xl text-[13px] font-semibold">Contact Support</button>
        </div>
      </div>
    </div>
  );
}

// ─── AI REMINDER ─────────────────────────────────────────────────────────
function AIReminderScreen({ ctx }: { ctx: AppCtx }) {
  const statusColor = { "overdue": "text-red-600 bg-red-50", "due-soon": "text-amber-600 bg-amber-50", "ok": "text-green-600 bg-green-50" };
  const statusLabel = { "overdue": "Overdue", "due-soon": "Due Soon", "ok": "Up to Date" };
  return (
    <div className="min-h-full bg-[#FAF8F4]">
      <BackHeader title="AI Maintenance Reminders" onBack={ctx.goBack} />
      <div className="px-4">
        <div className="bg-[#111111] rounded-2xl p-4 mb-5 flex items-start gap-3">
          <Sparkles size={20} className="text-white flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-[13px] font-bold text-white">AI-Powered Schedule</p>
            <p className="text-[11px] text-white/50 leading-relaxed mt-0.5">Based on your home profile and booking history, Homigo AI recommends this maintenance schedule.</p>
          </div>
        </div>
        <div className="flex flex-col gap-3 mb-5">
          {REMINDER_SERVICES.map((r, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 border border-[#F0EDE8]">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#F5F3EF] rounded-xl flex items-center justify-center flex-shrink-0">
                    <r.icon size={18} className="text-[#555555]" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-[#111111]">{r.name}</p>
                    <p className="text-[11px] text-[#888888]">Last: {r.lastDone}</p>
                  </div>
                </div>
                <span className={`text-[9px] font-bold px-2 py-1 rounded-full whitespace-nowrap ${statusColor[r.status]}`}>{statusLabel[r.status]}</span>
              </div>
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-1.5">
                  <Calendar size={12} className="text-[#AAAAAA]" />
                  <span className="text-[11px] text-[#888888]">Next due: {r.nextDue}</span>
                </div>
                {r.status !== "ok" && (
                  <button onClick={() => ctx.navigate("service-listing")} className="text-[11px] font-bold text-[#111111] bg-[#F0EDE8] px-2.5 py-1 rounded-full">Book Now</button>
                )}
              </div>
            </div>
          ))}
        </div>
        <button className="w-full border border-[#E8E8E8] bg-white py-3.5 rounded-2xl text-[14px] font-semibold text-[#555555] flex items-center justify-center gap-2">
          <Plus size={16} /> Add Custom Reminder
        </button>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────
export default function App() {
  const [dimensions, setDimensions] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 390,
    height: typeof window !== "undefined" ? window.innerHeight : 844,
  });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = dimensions.width < 480;
  const padding = 32;
  const scaleH = (dimensions.height - padding) / 844;
  const scaleW = (dimensions.width - padding) / 390;
  const scale = isMobile ? 1 : Math.min(1, scaleH, scaleW);

  const [currentScreen, setCurrentScreen] = useState("splash");
  const [history, setHistory] = useState<string[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [selectedWorkerId, setSelectedWorkerId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const [selectedPkgId, setSelectedPkgId] = useState<string | null>(null);
  const [selectedAddressId, setSelectedAddressId] = useState("a1");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedPayId, setSelectedPayId] = useState("pm1");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [bookings, setBookings] = useState<Booking[]>(INIT_BOOKINGS);
  const [addresses, setAddresses] = useState<Address[]>(INIT_ADDRESSES);
  const [payMethods, setPayMethods] = useState<PayMethod[]>(INIT_PAYMETHODS);
  const [chatMsgs, setChatMsgs] = useState<ChatMsg[]>(INIT_CHAT);
  const [aiTab, setAiTab] = useState<"text" | "photo" | "video">("text");
  const [aiQuery, setAiQuery] = useState("");
  const [galleryIdx, setGalleryIdx] = useState(0);
  const [sortOption, setSortOption] = useState("popular");
  const [filterState, setFilterState] = useState({ rating: 0, verified: false, priceMax: 5000 });
  const [profile, setProfile] = useState<UserProfile>({ name: "Rahul Mehra", email: "rahul.mehra@gmail.com", phone: "+91 98765 43210" });
  const [currentBookingId, setCurrentBookingId] = useState<string | null>(null);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notif[]>(INIT_NOTIFS);

  const scrollRef = useRef<HTMLDivElement>(null);

  const navigate = (s: string) => {
    setHistory(h => [...h, currentScreen]);
    setCurrentScreen(s);
    setTimeout(() => scrollRef.current?.scrollTo({ top: 0 }), 0);
  };

  const goBack = () => {
    if (history.length > 0) {
      const prev = [...history];
      const last = prev.pop()!;
      setHistory(prev);
      setCurrentScreen(last);
      setTimeout(() => scrollRef.current?.scrollTo({ top: 0 }), 0);
    }
  };

  const requireAuth = (cb: () => void) => {
    if (isLoggedIn) { cb(); } else { navigate("login"); }
  };

  const toggleWishlist = (id: string) => {
    setWishlist(w => { const n = new Set(w); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  };

  const markNotifsRead = () => {
    setNotifications(n => n.map(x => ({ ...x, read: true })));
  };

  const ctx: AppCtx = {
    screen: currentScreen, navigate, goBack, isLoggedIn, setIsLoggedIn,
    selectedServiceId, setSelectedServiceId,
    selectedWorkerId, setSelectedWorkerId,
    selectedCategoryId, setSelectedCategoryId,
    cart, setCart, wishlist, toggleWishlist,
    selectedPkgId, setSelectedPkgId,
    selectedAddressId, setSelectedAddressId,
    selectedDate, setSelectedDate,
    selectedTime, setSelectedTime,
    selectedPayId, setSelectedPayId,
    appliedCoupon, setAppliedCoupon,
    bookings, setBookings,
    addresses, setAddresses,
    payMethods, setPayMethods,
    chatMsgs, setChatMsgs,
    aiTab, setAiTab, aiQuery, setAiQuery,
    galleryIdx, setGalleryIdx,
    sortOption, setSortOption,
    filterState, setFilterState,
    profile, setProfile,
    currentBookingId, setCurrentBookingId,
    editingAddressId, setEditingAddressId,
    notifications, markNotifsRead,
    requireAuth,
    isMobile,
  };

  const showBottomNav = ["home", "categories", "booking-history", "profile"].includes(currentScreen);
  const isDark = ["splash", "image-gallery"].includes(currentScreen);

  const screenMap: Record<string, React.ComponentType<{ ctx: AppCtx }>> = {
    splash: SplashScreen,
    onboarding: OnboardingScreen,
    login: LoginScreen,
    home: HomeScreen,
    search: SearchScreen,
    notifications: NotificationsScreen,
    categories: CategoriesScreen,
    "all-categories": AllCategoriesScreen,
    "category-detail": CategoryDetailScreen,
    "service-listing": ServiceListingScreen,
    "service-detail": ServiceDetailScreen,
    "image-gallery": ImageGalleryScreen,
    packages: PackagesScreen,
    faqs: FAQsScreen,
    reviews: ReviewsScreen,
    "similar-services": SimilarServicesScreen,
    "ai-diagnosis": AIDiagnosisScreen,
    "ai-results": AIResultsScreen,
    "cost-estimation": CostEstimationScreen,
    "worker-recommendation": WorkerRecommendationScreen,
    "worker-profile": WorkerProfileScreen,
    wishlist: WishlistScreen,
    cart: CartScreen,
    address: AddressScreen,
    "add-edit-address": AddEditAddressScreen,
    schedule: ScheduleScreen,
    checkout: CheckoutScreen,
    coupons: CouponsScreen,
    payment: PaymentScreen,
    "booking-success": BookingSuccessScreen,
    "live-tracking": LiveTrackingScreen,
    chat: ChatScreen,
    "booking-detail": BookingDetailScreen,
    "booking-history": BookingHistoryScreen,
    profile: ProfileScreen,
    "edit-profile": EditProfileScreen,
    "saved-addresses": SavedAddressesScreen,
    "payment-methods": PaymentMethodsScreen,
    settings: SettingsScreen,
    "help-support": HelpSupportScreen,
    "ai-reminder": AIReminderScreen,
  };

  const CurrentScreen = screenMap[currentScreen] || HomeScreen;

  const now = new Date();
  const timeStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}`;

  return (
    <div className={isMobile ? "w-full h-[100dvh] overflow-hidden" : "min-h-screen flex items-center justify-center p-4"} style={{ background: isMobile ? (isDark ? "#111111" : "#FAF8F4") : "#D9D4CB" }}>
      {/* Phone frame */}
      <div className="relative flex-shrink-0" style={
        isMobile
          ? {
            width: "100%",
            height: "100%",
            borderRadius: 0,
            overflow: "hidden",
            boxShadow: "none"
          }
          : {
            width: 390,
            height: 844,
            borderRadius: 48,
            overflow: "hidden",
            boxShadow: "0 60px 120px -20px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,0,0,0.15)",
            transform: `scale(${scale})`,
            transformOrigin: "center center"
          }
      }>
        {/* Dynamic Island */}
        {!isMobile && (
          <div className="absolute left-1/2 -translate-x-1/2 z-50 pointer-events-none" style={{ top: 14, width: 126, height: 34, background: "#000", borderRadius: 20 }} />
        )}

        {/* Status bar */}
        {!isMobile && (
          <div className={`absolute top-0 left-0 right-0 z-40 flex items-center justify-between pointer-events-none`} style={{ height: 56, paddingLeft: 24, paddingRight: 24, paddingTop: 16, background: isDark ? "#111111" : "#FAF8F4" }}>
            <span className={`text-[13px] font-semibold ${isDark ? "text-white" : "text-[#111111]"}`}>{timeStr}</span>
            <div className={`flex items-center gap-[5px] ${isDark ? "text-white" : "text-[#111111]"}`}>
              <Signal size={13} />
              <Wifi size={13} />
              <Battery size={15} />
            </div>
          </div>
        )}

        {/* Scrollable content */}
        <div ref={scrollRef} className="absolute inset-0 overflow-y-auto" style={{
          scrollbarWidth: "none",
          paddingTop: isMobile ? "env(safe-area-inset-top, 0px)" : 56,
          paddingBottom: isMobile
            ? (showBottomNav ? "calc(64px + env(safe-area-inset-bottom, 0px))" : "env(safe-area-inset-bottom, 0px)")
            : (showBottomNav ? 83 : 0),
          background: isDark ? "#111111" : "#FAF8F4"
        }}>
          <motion.div key={currentScreen} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }} className="min-h-full flex flex-col">
            <CurrentScreen ctx={ctx} />
          </motion.div>
        </div>

        {/* Bottom navigation */}
        {showBottomNav && (
          <div className="absolute bottom-0 left-0 right-0 z-40">
            <BottomNav screen={currentScreen} navigate={navigate} requireAuth={requireAuth} isMobile={isMobile} />
          </div>
        )}
      </div>
    </div>
  );
}
