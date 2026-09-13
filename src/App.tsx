import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useProfileData, type FarmerProfile, type OfficerProfile } from '@/useProfileData';
import { useBookingData, type Booking } from '@/useBookingData';
import { useTruckPoolData, type TruckPool, type PoolStatus } from '@/useTruckPoolData';
import { allCrops, cropRates, procurementCentres, centresForCrop, availableDates, availableTimes, cropName, type ProcurementCentre } from '@/cropData';
import { UserProfileContext, useUserProfile, defaultUserProfile, greetingFor, displayLocation, displayName, type UserProfile } from '@/userProfile';
import {
  ArrowRight,
  BarChart3,
  Bell,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  CloudSun,
  Download,
  Droplets,
  FileCheck2,
  FileText,
  IndianRupee,
  Landmark,
  Languages,
  Leaf,
  MapPin,
  Menu,
  MoreHorizontal,
  Navigation,
  PackageCheck,
  Phone,
  Plus,
  QrCode,
  ScanLine,
  Search,
  Share2,
  ShieldCheck,
  Sprout,
  SunMedium,
  Tractor,
  Truck,
  Upload,
  UserRound,
  Users,
  Users2,
  Wallet,
  X,
  AlertTriangle,
  Warehouse,
  Route,
  Clock,
  TrendingUp,
  Send,
} from 'lucide-react';
import { t, type Language, languageNames, languageShort } from '@/translations';
import { useFarmerDetails, useMoistureRecords, useCropVerifications } from '@/useFarmerDetails';
import { useDriverData, driverWarehouses, type TransportRequest } from '@/useDriverData';
import { useJuteBagStock } from '@/useJuteBagStock';
import { indianStates, officerMandis } from '@/cropData';

type Role = 'farmer' | 'officer' | 'driver';
type Screen = 'welcome' | 'phone' | 'otp' | 'role' | 'profileSetup' | 'aadhaarStep' | 'bankStep' | 'farmer' | 'book' | 'pass' | 'myBookings' | 'rates' | 'transport' | 'truckPool' | 'tractorPool' | 'trackPayment' | 'officer' | 'scanner' | 'mandiExpress' | 'farmerProfile' | 'officerProfile' | 'driverOnboarding' | 'driver' | 'driverRequests' | 'driverActiveTrip' | 'driverWarehouses' | 'driverPayments' | 'driverTripHistory' | 'driverProfile';

type BookScreenProps = { setScreen: (screen: Screen) => void; language: Language; setLanguage: (value: Language) => void; role: Role; onSignOut: () => void; bookingData: ReturnType<typeof useBookingData>; initialTime?: string; resetKey?: number };

type IconType = typeof Sprout;

function locField(field: { en: string; hi: string; [key: string]: string }, lang: Language): string {
  return (field[lang] as string) || field.en;
}

const queue = [
  { name: 'Ramesh Kumar', crop: { en: 'Wheat', hi: 'गेहूं' }, quantity: { en: '24 Quintal', hi: '24 क्विंटल' }, quantityValue: 24, time: '09:30 AM', status: 'checkedIn' as const, state: 'Rajasthan', district: 'Jaipur', tehsil: 'Chomu', village: 'Govindgarh', pinCode: '303702', date: 'Wed, 15 May 2024' },
  { name: 'Sushila Devi', crop: { en: 'Mustard', hi: 'सरसों' }, quantity: { en: '12 Quintal', hi: '12 क्विंटल' }, quantityValue: 12, time: '10:00 AM', status: 'arriving' as const, state: 'Rajasthan', district: 'Jaipur', tehsil: 'Amer', village: 'Nayla', pinCode: '302028', date: 'Wed, 15 May 2024' },
  { name: 'Mohan Lal', crop: { en: 'Rice', hi: 'धान' }, quantity: { en: '18 Quintal', hi: '18 क्विंटल' }, quantityValue: 18, time: '10:30 AM', status: 'arriving' as const, state: 'Rajasthan', district: 'Jaipur', tehsil: 'Sanganer', village: 'Bassi', pinCode: '303301', date: 'Wed, 15 May 2024' },
  { name: 'Kamlesh Meena', crop: { en: 'Wheat', hi: 'गेहूं' }, quantity: { en: '30 Quintal', hi: '30 क्विंटल' }, quantityValue: 30, time: '11:00 AM', status: 'arriving' as const, state: 'Rajasthan', district: 'Jaipur', tehsil: 'Phulera', village: 'Sambhar', pinCode: '303604', date: 'Wed, 15 May 2024' },
  { name: 'Geeta Sharma', crop: { en: 'Paddy', hi: 'धान' }, quantity: { en: '15 Quintal', hi: '15 क्विंटल' }, quantityValue: 15, time: '11:30 AM', status: 'checkedIn' as const, state: 'Rajasthan', district: 'Jaipur', tehsil: 'Chaksu', village: 'Kotkhawada', pinCode: '303901', date: 'Wed, 15 May 2024' },
];

const recentScans = [
  { name: 'Ramesh Kumar', crop: { en: 'Wheat', hi: 'गेहूं' }, time: '09:32 AM', verified: true },
  { name: 'Suresh Patel', crop: { en: 'Mustard', hi: 'सरसों' }, time: '09:15 AM', verified: true },
];

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="brand-mark"><Sprout size={compact ? 18 : 22} strokeWidth={2.5} /></div>
      <div>
        <div className="font-display text-lg font-semibold tracking-tight text-navy">Fasal Flow</div>
        {!compact && <div className="text-[10px] font-medium uppercase tracking-[0.2em] text-ink-secondary">Smart mandi access</div>}
      </div>
    </div>
  );
}

function LanguageDropdown({ language, setLanguage, dark = false }: { language: Language; setLanguage: (value: Language) => void; dark?: boolean }) {
  const [open, setOpen] = useState(false);
  const langs = Object.keys(languageNames) as Language[];
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold transition ${dark ? 'border border-white/25 bg-white/10 text-white backdrop-blur-md hover:bg-white/20' : 'language-button'}`}
        aria-label="Change language"
      >
        <Languages size={17} />
        <span>{languageNames[language]}</span>
        <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <>
        <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
        <div className="absolute right-0 z-50 mt-2 max-h-80 overflow-y-auto rounded-2xl border border-line bg-white py-1.5 shadow-xl">
          {langs.map((lng) => (
            <button
              key={lng}
              onClick={() => { setLanguage(lng); setOpen(false); }}
              className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition hover:bg-[#F7F8F5] ${language === lng ? 'font-semibold text-agri-green' : 'text-ink'}`}
            >
              {languageNames[lng]}
              {language === lng && <Check size={15} className="ml-auto" />}
            </button>
          ))}
        </div>
      </>}
    </div>
  );
}

function Header({ language, setLanguage }: { language: Language; setLanguage: (value: Language) => void }) {
  return (
    <header className="sticky top-0 z-30 border-b border-[#D9E0E3]/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8">
        <Brand />
        <div className="flex items-center gap-2 sm:gap-5">
          <LanguageDropdown language={language} setLanguage={setLanguage} />
        </div>
      </div>
    </header>
  );
}

function Progress({ step }: { step: number }) {
  return <div className="mb-8 flex items-center gap-2">{[1, 2, 3].map((item) => <div key={item} className={`h-1.5 flex-1 rounded-full ${item <= step ? 'bg-navy' : 'bg-line'}`} />)}</div>;
}

function Welcome({ onStart, language, setLanguage }: { onStart: () => void; language: Language; setLanguage: (value: Language) => void }) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1000&auto=format&fit=crop')" }}
      />
      {/* Dark overlay gradient for readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/40 to-black/65" />
      {/* Subtle bottom fade for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

      {/* Language selector - top right */}
      <div className="absolute right-4 top-4 z-20 sm:right-6 sm:top-6">
        <LanguageDropdown language={language} setLanguage={setLanguage} dark />
      </div>

      {/* Centered content */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-12 text-center">
        {/* Brand icon */}
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md sm:h-20 sm:w-20">
          <Sprout size={36} className="text-agri-green sm:size-10" strokeWidth={1.8} />
        </div>

        {/* Title */}
        <h1 className="font-display text-5xl font-semibold tracking-[-0.04em] text-white drop-shadow-lg sm:text-7xl">
          {t('welcomeHeroTitle', language)}
        </h1>

        {/* Subtitle */}
        <p className="mt-3 text-lg font-medium text-agri-sage drop-shadow-md sm:text-2xl">
          {t('welcomeHeroSubtitle', language)}
        </p>

        {/* Description */}
        <p className="mt-6 max-w-xl text-base leading-7 text-white/85 drop-shadow sm:mt-8 sm:text-lg sm:leading-8">
          {t('welcomeHeroDesc', language)}
        </p>

        {/* Stats */}
        <div className="mt-10 flex items-center gap-10 sm:mt-12">
          <div className="text-center">
            <span className="block font-display text-3xl font-semibold text-white drop-shadow sm:text-4xl">2.4L+</span>
            <span className="mt-1 block text-xs text-white/70 sm:text-sm">{t('farmersOnboarded', language)}</span>
          </div>
          <div className="h-10 w-px bg-white/20" />
          <div className="text-center">
            <span className="block font-display text-3xl font-semibold text-white drop-shadow sm:text-4xl">98%</span>
            <span className="mt-1 block text-xs text-white/70 sm:text-sm">{t('onTimeArrivals', language)}</span>
          </div>
        </div>

        {/* Get Started button */}
        <button
          onClick={onStart}
          className="group mt-12 inline-flex items-center gap-2 rounded-full bg-navy px-8 py-4 text-lg font-semibold text-white shadow-2xl shadow-navy/20 transition-all hover:bg-success-light0 hover:shadow-navy/25 active:scale-95 sm:mt-14 sm:px-10 sm:py-5 sm:text-xl"
        >
          {t('getStartedBilingual', language)}
          <ArrowRight size={22} className="transition-transform group-hover:translate-x-1" />
        </button>

        {/* Trust badge */}
        <div className="mt-8 flex items-center gap-2 text-sm text-white/70">
          <ShieldCheck size={16} className="text-agri-green" />
          {t('safeVerified', language)}
        </div>
      </div>
    </div>
  );
}

