import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useApi } from '../contexts/ApiContext';
import { Layout } from '../components/Layout';
import { Pagination } from '../components/Pagination';
import type { Book, Category, Order } from '../types/api';
import './Pages.css';

const PAGE_SIZE = 5;

function paginate<T>(items: T[], page: number, pageSize: number): T[] {
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
}

const ORDER_STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'] as const;

function getBooksData(res: { data?: { data?: Book[] } }): Book[] {
  const d = res?.data?.data;
  return Array.isArray(d) ? d : [];
}

function getCategoriesData(res: { data?: { data?: Category[] } }): Category[] {
  const d = res?.data?.data;
  return Array.isArray(d) ? d : [];
}

function getOrdersData(res: { data?: { data?: Order[] } }): Order[] {
  const d = res?.data?.data;
  return Array.isArray(d) ? d : [];
}

type Tab = 'books' | 'categories' | 'orders';

function getTabFromHash(): Tab {
  const hash = window.location.hash.slice(1).toLowerCase();
  if (hash === 'books' || hash === 'categories' || hash === 'orders') return hash;
  return 'books';
}

export function DashboardPage() {
  const api = useApi();
  const [tab, setTab] = useState<Tab>(getTabFromHash);
  const [page, setPage] = useState(1);
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Editable values - keyed by id
  const [bookEdits, setBookEdits] = useState<Record<string, { title: string; author: string; price: string; quantity: string }>>({});
  const [categoryEdits, setCategoryEdits] = useState<Record<string, string>>({});
  const [orderStatusEdits, setOrderStatusEdits] = useState<Record<string, string>>({});

  const [newBook, setNewBook] = useState({ title: '', author: '', price: '', category_name: '', quantity: '1' });
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newOrderItems, setNewOrderItems] = useState<{ bookId: string; quantity: number }[]>([{ bookId: '', quantity: 1 }]);

  const fetchData = () => {
    setLoading(true);
    Promise.all([api.getBooks(), api.getCategories(), api.getAllOrders()])
      .then(([booksRes, catsRes, ordersRes]) => {
        const b = getBooksData(booksRes as { data?: { data?: Book[] } });
        const c = getCategoriesData(catsRes as { data?: { data?: Category[] } });
        const o = getOrdersData(ordersRes as { data?: { data?: Order[] } });
        setBooks(b);
        setCategories(c);
        setOrders(o);
        setBookEdits(
          Object.fromEntries(b.map((x) => [x._id, { title: x.title, author: x.author, price: String(x.price), quantity: String(x.quantity) }]))
        );
        setCategoryEdits(Object.fromEntries(c.map((x) => [x._id, x.name])));
        setOrderStatusEdits(Object.fromEntries(o.map((x) => [x._id, x.status])));
      })
      .catch(() => toast.error('Failed to load data'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, [api]);

  useEffect(() => {
    const onHashChange = () => setTab(getTabFromHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const setTabAndHash = (t: Tab) => {
    setTab(t);
    setPage(1);
    window.location.hash = t;
  };

  const getCategoryName = (cat: Book['category']) => {
    if (!cat) return '-';
    return typeof cat === 'object' && cat?.name ? cat.name : String(cat);
  };

  const isBookChanged = (b: Book) => {
    const e = bookEdits[b._id];
    if (!e) return false;
    return (
      e.title !== b.title ||
      e.author !== b.author ||
      String(e.price) !== String(b.price) ||
      String(e.quantity) !== String(b.quantity)
    );
  };

  const isCategoryChanged = (c: Category) => {
    const e = categoryEdits[c._id];
    if (!e) return false;
    return e !== c.name;
  };

  const handleBookUpdate = async (book: Book) => {
    const e = bookEdits[book._id];
    if (!e || !isBookChanged(book)) return;
    try {
      await api.updateBook(book._id, {
        title: e.title,
        author: e.author,
        price: parseFloat(e.price) || 0,
        quantity: parseInt(e.quantity, 10) || 0,
      });
      fetchData();
      setBookEdits((prev) => {
        const next = { ...prev };
        delete next[book._id];
        return next;
      });
    } catch {
      // toaster in context
    }
  };

  const handleBookDelete = (book: Book) => {
    if (!window.confirm(`Delete "${book.title}"? This cannot be undone.`)) return;
    api.deleteBook(book._id).then(() => fetchData()).catch(() => {});
  };

  const handleCategoryUpdate = async (cat: Category) => {
    const e = categoryEdits[cat._id];
    if (!e || !isCategoryChanged(cat)) return;
    try {
      await api.updateCategory(cat._id, { name: e });
      fetchData();
      setCategoryEdits((prev) => {
        const next = { ...prev };
        delete next[cat._id];
        return next;
      });
    } catch {
      // toaster in context
    }
  };

  const handleCategoryDelete = (cat: Category) => {
    if (!window.confirm(`Delete category "${cat.name}"? This cannot be undone.`)) return;
    api.deleteCategory(cat._id).then(() => fetchData()).catch(() => {});
  };

  const isOrderStatusChanged = (o: Order) => {
    const s = orderStatusEdits[o._id];
    return s !== undefined && s !== o.status;
  };

  const handleOrderStatusUpdate = async (order: Order) => {
    const s = orderStatusEdits[order._id];
    if (!s || !isOrderStatusChanged(order)) return;
    try {
      await api.updateOrderStatus(order._id, s);
      fetchData();
    } catch {
      // toaster in context
    }
  };

  const formatOrderUser = (o: Order) => {
    const u = o.user;
    if (!u) return '-';
    return typeof u === 'object' && u.email ? `${u.fName} ${u.lName} (${u.email})` : '-';
  };

  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBook.title || !newBook.author || !newBook.price || !newBook.category_name) {
      toast.error('Title, author, price and category are required');
      return;
    }
    try {
      await api.createBook({
        title: newBook.title,
        author: newBook.author,
        price: parseFloat(newBook.price) || 0,
        category_name: newBook.category_name,
        quantity: parseInt(newBook.quantity, 10) || 1,
      });
      setNewBook({ title: '', author: '', price: '', category_name: '', quantity: '1' });
      fetchData();
    } catch {
      // toaster in context
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newCategoryName.trim();
    if (!name) {
      toast.error('Category name is required');
      return;
    }
    try {
      await api.createCategory({ name });
      setNewCategoryName('');
      fetchData();
    } catch {
      // toaster in context
    }
  };

  const handleAddOrderItem = () => {
    setNewOrderItems((prev) => [...prev, { bookId: '', quantity: 1 }]);
  };

  const handleRemoveOrderItem = (idx: number) => {
    if (newOrderItems.length <= 1) return;
    setNewOrderItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleOrderItemChange = (idx: number, field: 'bookId' | 'quantity', value: string | number) => {
    setNewOrderItems((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: field === 'quantity' ? (typeof value === 'number' ? value : parseInt(String(value), 10) || 1) : value };
      return next;
    });
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    const items = newOrderItems.filter((i) => i.bookId && i.quantity > 0);
    if (items.length === 0) {
      toast.error('Add at least one item');
      return;
    }
    try {
      await api.createOrder({ items });
      setNewOrderItems([{ bookId: '', quantity: 1 }]);
      fetchData();
    } catch {
      // toaster in context
    }
  };

  if (loading && books.length === 0 && categories.length === 0 && orders.length === 0) {
    return <Layout><div className="page"><p>Loading...</p></div></Layout>;
  }

  return (
    <Layout>
      <div className="page dashboard-page">
        <h1>Dashboard</h1>

        <div className="dashboard-tabs">
          <button
            type="button"
            className={`dashboard-tab ${tab === 'books' ? 'active' : ''}`}
            onClick={() => setTabAndHash('books')}
          >
            Books
          </button>
          <button
            type="button"
            className={`dashboard-tab ${tab === 'categories' ? 'active' : ''}`}
            onClick={() => setTabAndHash('categories')}
          >
            Categories
          </button>
          <button
            type="button"
            className={`dashboard-tab ${tab === 'orders' ? 'active' : ''}`}
            onClick={() => setTabAndHash('orders')}
          >
            Orders
          </button>
        </div>

        {tab === 'books' && (
          <div className="dashboard-tab-content">
          <form onSubmit={handleAddBook} className="dashboard-add-form">
            <h3>Add new book</h3>
            <div className="dashboard-add-row">
              <input
                type="text"
                placeholder="Title"
                value={newBook.title}
                onChange={(e) => setNewBook((p) => ({ ...p, title: e.target.value }))}
                className="dashboard-input"
              />
              <input
                type="text"
                placeholder="Author"
                value={newBook.author}
                onChange={(e) => setNewBook((p) => ({ ...p, author: e.target.value }))}
                className="dashboard-input"
              />
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="Price"
                value={newBook.price}
                onChange={(e) => setNewBook((p) => ({ ...p, price: e.target.value }))}
                className="dashboard-input dashboard-input-num"
              />
              <select
                value={newBook.category_name}
                onChange={(e) => setNewBook((p) => ({ ...p, category_name: e.target.value }))}
                className="dashboard-select"
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c._id} value={c.name}>{c.name}</option>
                ))}
              </select>
              <input
                type="number"
                min="1"
                placeholder="Qty"
                value={newBook.quantity}
                onChange={(e) => setNewBook((p) => ({ ...p, quantity: e.target.value }))}
                className="dashboard-input dashboard-input-num"
              />
              <button type="submit" className="btn btn-primary btn-sm">Add book</button>
            </div>
          </form>
          <div className="dashboard-table-wrap">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Category</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginate(books, page, PAGE_SIZE).map((b, idx) => {
                  const e = bookEdits[b._id] ?? { title: b.title, author: b.author, price: String(b.price), quantity: String(b.quantity) };
                  return (
                    <tr key={b._id}>
                      <td>{(page - 1) * PAGE_SIZE + idx + 1}</td>
                      <td>
                        <input
                          type="text"
                          value={e.title}
                          onChange={(ev) => setBookEdits((prev) => ({
                            ...prev,
                            [b._id]: { ...(prev[b._id] ?? e), title: ev.target.value },
                          }))}
                          className="dashboard-input"
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={e.author}
                          onChange={(ev) => setBookEdits((prev) => ({
                            ...prev,
                            [b._id]: { ...(prev[b._id] ?? e), author: ev.target.value },
                          }))}
                          className="dashboard-input"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={e.price}
                          onChange={(ev) => setBookEdits((prev) => ({
                            ...prev,
                            [b._id]: { ...(prev[b._id] ?? e), price: ev.target.value },
                          }))}
                          className="dashboard-input dashboard-input-num"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          value={e.quantity}
                          onChange={(ev) => setBookEdits((prev) => ({
                            ...prev,
                            [b._id]: { ...(prev[b._id] ?? e), quantity: ev.target.value },
                          }))}
                          className="dashboard-input dashboard-input-num"
                        />
                      </td>
                      <td className="dashboard-readonly">{getCategoryName(b.category)}</td>
                      <td>
                        <div className="dashboard-actions">
                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            disabled={!isBookChanged(b)}
                            onClick={() => handleBookUpdate(b)}
                          >
                            Update
                          </button>
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={() => handleBookDelete(b)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {books.length === 0 && <p className="empty">No books.</p>}
          </div>
          <Pagination
            currentPage={page}
            totalPages={Math.ceil(books.length / PAGE_SIZE) || 1}
            totalItems={books.length}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
          </div>
        )}

        {tab === 'categories' && (
          <div className="dashboard-tab-content">
          <form onSubmit={handleAddCategory} className="dashboard-add-form">
            <h3>Add new category</h3>
            <div className="dashboard-add-row">
              <input
                type="text"
                placeholder="Category name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="dashboard-input"
              />
              <button type="submit" className="btn btn-primary btn-sm">Add category</button>
            </div>
          </form>
          <div className="dashboard-table-wrap">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginate(categories, page, PAGE_SIZE).map((c, idx) => {
                  const name = categoryEdits[c._id] ?? c.name;
                  return (
                    <tr key={c._id}>
                      <td>{(page - 1) * PAGE_SIZE + idx + 1}</td>
                      <td>
                        <input
                          type="text"
                          value={name}
                          onChange={(ev) => setCategoryEdits((prev) => ({
                            ...prev,
                            [c._id]: ev.target.value,
                          }))}
                          className="dashboard-input"
                        />
                      </td>
                      <td>
                        <div className="dashboard-actions">
                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            disabled={!isCategoryChanged(c)}
                            onClick={() => handleCategoryUpdate(c)}
                          >
                            Update
                          </button>
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={() => handleCategoryDelete(c)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {categories.length === 0 && <p className="empty">No categories.</p>}
          </div>
          <Pagination
            currentPage={page}
            totalPages={Math.ceil(categories.length / PAGE_SIZE) || 1}
            totalItems={categories.length}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
          </div>
        )}

        {tab === 'orders' && (
          <div className="dashboard-tab-content">
          <form onSubmit={handleCreateOrder} className="dashboard-add-form">
            <h3>Create new order</h3>
            {newOrderItems.map((item, idx) => (
              <div key={idx} className="dashboard-add-row">
                <select
                  value={item.bookId}
                  onChange={(e) => handleOrderItemChange(idx, 'bookId', e.target.value)}
                  className="dashboard-select"
                >
                  <option value="">Select book</option>
                  {books.map((b) => (
                    <option key={b._id} value={b._id}>{b.title} — ${b.price}</option>
                  ))}
                </select>
                <input
                  type="number"
                  min="1"
                  placeholder="Qty"
                  value={item.quantity}
                  onChange={(e) => handleOrderItemChange(idx, 'quantity', e.target.value)}
                  className="dashboard-input dashboard-input-num"
                />
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  onClick={() => handleRemoveOrderItem(idx)}
                  disabled={newOrderItems.length <= 1}
                >
                  Remove
                </button>
              </div>
            ))}
            <div className="dashboard-add-row">
              <button type="button" className="btn btn-secondary btn-sm" onClick={handleAddOrderItem}>
                + Add item
              </button>
              <button type="submit" className="btn btn-primary btn-sm">Create order</button>
            </div>
          </form>
          <div className="dashboard-table-wrap">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Order ID</th>
                  <th>Date</th>
                  <th>User</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginate(orders, page, PAGE_SIZE).map((o, idx) => {
                  const statusVal = orderStatusEdits[o._id] ?? o.status;
                  const date = o.orderDate ? new Date(o.orderDate).toLocaleDateString() : '-';
                  return (
                    <tr key={o._id} className={`dashboard-order-row--${o.status}`}>
                      <td>{(page - 1) * PAGE_SIZE + idx + 1}</td>
                      <td className="dashboard-readonly">#{o._id.slice(-6).toUpperCase()}</td>
                      <td className="dashboard-readonly">{date}</td>
                      <td className="dashboard-readonly dashboard-user-cell">{formatOrderUser(o)}</td>
                      <td className="dashboard-readonly">${o.total.toFixed(2)}</td>
                      <td>
                        <select
                          value={statusVal}
                          onChange={(ev) => setOrderStatusEdits((prev) => ({
                            ...prev,
                            [o._id]: ev.target.value,
                          }))}
                          className="dashboard-select"
                        >
                          {ORDER_STATUSES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <div className="dashboard-actions">
                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            disabled={!isOrderStatusChanged(o)}
                            onClick={() => handleOrderStatusUpdate(o)}
                          >
                            Update
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {orders.length === 0 && <p className="empty">No orders.</p>}
          </div>
          <Pagination
            currentPage={page}
            totalPages={Math.ceil(orders.length / PAGE_SIZE) || 1}
            totalItems={orders.length}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
          </div>
        )}
      </div>
    </Layout>
  );
}
