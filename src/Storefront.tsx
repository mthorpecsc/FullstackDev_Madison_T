import { useEffect, useState } from 'react'
import {
  ArrowDown,
  ArrowLeft,
  ArrowUpRight,
  Check,
  Heart,
  Minus,
  Plus,
  ShoppingBag,
  Sparkles,
  Star,
  X,
} from 'lucide-react'
import { Link, Route, Routes, useNavigate, useParams } from 'react-router-dom'

type Product = {
  id: string
  name: string
  type: 'Keychain' | 'Enamel pin' | 'Art print'
  price: number
  image: string
  color: string
  label?: string
  description: string
}

type DrawerView = 'cart' | 'saved' | null

const products: Product[] = [
  { id: 'sunny-side', name: 'Sunny Side Up', type: 'Enamel pin', price: 14, image: 'photo-1549490349-8643362247b5', color: 'butter', label: 'Bestseller', description: 'A tiny reminder that brighter days are always on the way. This glossy enamel pin brings a little sunshine to your favorite jacket, tote, or pin board.' },
  { id: 'little-wild', name: 'A Little Wild', type: 'Art print', price: 28, image: 'photo-1577083552431-6e5fd01aa342', color: 'lilac', description: 'A dreamy art print for daydreamers, plant people, and anyone who likes their walls with a little whimsy. Printed on softly textured, archival paper.' },
  { id: 'lucky-charm', name: 'Lucky Charm', type: 'Keychain', price: 18, image: 'photo-1513364776144-60967b0f800f', color: 'peach', label: 'New', description: 'Your pocket-sized bit of good luck. Clip this cheerful charm onto keys, a backpack, or anywhere that could use a happy little detail.' },
  { id: 'slow-morning', name: 'Slow Morning', type: 'Art print', price: 32, image: 'photo-1579783902614-a3fb3927b6a5', color: 'blue', description: 'An invitation to take the long way through your morning. This art print makes a gentle focal point for a bedroom, breakfast nook, or cozy corner.' },
  { id: 'tiny-dancer', name: 'Tiny Dancer', type: 'Enamel pin', price: 12, image: 'photo-1541961017774-22349e4a1262', color: 'pink', description: 'A little spin of color for your collar or canvas bag. Finished with a smooth enamel face and a sturdy pin back for everyday twirling.' },
  { id: 'good-luck-club', name: 'Good Luck Club', type: 'Keychain', price: 20, image: 'photo-1531058020387-3be344556be6', color: 'green', description: 'Official membership for your keys. This bright, easy-to-spot charm is a sweet companion for errands, adventures, and finding your keys in a hurry.' },
  { id: 'soft-place', name: 'A Soft Place', type: 'Art print', price: 30, image: 'photo-1578301978018-3005759f55d0', color: 'coral', label: 'Small batch', description: 'A soft landing for your walls. Printed in a small run on heavyweight art paper, with warm colors that feel right at home in a reading nook.' },
  { id: 'flower-power', name: 'Flower Power', type: 'Enamel pin', price: 14, image: 'photo-1547826039-bfc35e0f1ea8', color: 'yellow', description: 'A happy little bloom that never needs watering. Add this cheerful enamel pin to a denim jacket, pencil pouch, or your growing pin collection.' },
]

const priceLabel = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

function readStored<T,>(key: string, fallback: T): T {
  try {
    const stored = window.localStorage.getItem(key)
    return stored ? (JSON.parse(stored) as T) : fallback
  } catch {
    return fallback
  }
}

