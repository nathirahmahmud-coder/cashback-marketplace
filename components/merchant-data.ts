export type MerchantEventRate = { category: string; advertiserCommissionRate: number; customerAllocation?: number }

export type Merchant = {
  id: string
  name: string
  description: string
  categories: string[]
  eventRates: MerchantEventRate[]
  detailRoute: 'merchant'
  affiliateUrl: string | null
  officialWebsite: string
  terms: string[]
  about: string
  logoPath: string | null
  logoIncludesWordmark?: boolean
  bannerPath: string
  bannerAlt: string
}

export const MERCHANTS: Merchant[] = [
  {
    id: 'trip-com', name: 'Trip.com', description: 'Hotels, Flights & More', categories: ['Hotels', 'Flights', 'Car Rentals', 'Activities'],
    eventRates: [{ category: 'Hotels', advertiserCommissionRate: 12.24 }, { category: 'Flights', advertiserCommissionRate: 6.12 }, { category: 'Car Rentals', advertiserCommissionRate: 8.16 }, { category: 'Activities', advertiserCommissionRate: 8.16 }],
    detailRoute: 'merchant', affiliateUrl: null, officialWebsite: 'https://www.trip.com',
    terms: ['Cancelled, refunded or no-show bookings may be excluded.', 'Unapproved promo codes and untracked purchases may be ineligible.'],
    about: 'Plan your next trip with Trip.com, where you can book stays, flights, car rentals and activities in one place. Earn cashback on eligible bookings; rates vary by category and offer terms.',
    logoPath: '/merchants/logos/trip-com.svg', bannerPath: '/images/travel-fuji.png', bannerAlt: 'Mount Fuji and a pagoda framed by cherry blossoms.',
  },
  {
    id: 'agoda', name: 'Agoda', description: 'Hotels & Homes', categories: ['Hotels', 'Homes'],
    eventRates: [{ category: 'Hotels', advertiserCommissionRate: 5, customerAllocation: 50 }, { category: 'Homes', advertiserCommissionRate: 10.2 }],
    detailRoute: 'merchant', affiliateUrl: null, officialWebsite: 'https://www.agoda.com',
    terms: ['Only completed and eligible hotel or home bookings may qualify.', 'Cancelled, refunded, no-show or otherwise excluded bookings may not earn cashback.'],
    about: 'Find a stay for every kind of getaway with Agoda, from hotels to private homes. Earn cashback on eligible bookings; rates and eligibility are subject to offer terms.',
    logoPath: '/merchants/logos/agoda.svg', logoIncludesWordmark: true, bannerPath: '/merchants/banners/agoda.png', bannerAlt: 'A tropical boutique hotel pool framed by palm trees.',
  },
  {
    id: 'klook', name: 'Klook', description: 'Activities & Attractions', categories: ['Activities', 'Attractions'],
    eventRates: [{ category: 'Activities', advertiserCommissionRate: 8.16 }, { category: 'Attractions', advertiserCommissionRate: 8.16 }],
    detailRoute: 'merchant', affiliateUrl: null, officialWebsite: 'https://www.klook.com',
    terms: ['Eligible activities and attraction bookings are subject to the offer shown at purchase.', 'Cancelled, refunded or untracked bookings may be excluded.'],
    about: 'Make more of every trip with Klook. Discover and book activities and attractions, then earn cashback on eligible bookings under the offer terms.',
    logoPath: '/merchants/logos/klook.svg', bannerPath: '/merchants/banners/klook.png', bannerAlt: 'A scenic coastal cable car ride above turquoise water.',
  },
  {
    id: 'zalora', name: 'ZALORA', description: 'Fashion & Lifestyle', categories: ['Fashion', 'Lifestyle'],
    eventRates: [{ category: 'Fashion', advertiserCommissionRate: 16.33 }, { category: 'Lifestyle', advertiserCommissionRate: 16.33 }],
    detailRoute: 'merchant', affiliateUrl: null, officialWebsite: 'https://www.zalora.com.my',
    terms: ['Eligible purchases must be completed through the Shop Now offer path.', 'Returned or refunded purchases and excluded items may not qualify.'],
    about: 'Refresh your wardrobe with ZALORA’s selection of fashion and lifestyle brands. Earn cashback on eligible purchases; exclusions and offer terms apply.',
    logoPath: null, bannerPath: '/images/fashion-order.png', bannerAlt: 'Neutral fashion accessories arranged on a linen surface.',
  },
  {
    id: 'lazada', name: 'Lazada', description: 'Online Shopping', categories: ['Online Shopping'],
    eventRates: [{ category: 'Online Shopping', advertiserCommissionRate: 12.24 }],
    detailRoute: 'merchant', affiliateUrl: null, officialWebsite: 'https://www.lazada.com.my',
    terms: ['Only eligible orders placed through the tracked offer path may qualify.', 'Cancelled orders, returned items and excluded products may not earn cashback.'],
    about: 'Explore Lazada’s online marketplace for everyday essentials, new discoveries and more. Earn cashback on eligible orders; product exclusions and offer terms apply.',
    logoPath: null, bannerPath: '/merchants/banners/lazada.png', bannerAlt: 'Unbranded lifestyle products and a delivery box in a bright home setting.',
  },
  {
    id: 'shopee', name: 'Shopee', description: 'Online Shopping', categories: ['Online Shopping'],
    eventRates: [{ category: 'Online Shopping', advertiserCommissionRate: 8.16 }],
    detailRoute: 'merchant', affiliateUrl: null, officialWebsite: 'https://shopee.com.my',
    terms: ['Eligible products and completed orders are subject to the merchant offer.', 'Cancelled, returned or untracked orders may be excluded.'],
    about: 'Find everyday favourites and new discoveries across Shopee’s online marketplace. Earn cashback on eligible orders; product exclusions and offer terms apply.',
    logoPath: '/merchants/logos/shopee.svg', bannerPath: '/merchants/banners/shopee.png', bannerAlt: 'Unbranded shopping parcels and a paper bag beside a smartphone.',
  },
  {
    id: 'adidas', name: 'adidas', description: 'Fashion & Sports', categories: ['Fashion', 'Sports'],
    eventRates: [{ category: 'Fashion', advertiserCommissionRate: 16.33 }, { category: 'Sports', advertiserCommissionRate: 16.33 }],
    detailRoute: 'merchant', affiliateUrl: null, officialWebsite: 'https://www.adidas.com.my',
    terms: ['Eligible fashion and sports items are subject to the merchant offer.', 'Returned, refunded or excluded items may not qualify for cashback.'],
    about: 'Explore adidas sportswear, footwear and accessories designed for sport and everyday wear. Earn cashback on eligible purchases; exclusions and offer terms apply.',
    logoPath: '/merchants/logos/adidas.svg', bannerPath: '/merchants/banners/adidas.png', bannerAlt: 'Unbranded running shoes and athletic apparel at a trackside bench.',
  },
  {
    id: 'uniqlo', name: 'UNIQLO', description: 'Fashion & Lifestyle', categories: ['Fashion', 'Lifestyle'],
    eventRates: [{ category: 'Fashion', advertiserCommissionRate: 12.24 }, { category: 'Lifestyle', advertiserCommissionRate: 12.24 }],
    detailRoute: 'merchant', affiliateUrl: null, officialWebsite: 'https://www.uniqlo.com/my',
    terms: ['Eligible purchases must follow the merchant-specific offer conditions.', 'Cancelled, refunded or excluded purchases may not qualify.'],
    about: 'Discover UNIQLO LifeWear: thoughtfully designed clothing made for comfort, quality and everyday versatility. Earn cashback on eligible purchases; exclusions and offer terms apply.',
    logoPath: '/merchants/logos/uniqlo.svg', bannerPath: '/merchants/banners/uniqlo.png', bannerAlt: 'Folded neutral casual clothing with a muted red accent.',
  },
]
