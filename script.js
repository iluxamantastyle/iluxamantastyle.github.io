document.addEventListener('DOMContentLoaded', () => {
    // --- КОРЗИНА ---
    let cart = JSON.parse(localStorage.getItem('giftbox_cart')) || [];
    const cartCountEl = document.getElementById('cart-count');
    const cartModal = document.getElementById('cart-modal');
    const cartModalClose = document.getElementById('cart-modal-close');
    const cartItemsList = document.getElementById('cart-items');
    const cartTotalSpan = document.getElementById('cart-total');
    const cartBtn = document.getElementById('cart-btn');
    const checkoutBtn = document.getElementById('checkout-btn');
    const orderModal = document.getElementById('order-modal');
    const orderItemsList = document.getElementById('order-items-list');
    const orderTotalSpan = document.getElementById('order-total');
    const closeOrderBtn = document.getElementById('close-order-btn');

    // Функция сохранения корзины
    function saveCart() {
        localStorage.setItem('giftbox_cart', JSON.stringify(cart));
        updateCartCount();
        if (cartModal && cartModal.classList.contains('active')) {
            renderCartModal();
        }
    }

    // Обновление счетчика
    function updateCartCount() {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        if (cartCountEl) cartCountEl.textContent = totalItems;
    }

    // Добавление товара
    function addToCart(productName, productPrice) {
        const existingItem = cart.find(item => item.name === productName);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({ name: productName, price: productPrice, quantity: 1 });
        }
        saveCart();
        showNotification(`✨ "${productName}" добавлен в корзину!`);
    }

    // Уведомление
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #4a6a3b;
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            z-index: 1001;
            animation: slideIn 0.3s ease;
            font-family: inherit;
        `;
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }

    // Удаление товара
    function removeFromCart(index) {
        cart.splice(index, 1);
        saveCart();
    }

    // Изменение количества
    function changeQuantity(index, delta) {
        if (cart[index].quantity + delta > 0) {
            cart[index].quantity += delta;
        } else {
            cart.splice(index, 1);
        }
        saveCart();
    }

    // Получить общую сумму
    function getTotal() {
        return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    // Отображение корзины
    function renderCartModal() {
        if (!cartItemsList) return;
        
        if (cart.length === 0) {
            cartItemsList.innerHTML = '<li class="empty-cart-message">Корзина пуста</li>';
            if (cartTotalSpan) cartTotalSpan.textContent = '0';
            return;
        }
        
        cartItemsList.innerHTML = '';
        let total = 0;
        
        cart.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            const li = document.createElement('li');
            li.className = 'cart-item';
            li.innerHTML = `
                <div class="cart-item-info">
                    <div class="cart-item-title">${escapeHtml(item.name)}</div>
                    <div class="cart-item-price">${item.price} ₽ × ${item.quantity}</div>
                    <div class="cart-item-sum">= ${itemTotal} ₽</div>
                </div>
                <div class="cart-item-actions">
                    <button class="cart-qty-btn" data-index="${index}" data-delta="-1">−</button>
                    <span class="cart-qty">${item.quantity}</span>
                    <button class="cart-qty-btn" data-index="${index}" data-delta="1">+</button>
                    <button class="cart-remove-btn" data-index="${index}" data-remove="true">Убрать</button>
                </div>
            `;
            cartItemsList.appendChild(li);
        });
        
        if (cartTotalSpan) cartTotalSpan.textContent = total;
        
        // Обработчики кнопок
        document.querySelectorAll('.cart-qty-btn').forEach(btn => {
            btn.removeEventListener('click', handleQtyClick);
            btn.addEventListener('click', handleQtyClick);
        });
        document.querySelectorAll('.cart-remove-btn').forEach(btn => {
            btn.removeEventListener('click', handleRemoveClick);
            btn.addEventListener('click', handleRemoveClick);
        });
    }
    
    function handleQtyClick(e) {
        const btn = e.currentTarget;
        const idx = parseInt(btn.dataset.index);
        const delta = parseInt(btn.dataset.delta);
        changeQuantity(idx, delta);
    }
    
    function handleRemoveClick(e) {
        const btn = e.currentTarget;
        const idx = parseInt(btn.dataset.index);
        removeFromCart(idx);
    }
    
    function escapeHtml(str) {
        return str.replace(/[&<>]/g, function(m) {
            if (m === '&') return '&amp;';
            if (m === '<') return '&lt;';
            if (m === '>') return '&gt;';
            return m;
        });
    }

    // Оформление заказа (оплата)
    function checkout() {
        if (cart.length === 0) {
            showNotification('Корзина пуста! Добавьте товары перед оформлением.');
            return;
        }
        
        // Показываем список купленных товаров
        if (orderItemsList) {
            orderItemsList.innerHTML = '';
            cart.forEach(item => {
                const li = document.createElement('li');
                li.textContent = `${item.name} — ${item.quantity} шт. × ${item.price} ₽ = ${item.price * item.quantity} ₽`;
                orderItemsList.appendChild(li);
            });
        }
        
        const total = getTotal();
        if (orderTotalSpan) orderTotalSpan.textContent = total;
        
        // Показываем модальное окно с подтверждением
        if (orderModal) {
            orderModal.classList.add('active');
        }
        
        // Очищаем корзину
        cart = [];
        saveCart();
        
        // Закрываем окно корзины
        if (cartModal) {
            cartModal.classList.remove('active');
        }
    }

    // Открыть/Закрыть модальное окно корзины
    if (cartBtn && cartModal && cartModalClose) {
        cartBtn.addEventListener('click', (e) => {
            e.preventDefault();
            renderCartModal();
            cartModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
        
        cartModalClose.addEventListener('click', () => {
            cartModal.classList.remove('active');
            document.body.style.overflow = '';
        });
        
        cartModal.addEventListener('click', (e) => {
            if (e.target === cartModal) {
                cartModal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }
    
    // Кнопка оплаты
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', checkout);
    }
    
    // Закрыть окно подтверждения заказа
    if (closeOrderBtn && orderModal) {
        closeOrderBtn.addEventListener('click', () => {
            orderModal.classList.remove('active');
            document.body.style.overflow = '';
        });
        
        orderModal.addEventListener('click', (e) => {
            if (e.target === orderModal) {
                orderModal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }

    // Кнопки "В корзину"
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', () => {
            const name = button.dataset.name;
            const price = parseInt(button.dataset.price);
            if (name && price) {
                addToCart(name, price);
            }
        });
    });

    // Инициализация
    updateCartCount();

    // Год в подвале
    const currentYearEl = document.querySelector('.current-year');
    if (currentYearEl) currentYearEl.textContent = new Date().getFullYear();

    // Бургер-меню
    const burgerBtn = document.getElementById('burger-btn');
    const nav = document.getElementById('nav');
    if (burgerBtn && nav) {
        burgerBtn.addEventListener('click', () => {
            nav.classList.toggle('active');
        });
    }

    // Подписка
    const newsletterForm = document.getElementById('newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = newsletterForm.querySelector('input[type="email"]').value;
            alert(`Спасибо за подписку, ${email}! Скидка 10% уже ваша.`);
            newsletterForm.reset();
        });
    }
});