function Storefront() {
  const [favorites, setFavorites] = useState<string[]>(() => readStored('cody-goods-favorites', []))
  const [cart, setCart] = useState<Record<string, number>>(() => readStored('cody-goods-cart', {}))
  const [drawer, setDrawer] = useState<DrawerView>(null)
  const [toast, setToast] = useState('')

  useEffect(() => {
    window.localStorage.setItem('cody-goods-favorites', JSON.stringify(favorites))
  }, [favorites])

  useEffect(() => {
    window.localStorage.setItem('cody-goods-cart', JSON.stringify(cart))
  }, [cart])

  useEffect(() => {
    if (!drawer) return

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setDrawer(null)
    }

    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [drawer])

  useEffect(() => {
    if (!toast) return

    const timeout = window.setTimeout(() => setToast(''), 2400)
    return () => window.clearTimeout(timeout)
  }, [toast])

  const cartCount = Object.values(cart).reduce((total, quantity) => total + quantity, 0)
  const cartItems = products.filter((product) => cart[product.id])
  const savedItems = products.filter((product) => favorites.includes(product.id))
  const subtotal = cartItems.reduce((total, product) => total + product.price * cart[product.id], 0)

  const toggleFavorite = (product: Product) => {
    const isSaved = favorites.includes(product.id)
    setFavorites((current) => isSaved
      ? current.filter((favorite) => favorite !== product.id)
      : [...current, product.id])
    setToast(isSaved ? 'Removed from your favorites' : `${product.name} saved to your favorites!`)
  }

  const addToCart = (product: Product) => {
    setCart((current) => ({ ...current, [product.id]: (current[product.id] ?? 0) + 1 }))
    setToast(`${product.name} saved to your bag!`)
  }

  const changeQuantity = (id: string, amount: number) => {
    setCart((current) => {
      const nextQuantity = (current[id] ?? 0) + amount
      const next = { ...current }

      if (nextQuantity <= 0) delete next[id]
      else next[id] = nextQuantity

      return next
    })
  }

  return (
    <div className="storefront">
      <div className="announcement">
        <Sparkles size={14} strokeWidth={1.8} aria-hidden="true" />
        <span>Made with love, packed with a little extra joy</span>
        <Sparkles size={14} strokeWidth={1.8} aria-hidden="true" />
      </div>

      <SiteHeader favoritesCount={favorites.length} cartCount={cartCount} onOpenDrawer={setDrawer} />

      <Routes>
        <Route path="/" element={<HomePage favorites={favorites} onToggleFavorite={toggleFavorite} onAddToCart={addToCart} />} />
        <Route path="/products/:productId" element={<ProductPage favorites={favorites} onToggleFavorite={toggleFavorite} onAddToCart={addToCart} />} />
        <Route path="*" element={<NotFound />} />
      </Routes>

      <SiteFooter />

      {drawer && (
        <CartDrawer
          view={drawer}
          cart={cart}
          cartItems={cartItems}
          savedItems={savedItems}
          subtotal={subtotal}
          onClose={() => setDrawer(null)}
          onChangeQuantity={changeQuantity}
          onToggleFavorite={toggleFavorite}
          onAddToCart={addToCart}
        />
      )}

      {toast && <div className="toast-message" role="status" aria-live="polite"><Check size={18} />{toast}</div>}
    </div>
  )
}

function SiteHeader({ favoritesCount, cartCount, onOpenDrawer }: {
  favoritesCount: number
  cartCount: number
  onOpenDrawer: (view: DrawerView) => void
}) {
  return (
    <header className="site-header">
      <Link className="wordmark" to="/" aria-label="Cody's Goods home">
        <span className="wordmark-icon"><Star size={16} fill="currentColor" /></span>
        <span>CODY’S GOODS 4 CRITTERS</span>
      </Link>
      <nav className="main-nav" aria-label="Main navigation">
        <Link to="/#shop">Shop all</Link>
        <Link to="/#about">My story</Link>
      </nav>
      <div className="header-actions">
        <button className="header-action saved-action" type="button" onClick={() => onOpenDrawer('saved')} aria-label={`View favorites, ${favoritesCount} saved`}>
          <Heart size={19} strokeWidth={1.8} />
          <span>Favorites</span>
          <span className="action-count">{favoritesCount}</span>
        </button>
        <button className="header-action cart-action" type="button" onClick={() => onOpenDrawer('cart')} aria-label={`Open bag, ${cartCount} items`}>
          <ShoppingBag size={19} strokeWidth={1.8} />
          <span>Bag</span>
          <span className="action-count">{cartCount}</span>
        </button>
      </div>
    </header>
  )
}

