const menu = document.querySelector('#menu');
const WHATSAPP_NUMBER = '56920194361'; // Número sin espacios ni símbolos

// CARRITO DE COMPRAS
let cart = [];

// Elementos del DOM
const cartButton = document.getElementById('cartButton');
const cartPanel = document.getElementById('cartPanel');
const cartOverlay = document.getElementById('cartOverlay');
const closeCart = document.getElementById('closeCart');
const cartCount = document.getElementById('cartCount');
const cartItems = document.getElementById('cartItems');
const cartFooter = document.getElementById('cartFooter');
const cartTotal = document.getElementById('cartTotal');
const checkoutBtn = document.getElementById('checkoutBtn');

// Elementos del filtro
const filterButton = document.getElementById('filterButton');
const filterPanel = document.getElementById('filterPanel');
const filterOverlay = document.getElementById('filterOverlay');
const closeFilter = document.getElementById('closeFilter');
const filterCategoryBtns = document.querySelectorAll('.filter-category-btn');

// Siempre volver arriba al recargar
window.addEventListener('beforeunload', () => {
  window.scrollTo(0, 0);
});

window.addEventListener('load', () => {
  setTimeout(() => {
    window.scrollTo(0, 0);
  }, 0);
});

if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);

// Intersection Observer para el menú
const io = new IntersectionObserver((entries) => {
  for (const e of entries) {
    if (e.isIntersecting) {
      menu.classList.add('menu-visible');
      io.disconnect();
    }
  }
}, { threshold: 0.1 });

io.observe(menu);

// Remover pantalla de carga
setTimeout(() => {
  const loader = document.querySelector('.loader-screen');
  if (loader) {
    loader.remove();
  }
}, 4800);

// ===== FUNCIONALIDAD DEL CARRITO =====

// Formatear precio
function formatPrice(price) {
  // Asegurarse de que sea un número
  const num = parseInt(price);
  
  // Convertir a string
  let priceStr = num.toString();
  
  // Si tiene más de 3 dígitos, agregar el punto
  if (priceStr.length > 3) {
    // Insertar punto antes de los últimos 3 dígitos
    const lastThree = priceStr.slice(-3);
    const rest = priceStr.slice(0, -3);
    
    // Si rest tiene más de 3 dígitos, agregar más puntos
    let formatted = rest.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    priceStr = formatted + '.' + lastThree;
  }
  
  return '$' + priceStr;
}

// Actualizar contador del carrito
function updateCartCount() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCount.textContent = totalItems;
  
  if (totalItems > 0) {
    cartCount.style.display = 'grid';
  } else {
    cartCount.style.display = 'none';
  }
}

// Renderizar items del carrito
function renderCart() {
  if (cart.length === 0) {
    cartItems.innerHTML = '<p class="empty-cart">Tu carrito está vacío</p>';
    cartFooter.style.display = 'none';
    return;
  }

  cartFooter.style.display = 'block';
  
  const html = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-info">
        <h4>${item.name} ${item.quantity > 1 ? `<span class="quantity-badge">x${item.quantity}</span>` : ''}</h4>
        <p>${formatPrice(item.price)}${item.quantity > 1 ? ` <span class="unit-price">(c/u)</span>` : ''}</p>
        ${item.quantity > 1 ? `<p class="subtotal">Subtotal: ${formatPrice(item.price * item.quantity)}</p>` : ''}
      </div>
      <button class="remove-item" data-id="${item.id}">Eliminar</button>
    </div>
  `).join('');
  
  cartItems.innerHTML = html;
  
  // Calcular total
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  cartTotal.textContent = formatPrice(total);
  
  // Agregar event listeners a botones de eliminar
  document.querySelectorAll('.remove-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      removeFromCart(id);
    });
  });
}

// Agregar al carrito
function addToCart(product) {
  const existingItem = cart.find(item => item.id === product.id);
  
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      ...product,
      quantity: 1
    });
  }
  
  updateCartCount();
  renderCart();
  
  // Feedback visual
  showNotification('Agregado al carrito');
}

// Eliminar del carrito
function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  updateCartCount();
  renderCart();
  showNotification('Producto eliminado');
}

// Mostrar notificación
function showNotification(message) {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    bottom: 30px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(16, 185, 129, 0.95);
    color: white;
    padding: 16px 32px;
    border-radius: 12px;
    font-weight: 600;
    z-index: 10000;
    animation: slideUp 0.3s ease-out;
  `;
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideDown 0.3s ease-out';
    setTimeout(() => notification.remove(), 300);
  }, 2000);
}

