// ---------- Practice database: "Sklep Wisła", a fictional Polish online shop ----------
// Generated deterministically so every exercise has a stable, checkable answer.
function buildSeedSQL() {
  let s = 20240917;
  const rnd = () => { s |= 0; s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const pick = (a) => a[Math.floor(rnd() * a.length)];
  const wpick = (pairs) => { const tot = pairs.reduce((x, p) => x + p[1], 0); let r = rnd() * tot; for (const p of pairs) { if ((r -= p[1]) <= 0) return p[0]; } return pairs[0][0]; };
  const q = (v) => v === null ? 'NULL' : typeof v === 'number' ? String(v) : "'" + String(v).replace(/'/g, "''") + "'";
  const fold = (t) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ł/g, 'l').replace(/Ł/g, 'L').toLowerCase();
  const pad = (n) => String(n).padStart(2, '0');
  const dstr = (d) => d.getUTCFullYear() + '-' + pad(d.getUTCMonth() + 1) + '-' + pad(d.getUTCDate());
  const out = [];

  out.push(`CREATE TABLE departments (
  department_id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT NOT NULL
);`);
  out.push(`CREATE TABLE employees (
  employee_id INTEGER PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  department_id INTEGER NOT NULL REFERENCES departments(department_id),
  manager_id INTEGER REFERENCES employees(employee_id),
  hire_date TEXT NOT NULL,
  salary NUMERIC NOT NULL
);`);
  out.push(`CREATE TABLE customers (
  customer_id INTEGER PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  city TEXT NOT NULL,
  signup_date TEXT NOT NULL
);`);
  out.push(`CREATE TABLE categories (
  category_id INTEGER PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);`);
  out.push(`CREATE TABLE products (
  product_id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  category_id INTEGER NOT NULL REFERENCES categories(category_id),
  price NUMERIC NOT NULL CHECK (price > 0),
  stock INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1
);`);
  out.push(`CREATE TABLE orders (
  order_id INTEGER PRIMARY KEY,
  customer_id INTEGER NOT NULL REFERENCES customers(customer_id),
  order_date TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('delivered','shipped','cancelled','returned')),
  channel TEXT NOT NULL CHECK (channel IN ('web','mobile_app','marketplace'))
);`);
  out.push(`CREATE TABLE order_items (
  order_item_id INTEGER PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(order_id),
  product_id INTEGER NOT NULL REFERENCES products(product_id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC NOT NULL
);`);

  // Departments & employees (hierarchy for self-joins; one person out-earns their manager on purpose)
  const depts = [[1, 'Management', 'Warszawa'], [2, 'Sales', 'Warszawa'], [3, 'Customer Support', 'Łódź'], [4, 'Warehouse', 'Poznań'], [5, 'IT & Data', 'Kraków']];
  depts.forEach(d => out.push(`INSERT INTO departments VALUES (${d.map(q).join(',')});`));
  const emps = [
    [1, 'Agnieszka', 'Wiśniewska', 1, null, '2018-03-01', 24000],
    [2, 'Tomasz', 'Kowalczyk', 2, 1, '2019-01-14', 15500],
    [3, 'Marta', 'Zielińska', 3, 1, '2019-06-03', 12800],
    [4, 'Paweł', 'Lewandowski', 4, 1, '2019-09-16', 11900],
    [5, 'Katarzyna', 'Nowak', 5, 1, '2020-02-10', 17200],
    [6, 'Jakub', 'Wójcik', 2, 2, '2021-04-12', 8900],
    [7, 'Natalia', 'Kamińska', 2, 2, '2022-08-01', 7600],
    [8, 'Michał', 'Szymański', 2, 2, '2023-03-20', 7600],
    [9, 'Ola', 'Dąbrowska', 3, 3, '2021-11-02', 6400],
    [10, 'Bartosz', 'Kozłowski', 3, 3, '2022-05-09', 6100],
    [11, 'Julia', 'Jankowska', 3, 3, '2024-01-15', 5800],
    [12, 'Krzysztof', 'Mazur', 4, 4, '2020-07-06', 6900],
    [13, 'Adam', 'Krawczyk', 4, 4, '2023-10-02', 5900],
    [14, 'Zofia', 'Piotrowska', 4, 4, '2025-02-17', 5600],
    [15, 'Piotr', 'Grabowski', 5, 5, '2020-09-01', 18400],
    [16, 'Weronika', 'Pawłowska', 5, 5, '2022-01-10', 12500],
    [17, 'Mateusz', 'Michalski', 5, 15, '2024-06-03', 9800],
    [18, 'Alicja', 'Król', 5, 15, '2025-09-01', 8200],
    [19, 'Filip', 'Wieczorek', 2, 2, '2025-05-05', 7100],
    [20, 'Maja', 'Jabłońska', 3, 3, '2026-03-02', 5800]
  ];
  emps.forEach(e => out.push(`INSERT INTO employees VALUES (${e.map(q).join(',')});`));

  // Customers
  const fnF = ['Anna', 'Maria', 'Katarzyna', 'Małgorzata', 'Agnieszka', 'Barbara', 'Ewa', 'Magdalena', 'Joanna', 'Aleksandra', 'Zuzanna', 'Natalia', 'Monika', 'Karolina', 'Julia', 'Wiktoria', 'Dorota', 'Paulina', 'Kinga', 'Hanna'];
  const fnM = ['Piotr', 'Krzysztof', 'Andrzej', 'Tomasz', 'Paweł', 'Michał', 'Marcin', 'Jakub', 'Adam', 'Łukasz', 'Kamil', 'Mateusz', 'Szymon', 'Wojciech', 'Grzegorz', 'Bartosz', 'Dawid', 'Filip', 'Kacper', 'Jan'];
  const lnBase = [['Nowak', 'Nowak'], ['Kowalski', 'Kowalska'], ['Wiśniewski', 'Wiśniewska'], ['Wójcik', 'Wójcik'], ['Kowalczyk', 'Kowalczyk'], ['Kamiński', 'Kamińska'], ['Lewandowski', 'Lewandowska'], ['Zieliński', 'Zielińska'], ['Szymański', 'Szymańska'], ['Woźniak', 'Woźniak'], ['Dąbrowski', 'Dąbrowska'], ['Kozłowski', 'Kozłowska'], ['Jankowski', 'Jankowska'], ['Mazur', 'Mazur'], ['Kwiatkowski', 'Kwiatkowska'], ['Krawczyk', 'Krawczyk'], ['Piotrowski', 'Piotrowska'], ['Grabowski', 'Grabowska'], ['Nowakowski', 'Nowakowska'], ['Pawłowski', 'Pawłowska'], ['Michalski', 'Michalska'], ['Nowicki', 'Nowicka'], ['Adamczyk', 'Adamczyk'], ['Dudek', 'Dudek'], ['Zając', 'Zając'], ['Wieczorek', 'Wieczorek'], ['Jabłoński', 'Jabłońska'], ['Król', 'Król'], ['Majewski', 'Majewska'], ['Olszewski', 'Olszewska']];
  const cities = [['Warszawa', 26], ['Kraków', 15], ['Wrocław', 12], ['Gdańsk', 9], ['Poznań', 10], ['Łódź', 9], ['Katowice', 7], ['Lublin', 5], ['Szczecin', 4], ['Rzeszów', 3]];
  const domains = ['gmail.com', 'gmail.com', 'gmail.com', 'wp.pl', 'onet.pl', 'o2.pl', 'interia.pl', 'outlook.com'];
  const used = new Set();
  const custs = [];
  const start = Date.UTC(2023, 6, 1), end = Date.UTC(2026, 8, 30);
  for (let i = 1; i <= 300; i++) {
    const female = rnd() < 0.52;
    const fn = female ? pick(fnF) : pick(fnM);
    const lnPair = pick(lnBase); const ln = female ? lnPair[1] : lnPair[0];
    let base = fold(fn) + '.' + fold(ln), email = base + '@' + pick(domains), k = 2;
    while (used.has(email)) { email = base + k + '@' + email.split('@')[1]; k++; }
    used.add(email);
    const phone = rnd() < 0.16 ? null : '+48 ' + (500 + Math.floor(rnd() * 299)) + ' ' + String(Math.floor(rnd() * 1000)).padStart(3, '0') + ' ' + String(Math.floor(rnd() * 1000)).padStart(3, '0');
    const signup = dstr(new Date(start + Math.pow(rnd(), 0.8) * (end - start)));
    custs.push([i, fn, ln, email, phone, wpick(cities), signup]);
  }
  // Four accidental duplicate sign-ups (same email, new id) for data-quality exercises
  [[17, 301], [88, 302], [140, 303], [233, 304]].forEach(([src, id]) => {
    const c = custs[src - 1];
    custs.push([id, c[1], c[2], c[3], c[4], c[5], '2026-' + pad(3 + (id % 5)) + '-1' + (id % 9)]);
  });
  custs.forEach(c => out.push(`INSERT INTO customers VALUES (${c.map(q).join(',')});`));

  // Categories & products
  const cats = ['Books', 'Coffee & Tea', 'Board Games', 'Stationery', 'Electronics'];
  cats.forEach((c, i) => out.push(`INSERT INTO categories VALUES (${i + 1},${q(c)});`));
  const prods = [
    ['Lalka – Bolesław Prus (hardcover)', 1, 59.99], ['Wiedźmin: Ostatnie życzenie', 1, 44.9], ['Solaris – Stanisław Lem', 1, 39.9], ['Learning SQL, 3rd ed.', 1, 189.0], ['T-SQL Fundamentals', 1, 214.5], ['Pan Tadeusz (illustrated)', 1, 129.0], ['Kuchnia polska – cookbook', 1, 79.0], ['Data Visualisation Handbook', 1, 159.0], ['Bieguni – Olga Tokarczuk', 1, 49.9],
    ['Single-origin Ethiopia beans 1 kg', 2, 119.0], ['Espresso blend 500 g', 2, 54.0], ['Herbata Earl Grey 100 bags', 2, 24.99], ['Matcha ceremonial 50 g', 2, 89.0], ['Decaf Colombia 250 g', 2, 36.5], ['Cold brew kit', 2, 149.0], ['Yerba mate 500 g', 2, 42.0],
    ['Wsiąść do Pociągu: Europa', 3, 199.99], ['Carcassonne', 3, 129.9], ['Dixit', 3, 139.0], ['Splendor', 3, 159.0], ['Azul', 3, 169.0], ['5 sekund', 3, 69.9], ['Pandemic', 3, 179.0], ['Catan', 3, 189.0],
    ['Notebook A5 dotted', 4, 34.9], ['Fountain pen starter', 4, 99.0], ['Highlighter set 6', 4, 19.9], ['Desk planner 2026', 4, 59.0], ['Sticky notes mega pack', 4, 15.5], ['Mechanical pencil 0.5', 4, 22.0],
    ['Wireless mouse', 5, 89.99], ['USB-C hub 7-in-1', 5, 159.0], ['Mechanical keyboard', 5, 349.0], ['Noise-cancelling headphones', 5, 599.0], ['27" monitor arm', 5, 229.0], ['Webcam 1080p', 5, 199.0], ['Laptop stand aluminium', 5, 129.0],
    // never ordered / discontinued
    ['Polish grammar workbook (old ed.)', 1, 29.9], ['Instant coffee 200 g', 2, 18.0], ['Fax paper rolls', 4, 12.0], ['VGA cable 3 m', 5, 25.0]
  ];
  prods.forEach((p, i) => {
    const inactive = i >= prods.length - 4;
    out.push(`INSERT INTO products VALUES (${i + 1},${q(p[0])},${p[1]},${p[2]},${Math.floor(rnd() * 120)},${inactive ? 0 : 1});`);
  });
  const sellable = prods.slice(0, prods.length - 4).map((p, i) => ({ id: i + 1, price: p[2], cat: p[1] }));

  // Orders: ~1600 between Jan 2024 and Oct 2026 with growth; 25 customers never order
  const neverOrder = new Set(); while (neverOrder.size < 25) neverOrder.add(1 + Math.floor(rnd() * 300));
  const buyers = custs.filter(c => !neverOrder.has(c[0]) && c[0] <= 300);
  const loyal = buyers.filter(() => rnd() < 0.18).map(c => c[0]);
  let oid = 1001, iid = 1;
  const oStart = Date.UTC(2024, 0, 1), oEnd = Date.UTC(2026, 9, 31);
  const orders = [];
  for (let n = 0; n < 1600; n++) {
    const t = oStart + Math.pow(rnd(), 0.75) * (oEnd - oStart);
    const date = dstr(new Date(t));
    let cid = rnd() < 0.45 ? pick(loyal) : pick(buyers)[0];
    const cust = custs[cid - 1];
    if (cust[6] > date) { cid = pick(loyal); }
    const status = date >= '2026-10-20' ? wpick([['shipped', 7], ['delivered', 2], ['cancelled', 1]]) : wpick([['delivered', 84], ['shipped', 2], ['cancelled', 8], ['returned', 6]]);
    const channel = wpick([['web', 50], ['mobile_app', date >= '2025-01-01' ? 35 : 18], ['marketplace', 20]]);
    orders.push([date, cid, status, channel]);
  }
  orders.sort((a, b) => a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0);
  // customer 42 gets a predictable history for the LAG exercise
  orders.forEach(o => {
    out.push(`INSERT INTO orders VALUES (${oid},${o[1]},${q(o[0])},${q(o[2])},${q(o[3])});`);
    const lines = wpick([[1, 45], [2, 30], [3, 17], [4, 8]]);
    const chosen = new Set();
    for (let l = 0; l < lines; l++) {
      let p = pick(sellable); let guard = 0;
      while (chosen.has(p.id) && guard++ < 10) p = pick(sellable);
      if (chosen.has(p.id)) continue; chosen.add(p.id);
      const qty = p.cat === 4 ? wpick([[1, 50], [2, 30], [3, 12], [5, 8]]) : wpick([[1, 80], [2, 17], [3, 3]]);
      const promo = rnd() < 0.12 ? 0.9 : 1;
      const unit = Math.round(p.price * promo * 100) / 100;
      out.push(`INSERT INTO order_items VALUES (${iid++},${oid},${p.id},${qty},${unit});`);
    }
    oid++;
  });
  return out.join('\n');
}

const SCHEMA_DOC = [
  { t: 'customers', d: 'People who signed up at the shop', cols: [['customer_id', 'INTEGER PK'], ['first_name', 'TEXT'], ['last_name', 'TEXT'], ['email', 'TEXT'], ['phone', 'TEXT, nullable'], ['city', 'TEXT'], ['signup_date', "TEXT 'YYYY-MM-DD'"]] },
  { t: 'orders', d: 'One row per order', cols: [['order_id', 'INTEGER PK'], ['customer_id', 'FK → customers'], ['order_date', "TEXT 'YYYY-MM-DD'"], ['status', 'delivered | shipped | cancelled | returned'], ['channel', 'web | mobile_app | marketplace']] },
  { t: 'order_items', d: 'Lines of each order', cols: [['order_item_id', 'INTEGER PK'], ['order_id', 'FK → orders'], ['product_id', 'FK → products'], ['quantity', 'INTEGER'], ['unit_price', 'NUMERIC, PLN']] },
  { t: 'products', d: 'Catalogue', cols: [['product_id', 'INTEGER PK'], ['name', 'TEXT'], ['category_id', 'FK → categories'], ['price', 'NUMERIC, PLN'], ['stock', 'INTEGER'], ['is_active', '1 or 0']] },
  { t: 'categories', d: '5 product categories', cols: [['category_id', 'INTEGER PK'], ['name', 'TEXT UNIQUE']] },
  { t: 'employees', d: 'Staff, with manager hierarchy', cols: [['employee_id', 'INTEGER PK'], ['first_name', 'TEXT'], ['last_name', 'TEXT'], ['department_id', 'FK → departments'], ['manager_id', 'FK → employees, nullable'], ['hire_date', 'TEXT'], ['salary', 'NUMERIC, PLN / month']] },
  { t: 'departments', d: 'Company departments', cols: [['department_id', 'INTEGER PK'], ['name', 'TEXT'], ['city', 'TEXT']] }
];