function PhoneScreen({ onNext, onBack, language, setLanguage }: { onNext: (phone: string) => void; onBack: () => void; language: Language; setLanguage: (value: Language) => void }) {
  const { userProfile, setUserProfile } = useUserProfile();
  const [phone, setPhone] = useState(userProfile.phoneNumber);
  return <div className="min-h-screen bg-[#F7F8F5]"><Header language={language} setLanguage={setLanguage} /><main className="mx-auto max-w-md px-5 py-12 sm:py-20"><button className="back-link" onClick={onBack}><ChevronLeft size={17} /> {t('back', language)}</button><Progress step={1} /><div className="mb-10"><div className="screen-icon"><ShieldCheck size={25} /></div><h1 className="mt-6 font-display text-4xl font-semibold tracking-tight text-navy">{t('welcomeToFasal', language)}</h1><p className="mt-3 leading-7 text-ink-secondary">{t('phoneSubtitle', language)}</p></div><label className="field-label">{t('mobileNumber', language)}</label><div className="phone-field"><span>+91</span><input value={phone} onChange={(event) => setPhone(event.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="98765 43210" inputMode="numeric" /></div><button onClick={() => { if (phone.length === 10) { setUserProfile((prev) => ({ ...prev, phoneNumber: phone })); onNext(phone); } }} disabled={phone.length !== 10} className="primary-button mt-6 w-full justify-center disabled:cursor-not-allowed disabled:opacity-40">{t('sendCode', language)} <ArrowRight size={18} /></button><p className="mt-6 text-center text-xs leading-5 text-ink-secondary">{t('termsNotice', language)}</p></main></div>;
}

function OtpScreen({ phone, onNext, onBack, language, setLanguage }: { phone: string; onNext: () => void; onBack: () => void; language: Language; setLanguage: (value: Language) => void }) {
  const [otp, setOtp] = useState('');
  return <div className="min-h-screen bg-[#F7F8F5]"><Header language={language} setLanguage={setLanguage} /><main className="mx-auto max-w-md px-5 py-12 sm:py-20"><button className="back-link" onClick={onBack}><ChevronLeft size={17} /> {t('changeNumber', language)}</button><Progress step={1} /><div className="mb-10"><div className="screen-icon"><Check size={25} /></div><h1 className="mt-6 font-display text-4xl font-semibold tracking-tight text-navy">{t('checkMessages', language)}</h1><p className="mt-3 leading-7 text-ink-secondary">{t('otpSent', language)} <strong className="text-ink">+91 {phone}</strong>.</p></div><label className="field-label">{t('verificationCode', language)}</label><input className="otp-input" value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="000000" inputMode="numeric" autoFocus /><div className="mt-4 flex justify-between text-sm"><button className="font-medium text-agri-green">{t('resendCode', language)}</button><span className="text-ink-secondary">00:42</span></div><button onClick={onNext} disabled={otp.length !== 6} className="primary-button mt-8 w-full justify-center disabled:cursor-not-allowed disabled:opacity-40">{t('verifyContinue', language)} <ArrowRight size={18} /></button></main></div>;
}

function RoleScreen({ onSelect, onBack, language, setLanguage }: { onSelect: (role: Role) => void; onBack: () => void; language: Language; setLanguage: (value: Language) => void }) {
  return <div className="min-h-screen bg-[#F7F8F5]"><Header language={language} setLanguage={setLanguage} /><main className="mx-auto max-w-3xl px-5 py-12 sm:py-20"><button className="back-link" onClick={onBack}><ChevronLeft size={17} /> {t('back', language)}</button><Progress step={2} /><div className="mx-auto max-w-xl text-center"><div className="screen-icon mx-auto"><Users size={25} /></div><h1 className="mt-6 font-display text-4xl font-semibold tracking-tight text-navy">{t('whoAreYou', language)}</h1><p className="mt-3 leading-7 text-ink-secondary">{t('roleSubtitle', language)}</p></div><div className="mt-10 grid gap-4 sm:grid-cols-3"><button onClick={() => onSelect('farmer')} className="role-card group"><div className="role-icon bg-[#DCE9DF] text-agri-green"><Sprout size={28} /></div><div className="flex-1 text-left"><h2 className="font-display text-xl font-semibold text-navy">{t('iAmFarmer', language)}</h2><p className="mt-2 text-sm leading-6 text-ink-secondary">{t('farmerRoleDesc', language)}</p></div><ChevronRight className="text-ink-secondary transition group-hover:translate-x-1 group-hover:text-agri-green" /></button><button onClick={() => onSelect('officer')} className="role-card group"><div className="role-icon bg-[#E8EDF0] text-navy-light"><PackageCheck size={28} /></div><div className="flex-1 text-left"><h2 className="font-display text-xl font-semibold text-navy">{t('iAmOfficer', language)}</h2><p className="mt-2 text-sm leading-6 text-ink-secondary">{t('officerRoleDesc', language)}</p></div><ChevronRight className="text-ink-secondary transition group-hover:translate-x-1 group-hover:text-agri-green" /></button><button onClick={() => onSelect('driver')} className="role-card group"><div className="role-icon bg-[#DCE9DF] text-agri-green"><Truck size={28} /></div><div className="flex-1 text-left"><h2 className="font-display text-xl font-semibold text-navy">{t('iAmDriver', language)}</h2><p className="mt-2 text-sm leading-6 text-ink-secondary">{t('driverRoleDesc', language)}</p></div><ChevronRight className="text-ink-secondary transition group-hover:translate-x-1 group-hover:text-agri-green" /></button></div></main></div>;
}

function ProfileSetupScreen({ role, onComplete, onBack, language, setLanguage }: { role: Role; onComplete: () => void; onBack: () => void; language: Language; setLanguage: (value: Language) => void }) {
  const { userProfile, setUserProfile } = useUserProfile();
  const update = (field: keyof UserProfile, value: string) => setUserProfile((prev) => ({ ...prev, [field]: value }));
  return <div className="min-h-screen bg-[#F7F8F5]"><Header language={language} setLanguage={setLanguage} /><main className="mx-auto max-w-2xl px-5 py-10 sm:py-16"><button className="back-link" onClick={onBack}><ChevronLeft size={17} /> {t('back', language)}</button><Progress step={3} /><div className="mb-8"><p className="eyebrow">{t('almostThere', language)}</p><h1 className="mt-4 font-display text-4xl font-semibold tracking-tight text-navy">{t('setupProfile', language)}</h1><p className="mt-3 leading-7 text-ink-secondary">{t('profileSubtitle', language)}</p></div><div className="form-card"><div className="grid gap-5 sm:grid-cols-2"><div className="sm:col-span-2"><label className="field-label">{t('fullName', language)}</label><input className="text-input" value={userProfile.fullName} onChange={(event) => update('fullName', event.target.value)} placeholder={role === 'farmer' ? 'e.g. Ramesh Kumar' : 'e.g. Anita Sharma'} /></div>{role === 'farmer' ? <><div><label className="field-label">{t('state', language)}</label><select className="text-input" value={userProfile.state} onChange={(event) => update('state', event.target.value)}><option value="">Select state</option>{indianStates.map((s) => <option key={s} value={s}>{s}</option>)}</select></div><div><label className="field-label">{t('district', language)}</label><input className="text-input" value={userProfile.district} onChange={(event) => update('district', event.target.value)} placeholder="Jaipur" /></div><div><label className="field-label">{t('villageCity', language)}</label><input className="text-input" value={userProfile.village} onChange={(event) => update('village', event.target.value)} placeholder="Village name" /></div><div><label className="field-label">{t('pinCode', language)}</label><input className="text-input" value={userProfile.pinCode} onChange={(event) => update('pinCode', event.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="302001" inputMode="numeric" /></div></> : <><div><label className="field-label">{t('assignedMandi', language)}</label><select className="text-input" value={userProfile.state} onChange={(event) => update('state', event.target.value)}><option value="">Select mandi</option>{officerMandis.map((m) => <option key={m} value={m}>{m}</option>)}</select></div><div><label className="field-label">{t('employeeId', language)}</label><input className="text-input" value={userProfile.district} onChange={(event) => update('district', event.target.value)} placeholder="FF-2048" /></div></>}</div><button onClick={() => { setUserProfile((prev) => ({ ...prev, fullName: prev.fullName || 'Guest Farmer', isSetupComplete: true })); onComplete(); }} disabled={!userProfile.fullName} className="primary-button mt-7 w-full justify-center disabled:cursor-not-allowed disabled:opacity-40">{t('continueDashboard', language)} <ArrowRight size={18} /></button></div><div className="mt-5 flex items-center justify-center gap-2 text-xs text-ink-secondary"><ShieldCheck size={15} className="text-agri-green" /> {t('infoSecure', language)}</div></main></div>;
}

type NavItem = { id: Screen; label: string; icon: IconType };

function DashboardLayout({ children, language, setLanguage, active, setScreen, role, onSignOut }: { children: ReactNode; language: Language; setLanguage: (language: Language) => void; active: string; setScreen: (screen: Screen) => void; role: Role; onSignOut: () => void }) {
  const { userProfile } = useUserProfile();
  const nav: NavItem[] = role === 'officer'
    ? [{ id: 'officer', label: t('navOverview', language), icon: BarChart3 }, { id: 'scanner', label: t('navScanner', language), icon: ScanLine }, { id: 'mandiExpress', label: t('navMandiExpress', language), icon: Navigation }, { id: 'rates', label: t('navMspRates', language), icon: IndianRupee }]
    : role === 'driver'
    ? [{ id: 'driver', label: t('navDriverDashboard', language), icon: BarChart3 }, { id: 'driverRequests', label: t('navUpcomingRequests', language), icon: FileCheck2 }, { id: 'driverActiveTrip', label: t('navActiveTrip', language), icon: Route }, { id: 'driverWarehouses', label: t('navNearbyWarehouses', language), icon: Warehouse }, { id: 'driverPayments', label: t('navDriverPayments', language), icon: Wallet }, { id: 'driverTripHistory', label: t('navTripHistory', language), icon: Clock }]
    : [{ id: 'farmer', label: t('navHome', language), icon: Sprout }, { id: 'book', label: t('navBookSlot', language), icon: CalendarDays }, { id: 'myBookings', label: t('navMyBookings', language), icon: FileCheck2 }, { id: 'truckPool', label: t('navTruckPool', language), icon: Truck }, { id: 'tractorPool', label: t('navTractorPool', language), icon: Tractor }, { id: 'rates', label: t('navMspRates', language), icon: IndianRupee }];

  const homeScreen: Screen = role === 'officer' ? 'officer' : role === 'driver' ? 'driver' : 'farmer';
  const profileScreen: Screen = role === 'officer' ? 'officerProfile' : role === 'driver' ? 'driverProfile' : 'farmerProfile';

  return <div className="min-h-screen bg-[#F7F8F5]"><Header language={language} setLanguage={setLanguage} /><div className="mx-auto flex max-w-7xl"><aside className="hidden w-60 shrink-0 border-r border-[#D9E0E3]/80 px-5 py-8 md:block"><div className="mb-9 px-3"><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-secondary">{role === 'officer' ? t('mandiOperations', language) : role === 'driver' ? t('driverSpace', language) : t('farmerSpace', language)}</p><p className="mt-1 font-display font-semibold text-navy">{role === 'officer' ? t('jaipurCentral', language) : displayName(userProfile)}</p></div><nav className="space-y-1">{nav.map((item) => <button key={item.id} onClick={() => setScreen(item.id)} className={`side-nav ${active === item.id ? 'active' : ''}`}><item.icon size={18} />{item.label}</button>)}</nav><div className="mt-10 border-t border-line pt-5"><button onClick={() => setScreen(profileScreen)} className={`side-nav ${active === profileScreen ? 'active' : ''}`}><UserRound size={18} />{t('myProfile', language)}</button><button onClick={onSignOut} className="side-nav text-ink-secondary"><ArrowRight size={18} className="rotate-180" />{t('signOut', language)}</button></div></aside><main className="min-w-0 flex-1 px-5 py-7 pb-24 sm:px-8 lg:px-12 lg:py-10">{children}</main></div><nav className="fixed bottom-0 left-0 right-0 z-20 flex border-t border-line bg-white/95 px-2 py-2 backdrop-blur md:hidden">{nav.map((item) => <button key={item.id} onClick={() => setScreen(item.id)} className={`bottom-nav ${active === item.id ? 'active' : ''}`}><item.icon size={19} /><span>{item.label}</span></button>)}</nav></div>;
}

function PageBack({ title, onBack }: { title: string; onBack: () => void }) {
  return <div className="flex items-center gap-3"><button className="icon-button" onClick={onBack}><ChevronLeft size={19} /></button><h1 className="font-display text-3xl font-semibold tracking-tight text-navy">{title}</h1></div>;
}

function ActionCard({ icon: Icon, label, detail, onClick }: { icon: IconType; label: string; detail: string; onClick: () => void }) {
  return <button onClick={onClick} className="action-card"><div className="action-icon"><Icon size={20} /></div><div className="mt-4 text-left"><p className="font-semibold text-ink">{label}</p><p className="mt-1 text-xs text-ink-secondary">{detail}</p></div><ChevronRight className="absolute right-3 top-3 text-ink-secondary" size={16} /></button>;
}

function Info({ label, value }: { label: string; value: string }) {
  return <div><p className="text-xs text-ink-secondary">{label}</p><p className="mt-1 text-sm font-semibold text-ink">{value}</p></div>;
}

function StatCard({ label, value, detail, icon: Icon, green = false }: { label: string; value: string; detail: string; icon: IconType; green?: boolean }) {
  return <div className="stat-card"><div className={`stat-icon ${green ? 'green' : ''}`}><Icon size={19} /></div><div><p className="text-sm text-ink-secondary">{label}</p><p className="mt-1 font-display text-3xl font-semibold text-navy">{value}</p><p className="mt-1 text-xs text-ink-secondary">{detail}</p></div></div>;
}



function FarmerDashboard({ setScreen, language, setLanguage, role, onSignOut }: { setScreen: (screen: Screen) => void; language: Language; setLanguage: (value: Language) => void; role: Role; onSignOut: () => void }) {
  const { userProfile } = useUserProfile();
  const { getVerification } = useCropVerifications();
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const locale = language === 'hi' ? 'hi-IN' : 'en-IN';
  const dateStr = currentTime.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const timeStr = currentTime.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const hour = currentTime.getHours();
  const greetingKey = greetingFor(hour);
 return (
  <DashboardLayout language={language} setLanguage={setLanguage} active="farmer" setScreen={setScreen} role={role} onSignOut={onSignOut}>
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <p className="eyebrow">{dateStr} · {timeStr}</p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-navy sm:text-4xl">{t(greetingKey, language)}, {displayName(userProfile)}</h1>
        <div className="mt-2 flex items-center gap-1.5 text-sm text-ink-secondary"><MapPin size={15} className="text-agri-green" /> {displayLocation(userProfile)}</div>
      </div>
      <button className="icon-button self-start sm:self-auto"><Bell size={19} /><span className="notification-dot" /></button>
    </div>
    
    <div className="mt-8 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
      <div className="weather-card">
        <div className="weather-bg-overlay" />
        <div className="weather-content">
          <div className="weather-top">
            <div>
              <p className="text-sm font-medium text-white/90">{t('todaysWeather', language)}</p>
              <p className="mt-3 font-display text-4xl font-semibold text-white">28° <span className="text-xl font-medium">C</span></p>
              <p className="mt-1 text-sm text-white/85">{t('sunnyClearWeather', language)}</p>
              <p className="mt-1 flex items-center gap-1 text-xs text-white/75"><MapPin size={12} /> {displayLocation(userProfile)}</p>
            </div>
            <SunMedium size={65} strokeWidth={1.4} className="text-saffron" />
          </div>
          <div className="weather-meta">
            <span>{t('humidity', language)} <b>42%</b></span>
            <span>{t('wind', language)} <b>12 km/h</b></span>
            <span>{t('rain', language)} <b>0%</b></span>
          </div>
        </div>
      </div>
      
      <div className="status-card">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-ink-secondary">{t('nextMandiVisit', language)}</p>
          <div className="status-pill"><span /> {t('tomorrow', language)}</div>
        </div>
        <p className="mt-5 font-display text-2xl font-semibold text-navy">{t('jaipurCentral', language)}</p>
        <p className="mt-1 text-sm text-ink-secondary">{t('wednesdayTime', language)}</p>
        <button onClick={() => setScreen('pass')} className="mt-5 text-sm font-semibold text-agri-green">{t('viewDigitalPass', language)} <ArrowRight size={15} className="ml-1 inline" /></button>
      </div>
    </div>
    
    <section className="mt-10">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="section-title">{t('whatToDo', language)}</h2>
        <span className="text-xs text-ink-secondary">{t('quickActions', language)}</span>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <ActionCard icon={CalendarDays} label={t('bookSlotAction', language)} detail={t('chooseTimeCrop', language)} onClick={() => setScreen('book')} />
        <ActionCard icon={FileCheck2} label={t('myBookings', language)} detail={t('viewManageBookings', language)} onClick={() => setScreen('myBookings')} />
        <ActionCard icon={Wallet} label={t('trackPayment', language)} detail={t('trackPaymentDesc', language)} onClick={() => setScreen('trackPayment')} />
        <ActionCard icon={Truck} label={t('navTruckPool', language)} detail={t('truckPoolDesc', language)} onClick={() => setScreen('truckPool')} />
        <ActionCard icon={IndianRupee} label={t('checkMspRates', language)} detail={t('todaysFairPrices', language)} onClick={() => setScreen('rates')} />
      </div>
    </section>
    
    <section className="mt-10">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="section-title">{t('todaysMspRates', language)}</h2>
        <button onClick={() => setScreen('rates')} className="text-sm font-semibold text-agri-green">{t('seeAll', language)} <ArrowRight size={15} className="ml-1 inline" /></button>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {cropRates.map((item) => (
          <div key={item.en} className="rate-card">
            <div className={`crop-icon ${item.color}`}><Leaf size={18} /></div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-ink">{item[language]}</p>
              <p className="text-xs text-ink-secondary">{t('perQuintal', language)}</p>
            </div>
            <div className="text-right">
              <p className="font-display text-lg font-semibold text-navy">{item.rate}</p>
              <p className="text-xs font-semibold text-agri-green">{item.change}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
    
    {(() => { 
      const ver = getVerification(displayName(userProfile)); 
      if (!ver || !ver.status) return null; 
      return (
        <section className="mt-10">
          <h2 className="section-title">{t('cropStatusTitle', language)}</h2>
          {ver.status === 'accepted' ? (
            <div className="mt-4 rounded-2xl border border-success-light bg-success-light p-5">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={20} className="text-agri-green" />
                <span className="font-semibold text-agri-green">{t('cropAccepted', language)}</span>
              </div>
              {ver.moistureContent && (
                <p className="mt-3 text-sm text-ink-secondary">{t('moistureContent', language)}: <span className="font-semibold text-ink">{ver.moistureContent}%</span></p>
              )}
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-danger-light bg-danger-light p-5">
              <div className="flex items-center gap-2">
                <X size={20} className="text-danger" />
                <span className="font-semibold text-danger">{t('cropRejected', language)}</span>
              </div>
              <p className="mt-3 text-sm text-ink-secondary">{t('rejectionReasonLabel', language)}: <span className="font-semibold text-ink">{reasonLabel(ver.rejectionReason, language)}</span></p>
              {ver.rejectionRemarks && (
                <p className="mt-1 text-sm text-ink-secondary">{t('officerRemarksLabel', language)}: <span className="font-semibold text-ink">{ver.rejectionRemarks}</span></p>
              )}
              {ver.moistureContent && (
                <p className="mt-1 text-sm text-ink-secondary">{t('moistureContent', language)}: <span className="font-semibold text-ink">{ver.moistureContent}%</span></p>
              )}
            </div>
          )}
        </section>
      ); 
    })()}
  </DashboardLayout>
  );
}

function BookScreen({ setScreen, language, setLanguage, role, onSignOut, bookingData, initialTime, resetKey }: BookScreenProps) {
  const [step, setStep] = useState(0);
  const [crop, setCrop] = useState('');
  const [centre, setCentre] = useState<ProcurementCentre | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState(initialTime ?? '');
  const [quantity, setQuantity] = useState('24');
  const [unit, setUnit] = useState('Quintal');
  const [submitted, setSubmitted] = useState(false);
  const [cropSearch, setCropSearch] = useState('');
  useEffect(() => { if (initialTime) setSelectedTime(initialTime); }, [resetKey, initialTime]);

  const filteredCrops = allCrops.filter((c) => c.en.toLowerCase().includes(cropSearch.toLowerCase()) || c.hi.includes(cropSearch));
  const centres = crop ? centresForCrop(crop) : [];

  const steps = [t('stepCrop', language), t('stepCentre', language), t('stepDateTime', language), t('stepConfirm', language)];

  const handleConfirm = () => {
    if (!crop || !centre || !selectedDate || !selectedTime) return;
    bookingData.createBooking(crop, centre.id, centre.name, selectedDate, selectedTime, quantity, unit);
    setSubmitted(true);
  };

  const reset = () => {
    setStep(0); setCrop(''); setCentre(null); setSelectedDate(''); setSelectedTime(''); setSubmitted(false); setCropSearch('');
  };

  if (submitted) {
    return <DashboardLayout language={language} setLanguage={setLanguage} active="book" setScreen={setScreen} role={role} onSignOut={onSignOut}><PageBack title={t('bookMandiSlot', language)} onBack={() => setScreen('farmer')} /><div className="mx-auto mt-7 max-w-2xl"><div className="success-panel"><div className="success-icon"><Check size={28} /></div><h2 className="mt-5 font-display text-3xl font-semibold text-navy">{t('slotBookedSuccess', language)}</h2><p className="mt-3 leading-7 text-ink-secondary">{t('passReady', language)}</p><div className="booking-summary"><span>{centre!.name}</span><strong>{selectedDate} · {selectedTime}</strong><span>{cropName(crop, language)} · {quantity} {unit}</span></div><div className="mt-5 flex gap-3"><button onClick={() => setScreen('pass')} className="primary-button flex-1 justify-center">{t('viewMyPass', language)} <QrCode size={18} /></button><button onClick={() => setScreen('myBookings')} className="secondary-button flex-1 justify-center">{t('myBookings', language)} <FileCheck2 size={18} /></button></div></div></div></DashboardLayout>;
  }

  return <DashboardLayout language={language} setLanguage={setLanguage} active="book" setScreen={setScreen} role={role} onSignOut={onSignOut}><PageBack title={t('bookMandiSlot', language)} onBack={() => setScreen('farmer')} /><div className="mx-auto mt-7 max-w-2xl">
    <div className="step-indicator">{steps.map((label, i) => <div key={i} className="step"><div className={`step-dot ${i === step ? 'active' : i < step ? 'done' : ''}`}>{i < step ? <Check size={14} /> : i + 1}</div><span className={`step-label ${i === step ? 'active' : ''}`}>{label}</span>{i < steps.length - 1 && <div className={`step-bar ${i < step ? 'done' : ''}`} />}</div>)}</div>

    {step === 0 && <div className="form-card"><h2 className="font-display text-2xl font-semibold text-navy">{t('selectCrop', language)}</h2><div className="mt-4 search-field"><Search size={16} /><input placeholder={t('searchCrop', language)} value={cropSearch} onChange={(e) => setCropSearch(e.target.value)} /></div><div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">{filteredCrops.map((item) => <button key={item.en} onClick={() => { setCrop(item.en); setCentre(null); setSelectedDate(''); setSelectedTime(''); setStep(1); }} className={`choice-button ${crop === item.en ? 'selected' : ''} justify-start`}><Leaf size={16} /> {item[language]}</button>)}</div></div>}

    {step === 1 && <div><div className="mb-4 flex items-center gap-2 text-sm text-ink-secondary"><Leaf size={15} className="text-agri-green" /> {cropName(crop, language)}</div>{centres.length === 0 ? <p className="text-sm text-ink-secondary">{t('noCentresForCrop', language)}</p> : <div className="space-y-3">{centres.map((c) => { const avail = bookingData.getAvailableSlotCount(c.id); const isFull = avail === 0; return <div key={c.id} className={`centre-card ${isFull ? 'disabled' : ''} ${centre?.id === c.id ? 'border-2 border-navy' : ''}`}><div className="centre-card-top"><div><p className="centre-name">{c.name}</p><p className="centre-area"><MapPin size={12} /> {c.area}</p></div><span className="centre-distance">{c.distanceKm} km</span></div><div className="flex items-center justify-between"><span className={`slot-badge ${isFull ? 'full' : 'available'}`}>{isFull ? t('noSlotsAvailable', language) : `${avail} ${t('slotsAvailable', language)}`}</span>{isFull ? <span className="text-xs font-semibold text-ink-secondary">{t('full', language)}</span> : <button onClick={() => { setCentre(c); setStep(2); }} className="secondary-button justify-center">{t('selectCentre', language)}</button>}</div></div>; })}</div>}</div>}

    {step === 2 && centre && <div className="form-card"><div className="mb-4 flex items-center gap-2 text-sm text-ink-secondary"><Leaf size={15} className="text-agri-green" /> {cropName(crop, language)} <span className="text-ink-secondary">·</span> <MapPin size={15} className="text-agri-green" /> {centre.name}</div><label className="field-label">{t('chooseDate', language)}</label><div className="mt-2 flex gap-2 overflow-x-auto pb-2">{availableDates.map((date) => <button key={date} onClick={() => setSelectedDate(date)} className={`choice-button ${selectedDate === date ? 'selected' : ''} justify-start whitespace-nowrap`}><CalendarDays size={16} /> {date}</button>)}</div><label className="field-label mt-5">{t('availableTimeSlots', language)}</label>{selectedDate ? <div className="mt-2 flex flex-wrap gap-2">{availableTimes.map((time) => { const available = bookingData.isSlotAvailable(centre.id, selectedDate, time); return <button key={time} disabled={!available} onClick={() => setSelectedTime(time)} className={`choice-button ${selectedTime === time ? 'selected' : ''} justify-start ${!available ? 'cursor-not-allowed opacity-40' : ''}`}>{!available && <span className="mr-1 text-xs font-semibold text-danger">{t('slotTaken', language)}</span>}<Clock3 size={16} /> {time}</button>; })}</div> : <p className="mt-2 text-xs text-ink-secondary">{t('chooseDate', language)}</p>}</div>}

    {step === 3 && centre && <div className="form-card"><h2 className="font-display text-2xl font-semibold text-navy">{t('reviewBooking', language)}</h2><div className="mt-6 space-y-4"><Info label={t('crop', language)} value={cropName(crop, language)} /><Info label={t('procurementCentre', language)} value={centre.name} /><Info label={t('date', language)} value={selectedDate} /><Info label={t('arrivalTime', language)} value={selectedTime} /><div><label className="field-label">{t('expectedQuantity', language)}</label><div className="mt-1 flex items-center gap-2"><input className="text-input" value={quantity} onChange={(event) => setQuantity(event.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="24" inputMode="numeric" /><select className="text-input max-w-[130px]" value={unit} onChange={(event) => setUnit(event.target.value)}><option>Quintal</option><option>Kg</option></select></div></div></div><button onClick={handleConfirm} className="primary-button mt-8 w-full justify-center">{t('confirmBooking', language)} <Check size={18} /></button></div>}

    {step > 0 && !submitted && <div className="mt-5 flex gap-3"><button onClick={() => setStep(step - 1)} className="secondary-button flex-1 justify-center"><ChevronLeft size={18} /> {t('backStep', language)}</button>{step < 3 && <button onClick={() => { if (step === 1 && centre) setStep(2); else if (step === 2 && selectedDate && selectedTime) setStep(3); }} disabled={(step === 2 && (!selectedDate || !selectedTime)) || (step === 1 && !centre)} className="primary-button flex-1 justify-center disabled:cursor-not-allowed disabled:opacity-40">{t('nextStep', language)} <ChevronRight size={18} /></button>}</div>}
  </div></DashboardLayout>;
}

function PassScreen({ setScreen, language, setLanguage, role, onSignOut, bookingData }: { setScreen: (screen: Screen) => void; language: Language; setLanguage: (value: Language) => void; role: Role; onSignOut: () => void; bookingData: ReturnType<typeof useBookingData> }) {
  const homeScreen: Screen = role === 'officer' ? 'officer' : 'farmer';
  const { userProfile } = useUserProfile();
  const booking = bookingData.latestBooking;
  const [toast, setToast] = useState(false);

  const showToast = (msg: string) => { setToast(true); setTimeout(() => setToast(false), 2500); };

  const farmerName = displayName(userProfile);

  const passText = booking ? [
    `Fasal Flow - Digital Pass`,
    `Booking ID: ${booking.id}`,
    `Name: ${farmerName}`,
    `Crop: ${cropName(booking.crop, language)}`,
    `Quantity: ${booking.quantity} ${booking.unit}`,
    `Procurement Centre: ${booking.centreName}`,
    `Date: ${booking.date}`,
    `Time: ${booking.time}`,
    `Status: ${booking.status === 'confirmed' ? t('confirmed', language) : t('cancelled', language)}`,
  ].join('\n') : '';

  const handleDownload = () => {
    if (!booking) return;
    const pdfContent = generatePassPDF(booking, farmerName, language);
    const blob = new Blob([pdfContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FasalFlow-Pass-${booking.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    if (!booking) return;
    if (navigator.share) {
      try { await navigator.share({ title: 'Fasal Flow Pass', text: passText }); } catch { /* user cancelled */ }
    } else if (navigator.clipboard) {
      try { await navigator.clipboard.writeText(passText); showToast(t('passCopied', language)); } catch { /* ignore */ }
    } else {
      const ta = document.createElement('textarea'); ta.value = passText; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta); showToast(t('passCopied', language));
    }
  };

  if (!booking) {
    return <DashboardLayout language={language} setLanguage={setLanguage} active="pass" setScreen={setScreen} role={role} onSignOut={onSignOut}><PageBack title={t('myDigitalPassTitle', language)} onBack={() => setScreen(homeScreen)} /><div className="mx-auto mt-7 max-w-2xl"><div className="panel text-center"><div className="screen-icon mx-auto"><QrCode size={25} /></div><h2 className="mt-5 font-display text-2xl font-semibold text-navy">{t('noPassYet', language)}</h2><button onClick={() => setScreen('book')} className="primary-button mt-6 justify-center">{t('bookSlotNow', language)} <CalendarDays size={18} /></button></div></div></DashboardLayout>;
  }

  return <DashboardLayout language={language} setLanguage={setLanguage} active="pass" setScreen={setScreen} role={role} onSignOut={onSignOut}><PageBack title={t('myDigitalPassTitle', language)} onBack={() => setScreen(homeScreen)} /><div className="mx-auto mt-7 max-w-2xl"><div className="pass-card"><div className="flex items-start justify-between"><div><div className="status-pill"><span /> {t('confirmed', language)}</div><h2 className="mt-5 font-display text-3xl font-semibold text-navy">{booking.centreName}</h2><p className="mt-1 text-ink-secondary">{t('gate2FarmerEntry', language)}</p></div><div className="qr-box"><QrCode size={72} strokeWidth={1.4} /><span>{t('scanAtGate', language)}</span></div></div><div className="my-8 h-px bg-line" /><div className="grid grid-cols-2 gap-y-6 sm:grid-cols-4"><Info label={t('bookingId', language)} value={booking.id} /><Info label={t('date', language)} value={booking.date} /><Info label={t('arrivalTime', language)} value={booking.time} /><Info label={t('crop', language)} value={cropName(booking.crop, language)} /><Info label={t('quantity', language)} value={`${booking.quantity} ${booking.unit}`} /></div><div className="mt-8 rounded-2xl bg-[#F7F8F5] p-4 text-sm leading-6 text-ink-secondary"><strong className="text-ink">{t('remember', language)}</strong> {t('rememberNotice', language)}</div></div><div className="mt-4 flex gap-3"><button onClick={handleDownload} className="secondary-button flex-1 justify-center"><Download size={18} /> {t('downloadPass', language)}</button><button onClick={handleShare} className="secondary-button flex-1 justify-center"><Share2 size={18} /> {t('sharePass', language)}</button></div></div>{toast && <div className="toast"><Check size={16} /> {t('passCopied', language)}</div>}</DashboardLayout>;
}

function generatePassPDF(booking: Booking, farmerName: string, lang: Language): string {
  const lines = [
    'Fasal Flow - Digital Pass',
    '============================',
    '',
    `Booking ID:     ${booking.id}`,
    `Name:           ${farmerName}`,
    `Crop:           ${cropName(booking.crop, lang)}`,
    `Quantity:       ${booking.quantity} ${booking.unit}`,
    `Centre:         ${booking.centreName}`,
    `Date:           ${booking.date}`,
    `Time:           ${booking.time}`,
    `Status:         ${booking.status === 'confirmed' ? 'Confirmed' : 'Cancelled'}`,
    '',
    '============================',
    'Please present this pass at the gate.',
  ];
  return lines.join('\n');
}

function RatesScreen({ setScreen, language, setLanguage, role, onSignOut }: { setScreen: (screen: Screen) => void; language: Language; setLanguage: (value: Language) => void; role: Role; onSignOut: () => void }) {
  const [selected, setSelected] = useState('Wheat');
  const homeScreen: Screen = role === 'officer' ? 'officer' : 'farmer';
  return <DashboardLayout language={language} setLanguage={setLanguage} active="rates" setScreen={setScreen} role={role} onSignOut={onSignOut}><PageBack title={t('liveMspRates', language)} onBack={() => setScreen(homeScreen)} /><div className="mt-3 flex items-center gap-2 text-sm text-ink-secondary"><span className="live-dot" /> {t('updatedToday', language)}</div><div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_.9fr]"><div className="panel"><div className="flex items-center justify-between"><div><p className="text-sm text-ink-secondary">{t('currentMsp', language)}</p><p className="mt-1 font-display text-4xl font-semibold text-navy">₹2,275 <span className="text-base font-medium text-ink-secondary">/ quintal</span></p></div><div className="rate-up">+4.2% <span>{t('thisSeason', language)}</span></div></div><div className="chart mt-8"><div className="chart-labels"><span>₹2,400</span><span>₹2,200</span><span>₹2,000</span></div><svg viewBox="0 0 500 180" preserveAspectRatio="none" className="h-40 w-full"><defs><linearGradient id="fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#2F5D7C" stopOpacity=".22" /><stop offset="1" stopColor="#2F5D7C" stopOpacity="0" /></linearGradient></defs><path d="M0,145 C55,134 70,150 110,112 S170,130 210,92 S255,115 300,72 S345,83 375,48 S430,62 500,18 V180 H0Z" fill="url(#fill)" /><path d="M0,145 C55,134 70,150 110,112 S170,130 210,92 S255,115 300,72 S345,83 375,48 S430,62 500,18" fill="none" stroke="#2F5D7C" strokeWidth="3" strokeLinecap="round" /></svg><div className="flex justify-between text-xs text-ink-secondary"><span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span></div></div></div><div className="panel"><h2 className="section-title">{t('compareCrops', language)}</h2><div className="mt-5 space-y-2">{cropRates.map((item) => <button key={item.en} onClick={() => setSelected(item.en)} className={`rate-row ${selected === item.en ? 'selected' : ''}`}><div className={`crop-icon small ${item.color}`}><Leaf size={15} /></div><div className="flex-1 text-left"><p className="font-medium text-ink">{item[language]}</p><p className="text-xs text-ink-secondary">{t('msp2024', language)}</p></div><div className="text-right"><p className="font-semibold text-ink">{item.rate}</p><p className="text-xs text-agri-green">{item.change}</p></div></button>)}</div><div className="mt-6 flex items-start gap-2 text-xs leading-5 text-ink-secondary"><ShieldCheck size={14} className="mt-0.5 shrink-0 text-agri-green" /> {t('ratesSource', language)}</div></div></div></DashboardLayout>;
}

function TransportScreen({ setScreen, language, setLanguage, role, onSignOut }: { setScreen: (screen: Screen) => void; language: Language; setLanguage: (value: Language) => void; role: Role; onSignOut: () => void }) {
  const { userProfile } = useUserProfile();
  const pickupDefault = displayLocation(userProfile) !== t('locationNotSet', language) ? displayLocation(userProfile) : 'Chomu, Jaipur';
  return <DashboardLayout language={language} setLanguage={setLanguage} active="transport" setScreen={setScreen} role={role} onSignOut={onSignOut}><PageBack title={t('findTransportTitle', language)} onBack={() => setScreen('farmer')} /><div className="mt-7 grid gap-5 lg:grid-cols-[.8fr_1.2fr]"><div className="panel"><div className="screen-icon"><Truck size={24} /></div><h2 className="mt-5 font-display text-2xl font-semibold text-navy">{t('moveYourHarvest', language)}</h2><p className="mt-2 text-sm leading-6 text-ink-secondary">{t('transportSubtitle', language)}</p><label className="field-label mt-7">{t('pickupLocation', language)}</label><div className="phone-field"><MapPin size={17} className="text-agri-green" /><input defaultValue={pickupDefault} /></div><label className="field-label mt-5">{t('loadSize', language)}</label><select className="text-input"><option>Up to 25 Quintal</option><option>25–50 Quintal</option></select><button className="primary-button mt-6 w-full justify-center">{t('findVehicles', language)} <Search size={18} /></button></div><div className="space-y-3"><p className="text-sm font-medium text-ink-secondary">{t('verifiedVehiclesNearby', language)}</p>{[['Mahindra Bolero Pickup', 'Raju Singh', '₹850', '2.4 km'], ['Tata 407 Truck', 'Vijay Transport', '₹1,400', '5.1 km'], ['Tractor trolley', 'Gopal Meena', '₹650', '7.8 km']].map(([vehicle, owner, price, distance]) => <div className="vehicle-card" key={vehicle}><div className="vehicle-icon"><Truck size={21} /></div><div className="min-w-0 flex-1"><p className="font-semibold text-ink">{vehicle}</p><p className="mt-1 text-sm text-ink-secondary">{owner} · <span className="text-agri-green">{t('verified', language)}</span></p><p className="mt-2 text-xs text-ink-secondary">{distance} {t('away', language)}</p></div><div className="text-right"><p className="font-semibold text-ink">{price} <span className="text-xs font-normal text-ink-secondary">{t('estimated', language)}</span></p><button className="mt-2 text-xs font-semibold text-agri-green">{t('request', language)}</button></div></div>)}</div></div></DashboardLayout>;
}

const nearbyLoads = [
  { farmer: 'Ramesh Kumar', crop: 'Wheat', quantity: '24 Quintal', pickup: 'Chomu, Jaipur', destination: 'Jaipur Central Mandi', date: 'Wed, 15 May', time: '09:30 AM', distance: 2.4, hours: 1 },
  { farmer: 'Sushila Devi', crop: 'Mustard', quantity: '12 Quintal', pickup: 'Amer, Jaipur', destination: 'Jaipur Central Mandi', date: 'Wed, 15 May', time: '10:00 AM', distance: 5.1, hours: 2 },
  { farmer: 'Mohan Lal', crop: 'Rice', quantity: '18 Quintal', pickup: 'Bassi, Jaipur', destination: 'Jaipur Central Mandi', date: 'Wed, 15 May', time: '10:30 AM', distance: 7.8, hours: 3 },
];

function TractorPoolScreen({ setScreen, language, setLanguage, role, onSignOut }: { setScreen: (screen: Screen) => void; language: Language; setLanguage: (value: Language) => void; role: Role; onSignOut: () => void }) {
  const [tab, setTab] = useState<'verify' | 'loads'>('verify');
  const [licenseUploaded, setLicenseUploaded] = useState(false);
  const [pollutionUploaded, setPollutionUploaded] = useState(false);
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [toast, setToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg: string) => { setToastMsg(msg); setToast(true); setTimeout(() => setToast(false), 2500); };

  const canSubmit = licenseUploaded && pollutionUploaded && vehicleNumber.length >= 6;

  const handleSubmit = () => {
    if (!canSubmit) return;
    setSubmitted(true);
    showToast(t('verificationPending', language));
    setTab('loads');
  };

  return <DashboardLayout language={language} setLanguage={setLanguage} active="tractorPool" setScreen={setScreen} role={role} onSignOut={onSignOut}><PageBack title={t('tractorPooling', language)} onBack={() => setScreen('farmer')} /><div className="mx-auto mt-7 max-w-2xl">
    <div className="pool-tab"><button className={tab === 'verify' ? 'active' : ''} onClick={() => setTab('verify')}><ShieldCheck size={16} /> {t('driverVerification', language)}</button><button className={tab === 'loads' ? 'active' : ''} onClick={() => setTab('loads')}><Truck size={16} /> {t('loadMatchingDashboard', language)}</button></div>

    {tab === 'verify' && <div className="form-card"><div className="screen-icon"><Tractor size={24} /></div><h2 className="mt-5 font-display text-2xl font-semibold text-navy">{t('driverVerification', language)}</h2><p className="mt-2 text-sm leading-6 text-ink-secondary">{t('verificationSubtitle', language)}</p>
      {submitted && <div className="mt-5"><span className="verification-badge pending"><Clock3 size={14} /> {t('verificationPending', language)}</span></div>}
      <div className="mt-6 space-y-5">
        <div><label className="field-label">{t('drivingLicense', language)}</label>
          <div className={`upload-box ${licenseUploaded ? 'uploaded' : ''}`} onClick={() => setLicenseUploaded(!licenseUploaded)}>
            {licenseUploaded ? <><CheckCircle2 size={28} className="upload-icon" /><span className="upload-text">{t('uploadComplete', language)}</span></> : <><Upload size={28} className="upload-icon" /><span className="upload-text">{t('uploadLicense', language)}</span></>}
          </div>
        </div>
        <div><label className="field-label">{t('vehicleNumber', language)}</label><input className="text-input" value={vehicleNumber} onChange={(e) => setVehicleNumber(e.target.value.toUpperCase().slice(0, 12))} placeholder={t('enterVehicleNumber', language)} /></div>
        <div><label className="field-label">{t('pollutionCert', language)}</label>
          <div className={`upload-box ${pollutionUploaded ? 'uploaded' : ''}`} onClick={() => setPollutionUploaded(!pollutionUploaded)}>
            {pollutionUploaded ? <><CheckCircle2 size={28} className="upload-icon" /><span className="upload-text">{t('uploadComplete', language)}</span></> : <><Upload size={28} className="upload-icon" /><span className="upload-text">{t('uploadPollutionCert', language)}</span></>}
          </div>
        </div>
      </div>
      <button onClick={handleSubmit} disabled={!canSubmit} className="primary-button mt-7 w-full justify-center disabled:cursor-not-allowed disabled:opacity-40">{submitted ? <><CheckCircle2 size={18} /> {t('verificationPending', language)}</> : <>{t('submitVerification', language)} <ArrowRight size={18} /></>}</button>
    </div>}

    {tab === 'loads' && <div>
      {!submitted && <div className="mb-4 panel" style={{ borderColor: '#FBF3E4', background: '#FBF3E4' }}><p className="text-sm text-ink-secondary">{t('verificationSubtitle', language)}</p><button onClick={() => setTab('verify')} className="text-sm font-semibold text-agri-green mt-2">{t('driverVerification', language)} →</button></div>}
      <p className="mb-3 text-sm font-medium text-ink-secondary">{t('loadMatchingSubtitle', language)}</p>
      {nearbyLoads.length === 0 ? <div className="panel text-center"><p className="text-sm text-ink-secondary">{t('noLoadsAvailable', language)}</p></div> : <div className="space-y-3">{nearbyLoads.map((load, i) => <div key={i} className="load-card"><div className="flex items-start justify-between"><div className="flex items-center gap-3"><div className="vehicle-icon"><Truck size={21} /></div><div><p className="font-semibold text-ink">{load.farmer}</p><p className="mt-1 text-xs text-ink-secondary">{load.crop} · {load.quantity}</p></div></div><span className="load-match-tag"><MapPin size={12} /> {load.distance} km</span></div><div className="mt-4 grid grid-cols-2 gap-3"><Info label={t('pickupLocation', language)} value={load.pickup} /><Info label={t('procurementCentre', language)} value={load.destination} /><Info label={t('preferredDate', language)} value={load.date} /><Info label={t('preferredTime', language)} value={load.time} /></div><div className="mt-4 rounded-xl bg-[#F7F8F5] p-3 text-xs leading-5 text-ink-secondary"><div className="flex justify-between"><span>Distance Rate (₹100/km)</span><span className="font-semibold text-ink">₹{(load.distance * 100).toLocaleString('en-IN')}</span></div><div className="mt-1 flex justify-between"><span>Time Rate (₹1,000/hr)</span><span className="font-semibold text-ink">₹{(load.hours * 1000).toLocaleString('en-IN')}</span></div></div><div className="mt-4 flex items-center justify-between"><p className="font-display text-lg font-semibold text-navy">₹{(load.distance * 100 + load.hours * 1000).toLocaleString('en-IN')} <span className="text-xs font-normal text-ink-secondary">{t('estimated', language)}</span></p><button onClick={() => showToast(t('acceptLoad', language))} className="primary-button justify-center text-sm">{t('acceptLoad', language)} <ArrowRight size={16} /></button></div></div>)}</div>}
    </div>}
  </div>{toast && <div className="toast"><Check size={16} /> {toastMsg}</div>}</DashboardLayout>;
}

function TrackPaymentScreen({ setScreen, language, setLanguage, role, onSignOut, bookingData }: { setScreen: (screen: Screen) => void; language: Language; setLanguage: (value: Language) => void; role: Role; onSignOut: () => void; bookingData: ReturnType<typeof useBookingData> }) {
  const booking = bookingData.latestBooking;
  const crop = booking ? cropName(booking.crop, language) : 'Wheat';
  const quantity = booking ? parseInt(booking.quantity, 10) || 24 : 24;
  const mspPerQuintal = booking ? (cropRates.find((c) => c.en === booking.crop)?.rate?.replace(/[^0-9]/g, '') || '2275') : '2275';
  const mspNum = parseInt(mspPerQuintal, 10);
  const total = quantity * mspNum;

  const paymentSteps = [
    { label: t('paymentStep1', language) },
    { label: t('paymentStep2', language) },
    { label: t('paymentStep3', language) },
    { label: t('paymentStep4', language) },
  ];
  const currentStep = 2;

  return <DashboardLayout language={language} setLanguage={setLanguage} active="trackPayment" setScreen={setScreen} role={role} onSignOut={onSignOut}><PageBack title={t('trackPayment', language)} onBack={() => setScreen('farmer')} /><div className="mx-auto mt-7 max-w-2xl">
    {!booking ? <div className="panel text-center"><div className="screen-icon mx-auto"><Wallet size={25} /></div><h2 className="mt-5 font-display text-2xl font-semibold text-navy">{t('noBookingForPayment', language)}</h2><button onClick={() => setScreen('book')} className="primary-button mt-6 justify-center"><CalendarDays size={18} /> {t('bookSlotNow', language)}</button></div> : <>
      <div className="panel"><h2 className="section-title">{t('paymentCalculation', language)}</h2><div className="mt-5 space-y-4"><div className="flex items-center justify-between rounded-xl bg-[#F7F8F5] p-4"><div className="flex items-center gap-3"><div className="crop-icon small bg-[#DCE9DF] text-agri-green"><Leaf size={16} /></div><span className="text-sm font-medium text-ink-secondary">{t('crop', language)}</span></div><span className="font-semibold text-ink">{crop}</span></div><div className="flex items-center justify-between rounded-xl bg-[#F7F8F5] p-4"><div className="flex items-center gap-3"><div className="crop-icon small bg-[#DCE9DF] text-agri-green"><PackageCheck size={16} /></div><span className="text-sm font-medium text-ink-secondary">{t('cropWeight', language)}</span></div><span className="font-semibold text-ink">{quantity} Quintal</span></div><div className="flex items-center justify-between rounded-xl bg-[#F7F8F5] p-4"><div className="flex items-center gap-3"><div className="crop-icon small bg-[#DCE9DF] text-agri-green"><IndianRupee size={16} /></div><span className="text-sm font-medium text-ink-secondary">{t('mspRate', language)}</span></div><span className="font-semibold text-ink">₹{mspNum.toLocaleString('en-IN')} / Quintal</span></div><div className="flex items-center justify-between rounded-xl bg-success-light p-4 border border-success-light"><div className="flex items-center gap-3"><div className="crop-icon small bg-navy text-white"><Wallet size={16} /></div><span className="text-sm font-semibold text-success">{t('totalAmount', language)}</span></div><span className="font-display text-2xl font-semibold text-success">₹{total.toLocaleString('en-IN')}</span></div></div></div>

      <div className="mt-6 panel"><div className="mb-4 flex items-center gap-2"><Navigation size={16} className="text-agri-green" /><h2 className="section-title">{t('paymentStatus', language)}</h2></div><div className="tracker"><div className="tracker-tractor" style={{ left: `calc(${(currentStep / (paymentSteps.length - 1)) * 100}% - 14px)` }}><Wallet size={26} className="text-agri-green" /></div>{paymentSteps.map((step, i) => <div key={i} className={`tracker-step ${i < currentStep ? 'done' : i === currentStep ? 'active' : ''}`}><div className="tracker-dot">{i < currentStep ? <Check size={14} /> : i + 1}</div><span className="tracker-label">{step.label}</span></div>)}</div></div>

      <div className="mt-5 flex gap-3"><button onClick={() => setScreen('farmer')} className="secondary-button flex-1 justify-center">{t('backToDashboard', language)}</button><button onClick={() => setScreen('myBookings')} className="primary-button flex-1 justify-center">{t('myBookings', language)} <FileCheck2 size={18} /></button></div>
    </>}
  </div></DashboardLayout>;
}

function reasonLabel(key: string, lang: Language): string {
  const labels: Record<string, string> = { highMoisture: t('reasonHighMoisture', lang), foreignParticles: t('reasonForeignParticles', lang), damagedGrain: t('reasonDamagedGrain', lang), poorQuality: t('reasonPoorQuality', lang), other: t('reasonOther', lang) };
  return labels[key] || key;
}

function OfficerDashboard({ setScreen, language, setLanguage, role, onSignOut }: { setScreen: (screen: Screen) => void; language: Language; setLanguage: (value: Language) => void; role: Role; onSignOut: () => void }) {
  const { userProfile } = useUserProfile();
  const [search, setSearch] = useState('');
  const [selectedFarmer, setSelectedFarmer] = useState<typeof queue[number] | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [moistureInput, setMoistureInput] = useState('');
  const { getMoisture, saveMoisture } = useMoistureRecords();
  const { getVerification, saveVerification } = useCropVerifications();
  const [moistureSaved, setMoistureSaved] = useState<string | null>(null);
  const [moistureToast, setMoistureToast] = useState(false);
  const [rejectMode, setRejectMode] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectionRemarks, setRejectionRemarks] = useState('');
  const [verificationToast, setVerificationToast] = useState(false);
  const [verificationToastMsg, setVerificationToastMsg] = useState('');
  const juteBag = useJuteBagStock();
  const [editingStock, setEditingStock] = useState(false);
  const [stockInput, setStockInput] = useState(String(juteBag.stock.available));
  const [capacityInput, setCapacityInput] = useState(String(juteBag.stock.capacity));
  const [stockToast, setStockToast] = useState(false);
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [orderForm, setOrderForm] = useState({ quantity: '', destination: '', date: availableDates[0] });
  const [orderToast, setOrderToast] = useState(false);
  useEffect(() => {
    const id = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  useEffect(() => { setMoistureInput(''); setMoistureSaved(selectedFarmer ? getMoisture(selectedFarmer.name) : null); setRejectMode(false); setRejectionReason(''); setRejectionRemarks(''); }, [selectedFarmer, getMoisture]);
  const filtered = useMemo(() => queue.filter((item) => item.name.toLowerCase().includes(search.toLowerCase())), [search]);
  const locale = language === 'hi' ? 'hi-IN' : 'en-IN';
  const dateStr = currentTime.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const timeStr = currentTime.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const hour = currentTime.getHours();
  const greetingKey = greetingFor(hour);
  return <DashboardLayout language={language} setLanguage={setLanguage} active="officer" setScreen={setScreen} role={role} onSignOut={onSignOut}><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="eyebrow">{dateStr} · {timeStr} · {t('liveOperations', language)}</p><h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-navy sm:text-4xl">{t(greetingKey, language)}, {displayName(userProfile)}</h1><p className="mt-2 flex items-center gap-1.5 text-sm text-ink-secondary"><MapPin size={15} className="text-agri-green" /> {userProfile.state || t('jaipurCentral', language)}</p></div><button onClick={() => setScreen('scanner')} className="primary-button self-start"><ScanLine size={18} /> {t('scanDigitalPass', language)}</button></div><div className="mt-8 grid gap-3 sm:grid-cols-3"><StatCard label={t('expectedToday', language)} value="48" detail={t('farmersScheduled', language)} icon={Users} /><StatCard label={t('checkedIn', language)} value="17" detail={t('ofArrivals', language)} icon={Check} green /><StatCard label={t('stockReceived', language)} value="126 T" detail={t('acrossAllCrops', language)} icon={PackageCheck} /></div><div className="mt-8 grid gap-6 xl:grid-cols-[1.5fr_.8fr]"><div className="panel"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div><h2 className="section-title">{t('incomingFarmersQueue', language)}</h2><p className="mt-1 text-sm text-ink-secondary">{t('todaysArrivals', language)}</p></div><div className="search-field"><Search size={16} /><input placeholder={t('searchFarmer', language)} value={search} onChange={(event) => setSearch(event.target.value)} /></div></div><div className="mt-5 overflow-x-auto"><table className="w-full min-w-[580px] text-left"><thead><tr><th>{t('farmer', language)}</th><th>{t('cropQuantity', language)}</th><th>{t('arrivalTimeCol', language)}</th><th>{t('status', language)}</th><th /></tr></thead><tbody>{filtered.length === 0 ? <tr><td colSpan={5} className="py-8 text-center text-sm text-ink-secondary">{t('noResultsFound', language)}</td></tr> : filtered.map((item) => <tr key={item.name} className="farmer-row" onClick={() => setSelectedFarmer(item)}><td><div className="flex items-center gap-3"><div className="avatar">{item.name.split(' ').map((word) => word[0]).join('')}</div><span className="font-medium text-ink">{item.name}</span></div></td><td><span className="text-sm font-medium text-ink">{locField(item.crop, language)}</span><span className="ml-2 text-xs text-ink-secondary">{locField(item.quantity, language)}</span></td><td className="text-sm text-ink-secondary">{item.time}</td><td><span className={`table-status ${item.status === 'checkedIn' ? 'checked' : ''}`}><span />{item.status === 'checkedIn' ? t('checkedInStatus', language) : t('arrivingStatus', language)}</span></td><td><button className="p-2 text-ink-secondary hover:text-ink" onClick={(e) => { e.stopPropagation(); setSelectedFarmer(item); }}><MoreHorizontal size={18} /></button></td></tr>)}</tbody></table></div></div><div className="panel"><div className="flex items-start justify-between"><div><h2 className="section-title">{t('todaysOverview', language)}</h2><p className="mt-1 text-sm text-ink-secondary">{t('stockByCrop', language)}</p></div><BarChart3 className="text-agri-green" size={20} /></div><div className="mt-7 space-y-5">{[['Wheat', '62 T', '76%', 'bg-navy'], ['Mustard', '38 T', '48%', 'bg-saffron'], ['Rice', '26 T', '34%', 'bg-agri-green']].map(([label, value, percent, color]) => <div key={label as string}><div className="mb-2 flex justify-between text-sm"><span className="font-medium text-ink">{label}</span><span className="text-ink-secondary">{value}</span></div><div className="h-2 rounded-full bg-line"><div className={`h-2 rounded-full ${color}`} style={{ width: percent as string }} /></div></div>)}</div><button className="mt-7 flex items-center text-sm font-semibold text-agri-green">{t('viewFullAnalytics', language)} <ArrowRight size={15} className="ml-1" /></button></div></div>
  <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_1fr]"><div className="panel"><div className="flex items-center justify-between"><h2 className="section-title">{t('juteBagStock', language)}</h2><PackageCheck size={20} className="text-agri-green" /></div><div className="mt-5"><div className="mb-4 flex items-center justify-between"><div><p className="text-sm text-ink-secondary">{t('juteBagAvailable', language)}</p><p className="mt-1 font-display text-3xl font-semibold text-navy">{juteBag.stock.available} <span className="text-base font-normal text-ink-secondary">/ {juteBag.stock.capacity}</span></p></div><span className={`text-sm font-semibold ${juteBag.isOutOfStock ? 'text-danger' : juteBag.isLowStock ? 'text-saffron' : 'text-agri-green'}`}>{juteBag.isOutOfStock ? t('juteBagOutOfStock', language) : juteBag.isLowStock ? t('juteBagLowStock', language) : t('juteBagInStock', language)}</span></div><div className="h-3 rounded-full bg-line"><div className={`h-3 rounded-full transition-all ${juteBag.isOutOfStock ? 'bg-danger' : juteBag.isLowStock ? 'bg-saffron' : 'bg-agri-green'}`} style={{ width: `${juteBag.stockPercentage}%` }} /></div>{juteBag.isLowStock && <div className="mt-4 flex items-center gap-2 rounded-xl bg-danger-light p-3"><AlertTriangle size={16} className="shrink-0 text-danger" /><p className="text-xs font-medium text-danger">{t('lowJuteBagWarning', language)}</p></div>}{editingStock ? <div className="mt-5 space-y-3"><div><label className="field-label">{t('juteBagAvailable', language)}</label><input className="text-input" value={stockInput} onChange={(e) => setStockInput(e.target.value.replace(/\D/g, ''))} inputMode="numeric" /></div><div><label className="field-label">{t('juteBagCapacity', language)}</label><input className="text-input" value={capacityInput} onChange={(e) => setCapacityInput(e.target.value.replace(/\D/g, ''))} inputMode="numeric" /></div><div className="flex gap-3"><button onClick={() => { juteBag.updateAvailable(Number(stockInput) || 0); juteBag.updateCapacity(Number(capacityInput) || 1); setEditingStock(false); setStockToast(true); setTimeout(() => setStockToast(false), 2500); }} className="primary-button flex-1 justify-center"><Check size={16} /> {t('saveStock', language)}</button><button onClick={() => { setEditingStock(false); setStockInput(String(juteBag.stock.available)); setCapacityInput(String(juteBag.stock.capacity)); }} className="secondary-button flex-1 justify-center">{t('cancel', language)}</button></div></div> : <div className="flex gap-3"><button onClick={() => setEditingStock(true)} className="secondary-button flex-1 justify-center"><PackageCheck size={16} /> {t('updateStock', language)}</button><button onClick={() => setOrderModalOpen(true)} className="primary-button flex-1 justify-center"><Plus size={16} /> {t('orderJuteBags', language)}</button></div>}</div></div><div className="panel"><div className="flex items-center justify-between"><h2 className="section-title">{t('todaysOverview', language)}</h2><BarChart3 className="text-agri-green" size={20} /></div><div className="mt-7 space-y-5">{[['Wheat', '62 T', '76%', 'bg-navy'], ['Mustard', '38 T', '48%', 'bg-saffron'], ['Rice', '26 T', '34%', 'bg-agri-green']].map(([label, value, percent, color]) => <div key={label as string}><div className="mb-2 flex justify-between text-sm"><span className="font-medium text-ink">{label}</span><span className="text-ink-secondary">{value}</span></div><div className="h-2 rounded-full bg-line"><div className={`h-2 rounded-full ${color}`} style={{ width: percent as string }} /></div></div>)}</div></div></div>

  {selectedFarmer && <div className="modal-overlay" onClick={() => setSelectedFarmer(null)}><div className="modal-box" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}><div className="flex items-center justify-between"><div className="flex items-center gap-3"><div className="avatar" style={{ width: '44px', height: '44px', fontSize: '14px' }}>{selectedFarmer.name.split(' ').map((word) => word[0]).join('')}</div><div><h3 className="font-display text-xl font-semibold text-navy">{selectedFarmer.name}</h3><p className="text-xs text-ink-secondary">{t('farmerDetails', language)}</p></div></div><button className="icon-button" onClick={() => setSelectedFarmer(null)}><X size={18} /></button></div><div className="farmer-detail-section"><div className="farmer-detail-grid"><div className="farmer-detail-item"><span className="label">{t('crop', language)}</span><span className="value">{locField(selectedFarmer.crop, language)}</span></div><div className="farmer-detail-item"><span className="label">{t('expectedWeight', language)}</span><span className="value">{selectedFarmer.quantityValue} Quintal</span></div><div className="farmer-detail-item"><span className="label">{t('assignedSlot', language)}</span><span className="value">{selectedFarmer.date}</span></div><div className="farmer-detail-item"><span className="label">{t('arrivalTime', language)}</span><span className="value">{selectedFarmer.time}</span></div></div></div><div className="farmer-detail-section"><h4 className="mb-3 text-sm font-semibold text-ink">{t('farmerDetails', language)}</h4><div className="farmer-detail-grid"><div className="farmer-detail-item"><span className="label">{t('state', language)}</span><span className="value">{selectedFarmer.state}</span></div><div className="farmer-detail-item"><span className="label">{t('district', language)}</span><span className="value">{selectedFarmer.district}</span></div><div className="farmer-detail-item"><span className="label">{t('tehsil', language)}</span><span className="value">{selectedFarmer.tehsil}</span></div><div className="farmer-detail-item"><span className="label">{t('village', language)}</span><span className="value">{selectedFarmer.village}</span></div><div className="farmer-detail-item"><span className="label">{t('pinCodeLabel', language)}</span><span className="value">{selectedFarmer.pinCode}</span></div><div className="farmer-detail-item"><span className="label">{t('status', language)}</span><span className="value">{selectedFarmer.status === 'checkedIn' ? t('checkedInStatus', language) : t('arrivingStatus', language)}</span></div></div></div><div className="farmer-detail-section"><h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink"><Droplets size={16} className="text-blue-600" /> {t('moistureContent', language)}</h4><div className="flex items-center gap-3"><div className="action-icon"><Droplets size={18} className="text-blue-600" /></div><div className="flex-1"><input className="text-input" value={moistureInput} onChange={(e) => setMoistureInput(e.target.value.replace(/[^0-9.]/g, '').slice(0, 5))} placeholder={t('moistureContentPlaceholder', language)} inputMode="decimal" /><p className="mt-1 text-xs text-ink-secondary">{t('moistureContentHint', language)}</p></div></div>{moistureSaved && <p className="mt-2 text-sm font-semibold text-agri-green"><Check size={14} className="inline" /> {t('moistureRecord', language)}: {moistureSaved}%</p>}<button onClick={() => { if (selectedFarmer && moistureInput) { setMoistureSaved(moistureInput); saveMoisture(selectedFarmer.name, moistureInput); setMoistureToast(true); setTimeout(() => setMoistureToast(false), 2500); } }} disabled={!moistureInput} className="primary-button mt-3 w-full justify-center disabled:cursor-not-allowed disabled:opacity-40">{t('saveMoisture', language)}</button></div><div className="farmer-detail-section"><h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink"><CheckCircle2 size={16} className="text-agri-green" /> {t('procurementStatus', language)}</h4>{(() => { const ver = selectedFarmer ? getVerification(selectedFarmer.name) : null; if (ver?.status === 'accepted') return <div className="rounded-xl bg-success-light p-4"><div className="flex items-center gap-2 text-sm font-semibold text-agri-green"><CheckCircle2 size={16} /> {t('cropAccepted', language)}</div>{ver.moistureContent && <p className="mt-2 text-xs text-ink-secondary">{t('moistureContent', language)}: {ver.moistureContent}%</p>}</div>; if (ver?.status === 'rejected') return <div className="rounded-xl bg-danger-light p-4"><div className="flex items-center gap-2 text-sm font-semibold text-danger"><X size={16} /> {t('cropRejected', language)}</div><p className="mt-2 text-xs text-ink-secondary">{t('rejectionReasonLabel', language)}: {reasonLabel(ver.rejectionReason, language)}</p>{ver.rejectionRemarks && <p className="mt-1 text-xs text-ink-secondary">{t('officerRemarksLabel', language)}: {ver.rejectionRemarks}</p>}{ver.moistureContent && <p className="mt-1 text-xs text-ink-secondary">{t('moistureContent', language)}: {ver.moistureContent}%</p>}</div>; return <p className="text-sm text-ink-secondary">{t('noCropStatus', language)}</p>; })()}</div>{!rejectMode ? <div className="mt-6 flex gap-3"><button onClick={() => { if (selectedFarmer) { saveVerification(selectedFarmer.name, 'accepted', moistureInput || moistureSaved || '', '', ''); setVerificationToastMsg(t('acceptanceSaved', language)); setVerificationToast(true); setTimeout(() => setVerificationToast(false), 2500); setSelectedFarmer(null); } }} className="primary-button flex-1 justify-center"><CheckCircle2 size={18} /> {t('acceptCrop', language)}</button><button onClick={() => setRejectMode(true)} className="secondary-button flex-1 justify-center" style={{ color: '#B85C5C' }}><X size={18} /> {t('rejectCrop', language)}</button><button onClick={() => setSelectedFarmer(null)} className="secondary-button justify-center">{t('closeModal', language)}</button></div> : <div className="mt-6 space-y-4"><div><label className="field-label">{t('rejectionReason', language)}</label><select className="text-input" value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)}><option value="">{t('selectRejectionReason', language)}</option><option value="highMoisture">{t('reasonHighMoisture', language)}</option><option value="foreignParticles">{t('reasonForeignParticles', language)}</option><option value="damagedGrain">{t('reasonDamagedGrain', language)}</option><option value="poorQuality">{t('reasonPoorQuality', language)}</option><option value="other">{t('reasonOther', language)}</option></select></div>{rejectionReason === 'other' && <div><label className="field-label">{t('otherReasonRequired', language)}</label><textarea className="text-input" value={rejectionRemarks} onChange={(e) => setRejectionRemarks(e.target.value)} rows={2} /></div>}{rejectionReason !== 'other' && <div><label className="field-label">{t('additionalRemarks', language)}</label><textarea className="text-input" value={rejectionRemarks} onChange={(e) => setRejectionRemarks(e.target.value)} rows={2} /></div>}<div className="flex gap-3"><button onClick={() => { setRejectMode(false); setRejectionReason(''); setRejectionRemarks(''); }} className="secondary-button flex-1 justify-center">{t('cancel', language)}</button><button onClick={() => { if (selectedFarmer && rejectionReason && (rejectionReason !== 'other' || rejectionRemarks.trim())) { saveVerification(selectedFarmer.name, 'rejected', moistureInput || moistureSaved || '', rejectionReason, rejectionRemarks); setVerificationToastMsg(t('rejectionSaved', language)); setVerificationToast(true); setTimeout(() => setVerificationToast(false), 2500); setSelectedFarmer(null); } }} disabled={!rejectionReason || (rejectionReason === 'other' && !rejectionRemarks.trim())} className="primary-button flex-1 justify-center disabled:cursor-not-allowed disabled:opacity-40" style={{ background: '#B85C5C' }}>{t('rejectCrop', language)}</button></div></div>}</div></div>}
  {moistureToast && <div className="toast"><Check size={16} /> {t('moistureSaved', language)}</div>}
  {verificationToast && <div className="toast"><Check size={16} /> {verificationToastMsg}</div>}
  {stockToast && <div className="toast"><Check size={16} /> {t('stockUpdated', language)}</div>}
  {orderModalOpen && <div className="modal-overlay" onClick={() => setOrderModalOpen(false)}><div className="modal-box" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}><div className="flex items-center justify-between"><div className="flex items-center gap-3"><div className="action-icon"><PackageCheck size={20} /></div><div><h3 className="font-display text-xl font-semibold text-navy">{t('orderJuteBagsTitle', language)}</h3></div></div><button className="icon-button" onClick={() => setOrderModalOpen(false)}><X size={18} /></button></div><div className="mt-6 space-y-4"><div><label className="field-label">{t('orderQuantity', language)}</label><input className="text-input" value={orderForm.quantity} onChange={(e) => setOrderForm({ ...orderForm, quantity: e.target.value.replace(/\D/g, '').slice(0, 5) })} placeholder={t('orderQuantityHint', language)} inputMode="numeric" /></div><div><label className="field-label">{t('orderDestination', language)}</label><select className="text-input" value={orderForm.destination} onChange={(e) => setOrderForm({ ...orderForm, destination: e.target.value })}><option value="">Select destination</option>{procurementCentres.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}</select></div><div><label className="field-label">{t('orderRequiredDate', language)}</label><select className="text-input" value={orderForm.date} onChange={(e) => setOrderForm({ ...orderForm, date: e.target.value })}>{availableDates.map((d) => <option key={d} value={d}>{d}</option>)}</select></div></div><div className="mt-6 flex gap-3"><button onClick={() => setOrderModalOpen(false)} className="secondary-button flex-1 justify-center">{t('cancel', language)}</button><button onClick={() => { if (orderForm.quantity && orderForm.destination) { setOrderModalOpen(false); setOrderToast(true); setOrderForm({ quantity: '', destination: '', date: availableDates[0] }); setTimeout(() => setOrderToast(false), 2500); } }} disabled={!orderForm.quantity || !orderForm.destination} className="primary-button flex-1 justify-center disabled:cursor-not-allowed disabled:opacity-40"><PackageCheck size={18} /> {t('placeOrder', language)}</button></div></div></div>}
  {orderToast && <div className="toast"><Check size={16} /> {t('orderPlaced', language)}</div>}
  </DashboardLayout>;
}

function ScannerScreen({ setScreen, language, setLanguage, role, onSignOut }: { setScreen: (screen: Screen) => void; language: Language; setLanguage: (value: Language) => void; role: Role; onSignOut: () => void }) {
  const [scanning, setScanning] = useState(false);
  return <DashboardLayout language={language} setLanguage={setLanguage} active="scanner" setScreen={setScreen} role={role} onSignOut={onSignOut}><PageBack title={t('scanPassTitle', language)} onBack={() => setScreen('officer')} /><div className="mx-auto mt-7 max-w-2xl"><div className="panel text-center"><div className="scanner-viewport"><ScanLine size={120} strokeWidth={1} className="text-agri-green/40" />{scanning && <div className="scan-line" />}<div className="scanner-corners"><span /><span /><span /><span /></div></div><h2 className="mt-6 font-display text-2xl font-semibold text-navy">{scanning ? t('scanning', language) : t('scanPassTitle', language)}</h2><p className="mt-2 text-sm leading-6 text-ink-secondary">{t('scanSubtitle', language)}</p><button onClick={() => setScanning(!scanning)} className="primary-button mt-6 justify-center">{scanning ? t('scanning', language) : t('startScanning', language)} <ScanLine size={18} /></button></div><div className="mt-6"><h3 className="section-title">{t('recentScans', language)}</h3><div className="mt-4 space-y-3">{recentScans.map((scan) => <div key={scan.name} className="vehicle-card"><div className="vehicle-icon"><QrCode size={21} /></div><div className="min-w-0 flex-1"><p className="font-semibold text-ink">{scan.name}</p><p className="mt-1 text-sm text-ink-secondary">{locField(scan.crop, language)} · {scan.time}</p></div><div className="flex items-center gap-2 text-sm font-semibold text-agri-green"><Check size={16} /> {t('verifiedPass', language)}</div></div>)}</div></div></div></DashboardLayout>;
}

function AadhaarBankSection({ language }: { language: Language }) {
  const { details, updateDetails } = useFarmerDetails();
  const [aadhaar, setAadhaar] = useState(details.aadhaarNumber);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [verified, setVerified] = useState(details.aadhaarVerified);
  const [otpError, setOtpError] = useState(false);

  const [accountNo, setAccountNo] = useState(details.bankAccountNumber);
  const [accountNo2, setAccountNo2] = useState(details.bankAccountNumber);
  const [ifsc, setIfsc] = useState(details.bankIfsc);
  const [holderName, setHolderName] = useState(details.bankHolderName);
  const [passbookUploaded, setPassbookUploaded] = useState(details.passbookUploaded);
  const [bankSaved, setBankSaved] = useState(false);
  const [toast, setToast] = useState(false);

  const accountMismatch = accountNo2.length > 0 && accountNo !== accountNo2;
  const canSaveBank = accountNo.length > 0 && accountNo === accountNo2 && ifsc.length >= 6 && holderName.length > 0 && passbookUploaded;

  const handleSendOtp = () => { if (aadhaar.length === 12) { setOtpSent(true); setOtpError(false); updateDetails({ aadhaarNumber: aadhaar }); } };
  const handleVerifyOtp = () => { if (otp.length === 6) { setVerified(true); setOtpError(false); updateDetails({ aadhaarNumber: aadhaar, aadhaarVerified: true }); } else { setOtpError(true); } };
  const handleSaveBank = () => { if (canSaveBank) { setBankSaved(true); setToast(true); updateDetails({ bankAccountNumber: accountNo, bankIfsc: ifsc, bankHolderName: holderName, passbookUploaded }); setTimeout(() => setToast(false), 2500); } };

  return <>
    <div className="mt-6 panel"><div className="mb-5 flex items-center gap-2"><ShieldCheck size={18} className="text-agri-green" /><h2 className="section-title">{t('aadhaarVerification', language)}</h2></div><div className="space-y-5"><div><label className="field-label">{t('aadhaarNumber', language)}</label><input className="text-input" value={aadhaar} onChange={(e) => setAadhaar(e.target.value.replace(/\D/g, '').slice(0, 12))} placeholder={t('aadhaarPlaceholder', language)} inputMode="numeric" disabled={verified} /></div>{!verified && !otpSent && <button onClick={handleSendOtp} disabled={aadhaar.length !== 12} className="primary-button w-full justify-center disabled:cursor-not-allowed disabled:opacity-40">{t('verifyViaOtp', language)}</button>}{!verified && otpSent && <><p className="text-sm text-ink-secondary">{t('aadhaarOtpSent', language)}</p><div><label className="field-label">{t('enterAadhaarOtp', language)}</label><input className="text-input" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="000000" inputMode="numeric" autoFocus /></div>{otpError && <p className="text-sm text-danger">{t('aadhaarOtpError', language)}</p>}<div className="flex gap-3"><button onClick={() => { setOtpSent(false); setOtp(''); }} className="secondary-button flex-1 justify-center">{t('cancel', language)}</button><button onClick={handleVerifyOtp} disabled={otp.length !== 6} className="primary-button flex-1 justify-center disabled:cursor-not-allowed disabled:opacity-40">{t('verifyOtp', language)}</button></div></>}{verified && <div className="inline-flex items-center gap-2 rounded-full bg-success-light px-4 py-2 text-sm font-semibold text-agri-green"><CheckCircle2 size={14} /> {t('aadhaarVerified', language)}</div>}</div></div>

    <div className="mt-6 panel"><div className="mb-1 flex items-center gap-2"><Landmark size={18} className="text-agri-green" /><h2 className="section-title">{t('bankDetails', language)}</h2></div><p className="mb-5 text-sm text-ink-secondary">{t('bankDetailsSubtitle', language)}</p><div className="space-y-5"><div><label className="field-label">{t('bankAccountNumber', language)}</label><input className="text-input" value={accountNo} onChange={(e) => setAccountNo(e.target.value.replace(/[^0-9]/g, '').slice(0, 18))} placeholder="000123456789" inputMode="numeric" /></div><div><label className="field-label">{t('reenterAccountNumber', language)}</label><input className="text-input" value={accountNo2} onChange={(e) => setAccountNo2(e.target.value.replace(/[^0-9]/g, '').slice(0, 18))} placeholder="000123456789" inputMode="numeric" />{accountMismatch && <p className="mt-1 text-sm text-danger">{t('accountNumberMismatch', language)}</p>}</div><div><label className="field-label">{t('ifscCode', language)}</label><input className="text-input" value={ifsc} onChange={(e) => setIfsc(e.target.value.toUpperCase().slice(0, 11))} placeholder="SBIN0001234" /></div><div><label className="field-label">{t('accountHolderName', language)}</label><input className="text-input" value={holderName} onChange={(e) => setHolderName(e.target.value)} placeholder={t('fullName', language)} /></div><div><label className="field-label">{t('passbookUpload', language)}</label><div className={`upload-box ${passbookUploaded ? 'uploaded' : ''}`} onClick={() => setPassbookUploaded(!passbookUploaded)}>{passbookUploaded ? <><CheckCircle2 size={28} className="upload-icon" /><span className="upload-text">{t('uploadComplete', language)}</span></> : <><Upload size={28} className="upload-icon" /><span className="upload-text">{t('passbookUploadHint', language)}</span></>}</div></div><button onClick={handleSaveBank} disabled={!canSaveBank} className="primary-button w-full justify-center disabled:cursor-not-allowed disabled:opacity-40">{bankSaved ? <><CheckCircle2 size={18} /> {t('bankDetailsSaved', language)}</> : <>{t('saveChanges', language)}</>}</button></div></div>

    {toast && <div className="toast"><Check size={16} /> {t('bankDetailsSaved', language)}</div>}
  </>;
}

function FarmerProfileScreen({ setScreen, language, setLanguage, role, onSignOut }: { setScreen: (screen: Screen) => void; language: Language; setLanguage: (value: Language) => void; role: Role; onSignOut: () => void }) {
  const { profile, editing, draft, startEdit, cancelEdit, saveEdit, updateDraft } = useProfileData(role);
  const p = profile as FarmerProfile;
  const d = draft as FarmerProfile | null;
  const data = editing && d ? d : p;
  return <DashboardLayout language={language} setLanguage={setLanguage} active="farmerProfile" setScreen={setScreen} role={role} onSignOut={onSignOut}><PageBack title={t('profileTitle', language)} onBack={() => setScreen('farmer')} /><div className="mx-auto mt-7 max-w-2xl"><div className="profile-header"><div className="profile-avatar"><UserRound size={48} /></div><div><h2 className="font-display text-2xl font-semibold text-navy">{data.name}</h2><p className="mt-1 text-sm text-ink-secondary">{t('farmerProfile', language)}</p></div></div><div className="mt-6 panel"><div className="grid gap-5 sm:grid-cols-2">{editing ? <><ProfileEditField icon={UserRound} label={t('fullName', language)} value={d!.name} onChange={(v) => updateDraft('name', v)} /><ProfileEditField icon={Phone} label={t('contactNumber', language)} value={d!.phone} onChange={(v) => updateDraft('phone', v)} /><ProfileEditField icon={MapPin} label={t('villageCity', language)} value={d!.village} onChange={(v) => updateDraft('village', v)} /><ProfileEditField icon={MapPin} label={t('state', language)} value={d!.state} onChange={(v) => updateDraft('state', v)} /><ProfileEditField icon={Sprout} label={t('cropsSold', language)} value={d!.cropsSold} onChange={(v) => updateDraft('cropsSold', v)} /><ProfileEditField icon={CalendarDays} label={t('lastVisit', language)} value={d!.lastVisit} onChange={(v) => updateDraft('lastVisit', v)} /></> : <><ProfileInfoRow icon={UserRound} label={t('fullName', language)} value={p.name} /><ProfileInfoRow icon={Phone} label={t('contactNumber', language)} value={p.phone} /><ProfileInfoRow icon={MapPin} label={t('villageCity', language)} value={p.village} /><ProfileInfoRow icon={MapPin} label={t('state', language)} value={p.state} /><ProfileInfoRow icon={CalendarDays} label={t('totalVisits', language)} value={p.totalVisits} /><ProfileInfoRow icon={Sprout} label={t('cropsSold', language)} value={p.cropsSold} /><ProfileInfoRow icon={Clock3} label={t('lastVisit', language)} value={p.lastVisit} /></>}</div></div><AadhaarBankSection language={language} /><div className="mt-5 flex gap-3">{editing ? <><button onClick={cancelEdit} className="secondary-button flex-1 justify-center">{t('cancel', language)}</button><button onClick={saveEdit} className="primary-button flex-1 justify-center"><Check size={18} /> {t('saveChanges', language)}</button></> : <><button onClick={startEdit} className="secondary-button flex-1 justify-center"><UserRound size={18} /> {t('editProfile', language)}</button><button onClick={() => setScreen('farmer')} className="primary-button flex-1 justify-center">{t('backToDashboard', language)} <ArrowRight size={18} /></button></>}</div></div></DashboardLayout>;
}

function OfficerProfileScreen({ setScreen, language, setLanguage, role, onSignOut }: { setScreen: (screen: Screen) => void; language: Language; setLanguage: (value: Language) => void; role: Role; onSignOut: () => void }) {
  const { profile, editing, draft, startEdit, cancelEdit, saveEdit, updateDraft } = useProfileData(role);
  const p = profile as OfficerProfile;
  const d = draft as OfficerProfile | null;
  const data = editing && d ? d : p;
  return <DashboardLayout language={language} setLanguage={setLanguage} active="officerProfile" setScreen={setScreen} role={role} onSignOut={onSignOut}><PageBack title={t('profileTitle', language)} onBack={() => setScreen('officer')} /><div className="mx-auto mt-7 max-w-2xl"><div className="profile-header"><div className="profile-avatar"><UserRound size={48} /></div><div><h2 className="font-display text-2xl font-semibold text-navy">{data.name}</h2><p className="mt-1 text-sm text-ink-secondary">{t('officerProfile', language)}</p></div></div><div className="mt-6 panel"><div className="grid gap-5 sm:grid-cols-2">{editing ? <><ProfileEditField icon={UserRound} label={t('fullName', language)} value={d!.name} onChange={(v) => updateDraft('name', v)} /><ProfileEditField icon={Phone} label={t('contactNumber', language)} value={d!.phone} onChange={(v) => updateDraft('phone', v)} /><ProfileEditField icon={MapPin} label={t('mandiAssigned', language)} value={d!.mandiAssigned} onChange={(v) => updateDraft('mandiAssigned', v)} /><ProfileEditField icon={ShieldCheck} label={t('employeeId', language)} value={d!.employeeId} onChange={(v) => updateDraft('employeeId', v)} /><ProfileEditField icon={Users} label={t('farmersVerified', language)} value={d!.farmersVerified} onChange={(v) => updateDraft('farmersVerified', v)} /><ProfileEditField icon={Clock3} label={t('todayShift', language)} value={d!.todayShift} onChange={(v) => updateDraft('todayShift', v)} /></> : <><ProfileInfoRow icon={UserRound} label={t('fullName', language)} value={p.name} /><ProfileInfoRow icon={Phone} label={t('contactNumber', language)} value={p.phone} /><ProfileInfoRow icon={MapPin} label={t('mandiAssigned', language)} value={p.mandiAssigned} /><ProfileInfoRow icon={ShieldCheck} label={t('employeeId', language)} value={p.employeeId} /><ProfileInfoRow icon={Users} label={t('farmersVerified', language)} value={p.farmersVerified} /><ProfileInfoRow icon={CalendarDays} label={t('totalVisits', language)} value={p.totalVisits} /><ProfileInfoRow icon={Clock3} label={t('todayShift', language)} value={p.todayShift} /></>}</div></div><div className="mt-5 flex gap-3">{editing ? <><button onClick={cancelEdit} className="secondary-button flex-1 justify-center">{t('cancel', language)}</button><button onClick={saveEdit} className="primary-button flex-1 justify-center"><Check size={18} /> {t('saveChanges', language)}</button></> : <><button onClick={startEdit} className="secondary-button flex-1 justify-center"><UserRound size={18} /> {t('editProfile', language)}</button><button onClick={() => setScreen('officer')} className="primary-button flex-1 justify-center">{t('backToDashboard', language)} <ArrowRight size={18} /></button></>}</div></div></DashboardLayout>;
}

function ProgressTracker({ currentStep, language }: { currentStep: number; language: Language }) {
  const steps = [
    { label: t('progressSlotBooked', language) },
    { label: t('progressTractorAssigned', language) },
    { label: t('progressReachedMandi', language) },
    { label: t('progressVerified', language) },
  ];
  const tractorLeft = steps.length > 1 ? (currentStep / (steps.length - 1)) * 100 : 0;
  return <div className="tracker">
    <div className="tracker-tractor" style={{ left: `calc(${tractorLeft}% - 14px)` }}><Tractor size={28} className="text-agri-green" /></div>
    {steps.map((step, i) => <div key={i} className={`tracker-step ${i < currentStep ? 'done' : i === currentStep ? 'active' : ''}`}><div className="tracker-dot">{i < currentStep ? <Check size={14} /> : i + 1}</div><span className="tracker-label">{step.label}</span></div>)}
  </div>;
}

function MyBookingsScreen({ setScreen, language, setLanguage, role, onSignOut, bookingData }: { setScreen: (screen: Screen) => void; language: Language; setLanguage: (value: Language) => void; role: Role; onSignOut: () => void; bookingData: ReturnType<typeof useBookingData> }) {
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);
  const [toast, setToast] = useState(false);

  const handleCancel = () => {
    if (cancelTarget) {
      bookingData.cancelBooking(cancelTarget.id);
      setToast(true);
      setTimeout(() => setToast(false), 2500);
    }
    setCancelTarget(null);
  };

  const active = bookingData.activeBookings;
  const cancelled = bookingData.cancelledBookings;

  return <DashboardLayout language={language} setLanguage={setLanguage} active="myBookings" setScreen={setScreen} role={role} onSignOut={onSignOut}><PageBack title={t('myBookings', language)} onBack={() => setScreen('farmer')} /><div className="mx-auto mt-7 max-w-2xl">
    <h2 className="section-title">{t('activeBookings', language)}</h2>
    {active.length === 0 ? <div className="mt-4 panel text-center"><p className="text-sm text-ink-secondary">{t('noActiveBookings', language)}</p><button onClick={() => setScreen('book')} className="primary-button mt-5 justify-center"><CalendarDays size={18} /> {t('bookSlotNow', language)}</button></div> : <div className="mt-4 space-y-3">{active.map((b) => <div key={b.id} className="booking-card"><div className="booking-card-header"><div><p className="font-semibold text-ink">{cropName(b.crop, language)}</p><p className="mt-1 text-xs text-ink-secondary">{b.centreName}</p></div><span className="booking-status-badge confirmed"><Check size={13} /> {t('confirmed', language)}</span></div><div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4"><Info label={t('bookingId', language)} value={b.id} /><Info label={t('date', language)} value={b.date} /><Info label={t('arrivalTime', language)} value={b.time} /><Info label={t('quantity', language)} value={`${b.quantity} ${b.unit}`} /></div><div className="mt-4 rounded-xl bg-[#F7F8F5] p-4"><div className="mb-3 flex items-center gap-2 text-xs font-semibold text-ink-secondary"><Navigation size={14} className="text-agri-green" /> {t('liveTracking', language)}</div><ProgressTracker currentStep={1} language={language} /></div><div className="mt-4 flex gap-2"><button onClick={() => setScreen('pass')} className="secondary-button flex-1 justify-center text-sm"><QrCode size={16} /> {t('viewPass', language)}</button><button onClick={() => setCancelTarget(b)} className="secondary-button flex-1 justify-center text-sm" style={{ color: '#B85C5C' }}><X size={16} /> {t('cancelBooking', language)}</button></div></div>)}</div>}

    <h2 className="section-title mt-10">{t('cancelledBookings', language)}</h2>
    {cancelled.length === 0 ? <p className="mt-3 text-sm text-ink-secondary">{t('noCancelledBookings', language)}</p> : <div className="mt-4 space-y-3">{cancelled.map((b) => <div key={b.id} className="booking-card opacity-60"><div className="booking-card-header"><div><p className="font-semibold text-ink">{cropName(b.crop, language)}</p><p className="mt-1 text-xs text-ink-secondary">{b.centreName}</p></div><span className="booking-status-badge cancelled">{t('cancelled', language)}</span></div><div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4"><Info label={t('bookingId', language)} value={b.id} /><Info label={t('date', language)} value={b.date} /><Info label={t('arrivalTime', language)} value={b.time} /><Info label={t('quantity', language)} value={`${b.quantity} ${b.unit}`} /></div></div>)}</div>}
  </div>

  {cancelTarget && <div className="modal-overlay" onClick={() => setCancelTarget(null)}><div className="modal-box" onClick={(e) => e.stopPropagation()}><div className="modal-icon"><X size={24} /></div><h3 className="text-center font-display text-xl font-semibold text-navy">{t('cancelConfirmTitle', language)}</h3><p className="mt-3 text-center text-sm leading-6 text-ink-secondary">{t('cancelConfirmDesc', language)}</p><div className="mt-4 rounded-xl bg-warm p-3 text-sm"><p className="font-medium text-ink">{cropName(cancelTarget.crop, language)} · {cancelTarget.centreName}</p><p className="mt-1 text-xs text-ink-secondary">{cancelTarget.date} · {cancelTarget.time}</p></div><div className="mt-6 flex gap-3"><button onClick={() => setCancelTarget(null)} className="secondary-button flex-1 justify-center">{t('keepBooking', language)}</button><button onClick={handleCancel} className="primary-button flex-1 justify-center" style={{ background: '#B85C5C' }}>{t('yesCancel', language)}</button></div></div></div>}
  {toast && <div className="toast"><Check size={16} /> {t('bookingCancelled', language)}</div>}
  </DashboardLayout>;
}

function TruckPoolScreen({ setScreen, language, setLanguage, role, onSignOut }: { setScreen: (screen: Screen) => void; language: Language; setLanguage: (value: Language) => void; role: Role; onSignOut: () => void }) {
  const poolData = useTruckPoolData();
  const { userProfile } = useUserProfile();
  const [tab, setTab] = useState<'find' | 'create'>('find');
  const [toast, setToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg: string) => { setToastMsg(msg); setToast(true); setTimeout(() => setToast(false), 2500); };

  const pickupDefault = displayLocation(userProfile) !== t('locationNotSet', language) ? displayLocation(userProfile) : 'Chomu, Jaipur';
  const [createForm, setCreateForm] = useState({ crop: 'Wheat', quantity: '15', pickup: pickupDefault, destination: 'Jaipur Central Mandi', date: availableDates[0], time: availableTimes[0], capacity: '40' });

  const handleCreate = () => {
    poolData.createPool(createForm.crop, `${createForm.quantity} Quintal`, createForm.pickup, createForm.destination, createForm.date, createForm.time, `${createForm.capacity} Quintal`);
    showToast(t('poolJoined', language));
    setTab('find');
  };

  const handleJoin = (poolId: string, qty: string) => {
    poolData.joinPool(poolId, qty);
    showToast(t('poolJoined', language));
  };

  const handleLeave = (poolId: string) => {
    poolData.leavePool(poolId);
    showToast(t('poolLeft', language));
  };

  const statusBadge = (status: PoolStatus) => {
    const labels: Record<PoolStatus, string> = { open: t('poolOpen', language), 'almost-full': t('poolAlmostFull', language), full: t('poolFullLabel', language), completed: t('poolCompleted', language), cancelled: t('poolCancelled', language) };
    return <span className={`pool-status-badge ${status}`}>{labels[status]}</span>;
  };

  return <DashboardLayout language={language} setLanguage={setLanguage} active="truckPool" setScreen={setScreen} role={role} onSignOut={onSignOut}><PageBack title={t('truckPooling', language)} onBack={() => setScreen('farmer')} /><div className="mx-auto mt-7 max-w-2xl"><p className="text-sm leading-6 text-ink-secondary">{t('truckPoolDesc', language)}</p>
    <div className="pool-tab mt-6"><button className={tab === 'find' ? 'active' : ''} onClick={() => setTab('find')}><Search size={16} /> {t('findPool', language)}</button><button className={tab === 'create' ? 'active' : ''} onClick={() => setTab('create')}><Plus size={16} /> {t('createPool', language)}</button></div>

    {tab === 'find' && <div>{poolData.pools.length === 0 ? <p className="text-sm text-ink-secondary">{t('noPoolsAvailable', language)}</p> : <div className="space-y-3">{poolData.pools.map((pool) => { const member = poolData.isMember(pool.id); const canJoin = (pool.status === 'open' || pool.status === 'almost-full') && !member; const canLeave = member && pool.status !== 'completed' && pool.status !== 'cancelled'; return <div key={pool.id} className="pool-card"><div className="flex items-start justify-between"><div><p className="font-semibold text-ink">{pool.crop}</p><p className="mt-1 text-xs text-ink-secondary">{t('poolId', language)}: {pool.id}</p></div>{statusBadge(pool.status)}</div><div className="mt-4 grid grid-cols-2 gap-3"><Info label={t('procurementCentre', language)} value={pool.destination} /><Info label={t('pickupLocation', language)} value={pool.pickupLocation} /><Info label={t('preferredDate', language)} value={pool.date} /><Info label={t('preferredTime', language)} value={pool.time} /><Info label={t('availableCapacity', language)} value={pool.availableCapacity} /><Info label={t('members', language)} value={`${pool.members.length}`} /></div>{member && <div className="mt-3"><p className="mb-2 text-xs font-medium text-ink-secondary">{t('members', language)}:</p><div className="space-y-1">{pool.members.map((m, i) => <div key={i} className="pool-member"><span className="font-medium text-ink">{m.name}</span><span className="text-xs text-ink-secondary">{m.quantity}</span></div>)}</div></div>}<div className="mt-4">{canJoin ? <button onClick={() => handleJoin(pool.id, '10 Quintal')} className="primary-button w-full justify-center"><Users size={18} /> {t('joinPool', language)}</button> : canLeave ? <button onClick={() => handleLeave(pool.id)} className="secondary-button w-full justify-center" style={{ color: '#B85C5C' }}><X size={18} /> {t('leavePool', language)}</button> : pool.status === 'full' ? <p className="text-center text-sm font-semibold text-ink-secondary">{t('poolFull', language)}</p> : null}</div></div>; })}</div>}</div>}

    {tab === 'create' && <div className="form-card"><div className="space-y-4"><div><label className="field-label">{t('cropType', language)}</label><select className="text-input" value={createForm.crop} onChange={(e) => setCreateForm({ ...createForm, crop: e.target.value })}>{allCrops.map((c) => <option key={c.en} value={c.en}>{c[language]}</option>)}</select></div><div className="grid gap-4 sm:grid-cols-2"><div><label className="field-label">{t('yourQuantity', language)}</label><input className="text-input" value={createForm.quantity} onChange={(e) => setCreateForm({ ...createForm, quantity: e.target.value.replace(/\D/g, '').slice(0, 4) })} placeholder="15" inputMode="numeric" /></div><div><label className="field-label">{t('truckCapacity', language)}</label><input className="text-input" value={createForm.capacity} onChange={(e) => setCreateForm({ ...createForm, capacity: e.target.value.replace(/\D/g, '').slice(0, 4) })} placeholder="40" inputMode="numeric" /></div></div><div><label className="field-label">{t('pickupLocation', language)}</label><input className="text-input" value={createForm.pickup} onChange={(e) => setCreateForm({ ...createForm, pickup: e.target.value })} /></div><div><label className="field-label">{t('destinationCentre', language)}</label><select className="text-input" value={createForm.destination} onChange={(e) => setCreateForm({ ...createForm, destination: e.target.value })}>{procurementCentres.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}</select></div><div className="grid gap-4 sm:grid-cols-2"><div><label className="field-label">{t('preferredDate', language)}</label><select className="text-input" value={createForm.date} onChange={(e) => setCreateForm({ ...createForm, date: e.target.value })}>{availableDates.map((d) => <option key={d} value={d}>{d}</option>)}</select></div><div><label className="field-label">{t('preferredTime', language)}</label><select className="text-input" value={createForm.time} onChange={(e) => setCreateForm({ ...createForm, time: e.target.value })}>{availableTimes.map((tm) => <option key={tm} value={tm}>{tm}</option>)}</select></div></div></div><button onClick={handleCreate} className="primary-button mt-6 w-full justify-center"><Plus size={18} /> {t('createPoolBtn', language)}</button></div>}
  </div>{toast && <div className="toast"><Check size={16} /> {toastMsg}</div>}</DashboardLayout>;
}

function ProfileInfoRow({ icon: Icon, label, value }: { icon: IconType; label: string; value: string }) {
  return <div className="flex items-center gap-3"><div className="action-icon"><Icon size={18} /></div><div><p className="text-xs text-ink-secondary">{label}</p><p className="mt-1 text-sm font-semibold text-ink">{value}</p></div></div>;
}

function ProfileEditField({ icon: Icon, label, value, onChange }: { icon: IconType; label: string; value: string; onChange: (value: string) => void }) {
  return <div className="flex items-center gap-3"><div className="action-icon"><Icon size={18} /></div><div className="flex-1"><p className="text-xs text-ink-secondary">{label}</p><input className="text-input mt-1" value={value} onChange={(event) => onChange(event.target.value)} /></div></div>;
}

function OnboardingProgress({ step, language }: { step: number; language: Language }) {
  const steps = [t('onboardingStep1', language), t('onboardingStep2', language), t('onboardingStep3', language), t('onboardingStep4', language)];
  return <div className="mb-8"><div className="flex items-center gap-1.5">{steps.map((label, i) => <div key={i} className="flex flex-1 items-center gap-1.5"><div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${i < step ? 'bg-navy text-white' : i === step ? 'bg-agri-green text-white' : 'bg-line text-ink-secondary'}`}>{i < step ? <Check size={14} /> : i + 1}</div>{i < steps.length - 1 && <div className={`h-0.5 flex-1 rounded-full ${i < step ? 'bg-navy' : 'bg-line'}`} />}</div>)}</div><div className="mt-2 flex"><div className="flex-1 text-center text-[10px] font-medium text-ink-secondary">{steps[step]}</div></div></div>;
}

function AadhaarStepScreen({ language, setLanguage, onComplete, onBack }: { language: Language; setLanguage: (value: Language) => void; onComplete: () => void; onBack: () => void }) {
  const { details, updateDetails } = useFarmerDetails();
  const [aadhaar, setAadhaar] = useState(details.aadhaarNumber);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [verified, setVerified] = useState(details.aadhaarVerified);
  const [otpError, setOtpError] = useState(false);
  const [aadhaarError, setAadhaarError] = useState(false);

  const handleSendOtp = () => {
    if (aadhaar.length === 12) { setOtpSent(true); setOtpError(false); setAadhaarError(false); updateDetails({ aadhaarNumber: aadhaar }); }
    else setAadhaarError(true);
  };
  const handleVerifyOtp = () => {
    if (otp.length === 6) { setVerified(true); setOtpError(false); updateDetails({ aadhaarNumber: aadhaar, aadhaarVerified: true }); }
    else setOtpError(true);
  };

  return <div className="min-h-screen bg-[#F7F8F5]"><Header language={language} setLanguage={setLanguage} /><main className="mx-auto max-w-md px-5 py-10 sm:py-16">
    <button className="back-link" onClick={onBack}><ChevronLeft size={17} /> {t('back', language)}</button>
    <OnboardingProgress step={1} language={language} />
    <div className="mb-8"><div className="screen-icon"><ShieldCheck size={25} /></div><h1 className="mt-6 font-display text-4xl font-semibold tracking-tight text-navy">{t('aadhaarVerification', language)}</h1><p className="mt-3 leading-7 text-ink-secondary">{t('aadhaarStepSubtitle', language)}</p></div>
    <div className="form-card">
      <div className="mb-4 flex items-center gap-2 rounded-lg bg-[#F7F8F5] p-3 text-xs text-ink-secondary"><ShieldCheck size={15} className="shrink-0 text-agri-green" /> {t('aadhaarStepSubtitle', language)}</div>
      <div className="space-y-5">
        <div><label className="field-label">{t('aadhaarNumber', language)}</label><input className="text-input" value={aadhaar} onChange={(e) => setAadhaar(e.target.value.replace(/\D/g, '').slice(0, 12))} placeholder={t('aadhaarPlaceholder', language)} inputMode="numeric" disabled={verified} />{aadhaarError && <p className="mt-1 text-sm text-danger">{t('invalidAadhaar', language)}</p>}</div>
        {!verified && !otpSent && <button onClick={handleSendOtp} disabled={aadhaar.length !== 12} className="primary-button w-full justify-center disabled:cursor-not-allowed disabled:opacity-40">{t('verifyViaOtp', language)}</button>}
        {!verified && otpSent && <>
          <p className="text-sm text-ink-secondary">{t('aadhaarOtpSent', language)}</p>
          <p className="text-xs text-ink-secondary">{t('demoOtpHint', language)}</p>
          <div><label className="field-label">{t('enterAadhaarOtp', language)}</label><input className="text-input" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="000000" inputMode="numeric" autoFocus /></div>
          {otpError && <p className="text-sm text-danger">{t('aadhaarOtpError', language)}</p>}
          <div className="flex gap-3"><button onClick={() => { setOtpSent(false); setOtp(''); }} className="secondary-button flex-1 justify-center">{t('changeAadhaar', language)}</button><button onClick={handleVerifyOtp} disabled={otp.length !== 6} className="primary-button flex-1 justify-center disabled:cursor-not-allowed disabled:opacity-40">{t('verifyOtp', language)}</button></div>
          <button onClick={() => { setOtp(''); setOtpError(false); }} className="text-sm font-medium text-agri-green">{t('resendOtp', language)}</button>
        </>}
        {verified && <div className="space-y-4"><div className="inline-flex items-center gap-2 rounded-full bg-success-light px-4 py-2 text-sm font-semibold text-agri-green"><CheckCircle2 size={14} /> {t('aadhaarVerified', language)}</div><button onClick={onComplete} className="primary-button w-full justify-center">{t('continueBtn', language)} <ArrowRight size={18} /></button></div>}
      </div>
    </div>
  </main></div>;
}

function BankStepScreen({ language, setLanguage, onComplete, onBack }: { language: Language; setLanguage: (value: Language) => void; onComplete: () => void; onBack: () => void }) {
  const { details, updateDetails } = useFarmerDetails();
  const [accountNo, setAccountNo] = useState(details.bankAccountNumber);
  const [accountNo2, setAccountNo2] = useState(details.bankAccountNumber);
  const [ifsc, setIfsc] = useState(details.bankIfsc);
  const [holderName, setHolderName] = useState(details.bankHolderName);
  const [passbookFile, setPassbookFile] = useState<File | null>(null);
  const [passbookPreview, setPassbookPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const accountMismatch = accountNo2.length > 0 && accountNo !== accountNo2;
  const ifscValid = /^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc);
  const accountValid = /^[0-9]{9,18}$/.test(accountNo);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setPassbookFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setPassbookPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => { setPassbookFile(null); setPassbookPreview(null); };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!accountValid) errs.accountNo = t('accountNumberShort', language);
    if (accountMismatch) errs.accountNo2 = t('accountNumberMismatch', language);
    if (!ifscValid) errs.ifsc = t('ifscFormatError', language);
    if (!holderName.trim()) errs.holderName = t('fieldRequired', language);
    if (!passbookFile) errs.passbook = t('passbookRequired', language);
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      updateDetails({ bankAccountNumber: accountNo, bankIfsc: ifsc, bankHolderName: holderName, passbookUploaded: true });
      setSuccess(true);
      setTimeout(() => onComplete(), 1500);
    }
  };

return (
    <div className="min-h-screen bg-[#F7F8F5]">
      <Header language={language} setLanguage={setLanguage} />
      <main className="mx-auto max-w-md px-5 py-10 sm:py-16">
        <button className="back-link" onClick={onBack}>
          <ChevronLeft size={17} /> {t('back', language)}
        </button>
        <OnboardingProgress step={2} language={language} />
        <div className="mb-8">
          <div className="screen-icon"><Landmark size={25} /></div>
          <h1 className="mt-6 font-display text-4xl font-semibold tracking-tight text-navy">{t('bankDetails', language)}</h1>
          <p className="mt-3 leading-7 text-ink-secondary">{t('bankStepSubtitle', language)}</p>
        </div>
        {success ? (
          <div className="form-card text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success-light">
              <CheckCircle2 size={36} className="text-agri-green" />
            </div>
            <h2 className="mt-5 font-display text-2xl font-semibold text-navy">{t('onboardingComplete', language)}</h2>
          </div>
        ) : (
          <div className="form-card">
            <div className="space-y-5">
              <div>
                <label className="field-label">{t('bankAccountNumber', language)}</label>
                <input className="text-input" value={accountNo} onChange={(e) => setAccountNo(e.target.value.replace(/[^0-9]/g, '').slice(0, 18))} placeholder="000123456789" inputMode="numeric" />
                {errors.accountNo && <p className="mt-1 text-sm text-danger">{errors.accountNo}</p>}
              </div>
              <div>
                <label className="field-label">{t('reenterAccountNumber', language)}</label>
                <input className="text-input" value={accountNo2} onChange={(e) => setAccountNo2(e.target.value.replace(/[^0-9]/g, '').slice(0, 18))} placeholder="000123456789" inputMode="numeric" />
                {errors.accountNo2 && <p className="mt-1 text-sm text-danger">{errors.accountNo2}</p>}
              </div>
              <div>
                <label className="field-label">{t('ifscCode', language)}</label>
                <input className="text-input" value={ifsc} onChange={(e) => setIfsc(e.target.value.toUpperCase().slice(0, 11))} placeholder="SBIN0001234" />
                {errors.ifsc && <p className="mt-1 text-sm text-danger">{errors.ifsc}</p>}
              </div>
              <div>
                <label className="field-label">{t('accountHolderName', language)}</label>
                <input className="text-input" value={holderName} onChange={(e) => setHolderName(e.target.value)} placeholder={t('fullName', language)} />
                {errors.holderName && <p className="mt-1 text-sm text-danger">{errors.holderName}</p>}
              </div>
              <div>
                <label className="field-label">{t('passbookUpload', language)}</label>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                {passbookPreview ? (
                  <div className="rounded-xl border border-line p-3">
                    <img src={passbookPreview} alt="Passbook" className="mx-auto max-h-48 rounded-lg object-contain" />
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs text-ink-secondary">{passbookFile?.name}</span>
                      <button onClick={handleRemoveImage} className="text-sm font-medium text-danger">{t('removeImage', language)}</button>
                    </div>
                  </div>
                ) : (
                  <div className="upload-box" onClick={() => fileInputRef.current?.click()}>
                    <Upload size={28} className="upload-icon" />
                    <span className="upload-text">{t('passbookUploadHint', language)}</span>
                  </div>
                )}
                {errors.passbook && <p className="mt-1 text-sm text-danger">{errors.passbook}</p>}
              </div>
              <button onClick={handleSubmit} className="primary-button w-full justify-center">
                {t('submitAndContinue', language)} <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function DriverOnboardingScreen({ setScreen, language, setLanguage, role, onSignOut }: { setScreen: (screen: Screen) => void; language: Language; setLanguage: (value: Language) => void; role: Role; onSignOut: () => void }) {
  const { driver, registerDriver } = useDriverData();
  const { userProfile } = useUserProfile();
  const [name, setName] = useState(userProfile.fullName || '');
  const [mobile, setMobile] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [licenceNumber, setLicenceNumber] = useState('');
  const [pollutionCert, setPollutionCert] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const canSubmit = name.trim().length > 0 && mobile.length >= 10 && vehicleNumber.length >= 4 && licenceNumber.length >= 4 && pollutionCert.length >= 4;

  const handleSubmit = () => {
    if (!canSubmit) return;
    registerDriver({ name, mobileNumber: mobile, vehicleNumber, licenceNumber, pollutionCertNumber: pollutionCert });
    setSubmitted(true);
    setTimeout(() => setScreen('driver'), 1500);
  };

  if (submitted) {
    return <DashboardLayout language={language} setLanguage={setLanguage} active="driver" setScreen={setScreen} role={role} onSignOut={onSignOut}><div className="mx-auto mt-7 max-w-2xl"><div className="success-panel"><div className="success-icon"><Check size={28} /></div><h2 className="mt-5 font-display text-3xl font-semibold text-navy">{t('driverRegistrationComplete', language)}</h2></div></div></DashboardLayout>;
  }

  return <DashboardLayout language={language} setLanguage={setLanguage} active="driver" setScreen={setScreen} role={role} onSignOut={onSignOut}><PageBack title={t('driverRegistration', language)} onBack={() => setScreen('role')} /><div className="mx-auto mt-7 max-w-2xl"><div className="form-card"><div className="screen-icon"><Truck size={25} /></div><h2 className="mt-5 font-display text-2xl font-semibold text-navy">{t('driverRegistration', language)}</h2><p className="mt-2 text-sm leading-6 text-ink-secondary">{t('driverRegistrationSubtitle', language)}</p><div className="mt-6 space-y-5"><div><label className="field-label">{t('driverName', language)}</label><input className="text-input" value={name} onChange={(e) => setName(e.target.value)} placeholder={t('fullName', language)} /></div><div><label className="field-label">{t('driverMobileNumber', language)}</label><input className="text-input" value={mobile} onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="9876543210" inputMode="numeric" /></div><div><label className="field-label">{t('driverVehicleNumber', language)}</label><input className="text-input" value={vehicleNumber} onChange={(e) => setVehicleNumber(e.target.value.toUpperCase().slice(0, 12))} placeholder="RJ01 AB 1234" /></div><div><label className="field-label">{t('drivingLicenceNumber', language)}</label><input className="text-input" value={licenceNumber} onChange={(e) => setLicenceNumber(e.target.value.toUpperCase().slice(0, 20))} placeholder="RJ01 20240012345" /></div><div><label className="field-label">{t('pollutionCertNumber', language)}</label><input className="text-input" value={pollutionCert} onChange={(e) => setPollutionCert(e.target.value.toUpperCase().slice(0, 20))} placeholder="PUCC2024001234" /></div></div><button onClick={handleSubmit} disabled={!canSubmit} className="primary-button mt-7 w-full justify-center disabled:cursor-not-allowed disabled:opacity-40">{t('completeRegistration', language)} <ArrowRight size={18} /></button></div></div></DashboardLayout>;
}

function DriverDashboardScreen({ setScreen, language, setLanguage, role, onSignOut }: { setScreen: (screen: Screen) => void; language: Language; setLanguage: (value: Language) => void; role: Role; onSignOut: () => void }) {
  const { driver, pendingRequests, activeTrip, totalEarnings, pendingPayments, tripHistory } = useDriverData();
  const { userProfile } = useUserProfile();
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => { const id = setInterval(() => setCurrentTime(new Date()), 1000); return () => clearInterval(id); }, []);
  const locale = language === 'hi' ? 'hi-IN' : 'en-IN';
  const dateStr = currentTime.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' });
  const timeStr = currentTime.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
  const hour = currentTime.getHours();
  const greetingKey = greetingFor(hour);

  return <DashboardLayout language={language} setLanguage={setLanguage} active="driver" setScreen={setScreen} role={role} onSignOut={onSignOut}><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="eyebrow">{dateStr} · {timeStr}</p><h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-navy sm:text-4xl">{t(greetingKey, language)}, {driver.name || displayName(userProfile)}</h1><p className="mt-2 flex items-center gap-1.5 text-sm text-ink-secondary"><Truck size={15} className="text-agri-green" /> {driver.vehicleNumber || t('driverVehicleNumber', language)}</p></div><button onClick={() => setScreen('driverProfile')} className="icon-button self-start sm:self-auto"><UserRound size={19} /></button></div><div className="mt-8 grid gap-4 sm:grid-cols-3"><StatCard label={t('upcomingRequests', language)} value={String(pendingRequests.length)} detail={t('newRequest', language)} icon={FileCheck2} /><StatCard label={t('totalEarnings', language)} value={`₹${totalEarnings.toLocaleString('en-IN')}`} detail={t('tripHistory', language)} icon={Wallet} green /><StatCard label={t('pendingPayments', language)} value={`₹${pendingPayments.toLocaleString('en-IN')}`} detail={t('paymentPending', language)} icon={IndianRupee} /></div><div className="mt-8 grid gap-6 lg:grid-cols-2"><div className="panel"><div className="flex items-center justify-between"><h2 className="section-title">{t('activeTrip', language)}</h2><Route size={20} className="text-agri-green" /></div>{activeTrip ? <div className="mt-5 space-y-3"><div className="rounded-xl bg-[#F7F8F5] p-4"><p className="font-semibold text-ink">{activeTrip.crop} · {activeTrip.quantity}</p><p className="mt-1 text-sm text-ink-secondary">{activeTrip.procurementCentre}</p><p className="mt-1 text-xs text-ink-secondary">→ {activeTrip.warehouse}</p></div><div className="flex gap-3">{activeTrip.status === 'accepted' ? <button onClick={() => setScreen('driverActiveTrip')} className="primary-button flex-1 justify-center">{t('startTrip', language)} <ArrowRight size={16} /></button> : <button onClick={() => setScreen('driverActiveTrip')} className="primary-button flex-1 justify-center">{t('viewDetails', language)} <ArrowRight size={16} /></button>}</div></div> : <div className="mt-5 text-center"><p className="text-sm text-ink-secondary">{t('noActiveTrip', language)}</p></div>}</div><div className="panel"><div className="flex items-center justify-between"><h2 className="section-title">{t('nearbyWarehouses', language)}</h2><Warehouse size={20} className="text-agri-green" /></div><div className="mt-5 space-y-3">{driverWarehouses.slice(0, 3).map((wh) => <div key={wh.id} className="vehicle-card"><div className="vehicle-icon"><Warehouse size={21} /></div><div className="min-w-0 flex-1"><p className="font-semibold text-ink">{wh.name}</p><p className="mt-1 text-sm text-ink-secondary">{wh.location} · {wh.distanceKm} km</p></div><span className={`text-xs font-semibold ${wh.status === 'available' ? 'text-agri-green' : wh.status === 'limited' ? 'text-saffron' : 'text-danger'}`}>{wh.status === 'available' ? t('warehouseAvailable', language) : wh.status === 'limited' ? t('warehouseLimited', language) : t('warehouseFull', language)}</span></div>)}</div><button onClick={() => setScreen('driverWarehouses')} className="mt-4 text-sm font-semibold text-agri-green">{t('viewRoute', language)} <ArrowRight size={15} className="ml-1 inline" /></button></div></div><div className="mt-8 grid gap-4 sm:grid-cols-2"><button onClick={() => setScreen('driverRequests')} className="panel flex items-center gap-3 text-left transition hover:shadow-md"><div className="action-icon"><FileCheck2 size={20} /></div><div><p className="font-semibold text-ink">{t('upcomingRequests', language)}</p><p className="text-sm text-ink-secondary">{pendingRequests.length} {t('newRequest', language)}</p></div></button><button onClick={() => setScreen('driverTripHistory')} className="panel flex items-center gap-3 text-left transition hover:shadow-md"><div className="action-icon"><Clock size={20} /></div><div><p className="font-semibold text-ink">{t('tripHistory', language)}</p><p className="text-sm text-ink-secondary">{tripHistory.length} {t('tripCompletedStatus', language)}</p></div></button></div></DashboardLayout>;
}

function DriverRequestsScreen({ setScreen, language, setLanguage, role, onSignOut }: { setScreen: (screen: Screen) => void; language: Language; setLanguage: (value: Language) => void; role: Role; onSignOut: () => void }) {
  const { pendingRequests, acceptRequest, declineRequest } = useDriverData();
  const [toast, setToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const showToast = (msg: string) => { setToastMsg(msg); setToast(true); setTimeout(() => setToast(false), 2500); };

  return <DashboardLayout language={language} setLanguage={setLanguage} active="driverRequests" setScreen={setScreen} role={role} onSignOut={onSignOut}><PageBack title={t('upcomingRequests', language)} onBack={() => setScreen('driver')} /><div className="mx-auto mt-7 max-w-2xl">{pendingRequests.length === 0 ? <div className="panel text-center"><div className="screen-icon mx-auto"><FileCheck2 size={25} /></div><h2 className="mt-5 font-display text-2xl font-semibold text-navy">{t('noUpcomingRequests', language)}</h2></div> : <div className="space-y-4">{pendingRequests.map((req) => <div key={req.id} className="load-card"><div className="flex items-start justify-between"><div className="flex items-center gap-3"><div className="vehicle-icon"><Truck size={21} /></div><div><p className="font-semibold text-ink">{req.crop} · {req.quantity}</p><p className="mt-1 text-xs text-ink-secondary">{req.id}</p></div></div><span className="load-match-tag"><MapPin size={12} /> {req.distanceKm} km</span></div><div className="mt-4 grid grid-cols-2 gap-3"><Info label={t('procurementCentre', language)} value={req.procurementCentre} /><Info label={t('nearbyWarehouses', language)} value={req.warehouse} /><Info label={t('preferredDate', language)} value={req.pickupDate} /><Info label={t('preferredTime', language)} value={req.pickupTime} /></div><div className="mt-4 flex items-center justify-between"><p className="font-display text-lg font-semibold text-navy">₹{req.estimatedPayment.toLocaleString('en-IN')} <span className="text-xs font-normal text-ink-secondary">{t('estimated', language)}</span></p><div className="flex gap-2"><button onClick={() => { declineRequest(req.id); showToast(t('requestDeclined', language)); }} className="secondary-button justify-center text-sm" style={{ color: '#B85C5C' }}>{t('declineRequest', language)}</button><button onClick={() => { acceptRequest(req.id); showToast(t('requestAccepted', language)); }} className="primary-button justify-center text-sm">{t('acceptRequest', language)} <Check size={16} /></button></div></div></div>)}</div>}</div>{toast && <div className="toast"><Check size={16} /> {toastMsg}</div>}</DashboardLayout>;
}

function DriverActiveTripScreen({ setScreen, language, setLanguage, role, onSignOut }: { setScreen: (screen: Screen) => void; language: Language; setLanguage: (value: Language) => void; role: Role; onSignOut: () => void }) {
  const { activeTrip, startTrip, completeTrip } = useDriverData();
  const [toast, setToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const showToast = (msg: string) => { setToastMsg(msg); setToast(true); setTimeout(() => setToast(false), 2500); };

  return <DashboardLayout language={language} setLanguage={setLanguage} active="driverActiveTrip" setScreen={setScreen} role={role} onSignOut={onSignOut}><PageBack title={t('activeTrip', language)} onBack={() => setScreen('driver')} /><div className="mx-auto mt-7 max-w-2xl">{!activeTrip ? <div className="panel text-center"><div className="screen-icon mx-auto"><Route size={25} /></div><h2 className="mt-5 font-display text-2xl font-semibold text-navy">{t('noActiveTrip', language)}</h2><button onClick={() => setScreen('driverRequests')} className="primary-button mt-6 justify-center">{t('acceptRequest', language)} <ArrowRight size={18} /></button></div> : <><div className="panel"><h2 className="section-title">{t('routeStatus', language)}</h2><div className="mt-5 space-y-4"><div className="rounded-xl bg-[#F7F8F5] p-4"><div className="flex items-center gap-3"><div className="crop-icon small bg-[#DCE9DF] text-agri-green"><Leaf size={16} /></div><div><p className="font-semibold text-ink">{activeTrip.crop} · {activeTrip.quantity}</p><p className="text-xs text-ink-secondary">{activeTrip.id}</p></div></div></div><div className="grid grid-cols-2 gap-3"><Info label={t('procurementCentre', language)} value={activeTrip.procurementCentre} /><Info label={t('nearbyWarehouses', language)} value={activeTrip.warehouse} /><Info label={t('preferredDate', language)} value={activeTrip.pickupDate} /><Info label={t('preferredTime', language)} value={activeTrip.pickupTime} /></div><div className="flex items-center justify-between rounded-xl bg-success-light p-4 border border-success-light"><div className="flex items-center gap-3"><div className="crop-icon small bg-navy text-white"><Wallet size={16} /></div><span className="text-sm font-semibold text-success">{t('transportPayment', language)}</span></div><span className="font-display text-2xl font-semibold text-success">₹{activeTrip.estimatedPayment.toLocaleString('en-IN')}</span></div></div><div className="mt-5 rounded-xl border border-line p-4"><div className="mb-3 flex items-center gap-2"><Navigation size={16} className="text-agri-green" /><h3 className="text-sm font-semibold text-ink">{t('navToWarehouse', language)}</h3></div><div className="space-y-3"><div className="flex items-center gap-3"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-agri-green text-white text-xs font-bold">A</div><div className="flex-1"><p className="text-xs text-ink-secondary">{t('currentLocation', language)}</p><p className="text-sm font-medium text-ink">{activeTrip.procurementCentre}</p></div></div><div className="ml-4 h-6 border-l-2 border-dashed border-line" /><div className="flex items-center gap-3"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-navy text-white text-xs font-bold">B</div><div className="flex-1"><p className="text-xs text-ink-secondary">{t('destination', language)}</p><p className="text-sm font-medium text-ink">{activeTrip.warehouse}</p></div></div></div><div className="mt-4 grid grid-cols-2 gap-3"><div className="rounded-lg bg-[#F7F8F5] p-3"><p className="text-xs text-ink-secondary">{t('remainingDistance', language)}</p><p className="mt-1 font-display text-lg font-semibold text-navy">{activeTrip.distanceKm} km</p></div><div className="rounded-lg bg-[#F7F8F5] p-3"><p className="text-xs text-ink-secondary">{t('estimatedArrival', language)}</p><p className="mt-1 font-display text-lg font-semibold text-navy">{activeTrip.status === 'started' ? '~25 min' : '~30 min'}</p></div></div><div className="mt-3"><div className="h-2 rounded-full bg-line"><div className="h-2 rounded-full bg-agri-green transition-all" style={{ width: activeTrip.status === 'started' ? '45%' : '0%' }} /></div><p className="mt-2 text-center text-xs font-medium text-ink-secondary">{activeTrip.status === 'started' ? t('navigating', language) : t('startNavigation', language)}</p></div></div><div className="mt-5 flex gap-3">{activeTrip.status === 'accepted' ? <button onClick={() => { startTrip(activeTrip.id); showToast(t('tripStarted', language)); }} className="primary-button flex-1 justify-center">{t('startTrip', language)} <ArrowRight size={18} /></button> : <button onClick={() => { completeTrip(activeTrip.id); showToast(t('tripCompleted', language)); setScreen('driverTripHistory'); }} className="primary-button flex-1 justify-center"><Check size={18} /> {t('completeTrip', language)}</button>}<button onClick={() => setScreen('driver')} className="secondary-button flex-1 justify-center">{t('backToDashboard', language)}</button></div></div></>}</div>{toast && <div className="toast"><Check size={16} /> {toastMsg}</div>}</DashboardLayout>;
}

function DriverWarehousesScreen({ setScreen, language, setLanguage, role, onSignOut }: { setScreen: (screen: Screen) => void; language: Language; setLanguage: (value: Language) => void; role: Role; onSignOut: () => void }) {
  return <DashboardLayout language={language} setLanguage={setLanguage} active="driverWarehouses" setScreen={setScreen} role={role} onSignOut={onSignOut}><PageBack title={t('nearbyWarehouses', language)} onBack={() => setScreen('driver')} /><div className="mx-auto mt-7 max-w-2xl"><div className="space-y-3">{driverWarehouses.map((wh) => <div key={wh.id} className="vehicle-card"><div className="vehicle-icon"><Warehouse size={21} /></div><div className="min-w-0 flex-1"><p className="font-semibold text-ink">{wh.name}</p><p className="mt-1 text-sm text-ink-secondary">{wh.location}</p><p className="mt-2 text-xs text-ink-secondary">{wh.distanceKm} km {t('away', language)}</p></div><div className="text-right"><span className={`text-sm font-semibold ${wh.status === 'available' ? 'text-agri-green' : wh.status === 'limited' ? 'text-saffron' : 'text-danger'}`}>{wh.status === 'available' ? t('warehouseAvailable', language) : wh.status === 'limited' ? t('warehouseLimited', language) : t('warehouseFull', language)}</span></div></div>)}</div></div></DashboardLayout>;
}

function DriverPaymentsScreen({ setScreen, language, setLanguage, role, onSignOut }: { setScreen: (screen: Screen) => void; language: Language; setLanguage: (value: Language) => void; role: Role; onSignOut: () => void }) {
  const { totalEarnings, pendingPayments, tripHistory } = useDriverData();
  return <DashboardLayout language={language} setLanguage={setLanguage} active="driverPayments" setScreen={setScreen} role={role} onSignOut={onSignOut}><PageBack title={t('driverPayments', language)} onBack={() => setScreen('driver')} /><div className="mx-auto mt-7 max-w-2xl"><div className="grid gap-4 sm:grid-cols-2"><div className="panel"><div className="flex items-center gap-2"><Wallet size={18} className="text-agri-green" /><h2 className="section-title">{t('totalEarnings', language)}</h2></div><p className="mt-4 font-display text-3xl font-semibold text-success">₹{totalEarnings.toLocaleString('en-IN')}</p></div><div className="panel"><div className="flex items-center gap-2"><Clock size={18} className="text-saffron" /><h2 className="section-title">{t('pendingPayments', language)}</h2></div><p className="mt-4 font-display text-3xl font-semibold text-saffron">₹{pendingPayments.toLocaleString('en-IN')}</p></div></div><div className="mt-6 panel"><h2 className="section-title">{t('tripHistory', language)}</h2>{tripHistory.length === 0 ? <p className="mt-4 text-sm text-ink-secondary">{t('noTripHistory', language)}</p> : <div className="mt-4 space-y-3">{tripHistory.map((trip) => <div key={trip.id} className="booking-card"><div className="booking-card-header"><div><p className="font-semibold text-ink">{trip.crop} · {trip.quantity}</p><p className="mt-1 text-xs text-ink-secondary">{trip.procurementCentre} → {trip.warehouse}</p></div><span className={`booking-status-badge ${trip.paymentStatus === 'completed' ? 'confirmed' : 'cancelled'}`}>{trip.paymentStatus === 'completed' ? t('paymentCompleted', language) : t('paymentPending', language)}</span></div><div className="mt-3 flex items-center justify-between"><span className="text-sm text-ink-secondary">{trip.distanceKm} km</span><span className="font-semibold text-navy">₹{trip.payment.toLocaleString('en-IN')}</span></div></div>)}</div>}</div></div></DashboardLayout>;
}

function DriverTripHistoryScreen({ setScreen, language, setLanguage, role, onSignOut }: { setScreen: (screen: Screen) => void; language: Language; setLanguage: (value: Language) => void; role: Role; onSignOut: () => void }) {
  const { tripHistory } = useDriverData();
  return <DashboardLayout language={language} setLanguage={setLanguage} active="driverTripHistory" setScreen={setScreen} role={role} onSignOut={onSignOut}><PageBack title={t('tripHistory', language)} onBack={() => setScreen('driver')} /><div className="mx-auto mt-7 max-w-2xl">{tripHistory.length === 0 ? <div className="panel text-center"><div className="screen-icon mx-auto"><Clock size={25} /></div><h2 className="mt-5 font-display text-2xl font-semibold text-navy">{t('noTripHistory', language)}</h2></div> : <div className="space-y-3">{tripHistory.map((trip) => <div key={trip.id} className="booking-card"><div className="booking-card-header"><div><p className="font-semibold text-ink">{trip.crop} · {trip.quantity}</p><p className="mt-1 text-xs text-ink-secondary">{trip.procurementCentre} → {trip.warehouse}</p></div><span className="booking-status-badge confirmed"><Check size={13} /> {t('tripCompletedStatus', language)}</span></div><div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3"><Info label={t('bookingId', language)} value={trip.id} /><Info label={t('estimated', language)} value={`${trip.distanceKm} km`} /><Info label={t('transportPayment', language)} value={`₹${trip.payment.toLocaleString('en-IN')}`} /></div></div>)}</div>}</div></DashboardLayout>;
}

function DriverProfileScreen({ setScreen, language, setLanguage, role, onSignOut }: { setScreen: (screen: Screen) => void; language: Language; setLanguage: (value: Language) => void; role: Role; onSignOut: () => void }) {
  const { driver, tripHistory, totalEarnings } = useDriverData();
  return <DashboardLayout language={language} setLanguage={setLanguage} active="driverProfile" setScreen={setScreen} role={role} onSignOut={onSignOut}><PageBack title={t('driverProfile', language)} onBack={() => setScreen('driver')} /><div className="mx-auto mt-7 max-w-2xl"><div className="profile-header"><div className="profile-avatar"><UserRound size={48} /></div><div><h2 className="font-display text-2xl font-semibold text-navy">{driver.name || 'Driver'}</h2><p className="mt-1 text-sm text-ink-secondary">{t('driverProfile', language)}</p></div></div><div className="mt-6 panel"><div className="grid gap-5 sm:grid-cols-2"><ProfileInfoRow icon={UserRound} label={t('driverName', language)} value={driver.name} /><ProfileInfoRow icon={Phone} label={t('driverMobileNumber', language)} value={driver.mobileNumber} /><ProfileInfoRow icon={Truck} label={t('driverVehicleNumber', language)} value={driver.vehicleNumber} /><ProfileInfoRow icon={ShieldCheck} label={t('drivingLicenceNumber', language)} value={driver.licenceNumber} /><ProfileInfoRow icon={ShieldCheck} label={t('pollutionCertNumber', language)} value={driver.pollutionCertNumber} /><ProfileInfoRow icon={TrendingUp} label={t('totalEarnings', language)} value={`₹${totalEarnings.toLocaleString('en-IN')}`} /><ProfileInfoRow icon={Clock} label={t('tripHistory', language)} value={`${tripHistory.length} ${t('tripCompletedStatus', language)}`} /></div></div><div className="mt-5 flex gap-3"><button onClick={() => setScreen('driver')} className="primary-button flex-1 justify-center">{t('backToDashboard', language)} <ArrowRight size={18} /></button></div></div></DashboardLayout>;
}

function MandiExpressScreen({ setScreen, language, setLanguage, role, onSignOut }: { setScreen: (screen: Screen) => void; language: Language; setLanguage: (value: Language) => void; role: Role; onSignOut: () => void }) {
  const [toast, setToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const showToast = (msg: string) => { setToastMsg(msg); setToast(true); setTimeout(() => setToast(false), 2500); };

  const nearbyDrivers = [
    { id: 'd1', name: 'Rajesh Kumar', vehicleNumber: 'RJ01 AB 1234', distanceKm: 2.3, capacity: '40 Quintal', status: 'available' as const, location: 'Sikar Road, Jaipur' },
    { id: 'd2', name: 'Mohan Singh', vehicleNumber: 'RJ02 CD 5678', distanceKm: 5.1, capacity: '25 Quintal', status: 'available' as const, location: 'Vaishali Nagar, Jaipur' },
    { id: 'd3', name: 'Vikram Meena', vehicleNumber: 'RJ14 EF 9012', distanceKm: 8.7, capacity: '60 Quintal', status: 'busy' as const, location: 'Tonk Road, Jaipur' },
    { id: 'd4', name: 'Suresh Lal', vehicleNumber: 'RJ01 GH 3456', distanceKm: 3.5, capacity: '35 Quintal', status: 'available' as const, location: 'Jawahar Circle, Jaipur' },
    { id: 'd5', name: 'Dinesh Patel', vehicleNumber: 'RJ03 IJ 7890', distanceKm: 11.2, capacity: '50 Quintal', status: 'busy' as const, location: 'Mansarovar, Jaipur' },
  ];

  return <DashboardLayout language={language} setLanguage={setLanguage} active="mandiExpress" setScreen={setScreen} role={role} onSignOut={onSignOut}><PageBack title={t('mandiExpressTitle', language)} onBack={() => setScreen('officer')} /><div className="mx-auto mt-7 max-w-4xl"><div className="panel"><div className="flex items-center gap-2"><Navigation size={20} className="text-agri-green" /><div><h2 className="section-title">{t('mandiExpressTitle', language)}</h2><p className="mt-1 text-sm text-ink-secondary">{t('mandiExpressDesc', language)}</p></div></div></div><div className="mt-6 panel"><div className="mb-4 flex items-center justify-between"><h3 className="text-sm font-semibold text-ink">{t('liveMap', language)}</h3><span className="flex items-center gap-1.5 text-xs font-medium text-agri-green"><span className="h-2 w-2 animate-pulse rounded-full bg-agri-green" /> Live</span></div><div className="relative h-64 overflow-hidden rounded-xl bg-[#E8F0E8]"><div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'linear-gradient(#A8C8A8 1px, transparent 1px), linear-gradient(90deg, #A8C8A8 1px, transparent 1px)', backgroundSize: '40px 40px' }} /><svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none"><path d="M 50 180 Q 150 120 250 80" stroke="#5B8C5B" strokeWidth="2" fill="none" strokeDasharray="6 4" /><path d="M 300 200 Q 200 150 120 100" stroke="#5B8C5B" strokeWidth="2" fill="none" strokeDasharray="6 4" /></svg>{nearbyDrivers.slice(0, 4).map((driver, i) => <div key={driver.id} className="absolute flex flex-col items-center" style={{ left: `${15 + i * 22}%`, top: `${30 + (i % 2) * 35}%` }}><div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 border-white shadow-md ${driver.status === 'available' ? 'bg-agri-green' : 'bg-saffron'}`}><Truck size={14} className="text-white" /></div><span className="mt-1 rounded bg-white/90 px-1.5 py-0.5 text-[10px] font-semibold text-ink">{driver.distanceKm} km</span></div>)}<div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"><div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-navy shadow-lg"><MapPin size={18} className="text-white" /></div></div></div></div><h3 className="section-title mt-8">{t('nearbyDrivers', language)}</h3><div className="mt-4 space-y-3">{nearbyDrivers.map((driver) => <div key={driver.id} className="vehicle-card"><div className="vehicle-icon"><Truck size={21} /></div><div className="min-w-0 flex-1"><p className="font-semibold text-ink">{driver.name}</p><p className="mt-1 text-sm text-ink-secondary">{driver.vehicleNumber} · {driver.location}</p><div className="mt-2 flex items-center gap-3 text-xs"><span className="flex items-center gap-1 text-ink-secondary"><MapPin size={12} /> {driver.distanceKm} km</span><span className="flex items-center gap-1 text-ink-secondary"><PackageCheck size={12} /> {t('driverCapacity', language)}: {driver.capacity}</span></div></div><div className="flex flex-col items-end gap-2"><span className={`text-xs font-semibold ${driver.status === 'available' ? 'text-agri-green' : 'text-saffron'}`}>{driver.status === 'available' ? t('driverAvailable', language) : t('driverBusy', language)}</span>{driver.status === 'available' && <button onClick={() => showToast(t('requestSent', language))} className="primary-button justify-center text-sm"><Send size={14} /> {t('sendRequest', language)}</button>}</div></div>)}</div></div>{toast && <div className="toast"><Check size={16} /> {toastMsg}</div>}</DashboardLayout>;
}

function App() {
  const [screen, setScreen] = useState<Screen>('welcome');
  const [language, setLanguage] = useState<Language>('en');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<Role>('farmer');
  const bookingData = useBookingData();
  const [userProfile, setUserProfile] = useState<UserProfile>(defaultUserProfile);
  const [bookInitialTime, setBookInitialTime] = useState<string | undefined>(undefined);
  const [bookResetKey, setBookResetKey] = useState(0);

  const updateUserProfile = (updater: (prev: UserProfile) => UserProfile) => setUserProfile(updater);
  const profileContext = useMemo(() => ({ userProfile, setUserProfile: updateUserProfile }), [userProfile]);

  const signOut = () => { setScreen('welcome'); setPhone(''); setRole('farmer'); };
  const dashboardProps = { language, setLanguage, role, onSignOut: signOut };

  return (
    <UserProfileContext.Provider value={profileContext}>
      <div dir={language === 'ur' ? 'rtl' : 'ltr'} className={language === 'ur' ? 'text-right' : ''}>
        {screen === 'welcome' && <Welcome language={language} setLanguage={setLanguage} onStart={() => setScreen('phone')} />}
        {screen === 'phone' && <PhoneScreen language={language} setLanguage={setLanguage} onNext={(value) => { setPhone(value); setScreen('otp'); }} onBack={() => setScreen('welcome')} />}
        {screen === 'otp' && <OtpScreen language={language} setLanguage={setLanguage} phone={phone} onNext={() => setScreen('role')} onBack={() => setScreen('phone')} />}
        {screen === 'role' && <RoleScreen language={language} setLanguage={setLanguage} onSelect={(value) => { setRole(value); setScreen('profileSetup'); }} onBack={() => setScreen('otp')} />}
        {screen === 'profileSetup' && <ProfileSetupScreen language={language} setLanguage={setLanguage} role={role} onComplete={() => { if (role === 'farmer') { setScreen('aadhaarStep'); } else if (role === 'driver') { setScreen('driverOnboarding'); } else { setScreen('officer'); } }} onBack={() => setScreen('role')} />}
        {screen === 'aadhaarStep' && <AadhaarStepScreen language={language} setLanguage={setLanguage} onComplete={() => setScreen('bankStep')} onBack={() => setScreen('profileSetup')} />}
        {screen === 'bankStep' && <BankStepScreen language={language} setLanguage={setLanguage} onComplete={() => setScreen('farmer')} onBack={() => setScreen('aadhaarStep')} />}

        {screen === 'farmer' && <FarmerDashboard {...dashboardProps} setScreen={(s) => { if (s === 'book') { setBookInitialTime(undefined); setBookResetKey((k) => k + 1); } setScreen(s); }} />}
        {screen === 'book' && <BookScreen key={bookResetKey} {...dashboardProps} setScreen={setScreen} bookingData={bookingData} initialTime={bookInitialTime} resetKey={bookResetKey} />}
        {screen === 'pass' && <PassScreen {...dashboardProps} setScreen={setScreen} bookingData={bookingData} />}
        {screen === 'myBookings' && <MyBookingsScreen {...dashboardProps} setScreen={setScreen} bookingData={bookingData} />}
        {screen === 'truckPool' && <TruckPoolScreen {...dashboardProps} setScreen={setScreen} />}
        {screen === 'rates' && <RatesScreen {...dashboardProps} setScreen={setScreen} />}
        {screen === 'transport' && <TransportScreen {...dashboardProps} setScreen={setScreen} />}
        {screen === 'tractorPool' && <TractorPoolScreen {...dashboardProps} setScreen={setScreen} />}
        {screen === 'trackPayment' && <TrackPaymentScreen {...dashboardProps} setScreen={setScreen} bookingData={bookingData} />}

        {screen === 'officer' && <OfficerDashboard {...dashboardProps} setScreen={setScreen} />}
        {screen === 'scanner' && <ScannerScreen {...dashboardProps} setScreen={setScreen} />}
        {screen === 'mandiExpress' && <MandiExpressScreen {...dashboardProps} setScreen={setScreen} />}
        {screen === 'farmerProfile' && <FarmerProfileScreen {...dashboardProps} setScreen={setScreen} />}
        {screen === 'officerProfile' && <OfficerProfileScreen {...dashboardProps} setScreen={setScreen} />}

        {screen === 'driverOnboarding' && <DriverOnboardingScreen {...dashboardProps} setScreen={setScreen} />}
        {screen === 'driver' && <DriverDashboardScreen {...dashboardProps} setScreen={setScreen} />}
        {screen === 'driverRequests' && <DriverRequestsScreen {...dashboardProps} setScreen={setScreen} />}
        {screen === 'driverActiveTrip' && <DriverActiveTripScreen {...dashboardProps} setScreen={setScreen} />}
        {screen === 'driverWarehouses' && <DriverWarehousesScreen {...dashboardProps} setScreen={setScreen} />}
        {screen === 'driverPayments' && <DriverPaymentsScreen {...dashboardProps} setScreen={setScreen} />}
        {screen === 'driverTripHistory' && <DriverTripHistoryScreen {...dashboardProps} setScreen={setScreen} />}
        {screen === 'driverProfile' && <DriverProfileScreen {...dashboardProps} setScreen={setScreen} />}
        {!['welcome', 'phone', 'otp', 'role', 'profileSetup', 'aadhaarStep', 'bankStep', 'farmer', 'book', 'pass', 'myBookings', 'truckPool', 'rates', 'transport', 'tractorPool', 'trackPayment', 'officer', 'scanner', 'mandiExpress', 'farmerProfile', 'officerProfile', 'driverOnboarding', 'driver', 'driverRequests', 'driverActiveTrip', 'driverWarehouses', 'driverPayments', 'driverTripHistory', 'driverProfile'].includes(screen) && <Welcome language={language} setLanguage={setLanguage} onStart={() => setScreen('phone')} />}
      </div>
    </UserProfileContext.Provider>
  );
}

export default App;