// Agregar estilos de animación para notificaciones
const style = document.createElement('style');
style.textContent = `
  @keyframes slideUp {
    from {
      transform: translateX(-50%) translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateX(-50%) translateY(0);
      opacity: 1;
    }
  }
  @keyframes slideDown {
    from {
      transform: translateX(-50%) translateY(0);
      opacity: 1;
    }
    to {
      transform: translateX(-50%) translateY(20px);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

// Generar mensaje de WhatsApp
function generateWhatsAppMessage(items) {
  let message = '¡Hola! Me gustaría hacer el siguiente pedido:\n\n';
  
  items.forEach((item, index) => {
    message += `${index + 1}. ${item.name}\n`;
    message += `   Precio: ${formatPrice(item.price)}\n`;
    if (item.quantity > 1) {
      message += `   Cantidad: ${item.quantity}\n`;
    }
    message += '\n';
  });
  
  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  message += `*Total: ${formatPrice(total)}*`;
  
  return encodeURIComponent(message);
}

// Comprar directamente (un solo producto)
function buyNow(product) {
  const message = generateWhatsAppMessage([product]);
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
  window.open(whatsappUrl, '_blank');
}

// Finalizar compra (carrito completo)
function checkout() {
  if (cart.length === 0) {
    showNotification('Tu carrito está vacío');
    return;
  }
  
  const message = generateWhatsAppMessage(cart);
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
  window.open(whatsappUrl, '_blank');
  
  // Opcional: limpiar carrito después de la compra
  // cart = [];
  // updateCartCount();
  // renderCart();
}

// ===== EVENT LISTENERS =====

// Abrir/cerrar carrito
cartButton.addEventListener('click', () => {
  cartPanel.classList.add('active');
  cartOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';
});

closeCart.addEventListener('click', () => {
  cartPanel.classList.remove('active');
  cartOverlay.classList.remove('active');
  document.body.style.overflow = '';
});

cartOverlay.addEventListener('click', () => {
  cartPanel.classList.remove('active');
  cartOverlay.classList.remove('active');
  document.body.style.overflow = '';
});

// Finalizar compra
checkoutBtn.addEventListener('click', checkout);

// ===== MENÚ DESPLEGABLE DE PRODUCTOS =====

// Agregar funcionalidad a todos los items del menú
document.querySelectorAll('.item').forEach(itemEl => {
  const infoEl = itemEl.querySelector('.item-info');
  const buyBtn = itemEl.querySelector('.buy-btn');
  const cartBtn = itemEl.querySelector('.cart-btn');
  
  // Toggle del menú desplegable
  infoEl.addEventListener('click', (e) => {
    // Evitar que el click en el precio cierre el menú
    if (e.target.classList.contains('item-price')) return;
    
    // Cerrar otros items expandidos
    document.querySelectorAll('.item.expanded').forEach(other => {
      if (other !== itemEl) {
        other.classList.remove('expanded');
      }
    });
    
    // Toggle del item actual
    itemEl.classList.toggle('expanded');
  });
  
  // Obtener datos del producto
  const getProductData = () => {
    try {
      return JSON.parse(itemEl.dataset.product);
    } catch (e) {
      console.error('Error parsing product data:', e);
      return null;
    }
  };
  
  // Botón de compra directa
  if (buyBtn) {
    buyBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const product = getProductData();
      if (product) {
        buyNow(product);
      }
    });
  }
  
  // Botón de agregar al carrito
  if (cartBtn) {
    cartBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const product = getProductData();
      if (product) {
        addToCart(product);
        // Cerrar el menú desplegable después de agregar
        setTimeout(() => {
          itemEl.classList.remove('expanded');
        }, 500);
      }
    });
  }
});

// Cerrar menús desplegables al hacer scroll
let scrollTimeout;
window.addEventListener('scroll', () => {
  clearTimeout(scrollTimeout);
  scrollTimeout = setTimeout(() => {
    document.querySelectorAll('.item.expanded').forEach(item => {
      item.classList.remove('expanded');
    });
  }, 150);
});

// ===== FUNCIONALIDAD DE FILTROS =====

// Abrir/cerrar panel de filtros
filterButton.addEventListener('click', () => {
  filterPanel.classList.add('active');
  filterOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';
});

closeFilter.addEventListener('click', () => {
  filterPanel.classList.remove('active');
  filterOverlay.classList.remove('active');
  document.body.style.overflow = '';
});

filterOverlay.addEventListener('click', () => {
  filterPanel.classList.remove('active');
  filterOverlay.classList.remove('active');
  document.body.style.overflow = '';
});

// Filtrar por categoría (SCROLL a la sección)
filterCategoryBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const category = btn.dataset.category;
    
    // Actualizar botón activo
    filterCategoryBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    // Cerrar panel de filtros primero
    filterPanel.classList.remove('active');
    filterOverlay.classList.remove('active');
    document.body.style.overflow = '';
    
    if (category === 'all') {
      // Scroll al inicio del menú
      const menuTop = document.querySelector('#menu');
      if (menuTop) {
        menuTop.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      showNotification('Mostrando todas las categorías');
    } else {
      // Scroll a la categoría seleccionada
      const targetSection = document.querySelector(`.menu-section[data-category="${category}"]`);
      if (targetSection) {
        setTimeout(() => {
          targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 300);
        
        showNotification(`Ir a: ${btn.textContent.trim()}`);
      }
    }
  });
});

// Inicializar
updateCartCount();