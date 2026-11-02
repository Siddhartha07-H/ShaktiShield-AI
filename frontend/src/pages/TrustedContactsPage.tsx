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
  Heart,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { TrustedContact } from '../types';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { EmptyState } from '../components/EmptyState';
import { SkeletonCard } from '../components/Skeleton';
import { StatusBadge } from '../components/StatusBadge';

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
  const [formError, setFormError] = useState<string | null>(null);
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
    setFormError(null);
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
    setFormError(null);
    setIsModalOpen(true);
  };

  const validatePhone = (phone: string): boolean => {
    // Allows 10-digit Indian numbers or E.164 formats (+91 9876543210, 9876543210)
    const cleaned = phone.replace(/[\s\-\(\)]/g, '');
    const indianRegex = /^(\+91)?[6-9]\d{9}$/;
    const genericIntlRegex = /^\+?[1-9]\d{7,14}$/;
    return indianRegex.test(cleaned) || genericIntlRegex.test(cleaned);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.name.trim()) {
      setFormError('Contact full name is required.');
      return;
    }

    if (!formData.phone.trim()) {
      setFormError('Phone number is required.');
      return;
    }

    if (!validatePhone(formData.phone)) {
      setFormError('Please enter a valid 10-digit mobile number (e.g. +91 98765 43210 or 9876543210).');
      return;
    }

    setIsSaving(true);
    try {
      if (editingContact) {
        await api.put(`/api/contacts/${editingContact.id}`, formData);
        showToast('Contact updated successfully.', 'success');
      } else {
        await api.post('/api/contacts', formData);
        showToast('New trusted guardian added to circle.', 'success');
      }
      setIsModalOpen(false);
      await fetchContacts();
    } catch (err: any) {
      setFormError(err.message || 'Error saving contact. Please try again.');
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Users className="w-7 h-7 text-purple-400" />
            <span>Trusted Guardian Circle</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Registered guardians who receive your emergency coordinates and instant alerts upon SOS activation.
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

      {/* Safety notice */}
      <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 flex items-start gap-3 text-xs text-slate-300">
        <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-white">Emergency Verification Protocol:</strong> We recommend adding at least two verified primary contacts (such as immediate family, roommate, or trusted friend). When you trigger an SOS, dispatch logs will associate these numbers directly with the SHA-256 incident record.
        </div>
      </div>

      {/* Contacts List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : contacts.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No Emergency Contacts Registered"
          description="Your safety circle is currently empty. Add at least two trusted emergency contacts to ensure notifications can be dispatched when an alert is created."
          action={{
            label: "Add First Guardian",
            onClick: openAddModal,
          }}
        />
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
                    {contact.is_primary ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-600 text-white shadow-sm">
                        <Star className="w-3 h-3 fill-current" />
                        PRIMARY
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                        GUARDIAN
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
                <span className="text-slate-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Registered Guardian
                </span>
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
        title={editingContact ? 'Edit Trusted Guardian' : 'Add Emergency Guardian'}
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          {formError && (
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
              <span>{formError}</span>
            </div>
          )}

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
              <label className="block text-slate-300 font-semibold mb-1">Phone Number (10 digits / Indian) *</label>
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
            <label htmlFor="is_primary" className="text-slate-300 font-medium cursor-pointer">
              Set as primary emergency contact (alerted with highest priority)
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
              <span>{editingContact ? 'Save Changes' : 'Add Guardian'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!contactToDelete}
        title="Remove Emergency Guardian?"
        description={`Are you sure you want to remove ${contactToDelete?.name} (${contactToDelete?.phone}) from your trusted guardian circle? They will no longer receive automated emergency coordinates if an alert is triggered.`}
        confirmText="Remove Guardian"
        cancelText="Keep in Circle"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setContactToDelete(null)}
      />
    </div>
  );
};