function HomePage({ favorites, onToggleFavorite, onAddToCart }: {
  favorites: string[]
  onToggleFavorite: (product: Product) => void
  onAddToCart: (product: Product) => void
}) {
  return (
    <main id="top">
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow"><span className="eyebrow-dot" /> Tiny treasures, big happy</p>
          <h1 id="hero-title">A little joy<br />goes <em>a long way.</em></h1>
          <p className="hero-description">Cute pins, pocket-sized charms, and art prints to make your everyday a little more lovely.</p>
          <Link className="hero-link" to="/#shop">Find your new favorite <ArrowDown size={16} strokeWidth={1.8} /></Link>
          <div className="hero-note"><span>♡</span><span>Made with love by Cody</span></div>
        </div>
        <div className="hero-art" aria-label="A colorful framed art print in a sunny studio">
          <img src={imageUrl('photo-1579783902614-a3fb3927b6a5', 1400)} alt="Colorful framed artwork in an artist's studio" />
          <div className="hero-sticker"><span>little</span><strong>happy<br />things</strong><Star size={16} fill="currentColor" /></div>
          <span className="hero-caption">A collection of tiny treasures / vol. 01</span>
        </div>
        <span className="hero-side-note">CUTE THINGS, GOOD FEELINGS</span>
      </section>

      <section className="shop-section" id="shop" aria-labelledby="shop-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow"><span className="eyebrow-dot" /> The good stuff</p>
            <h2 id="shop-title">Meet your new <em>favorite.</em></h2>
          </div>
          <p className="section-aside">Small things to make<br />your heart go ♡.</p>
        </div>
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} isFavorite={favorites.includes(product.id)} onToggleFavorite={() => onToggleFavorite(product)} onAddToCart={() => onAddToCart(product)} />
          ))}
        </div>
      </section>

      <section className="studio-note" id="about">
        <div className="studio-mark"><Star size={25} fill="currentColor" /></div>
        <div className="studio-copy">
          <p className="eyebrow">A note from Cody</p>
          <h2>Made with love.<br /><em>Kept close.</em></h2>
        </div>
        <p className="studio-description">Cody’s Goods is a tiny art shop for collectors of cute things. Every pin, charm, and print is made to bring a pocket-sized pop of happy to your day.</p>
        <a className="studio-link" href="#shop" aria-label="Back to the shop"><ArrowUpRight size={21} /></a>
      </section>
    </main>
  )
}

function ProductCard({ product, isFavorite, onToggleFavorite, onAddToCart }: {
  product: Product
  isFavorite: boolean
  onToggleFavorite: () => void
  onAddToCart: () => void
}) {
  return (
    <article className="product-card">
      <div className={`product-image ${product.color}`}>
        <Link className="product-image-link" to={`/products/${product.id}`} aria-label={`View ${product.name}`}>
          <img src={imageUrl(product.image, 700)} alt={`${product.name}, ${product.type.toLowerCase()}`} loading="lazy" />
        </Link>
        {product.label && <span className="product-label">{product.label}</span>}
        <button className={`favorite-button${isFavorite ? ' is-favorite' : ''}`} type="button" onClick={onToggleFavorite} aria-label={isFavorite ? `Remove ${product.name} from favorites` : `Save ${product.name} to favorites`} aria-pressed={isFavorite}>
          <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} strokeWidth={1.8} />
        </button>
        <button className="quick-add" type="button" onClick={onAddToCart} aria-label={`Add ${product.name} to bag`}><Plus size={17} strokeWidth={2} /></button>
      </div>
      <div className="product-details">
        <div><p className="product-type">{product.type}</p><h3><Link to={`/products/${product.id}`}>{product.name}</Link></h3></div>
        <span className="product-price">{priceLabel.format(product.price)}</span>
      </div>
      <button className="add-link" type="button" onClick={onAddToCart}>Add to bag <ArrowUpRight size={14} /></button>
    </article>
  )
}

function ProductPage({ favorites, onToggleFavorite, onAddToCart }: {
  favorites: string[]
  onToggleFavorite: (product: Product) => void
  onAddToCart: (product: Product) => void
}) {
  const { productId } = useParams()
  const product = products.find((item) => item.id === productId)
  const navigate = useNavigate()

  useEffect(() => window.scrollTo({ top: 0, behavior: 'smooth' }), [productId])

  if (!product) return <NotFound />

  const isFavorite = favorites.includes(product.id)

  return (
    <main className="product-page">
      <Link className="back-link" to="/#shop"><ArrowLeft size={16} /> Back to all the goodies</Link>
      <div className="product-detail-layout">
        <div className={`detail-image ${product.color}`}>
          <img src={imageUrl(product.image, 1500)} alt={`${product.name}, ${product.type.toLowerCase()}`} />
          {product.label && <span className="product-label">{product.label}</span>}
          <span className="detail-image-sparkle"><Sparkles size={25} /></span>
        </div>
        <section className="product-info" aria-labelledby="product-title">
          <p className="eyebrow"><span className="eyebrow-dot" /> {product.type}</p>
          <h1 id="product-title">{product.name}</h1>
          <p className="detail-price">{priceLabel.format(product.price)}</p>
          <p className="detail-description">{product.description}</p>
          <div className="detail-divider" />
          <p className="detail-note"><Sparkles size={16} /> A little something, picked just for you.</p>
          <div className="detail-actions">
            <button className="add-to-bag-button" type="button" onClick={() => onAddToCart(product)}><ShoppingBag size={18} /> Save to bag</button>
            <button className={`detail-favorite${isFavorite ? ' is-favorite' : ''}`} type="button" onClick={() => onToggleFavorite(product)} aria-pressed={isFavorite}>
              <Heart size={19} fill={isFavorite ? 'currentColor' : 'none'} />
              {isFavorite ? 'Saved to favorites' : 'Add to favorites'}
            </button>
          </div>
          <button className="detail-back-home" type="button" onClick={() => navigate('/#shop')}>Keep browsing <ArrowUpRight size={15} /></button>
        </section>
      </div>
    </main>
  )
}

