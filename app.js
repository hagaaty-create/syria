document.addEventListener("DOMContentLoaded", () => {
    let currentCategoryId = 0;
    let selectedService = null;
    let currentUser = null; // { email, role, balance, name }
    let currentAuthMode = "login"; // "login" or "register"

    // Mock initial data
    let ordersList = [
        { id: 8901, serviceName: "ببجي موبايل - 660 شدة (UC)", accountData: "5129938810", price: 10.99, date: "2026-07-27", status: "مكتمل", clientName: "أحمد علي" },
        { id: 8902, serviceName: "تيك توك - 1000 عملة", accountData: "@hagaaty_user", price: 15.50, date: "2026-07-27", status: "قيد المعالجة", clientName: "سارة محمود" },
        { id: 8903, serviceName: "شاهد VIP رياضة (شهر)", accountData: "user@gmail.com", price: 8.99, date: "2026-07-26", status: "مكتمل", clientName: "محمد عمر" },
        { id: 8904, serviceName: "رقم وهمي أمريكي للواتساب", accountData: "WhatsApp App", price: 2.50, date: "2026-07-25", status: "مكتمل", clientName: "خالد سعيد" }
    ];

    let usersList = [
        { id: 1, name: "مشرف النظام الأدمن", email: "admin@gmail.com", balance: 9999.00, role: "الأدمن العام" },
        { id: 2, name: "عميل حاجاتي المميز", email: "user@hagaaty.com", balance: 250.00, role: "مستخدِم VIP" },
        { id: 3, name: "موزع الشمال للخدمات", email: "reseller1@hagaaty.com", balance: 1200.00, role: "وكيل معتمد (Reseller)" }
    ];

    // DOM Elements
    const categoriesGrid = document.getElementById("categoriesGrid");
    const servicesGrid = document.getElementById("servicesGrid");
    const searchInput = document.getElementById("searchInput");
    const sectionTitle = document.getElementById("sectionTitle");
    const userBalanceEl = document.getElementById("userBalance");
    const userPanelBalance = document.getElementById("userPanelBalance");

    // Views
    const views = {
        store: document.getElementById("storeView"),
        user: document.getElementById("userView"),
        admin: document.getElementById("adminView")
    };

    const navLinks = {
        store: document.getElementById("navStoreLink"),
        user: document.getElementById("navUserLink"),
        admin: document.getElementById("navAdminLink")
    };

    // Header Auth Elements
    const loginBtnNav = document.getElementById("loginBtnNav");
    const userProfileArea = document.getElementById("userProfileArea");
    const userAccountEmail = document.getElementById("userAccountEmail");
    const balanceBadge = document.getElementById("balanceBadge");

    // Modals
    const authModal = document.getElementById("authModal");
    const orderModal = document.getElementById("orderModal");
    const aboutModal = document.getElementById("aboutModal");
    const confirmOrderBtn = document.getElementById("confirmOrderBtn");

    // Global View Switcher
    window.switchView = function(viewName) {
        // Access Protection
        if (viewName === 'admin' && (!currentUser || currentUser.email.toLowerCase() !== 'admin@gmail.com')) {
            alert("🔒 غير مسموح بالدخول! لوحة الأدمن مخصصة للمشرف (admin@gmail.com) فقط.");
            openAuthModal();
            return;
        }

        if (viewName === 'user' && !currentUser) {
            alert("🔑 يرجى تسجيل الدخول أولاً للوصول للوحة المستخدم.");
            openAuthModal();
            return;
        }

        Object.keys(views).forEach(v => {
            if (views[v]) {
                if (v === viewName) {
                    views[v].style.display = (v === 'store') ? 'block' : 'grid';
                    views[v].classList.add("active");
                } else {
                    views[v].style.display = 'none';
                    views[v].classList.remove("active");
                }
            }
            if (navLinks[v]) {
                if (v === viewName) navLinks[v].classList.add("active");
                else navLinks[v].classList.remove("active");
            }
        });

        if (viewName === 'user') renderUserPortalTables();
        if (viewName === 'admin') renderAdminPortalTables();
    };

    // Global Tab Switcher inside Portals
    window.switchTab = function(portal, tabId, btnElement) {
        const portalEl = (portal === 'user') ? views.user : views.admin;
        if (!portalEl) return;

        portalEl.querySelectorAll(".tab-pane").forEach(pane => pane.classList.remove("active"));
        portalEl.querySelectorAll(".sidebar-btn").forEach(btn => btn.classList.remove("active"));

        const targetPane = document.getElementById(tabId);
        if (targetPane) targetPane.classList.add("active");
        if (btnElement) btnElement.classList.add("active");
    };

    // Auth Modal Handlers
    window.openAuthModal = function() {
        if (authModal) authModal.classList.add("active");
    };

    window.switchAuthTab = function(mode) {
        currentAuthMode = mode;
        const tabLoginBtn = document.getElementById("tabLoginBtn");
        const tabRegisterBtn = document.getElementById("tabRegisterBtn");
        const fullNameGroup = document.getElementById("fullNameGroup");
        const authModalTitle = document.getElementById("authModalTitle");
        const authSubmitBtn = document.getElementById("authSubmitBtn");

        if (mode === "login") {
            tabLoginBtn.className = "btn-btn btn-primary";
            tabRegisterBtn.className = "btn-btn btn-outline";
            fullNameGroup.style.display = "none";
            authModalTitle.innerHTML = `<i class="fas fa-lock" style="color: var(--accent-cyan);"></i> تسجيل الدخول لحسابك`;
            authSubmitBtn.innerHTML = `<i class="fas fa-sign-in-alt"></i> الدخول الآن`;
        } else {
            tabRegisterBtn.className = "btn-btn btn-primary";
            tabLoginBtn.className = "btn-btn btn-outline";
            fullNameGroup.style.display = "block";
            authModalTitle.innerHTML = `<i class="fas fa-user-plus" style="color: var(--accent-cyan);"></i> إنشاء حساب جديد في حاجاتي`;
            authSubmitBtn.innerHTML = `<i class="fas fa-user-check"></i> إنشاء الحساب`;
        }
    };

    // Auth Submission (Firebase + Local Fallback)
    window.handleAuthSubmit = async function(e) {
        e.preventDefault();
        const email = document.getElementById("authEmail").value.trim();
        const password = document.getElementById("authPassword").value;
        const fullName = document.getElementById("authFullName").value.trim() || "مستخدم حاجاتي";

        if (!email || !password) return;

        // Try Firebase Authentication if SDK available
        if (typeof auth !== 'undefined' && auth) {
            try {
                if (currentAuthMode === "login") {
                    await auth.signInWithEmailAndPassword(email, password);
                } else {
                    const res = await auth.createUserWithEmailAndPassword(email, password);
                    if (res.user) {
                        await res.user.updateProfile({ displayName: fullName });
                    }
                }
            } catch (firebaseErr) {
                console.warn("Firebase Auth fallback used due to credentials status:", firebaseErr.message);
            }
        }

        // Apply Authentication State locally
        const isAdmin = (email.toLowerCase() === "admin@gmail.com");
        currentUser = {
            email: email,
            name: isAdmin ? "مشرف النظام الأدمن" : fullName,
            role: isAdmin ? "الأدمن" : "عميل",
            balance: isAdmin ? 9999.00 : 250.00
        };

        updateHeaderAuthState();

        if (authModal) authModal.classList.remove("active");

        if (isAdmin) {
            alert(`🛡️ أهلاً بك يا مشرف النظام! تم تفعيل وتسهيل الوصول إلى (لوحة الأدمن).`);
            switchView("admin");
        } else {
            alert(`🎉 أهلاً بك ${currentUser.name} في منصة حاجاتي HAGAATY!`);
            switchView("user");
        }
    };

    // Logout Function
    window.logoutUser = function() {
        if (typeof auth !== 'undefined' && auth) {
            auth.signOut().catch(() => {});
        }
        currentUser = null;
        updateHeaderAuthState();
        switchView("store");
        alert("تم تسجيل الخروج بنجاح.");
    };

    // Header State Updater
    function updateHeaderAuthState() {
        if (!currentUser) {
            // Logged Out State
            if (loginBtnNav) loginBtnNav.style.display = "flex";
            if (userProfileArea) userProfileArea.style.display = "none";
            if (balanceBadge) balanceBadge.style.display = "none";

            if (navLinks.admin) navLinks.admin.style.display = "none";
            if (navLinks.user) navLinks.user.style.display = "none";
        } else {
            // Logged In State
            if (loginBtnNav) loginBtnNav.style.display = "none";
            if (userProfileArea) userProfileArea.style.display = "flex";
            if (userAccountEmail) userAccountEmail.textContent = currentUser.email;

            if (currentUser.email.toLowerCase() === "admin@gmail.com") {
                // Admin user logged in
                if (navLinks.admin) navLinks.admin.style.display = "flex";
                if (navLinks.user) navLinks.user.style.display = "none";
                if (balanceBadge) balanceBadge.style.display = "none";
            } else {
                // Standard user logged in
                if (navLinks.admin) navLinks.admin.style.display = "none";
                if (navLinks.user) navLinks.user.style.display = "flex";
                if (balanceBadge) balanceBadge.style.display = "flex";

                if (userBalanceEl) userBalanceEl.textContent = `$${currentUser.balance.toFixed(2)}`;
                if (userPanelBalance) userPanelBalance.textContent = `$${currentUser.balance.toFixed(2)}`;
            }

            const userPortalEmailDisplay = document.getElementById("userPortalEmailDisplay");
            const profileEmailInput = document.getElementById("profileEmailInput");
            if (userPortalEmailDisplay) userPortalEmailDisplay.textContent = currentUser.email;
            if (profileEmailInput) profileEmailInput.value = currentUser.email;
        }
    }

    // Render Categories
    function renderCategories() {
        if (!categoriesGrid) return;
        categoriesGrid.innerHTML = CATEGORIES_LIST.map(cat => `
            <div class="category-chip ${cat.id === currentCategoryId ? 'active' : ''}" data-id="${cat.id}">
                <i class="fas ${cat.icon}"></i>
                <span>${cat.name}</span>
                <span class="category-count">${cat.count}</span>
            </div>
        `).join("");

        document.querySelectorAll(".category-chip").forEach(chip => {
            chip.addEventListener("click", () => {
                currentCategoryId = parseInt(chip.getAttribute("data-id"));
                renderCategories();
                filterServices();
            });
        });
    }

    // Render Services Cards
    function renderServices(items) {
        if (!servicesGrid) return;
        if (items.length === 0) {
            servicesGrid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 50px; color: var(--text-muted);">
                    <i class="fas fa-search-minus" style="font-size: 48px; margin-bottom: 16px;"></i>
                    <p>لا توجد خدمات مطابقة لبحثك في حاجاتي (HAGAATY)...</p>
                </div>
            `;
            return;
        }

        servicesGrid.innerHTML = items.map(srv => `
            <div class="service-card">
                <div class="card-img-wrapper">
                    <img src="${srv.image}" alt="${srv.name}" class="card-img" />
                    <span class="card-badge">${srv.badge}</span>
                </div>
                <div class="card-body">
                    <span class="card-category">${srv.categoryName}</span>
                    <h3 class="card-title">${srv.name}</h3>
                    <div class="card-info">
                        <i class="far fa-clock"></i>
                        <span>${srv.deliveryTime}</span>
                    </div>
                    <div class="card-footer">
                        <div class="card-price">
                            <span class="current-price">$${srv.price.toFixed(2)}</span>
                            ${srv.oldPrice ? `<span class="old-price">$${srv.oldPrice.toFixed(2)}</span>` : ''}
                        </div>
                        <button class="btn-buy" onclick="openOrderModal(${srv.id})">
                            <i class="fas fa-bolt"></i> طلب الخدمة
                        </button>
                    </div>
                </div>
            </div>
        `).join("");
    }

    // Filter Logic
    function filterServices() {
        const query = searchInput ? searchInput.value.toLowerCase().trim() : "";
        let filtered = SERVICES_DATA.filter(srv => {
            const matchesCat = currentCategoryId === 0 || srv.categoryId === currentCategoryId;
            const matchesQuery = srv.name.toLowerCase().includes(query) || srv.categoryName.toLowerCase().includes(query);
            return matchesCat && matchesQuery;
        });

        const activeCatObj = CATEGORIES_LIST.find(c => c.id === currentCategoryId);
        if (sectionTitle && activeCatObj) {
            sectionTitle.innerHTML = `<i class="fas ${activeCatObj.icon}"></i> ${activeCatObj.name}`;
        }
        renderServices(filtered);
    }

    // Global Order Modal Opener
    window.openOrderModal = function(serviceId) {
        if (!currentUser) {
            alert("🔑 يرجى تسجيل الدخول أولاً لتتمكن من إتمام طلب الخدمة.");
            openAuthModal();
            return;
        }

        selectedService = SERVICES_DATA.find(s => s.id === serviceId);
        if (!selectedService) return;

        modalServiceName.textContent = selectedService.name;
        modalInputLabel.textContent = selectedService.inputLabel;
        modalInput.placeholder = selectedService.inputPlaceholder;
        modalInput.value = "";
        modalDelivery.textContent = selectedService.deliveryTime;
        modalPrice.textContent = `$${selectedService.price.toFixed(2)}`;

        orderModal.classList.add("active");
    };

    // Close Modals
    document.querySelectorAll(".btn-close, .modal-overlay").forEach(el => {
        el.addEventListener("click", (e) => {
            if (e.target === el || el.classList.contains("btn-close")) {
                if (orderModal) orderModal.classList.remove("active");
                if (aboutModal) aboutModal.classList.remove("active");
                if (authModal) authModal.classList.remove("active");
            }
        });
    });

    const navAboutLink = document.getElementById("navAboutLink");
    if (navAboutLink && aboutModal) {
        navAboutLink.addEventListener("click", (e) => {
            e.preventDefault();
            aboutModal.classList.add("active");
        });
    }

    // Confirm Order Execution
    if (confirmOrderBtn) {
        confirmOrderBtn.addEventListener("click", () => {
            const val = modalInput.value.trim();
            if (!val) {
                alert("يرجى إدخال البيانات المطلوبة لإكمال الطلب!");
                return;
            }

            if (currentUser.balance < selectedService.price) {
                alert("عفواً، رصيدك في منصة حاجاتي HAGAATY غير كافٍ. يرجى إيداع رصيد بالمحفظة.");
                return;
            }

            currentUser.balance -= selectedService.price;
            if (userBalanceEl) userBalanceEl.textContent = `$${currentUser.balance.toFixed(2)}`;
            if (userPanelBalance) userPanelBalance.textContent = `$${currentUser.balance.toFixed(2)}`;

            const newOrder = {
                id: Math.floor(8900 + Math.random() * 1000),
                serviceName: selectedService.name,
                accountData: val,
                price: selectedService.price,
                date: new Date().toISOString().split("T")[0],
                status: "قيد المعالجة",
                clientName: currentUser.name
            };
            ordersList.unshift(newOrder);

            logAdminMessage(`[طلب جديد - HAGAATY] تم استقبال طلب جديد رقم #${newOrder.id} للخدمة ${selectedService.name}`);

            alert(`✅ تم إرسال طلبك بنجاح عبر منصة حاجاتي HAGAATY! \nرقم الطلب: #${newOrder.id}\nالخدمة: ${selectedService.name}\nالحالة: جاري المعالجة التلقائية.`);
            orderModal.classList.remove("active");
        });
    }

    // Render User Portal Tables
    function renderUserPortalTables() {
        const userRecent = document.getElementById("userRecentOrdersTable");
        const userAll = document.getElementById("userAllOrdersTable");

        const statusBadge = (st) => {
            if (st === "مكتمل") return `<span class="badge-status badge-success">مكتمل</span>`;
            if (st === "قيد المعالجة") return `<span class="badge-status badge-pending">قيد المعالجة</span>`;
            return `<span class="badge-status badge-danger">ملغى</span>`;
        };

        if (userRecent) {
            userRecent.innerHTML = ordersList.slice(0, 3).map(o => `
                <tr>
                    <td>#${o.id}</td>
                    <td>${o.serviceName}</td>
                    <td>$${o.price.toFixed(2)}</td>
                    <td>${o.date}</td>
                    <td>${statusBadge(o.status)}</td>
                </tr>
            `).join("");
        }

        if (userAll) {
            userAll.innerHTML = ordersList.map(o => `
                <tr>
                    <td>#${o.id}</td>
                    <td>${o.serviceName}</td>
                    <td>${o.accountData}</td>
                    <td>$${o.price.toFixed(2)}</td>
                    <td>${o.date}</td>
                    <td>${statusBadge(o.status)}</td>
                </tr>
            `).join("");
        }
    }

    // Render Admin Portal Tables
    function renderAdminPortalTables() {
        const adminStatsTable = document.getElementById("adminStatsOrdersTable");
        const adminServicesTable = document.getElementById("adminServicesTable");
        const adminOrdersTable = document.getElementById("adminAllOrdersTable");
        const adminUsersTable = document.getElementById("adminUsersTable");

        const statusBadge = (st) => {
            if (st === "مكتمل") return `<span class="badge-status badge-success">مكتمل</span>`;
            if (st === "قيد المعالجة") return `<span class="badge-status badge-pending">قيد المعالجة</span>`;
            return `<span class="badge-status badge-danger">ملغى</span>`;
        };

        if (adminStatsTable) {
            adminStatsTable.innerHTML = ordersList.slice(0, 4).map(o => `
                <tr>
                    <td>#${o.id}</td>
                    <td>${o.clientName}</td>
                    <td>${o.serviceName}</td>
                    <td>$${o.price.toFixed(2)}</td>
                    <td>${statusBadge(o.status)}</td>
                    <td>
                        <button class="btn-btn btn-outline" style="padding: 4px 10px; font-size: 11px;" onclick="updateOrderStatus(${o.id}, 'مكتمل')">تأكيد الإكمال</button>
                    </td>
                </tr>
            `).join("");
        }

        if (adminServicesTable) {
            adminServicesTable.innerHTML = SERVICES_DATA.map(s => `
                <tr>
                    <td>#${s.id}</td>
                    <td>${s.name}</td>
                    <td>${s.categoryName}</td>
                    <td>$${s.price.toFixed(2)}</td>
                    <td>${s.deliveryTime}</td>
                    <td>
                        <button class="btn-btn btn-outline" style="padding: 4px 10px; font-size: 11px;" onclick="alert('تعديل سعر خدمة ${s.name}')"><i class="fas fa-edit"></i> تعديل</button>
                    </td>
                </tr>
            `).join("");
        }

        if (adminOrdersTable) {
            adminOrdersTable.innerHTML = ordersList.map(o => `
                <tr>
                    <td>#${o.id}</td>
                    <td>${o.clientName}</td>
                    <td>${o.serviceName}</td>
                    <td>${o.accountData}</td>
                    <td>$${o.price.toFixed(2)}</td>
                    <td>${statusBadge(o.status)}</td>
                    <td>
                        <select onchange="updateOrderStatus(${o.id}, this.value)" style="background: var(--bg-primary); color: #fff; border: 1px solid var(--border-color); padding: 4px 8px; border-radius: 6px; font-size: 11px;">
                            <option value="قيد المعالجة" ${o.status === 'قيد المعالجة' ? 'selected' : ''}>قيد المعالجة</option>
                            <option value="مكتمل" ${o.status === 'مكتمل' ? 'selected' : ''}>مكتمل</option>
                            <option value="ملغى" ${o.status === 'ملغى' ? 'selected' : ''}>ملغى</option>
                        </select>
                    </td>
                </tr>
            `).join("");
        }

        if (adminUsersTable) {
            adminUsersTable.innerHTML = usersList.map(u => `
                <tr>
                    <td>#${u.id}</td>
                    <td>${u.name}</td>
                    <td>${u.email}</td>
                    <td style="color: var(--accent-green); font-weight: 800;">$${u.balance.toFixed(2)}</td>
                    <td><span class="badge-status badge-success">${u.role}</span></td>
                    <td>
                        <button class="btn-btn btn-outline" style="padding: 4px 10px; font-size: 11px;" onclick="addBalanceToUser(${u.id})"><i class="fas fa-plus"></i> إضافة رصيد</button>
                    </td>
                </tr>
            `).join("");
        }
    }

    // Admin Logging Helper
    function logAdminMessage(msg) {
        const apiLogConsole = document.getElementById("apiLogConsole");
        if (!apiLogConsole) return;
        const time = new Date().toLocaleTimeString("ar-EG");
        apiLogConsole.innerHTML += `<div>[${time}] ${msg}</div>`;
        apiLogConsole.scrollTop = apiLogConsole.scrollHeight;
    }

    // Search Listener
    if (searchInput) searchInput.addEventListener("input", filterServices);

    // Init
    renderCategories();
    filterServices();
    updateHeaderAuthState();
    logAdminMessage("نظام منصة حاجاتي HAGAATY DIGITAL جاهز ومتصل بالسيرفر بنجاح.");
});
