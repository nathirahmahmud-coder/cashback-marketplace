'use client'

import { useMemo, useState } from 'react'
import {
  ArrowDownUp,
  ArrowLeft,
  ArrowLeftRight,
  Bell,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Clock3,
  CreditCard,
  ExternalLink,
  Eye,
  FileText,
  Filter,
  Home,
  Menu,
  QrCode,
  ReceiptText,
  Search,
  ShieldCheck,
  ShoppingBag,
  Signal,
  Sparkles,
  UserRound,
  Wifi,
  X,
} from 'lucide-react'

type Screen = 'home' | 'deals' | 'merchant' | 'ledger' | 'transaction' | 'terms'
type CashbackStatus = 'Pending' | 'Approved' | 'Rejected'

const DEFAULT_CUSTOMER_ALLOCATION = 70
const ASTRO_COMMISSION_SHARE = 70

type MerchantEventRate = { category: string; advertiserCommissionRate: number; customerAllocation?: number }

type Merchant = {
  id: string
  name: string
  logo: string
  logoUrl?: string
  description: string
  categories: string[]
  eventRates: MerchantEventRate[]
  detailRoute: 'merchant'
  affiliateUrl: string | null
  officialWebsite: string
  terms: string[]
}

type Transaction = {
  id: string
  merchant: string
  date: string
  description: string
  amount: number
  status: CashbackStatus
  orderId?: string
  purchaseDateTime?: string
  purchaseAmount?: number
  estimatedAmount?: number
  statusUpdatedAt: string
}