function CartDrawer({ view, cart, cartItems, savedItems, subtotal, onClose, onChangeQuantity, onToggleFavorite, onAddToCart }: {
  view: Exclude<DrawerView, null>
  cart: Record<string, number>
  cartItems: Product[]
  savedItems: Product[]
  subtotal: number
  onClose: () => void
  onChangeQuantity: (id: string, amount: number) => void
  onToggleFavorite: (product: Product) => void
  onAddToCart: (product: Product) => void
}) {
  const isCart = view === 'cart'
  const items = isCart ? cartItems : savedItems

  return (
    <>
      <button className="drawer-backdrop" type="button" aria-label="Close panel" onClick={onClose} />
      <aside className="drawer" role="dialog" aria-modal="true" aria-labelledby="drawer-title">
        <div className="drawer-header">
          <div>
            <p className="eyebrow">Cody’s Goods</p>
            <h2 id="drawer-title">{isCart ? 'Your bag' : 'Your favorites'}</h2>
          </div>
          <button className="icon-button close-button" type="button" onClick={onClose} aria-label="Close panel"><X size={20} /></button>
        </div>
        <div className="drawer-items">
          {items.length === 0 ? (
            <EmptyState title={isCart ? 'Your bag is waiting for a little joy.' : 'No favorites just yet.'} detail={isCart ? 'There’s plenty of room for something lovely.' : 'Tap the heart on anything that catches your eye.'} />
          ) : items.map((product) => (
            <div className="drawer-item" key={product.id}>
              <Link to={`/products/${product.id}`} onClick={onClose} aria-label={`View ${product.name}`}><img src={imageUrl(product.image, 180)} alt="" /></Link>
              <div className="drawer-item-info">
                <span className="item-type">{product.type}</span>
                <h3><Link to={`/products/${product.id}`} onClick={onClose}>{product.name}</Link></h3>
                <strong>{priceLabel.format(product.price)}</strong>
                {isCart ? (
                  <div className="quantity-control" aria-label={`Quantity for ${product.name}`}>
                    <button type="button" onClick={() => onChangeQuantity(product.id, -1)} aria-label={`Remove one ${product.name}`}><Minus size={14} /></button>
                    <span>{cart[product.id]}</span>
                    <button type="button" onClick={() => onChangeQuantity(product.id, 1)} aria-label={`Add one ${product.name}`}><Plus size={14} /></button>
                  </div>
                ) : (
                  <button className="saved-add-button" type="button" onClick={() => onAddToCart(product)}><Plus size={14} /> Add to bag</button>
                )}
              </div>
              {!isCart && <button className="remove-saved" type="button" onClick={() => onToggleFavorite(product)} aria-label={`Remove ${product.name} from favorites`}><X size={16} /></button>}
            </div>
          ))}
        </div>
        {isCart && cartItems.length > 0 && (
          <div className="drawer-footer">
            <div className="subtotal-line"><span>Subtotal</span><strong>{priceLabel.format(subtotal)}</strong></div>
            <p>Shipping and taxes are not included.</p>
            <button className="continue-button" type="button" onClick={onClose}>Keep browsing <ArrowUpRight size={17} /></button>
          </div>
        )}
      </aside>
    </>
  )
}

function EmptyState({ title, detail }: { title: string; detail: string }) {
  return <div className="empty-state"><span className="empty-mark"><Sparkles size={22} /></span><h3>{title}</h3><p>{detail}</p></div>
}

function NotFound() {
  return <main className="not-found"><span className="empty-mark"><Sparkles size={22} /></span><h1>Oops, this goodie wandered off.</h1><Link className="add-to-bag-button" to="/">Back to the shop</Link></main>
}

function SiteFooter() {
  return <footer className="site-footer"><Link className="wordmark footer-wordmark" to="/"><span className="wordmark-icon"><Star size={15} fill="currentColor" /></span><span>CODY’S GOODS</span></Link><p>Little things, made with a lot of love.</p><span className="footer-copy">© 2026 Cody’s Goods</span></footer>
}

function imageUrl(image: string, width: number) {
  return `https://images.unsplash.com/${image}?auto=format&fit=crop&w=${width}&q=85`
}

export default Storefront