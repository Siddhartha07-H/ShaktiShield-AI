import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Phone, 
  Mail, 
  Star, 
  Trash2, 
  Edit3, 
  ShieldCheck, 
  Loader2, 
  CheckCircle2,
  Heart
} from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { TrustedContact } from '../types';
import { Modal } from '../components/Modal';

export const TrustedContactsPage: React.FC = () => {
  const { showToast } = useToast();
  const [contacts, setContacts] = useState<TrustedContact[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Add / Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<TrustedContact | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    relationship: 'Family',
    email: '',
    is_primary: false,
  });
  const [isSaving, setIsSaving] = useState(false);

  // Delete modal state
  const [contactToDelete, setContactToDelete] = useState<TrustedContact | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchContacts = async () => {
    try {
      const data = await api.get<TrustedContact[]>('/api/contacts');
      setContacts(data || []);
    } catch (err: any) {
      showToast(err.message || 'Failed to load contacts.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const openAddModal = () => {
    setEditingContact(null);
    setFormData({
      name: '',
      phone: '',
      relationship: 'Family',
      email: '',
      is_primary: contacts.length === 0,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (contact: TrustedContact) => {
    setEditingContact(contact);
    setFormData({
      name: contact.name,
      phone: contact.phone,
      relationship: contact.relationship,
      email: contact.email || '',
      is_primary: contact.is_primary,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      showToast('Name and phone are required.', 'error');
      return;
    }

    setIsSaving(true);
    try {
      if (editingContact) {
        await api.put(`/api/contacts/${editingContact.id}`, formData);
        showToast('Contact updated successfully.', 'success');
      } else {
        await api.post('/api/contacts', formData);
        showToast('New trusted contact added.', 'success');
      }
      setIsModalOpen(false);
      await fetchContacts();
    } catch (err: any) {
      showToast(err.message || 'Error saving contact.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!contactToDelete) return;
    setIsDeleting(true);
    try {
      await api.delete(`/api/contacts/${contactToDelete.id}`);
      showToast('Contact removed from safety circle.', 'info');
      setContactToDelete(null);
      await fetchContacts();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete contact.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <Users className="w-7 h-7 text-purple-400" />
            <span>Trusted Guardian Circle</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Add trusted contacts to receive your coordinates when you activate an emergency alert.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-glow-purple flex items-center gap-2 transition-all shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Emergency Contact</span>
        </button>
      </div>

      {/* Contacts List */}
      {isLoading ? (
        <div className="py-20 text-center space-y-3">
          <Loader2 className="w-8 h-8 text-purple-500 animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Loading guardian contacts...</p>
        </div>
      ) : contacts.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl border border-purple-500/20 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-purple-950/60 border border-purple-500/30 flex items-center justify-center text-purple-400 mx-auto">
            <Users className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white">No Emergency Contacts Registered</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Your safety circle is currently empty. Add at least 2 primary emergency contacts so they can be alerted when you trigger SOS or share live routes.
          </p>
          <button
            onClick={openAddModal}
            className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-glow-purple inline-flex items-center gap-2 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add First Contact</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className={`glass-panel p-6 rounded-2xl border transition-all ${
                contact.is_primary
                  ? 'border-purple-500/50 bg-gradient-to-br from-purple-950/30 to-slate-900/80 shadow-glow-purple'
                  : 'border-slate-800 hover:border-slate-700'
              } space-y-4`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">{contact.name}</h3>
                    {contact.is_primary && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-600 text-white shadow-sm">
                        <Star className="w-3 h-3 fill-current" />
                        PRIMARY
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-purple-300 font-medium">{contact.relationship}</span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(contact)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    title="Edit Contact"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setContactToDelete(contact)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
                    title="Remove Contact"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-300">
                <a
                  href={`tel:${contact.phone}`}
                  className="flex items-center gap-2 text-slate-200 hover:text-purple-300 font-semibold transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-purple-400" />
                  <span>{contact.phone}</span>
                </a>
                {contact.email && (
                  <div className="flex items-center gap-2 text-slate-400">
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    <span>{contact.email}</span>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-purple-500/10 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Status: Registered</span>
                <a
                  href={`tel:${contact.phone}`}
                  className="text-purple-400 font-bold hover:underline flex items-center gap-1"
                >
                  <Phone className="w-3 h-3" /> Call Contact
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Contact Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingContact ? 'Edit Trusted Contact' : 'Add Emergency Guardian'}
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Full Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Priya Sharma"
              required
              className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-purple-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Phone Number *</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98765 43210"
                required
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Relationship *</label>
              <select
                value={formData.relationship}
                onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-purple-500 focus:outline-none"
              >
                <option value="Parent">Parent</option>
                <option value="Sister">Sister</option>
                <option value="Brother">Brother</option>
                <option value="Spouse">Spouse / Partner</option>
                <option value="Friend">Friend</option>
                <option value="Colleague">Colleague</option>
                <option value="Neighbor">Neighbor</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Email Address (Optional)</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="contact@example.com"
              className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-purple-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="is_primary"
              checked={formData.is_primary}
              onChange={(e) => setFormData({ ...formData, is_primary: e.target.checked })}
              className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 bg-slate-900 border-slate-700"
            />
            <label htmlFor="is_primary" className="text-slate-300 font-medium">
              Set as primary emergency contact (alerted first)
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-purple-500/20">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold flex items-center gap-1.5 shadow-glow-purple disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              <span>{editingContact ? 'Save Changes' : 'Add Contact'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!contactToDelete}
        onClose={() => setContactToDelete(null)}
        title="Remove Emergency Contact"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-300">
            Are you sure you want to remove <strong className="text-white">{contactToDelete?.name}</strong> from your trusted guardian circle?
          </p>
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              onClick={() => setContactToDelete(null)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
            >
              Keep Contact
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold flex items-center gap-1.5"
            >
              {isDeleting ? 'Removing...' : 'Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