const merchants: Merchant[] = [
  { id: 'trip-com', name: 'Trip.com', logo: 'tripdotcom', logoUrl: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Trip_com-sn1QZ3qwv2QFeLdrz73nf9gyF6fb6y.jpg', description: 'Hotels, Flights & More', categories: ['Hotels', 'Flights', 'Car Rentals', 'Activities'], eventRates: [{ category: 'Hotels', advertiserCommissionRate: 12.24 }, { category: 'Flights', advertiserCommissionRate: 6.12 }, { category: 'Car Rentals', advertiserCommissionRate: 8.16 }, { category: 'Activities', advertiserCommissionRate: 8.16 }], detailRoute: 'merchant', affiliateUrl: null, officialWebsite: 'https://www.trip.com', terms: ['Cancelled, refunded or no-show bookings may be excluded.', 'Unapproved promo codes and untracked purchases may be ineligible.'] },
  { id: 'agoda', name: 'Agoda', logo: 'agoda', logoUrl: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/agoda-IIqFitiJ9AsdLvrF8CIWrwrHJtpU1m.png', description: 'Hotels & Homes', categories: ['Hotels', 'Homes'], eventRates: [{ category: 'Hotels', advertiserCommissionRate: 5, customerAllocation: 50 }, { category: 'Homes', advertiserCommissionRate: 10.2 }], detailRoute: 'merchant', affiliateUrl: null, officialWebsite: 'https://www.agoda.com', terms: ['Only completed and eligible hotel or home bookings may qualify.', 'Cancelled, refunded, no-show or otherwise excluded bookings may not earn cashback.'] },
  { id: 'klook', name: 'Klook', logo: 'klook', logoUrl: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/klook-hK1DKKqfZQaEDgtympzj2LBY6nHgLC.jpg', description: 'Activities & Attractions', categories: ['Activities', 'Attractions'], eventRates: [{ category: 'Activities', advertiserCommissionRate: 8.16 }, { category: 'Attractions', advertiserCommissionRate: 8.16 }], detailRoute: 'merchant', affiliateUrl: null, officialWebsite: 'https://www.klook.com', terms: ['Eligible activities and attraction bookings are subject to the offer shown at purchase.', 'Cancelled, refunded or untracked bookings may be excluded.'] },
  { id: 'zalora', name: 'ZALORA', logo: 'zalora', description: 'Fashion & Lifestyle', categories: ['Fashion', 'Lifestyle'], eventRates: [{ category: 'Fashion', advertiserCommissionRate: 16.33 }, { category: 'Lifestyle', advertiserCommissionRate: 16.33 }], detailRoute: 'merchant', affiliateUrl: null, officialWebsite: 'https://www.zalora.com.my', terms: ['Eligible purchases must be completed through the Shop Now offer path.', 'Returned or refunded purchases and excluded items may not qualify.'] },
  { id: 'lazada', name: 'Lazada', logo: 'lazada', logoUrl: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Lazada-0Jc7Exc727osXqjuDKOS8btB52nstk.png', description: 'Online Shopping', categories: ['Online Shopping'], eventRates: [{ category: 'Online Shopping', advertiserCommissionRate: 12.24 }], detailRoute: 'merchant', affiliateUrl: null, officialWebsite: 'https://www.lazada.com.my', terms: ['Only eligible orders placed through the tracked offer path may qualify.', 'Cancelled orders, returned items and excluded products may not earn cashback.'] },
  { id: 'shopee', name: 'Shopee', logo: 'shopee', logoUrl: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Shopee-7qXB9vRfgWlGMYxvlUnd2KTZpOlanR.png', description: 'Online Shopping', categories: ['Online Shopping'], eventRates: [{ category: 'Online Shopping', advertiserCommissionRate: 8.16 }], detailRoute: 'merchant', affiliateUrl: null, officialWebsite: 'https://shopee.com.my', terms: ['Eligible products and completed orders are subject to the merchant offer.', 'Cancelled, returned or untracked orders may be excluded.'] },
  { id: 'adidas', name: 'adidas', logo: 'adidas', logoUrl: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/adidas-8SXiWJiWNIaNVajf0vLsDyB0s0lVGq.png', description: 'Fashion & Sports', categories: ['Fashion', 'Sports'], eventRates: [{ category: 'Fashion', advertiserCommissionRate: 16.33 }, { category: 'Sports', advertiserCommissionRate: 16.33 }], detailRoute: 'merchant', affiliateUrl: null, officialWebsite: 'https://www.adidas.com.my', terms: ['Eligible fashion and sports items are subject to the merchant offer.', 'Returned, refunded or excluded items may not qualify for cashback.'] },
  { id: 'uniqlo', name: 'UNIQLO', logo: 'uniqlo', logoUrl: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/UNIQLO-MTkUYPM6maFUuhPnXwHnGfbkFRTB8O.png', description: 'Fashion & Lifestyle', categories: ['Fashion', 'Lifestyle'], eventRates: [{ category: 'Fashion', advertiserCommissionRate: 12.24 }, { category: 'Lifestyle', advertiserCommissionRate: 12.24 }], detailRoute: 'merchant', affiliateUrl: null, officialWebsite: 'https://www.uniqlo.com/my', terms: ['Eligible purchases must follow the merchant-specific offer conditions.', 'Cancelled, refunded or excluded purchases may not qualify.'] },
]

const merchantAbout: Record<Merchant['id'], string> = {
  'trip-com': 'Plan your next trip with Trip.com, where you can book stays, flights, car rentals and activities in one place. Earn cashback on eligible bookings; rates vary by category and offer terms.',
  agoda: 'Find a stay for every kind of getaway with Agoda, from hotels to private homes. Earn cashback on eligible bookings; rates and eligibility are subject to offer terms.',
  klook: 'Make more of every trip with Klook. Discover and book activities and attractions, then earn cashback on eligible bookings under the offer terms.',
  zalora: 'Refresh your wardrobe with ZALORA’s selection of fashion and lifestyle brands. Earn cashback on eligible purchases; exclusions and offer terms apply.',
  lazada: 'Explore Lazada’s online marketplace for everyday essentials, new discoveries and more. Earn cashback on eligible orders; product exclusions and offer terms apply.',
  shopee: 'Find everyday favourites and new discoveries across Shopee’s online marketplace. Earn cashback on eligible orders; product exclusions and offer terms apply.',
  adidas: 'Explore adidas sportswear, footwear and accessories designed for sport and everyday wear. Earn cashback on eligible purchases; exclusions and offer terms apply.',
  uniqlo: 'Discover UNIQLO LifeWear: thoughtfully designed clothing made for comfort, quality and everyday versatility. Earn cashback on eligible purchases; exclusions and offer terms apply.',
}

const homeFeaturedRates: Record<string, number> = { 'Trip.com': 6, Agoda: 6, Klook: 4 }

const transactions: Transaction[] = [
  { id: 'trip-approved', merchant: 'Trip.com', date: '12 Oct 2026', description: 'Hotels', amount: 12, status: 'Approved', orderId: 'TC2026101201', purchaseDateTime: '12 Oct 2026, 9:20 AM', purchaseAmount: 200, statusUpdatedAt: '26 Oct 2026, 2:15 PM' },
  { id: 'klook-approved', merchant: 'Klook', date: '2 Oct 2026', description: 'Activities', amount: 8, status: 'Approved', orderId: 'KL2026100204', purchaseDateTime: '2 Oct 2026, 2:14 PM', purchaseAmount: 200, statusUpdatedAt: '26 Oct 2026, 2:15 PM' },
  { id: 'agoda-pending', merchant: 'Agoda', date: '28 Sep 2026', description: 'Hotels', amount: 8.75, estimatedAmount: 8.75, status: 'Pending', orderId: 'AG2026092808', purchaseDateTime: '28 Sep 2026, 10:45 AM', purchaseAmount: 500, statusUpdatedAt: '25 Oct 2026, 10:30 AM' },
  { id: 'zalora-rejected', merchant: 'ZALORA', date: '28 Sep 2026', description: 'Fashion', amount: 0, status: 'Rejected', orderId: 'ZL20260928', purchaseDateTime: '28 Sep 2026, 10:45 AM', purchaseAmount: 250, statusUpdatedAt: '27 Oct 2026, 4:45 PM' },
  { id: 'shopee-approved', merchant: 'Shopee', date: '8 Sep 2026', description: 'Online Shopping', amount: 4, status: 'Approved', orderId: 'SH2026090802', purchaseDateTime: '8 Sep 2026, 11:05 AM', purchaseAmount: 100, statusUpdatedAt: '26 Oct 2026, 2:15 PM' },
  { id: 'lazada-approved', merchant: 'Lazada', date: '22 Aug 2026', description: 'Online Shopping', amount: 10, status: 'Approved', orderId: 'LZ2026082210', purchaseDateTime: '22 Aug 2026, 4:30 PM', purchaseAmount: 250, statusUpdatedAt: '26 Oct 2026, 2:15 PM' },
]

const statusMeta: Record<CashbackStatus, { className: string }> = {
  Approved: { className: 'status-approved' },
  Pending: { className: 'status-pending' },
  Rejected: { className: 'status-rejected' },
}
const merchantFor = (name: string) => merchants.find((merchant) => merchant.name === name) ?? merchants[0]
const effectiveEventRate = (eventRate: MerchantEventRate) => eventRate.advertiserCommissionRate * (ASTRO_COMMISSION_SHARE / 100) * ((eventRate.customerAllocation ?? DEFAULT_CUSTOMER_ALLOCATION) / 100)
const merchantCashbackRate = (merchant: Merchant) => Math.max(...merchant.eventRates.map(effectiveEventRate))
const estimatedCashbackFor = (transaction: Transaction) => {
  if (transaction.purchaseAmount === undefined) return transaction.estimatedAmount ?? transaction.amount
  const merchant = merchantFor(transaction.merchant)
  const eventRate = merchant.eventRates.find((item) => item.category === transaction.description)
  const rate = eventRate ? effectiveEventRate(eventRate) : merchantCashbackRate(merchant)
  return Number(((transaction.purchaseAmount * rate) / 100).toFixed(2))
}
const formatRate = (rate: number) => Number(rate.toFixed(2)).toString()
const formatRM = (amount: number) => `RM ${amount.toFixed(2)}`

function BrandLogo({ merchant, compact = false }: { merchant: Merchant; compact?: boolean }) {
  return (
    <div className={`brand-logo brand-logo-${merchant.logo} ${compact ? 'brand-logo-compact' : ''}`} aria-label={`${merchant.name} logo`}>
      {merchant.logoUrl ? <img src={merchant.logoUrl} alt={`${merchant.name} logo`} /> : <span className="brand-wordmark wordmark-zalora">ZALORA</span>}
    </div>
  )
}

function PhoneStatusBar({ dark }: { dark: boolean }) {
  return (
    <div className={`phone-status ${dark ? 'phone-status-dark' : ''}`} aria-label="9:41, mobile signal, Wi-Fi, battery">
      <span>9:41</span>
      <div className="phone-status-icons" aria-hidden="true">
        <Signal size={16} strokeWidth={2.7} />
        <Wifi size={18} strokeWidth={2.7} />
        <span className="battery-icon"><span /></span>
      </div>
    </div>
  )
}

function ScreenHeader({ title, onBack, right }: { title: string; onBack: () => void; right?: React.ReactNode }) {
  return (
    <header className="screen-header">
      <button className="icon-button" aria-label="Go back" onClick={onBack}><ChevronLeft size={23} /></button>
      <h1>{title}</h1>
      <div className="header-right">{right ?? <span className="header-spacer" />}</div>
    </header>
  )
}

function CashbackPrototype() {
  const [screen, setScreen] = useState<Screen>('home')
  const [history, setHistory] = useState<Screen[]>([])
  const [category, setCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('Name (A–Z)')
  const [transactionFilter, setTransactionFilter] = useState('All')
  const [showToast, setShowToast] = useState(false)
  const [selectedMerchantName, setSelectedMerchantName] = useState('Trip.com')
  const [selectedTransactionId, setSelectedTransactionId] = useState(transactions[0].id)

  const navigate = (next: Screen) => {
    setHistory((previous) => [...previous, screen])
    setScreen(next)
  }
  const goBack = () => {
    setHistory((previous) => {
      if (!previous.length) {
        setScreen('home')
        return previous
      }
      setScreen(previous[previous.length - 1])
      return previous.slice(0, -1)
    })
  }
  const toast = () => {
    setShowToast(true)
    window.setTimeout(() => setShowToast(false), 1900)
  }

  const filteredMerchants = useMemo(() => {
    const searchTerm = search.trim().toLowerCase()
    const filtered = merchants.filter((merchant) =>
      (category === 'All' || merchant.categories.some((item) => item.toLowerCase() === category.toLowerCase())) &&
      (!searchTerm || [merchant.name, merchant.description, ...merchant.categories].some((item) => item.toLowerCase().includes(searchTerm))),
    )
    if (sort === 'Highest Cashback Rate') return filtered.sort((a, b) => merchantCashbackRate(b) - merchantCashbackRate(a) || a.name.localeCompare(b.name))
    return filtered.sort((a, b) => a.name.localeCompare(b.name))
  }, [category, search, sort])

  const selectedMerchant = merchantFor(selectedMerchantName)
  const selectedTransaction = transactions.find((transaction) => transaction.id === selectedTransactionId) ?? transactions[0]

  const openMerchant = (name: string) => {
    const merchant = merchantFor(name)
    setSelectedMerchantName(merchant.name)
    navigate(merchant.detailRoute)
  }
  const openTransaction = (transaction: (typeof transactions)[number]) => {
    setSelectedMerchantName(transaction.merchant)
    setSelectedTransactionId(transaction.id)
    navigate('transaction')
  }

  return (
    <main className="prototype-stage">
      <div className="device-shell">
        <div className="device-camera" aria-hidden="true" />
        <PhoneStatusBar dark={false} />
        <div key={screen} className="screen-viewport screen-light">
          {screen === 'home' && <HomeScreen onOpenDeals={() => navigate('deals')} onToast={toast} />}
          {screen === 'deals' && <DealsScreen category={category} setCategory={setCategory} search={search} setSearch={setSearch} sort={sort} setSort={setSort} visibleMerchants={filteredMerchants} onBack={goBack} onSelect={openMerchant} onOpenLedger={() => navigate('ledger')} />}
          {screen === 'merchant' && <MerchantScreen merchant={selectedMerchant} onBack={goBack} onTerms={() => navigate('terms')} />}
          {screen === 'ledger' && <LedgerScreen filter={transactionFilter} setFilter={setTransactionFilter} onBack={goBack} onBrowse={() => navigate('deals')} onSelectTransaction={openTransaction} />}
          {screen === 'transaction' && <TransactionScreen transaction={selectedTransaction} merchant={selectedMerchant} onBack={goBack} onTerms={() => navigate('terms')} />}
          {screen === 'terms' && <TermsScreen merchant={selectedMerchant} onBack={goBack} onReturn={goBack} returnLabel={history[history.length - 1] === 'merchant' ? `Back to ${selectedMerchant.name}` : 'Back to transaction details'} />}
        </div>
        {showToast && <div className="app-toast" role="status">This action isn&apos;t available right now.</div>}
      </div>
    </main>
  )
}

function HomeScreen({ onOpenDeals, onToast }: { onOpenDeals: () => void; onToast: () => void }) {
  const quickActions = [
    { label: 'Scan', icon: QrCode }, { label: 'Pay', icon: CreditCard }, { label: 'Transfer', icon: ArrowLeftRight }, { label: 'Bills', icon: ReceiptText },
    { label: 'Top Up', icon: ArrowDownUp }, { label: 'Parking', icon: Clock3 }, { label: 'Insurance', icon: ShieldCheck },
  ]
  const featured = merchants.slice(0, 3)
  return (
    <div className="screen-content home-content">
      <div className="home-greeting-row">
        <div><p className="eyebrow-muted">Good morning,</p><button className="user-greeting" onClick={onToast}>Athirah <ChevronRight size={20} /></button></div>
        <div className="home-profile-actions">
          <button className="notification-button" aria-label="3 notifications" onClick={onToast}><Bell size={23} /><span>3</span></button>
          <button className="profile-button" aria-label="Profile" onClick={onToast}><UserRound size={26} /></button>
        </div>
      </div>

      <section className="balance-banner" aria-label="Total balance RM 568.00">
        <div><span className="balance-label">Total balance</span><strong>RM 568.00 <Eye size={19} /></strong></div>
        <button className="button-primary balance-add" onClick={onToast}><span>+</span> Add money</button>
      </section>

      <section className="quick-grid" aria-label="Services">
        {quickActions.map(({ label, icon: Icon }) => <button className="quick-action" key={label} onClick={onToast}><span><Icon size={22} /></span><small>{label}</small></button>)}
        <button className="quick-action cashback-shortcut" onClick={onOpenDeals}>
          <span><ShoppingBag size={24} /></span><small>Cashback<br />Deals</small><b>New</b>
        </button>
      </section>

      <button className="home-campaign" onClick={onOpenDeals} aria-label="Explore cashback deals">
        <div className="campaign-copy"><span className="campaign-kicker">Cashback Deals</span><strong>Shop online.<br />Earn cashback.</strong><p>Discover offers from your favourite brands and earn cashback on eligible purchases.</p><span className="campaign-button">Explore Deals <ChevronRight size={16} /></span></div>
        <div className="campaign-photo" role="img" aria-label="Suitcase, sun hat and sunglasses ready for a trip" />
      </button>

      <div className="section-heading home-featured-heading"><h2>Featured merchants</h2><button onClick={onOpenDeals}>See all <ChevronRight size={16} /></button></div>
      <div className="featured-scroll">
        {featured.map((merchant) => <button key={merchant.name} className="featured-card" onClick={onOpenDeals}><div className="featured-scene" /><BrandLogo merchant={merchant} /><strong>Up to {homeFeaturedRates[merchant.name]}%</strong><span>Cashback</span></button>)}
      </div>

      <nav className="bottom-tabs" aria-label="Primary navigation">
        <button className="active" aria-current="page"><Home size={20} fill="currentColor" /><span>Home</span></button>
        <button onClick={onToast}><Sparkles size={20} /><span>Rewards</span></button>
        <button onClick={onToast}><QrCode size={21} /><span>Scan</span></button>
        <button onClick={onToast}><Menu size={21} /><span>More</span></button>
      </nav>
    </div>
  )
}

function DealsScreen({ category, setCategory, search, setSearch, sort, setSort, visibleMerchants, onBack, onSelect, onOpenLedger }: {
  category: string; setCategory: (value: string) => void; search: string; setSearch: (value: string) => void; sort: string; setSort: (value: string) => void; visibleMerchants: Merchant[]; onBack: () => void; onSelect: (name: string) => void; onOpenLedger: () => void
}) {
  const categories = ['All', 'Hotels', 'Flights', 'Car Rentals', 'Activities']
  return (
    <div className="screen-content deals-content">
      <ScreenHeader title="Cashback Deals" onBack={onBack} right={<button className="icon-button" aria-label="Find offers" onClick={() => document.getElementById('merchant-search')?.focus()}><Search size={21} /></button>} />
      <nav className="cashback-section-nav" role="tablist" aria-label="Cashback section">
        <button type="button" role="tab" aria-selected="true" className="selected">Cashback Deals</button>
        <button type="button" role="tab" aria-selected="false" onClick={onOpenLedger}><ReceiptText size={15} /> My Cashback</button>
      </nav>
      <label className="search-field"><Search size={19} /><input id="merchant-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search merchants or offers" aria-label="Search merchants or offers" />{search && <button onClick={() => setSearch('')} aria-label="Clear search"><X size={15} /></button>}</label>
      <div className="category-pills" aria-label="Filter by category">
        {categories.map((item) => <button key={item} onClick={() => setCategory(item)} className={category === item ? 'selected' : ''} aria-pressed={category === item}>{item}</button>)}
      </div>
      <div className="section-heading deals-list-heading"><h2>{category === 'All' ? 'Explore offers' : `${category} offers`}</h2><label className="sort-select"><select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Sort offers"><option>Name (A–Z)</option><option>Highest Cashback Rate</option></select><ChevronDown size={15} /></label></div>
      <div className="merchant-list">
        {visibleMerchants.map((merchant) => <button className="merchant-row" key={merchant.name} onClick={() => onSelect(merchant.name)}>
          <div className="merchant-logo-box"><BrandLogo merchant={merchant} /></div>
          <div className="merchant-info"><strong>{merchant.name}</strong><span>{merchant.categories.slice(0, 2).join(' · ')}</span></div>
          <div className="merchant-rate"><strong>Up to {formatRate(merchantCashbackRate(merchant))}%</strong><span>Cashback</span></div><ChevronRight className="merchant-chevron" size={19} />
        </button>)}
        {!visibleMerchants.length && <div className="empty-search"><Search size={22} /><strong>No offers found</strong><span>Try another search or browse all offers.</span><button className="empty-state-button" onClick={() => { setSearch(''); setCategory('All') }}>Browse all offers</button></div>}
      </div>
    </div>
  )
}

function MerchantScreen({ merchant, onBack, onTerms }: { merchant: Merchant; onBack: () => void; onTerms: () => void }) {
  const shopUrl = merchant.affiliateUrl ?? merchant.officialWebsite
  const isBooking = merchant.categories.some((category) => ['Hotels', 'Homes', 'Flights', 'Car Rentals', 'Activities', 'Attractions'].includes(category))
  const purchase = isBooking ? 'booking' : 'purchase'
  const about = merchantAbout[merchant.id]
  return (
    <div className="screen-content trip-content">
      <ScreenHeader title={merchant.name} onBack={onBack} />
      <section className="merchant-profile">
        <div className="merchant-profile-logo"><BrandLogo merchant={merchant} /></div>
        <div className="trip-headline"><h2><em>Up to {formatRate(merchantCashbackRate(merchant))}%</em> Cashback</h2><p>{merchant.description}</p></div>
      </section>
      <div className="service-tags" aria-label="Merchant categories">{merchant.categories.map((item) => <span key={item}>{item}</span>)}</div>
      <section className="about-section"><h3>About {merchant.name}</h3><p>{about}</p></section>
      <section className="rates-card"><div className="rates-card-heading"><h3>Cashback rates</h3><b>Up to {formatRate(merchantCashbackRate(merchant))}%</b></div>
        {merchant.eventRates.map((eventRate) => <div className="rate-line" key={eventRate.category}><span>{eventRate.category}</span><strong>Up to {formatRate(effectiveEventRate(eventRate))}%</strong></div>)}
      </section>
      <section className="steps-section"><h3>How to earn cashback</h3>
        <Step number="1" title="Select Shop Now" description="Tap Shop Now to visit the merchant’s website or app." />
        <Step number="2" title={`Complete your ${purchase}`} description={`Complete an eligible ${purchase} and follow the merchant’s cashback terms.`} />
        <Step number="3" title="Check your cashback" description={`Visit My Cashback to view your ${purchase} and cashback status.`} />
      </section>
      <div className="trip-sticky-cta"><a className="button-primary shop-now-button" href={shopUrl} target="_blank" rel="noopener noreferrer">Shop Now <ExternalLink size={17} /></a></div>
      <button className="list-link" onClick={onTerms}><FileText size={20} /><span>View terms &amp; conditions</span><ChevronRight size={19} /></button>
    </div>
  )
}

function Step({ number, title, description }: { number: string; title: string; description: string }) {
  return <div className="instruction-step"><span className="step-number">{number}</span><div><strong>{title}</strong><p>{description}</p></div></div>
}

function LedgerScreen({ filter, setFilter, onBack, onBrowse, onSelectTransaction }: { filter: string; setFilter: (value: string) => void; onBack: () => void; onBrowse: () => void; onSelectTransaction: (transaction: Transaction) => void }) {
  const filters: Array<'All' | CashbackStatus> = ['All', 'Pending', 'Approved', 'Rejected']
  const visible = transactions.filter((transaction) => filter === 'All' || transaction.status === filter)
  const pendingCashback = transactions.filter((transaction) => transaction.status === 'Pending').reduce((total, transaction) => total + estimatedCashbackFor(transaction), 0)
  const approvedCashback = transactions.filter((transaction) => transaction.status === 'Approved').reduce((total, transaction) => total + transaction.amount, 0)
  return (
    <div className="screen-content ledger-content">
      <ScreenHeader title="My Cashback" onBack={onBack} right={<button className="icon-button" aria-label="Filter transactions" onClick={() => setFilter(filter === 'All' ? 'Pending' : 'All')}><Filter size={19} /></button>} />
      <div className="ledger-filters" role="tablist" aria-label="Cashback status">
        {filters.map((item) => <button key={item} role="tab" aria-selected={filter === item} className={filter === item ? 'active' : ''} onClick={() => setFilter(item)}>{item}</button>)}
      </div>
      <section className="summary-card"><div><span>Pending Cashback</span><strong>{formatRM(pendingCashback)}</strong><small>Awaiting merchant approval.</small></div><div><span>Approved Cashback</span><strong>{formatRM(approvedCashback)}</strong><small>Approved by the merchant.</small></div></section>
      <div className="section-heading ledger-list-heading"><h2>Transaction history</h2></div>
      <div className="transaction-list">
        {visible.map((transaction) => {
          const merchant = merchantFor(transaction.merchant)
          const cashbackAmount = transaction.status === 'Pending' ? estimatedCashbackFor(transaction) : transaction.amount
          const cashbackLabel = transaction.status === 'Pending' ? 'Estimated Cashback' : 'Approved Cashback'
          return <button className="transaction-row" key={transaction.id} onClick={() => onSelectTransaction(transaction)}>
            <div className="transaction-logo"><BrandLogo merchant={merchant} compact /></div>
            <div className="transaction-description"><strong>{merchant.name}</strong><span>{transaction.orderId ? `Order ID ${transaction.orderId} · ` : ''}Purchase date {transaction.date}</span><small>Order amount {formatRM(transaction.purchaseAmount ?? 0)} · {transaction.description}</small></div>
            <div className="transaction-money">{transaction.status !== 'Rejected' && <><strong>{formatRM(cashbackAmount)}</strong><small>{cashbackLabel}</small></>}<span className={`status-pill ${statusMeta[transaction.status].className}`}>{transaction.status}</span></div><ChevronRight size={18} className="merchant-chevron" />
          </button>
        })}
        {!visible.length && <div className="empty-search"><Filter size={21} /><strong>{filter === 'All' ? 'No cashback transactions yet' : `No ${filter.toLowerCase()} transactions`}</strong><span>{filter === 'All' ? 'Your purchases will appear here once they have been recorded.' : "There's nothing to show here yet."}</span></div>}
      </div>
      <button className="button-primary browse-button" onClick={onBrowse}>Explore Deals <ChevronRight size={19} /></button>
    </div>
  )
}

function TransactionScreen({ transaction, merchant, onBack, onTerms }: { transaction: Transaction; merchant: Merchant; onBack: () => void; onTerms: () => void }) {
  const orderRows: string[][] = []
  if (transaction.orderId) orderRows.push(['Order ID', transaction.orderId])
  if (transaction.purchaseDateTime ?? transaction.date) orderRows.push(['Purchase date', transaction.purchaseDateTime ?? transaction.date])
  if (transaction.purchaseAmount !== undefined) orderRows.push(['Order amount', formatRM(transaction.purchaseAmount)])

  const cashbackRows: string[][] = []
  if (transaction.status === 'Pending') {
    const eventRate = merchant.eventRates.find((item) => item.category === transaction.description) ?? merchant.eventRates.reduce((highest, item) => effectiveEventRate(item) > effectiveEventRate(highest) ? item : highest)
    cashbackRows.push(['Cashback rate', `${formatRate(effectiveEventRate(eventRate))}%`])
    cashbackRows.push(['Estimated Cashback', formatRM(transaction.estimatedAmount ?? transaction.amount), 'pending'])
  } else if (transaction.status === 'Approved') {
    cashbackRows.push(['Approved Cashback', formatRM(transaction.amount), 'positive'])
  } else {
    cashbackRows.push(['Cashback', 'RM0.00'])
  }

  const statusInformation = {
    Pending: { heading: 'Cashback pending', description: 'Your purchase has been recorded. Cashback is awaiting the merchant’s approval. The estimated cashback amount may change.' },
    Approved: { heading: 'Cashback approved', description: 'Your cashback has been approved by the merchant.' },
    Rejected: { heading: 'Cashback not approved', description: 'This purchase was not approved for cashback. Please refer to the merchant’s terms and conditions or contact Customer Support if you need assistance.' },
  }[transaction.status]

  return (
    <div className="screen-content transaction-content">
      <ScreenHeader title="Transaction details" onBack={onBack} />
      <section className="transaction-merchant-card"><div className="transaction-merchant-logo"><BrandLogo merchant={merchant} /></div><div className="transaction-merchant-name"><strong>{merchant.name}</strong><span>{merchant.description}</span></div><span className={`status-pill ${statusMeta[transaction.status].className}`}>{transaction.status}</span></section>
      <DataSection title="Order information" rows={orderRows} />
      <DataSection title="Cashback details" rows={cashbackRows} />
      <DataSection title="Transaction status" rows={[["Status", transaction.status, transaction.status.toLowerCase()], ["Last updated", transaction.statusUpdatedAt]]} />
      <section className="transaction-status-note"><h2>{statusInformation.heading}</h2><p>{statusInformation.description}</p></section>
      <div className="detail-links"><button onClick={onTerms}><FileText size={21} /><span>View terms &amp; conditions</span><ChevronRight size={18} /></button></div>
      <section className="support-card"><CircleHelp size={22} /><div><h2>Need help with this purchase?</h2><p>If your cashback is missing or incorrect, contact Customer Support with your order number and proof of purchase.</p><p>Missing cashback claims should normally be submitted within 30 days of purchase, unless the merchant’s terms specify otherwise. For travel bookings, the applicable claim period may depend on completion of your stay, flight or activity.</p></div></section>
    </div>
  )
}

function DataSection({ title, rows }: { title: string; rows: string[][] }) {
  return <section className="data-section"><h2>{title}</h2><div className="data-card">{rows.map(([label, value, tone]) => <div className="data-row" key={label}><span>{label}</span><strong className={tone}>{value}</strong></div>)}</div></section>
}

function TermsScreen({ merchant, onBack, onReturn, returnLabel }: { merchant: Merchant; onBack: () => void; onReturn: () => void; returnLabel: string }) {
  const topics = [
    { title: 'Eligible purchases', icon: ShoppingBag, lines: ['To qualify for cashback, select Shop Now from the merchant’s offer page and complete an eligible purchase.', 'Cashback is available only for qualifying products, services or bookings listed under the applicable offer.', 'Cashback rates and eligibility may vary by purchase category.'] },
    { title: 'Exclusions', icon: FileText, lines: ['Cashback may not be awarded for cancelled, refunded or ineligible purchases.', 'Using promotional codes that are not approved under the offer may affect cashback eligibility.', 'Purchases that cannot be successfully tracked may not qualify for cashback.', 'Additional merchant-specific exclusions may apply.', ...merchant.terms] },
    { title: 'How to qualify for cashback', icon: ArrowLeftRight, lines: ['Start your purchase by selecting Shop Now from the relevant merchant offer.', 'Complete your purchase in accordance with the merchant’s terms and conditions.', 'Avoid switching between different promotional links during checkout, as this may affect cashback tracking.'] },
    { title: 'Cashback approval', icon: Clock3, lines: ['Cashback is initially recorded as Pending while the merchant reviews the purchase.', 'The estimated cashback amount may change following the merchant’s review.', 'Once approved, the confirmed cashback amount will appear under Approved in My Cashback.', 'Cashback crediting is handled separately in accordance with the applicable wallet terms.'] },
    { title: 'Missing or rejected cashback', icon: CircleHelp, lines: ['If your purchase does not appear in My Cashback, contact Customer Support with your order details and proof of purchase.', 'Missing cashback claims should normally be submitted within 30 days of purchase, unless the merchant’s terms specify otherwise.', 'Cashback claims are subject to the merchant’s eligibility rules and investigation outcome.', 'Submitting proof of purchase does not guarantee cashback approval.', 'Rejected cashback will not be paid unless the merchant subsequently approves an adjustment.'] },
  ]
  return (
    <div className="screen-content terms-content">
      <ScreenHeader title="Cashback Terms & Conditions" onBack={onBack} />
      <div className="terms-brand-banner"><div><BrandLogo merchant={merchant} /><span>{merchant.description}</span></div></div>
      <div className="terms-topic-list">{topics.map(({ title, icon: Icon, lines }, index) => <section className="terms-topic" key={title}>
        <div className="terms-topic-symbol"><span>{index + 1}</span><div><Icon size={25} /></div></div>
        <div className="terms-topic-copy"><h2>{title}</h2><ul>{lines.map((line, lineIndex) => <li key={`${title}-${lineIndex}`}>{line}</li>)}</ul></div>
      </section>)}</div>
      <button className="terms-return" onClick={onReturn}>{returnLabel} <ChevronRight size={20} /></button>
    </div>
  )
}

export default CashbackPrototype
