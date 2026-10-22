import React, { useState } from 'react';
import {
  Settings,
  Building2,
  Bell,
  RotateCcw,
  ShieldAlert,
  Save,
  Check,
  Globe,
  Mail,
  User,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/common/Button';
import { Card, CardHeader } from '../components/common/Card';
import { Modal } from '../components/common/Modal';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings, resetDemoData } = useApp();
  const { showToast } = useToast();

  const [formState, setFormState] = useState({ ...settings });
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formState);
    showToast({
      title: 'Settings Saved',
      message: 'Business profile and notifications updated in local persistence.',
      type: 'success',
    });
  };

  const handleConfirmReset = () => {
    resetDemoData();
    setIsResetModalOpen(false);
    showToast({
      title: 'Demo Data Restored',
      message: 'Application state reset to pristine Nexus Retail dataset.',
      type: 'info',
    });
    // Sync local form state
    setFormState({ ...settings });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#26282D]">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#EDEDED]">
            Business Settings & Preferences
          </h2>
          <p className="text-xs sm:text-sm text-[#9094A0] mt-0.5">
            Manage company profile, GST configuration, alerts, and demo data state.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={<Save className="w-3.5 h-3.5" />}
          onClick={handleSave}
        >
          Save Changes
        </Button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Company Profile */}
        <Card>
          <CardHeader
            title="Entity Profile"
            subtitle="Commercial business credentials and tax registration identifiers"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-xs font-medium text-[#EDEDED] mb-1.5">
                Registered Business Name
              </label>
              <input
                type="text"
                value={formState.businessName}
                onChange={(e) => setFormState({ ...formState, businessName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[#151619] border border-[#2D3037] focus:border-[#E5484D] text-sm text-[#EDEDED] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#EDEDED] mb-1.5">
                Primary Facility / Hub
              </label>
              <input
                type="text"
                value={formState.branchName}
                onChange={(e) => setFormState({ ...formState, branchName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[#151619] border border-[#2D3037] focus:border-[#E5484D] text-sm text-[#EDEDED] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#EDEDED] mb-1.5">
                Business Type / Industry
              </label>
              <input
                type="text"
                value={formState.businessType}
                onChange={(e) => setFormState({ ...formState, businessType: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[#151619] border border-[#2D3037] focus:border-[#E5484D] text-sm text-[#EDEDED] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#EDEDED] mb-1.5">
                GSTIN / Tax Registration No
              </label>
              <input
                type="text"
                value={formState.gstin}
                onChange={(e) => setFormState({ ...formState, gstin: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[#151619] border border-[#2D3037] focus:border-[#E5484D] text-sm text-[#EDEDED] font-mono outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#EDEDED] mb-1.5">
                Primary Currency
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  disabled
                  value="Indian Rupee (INR - ₹)"
                  className="w-full px-3 py-2 rounded-xl bg-[#151619]/60 border border-[#2D3037] text-sm text-[#9094A0] cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#EDEDED] mb-1.5">
                Operating Timezone
              </label>
              <select
                value={formState.timezone}
                onChange={(e) => setFormState({ ...formState, timezone: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[#151619] border border-[#2D3037] focus:border-[#E5484D] text-sm text-[#EDEDED] outline-none"
              >
                <option value="Asia/Kolkata">Asia/Kolkata (IST - UTC+05:30)</option>
                <option value="Asia/Dubai">Asia/Dubai (GST - UTC+04:00)</option>
                <option value="Asia/Singapore">Asia/Singapore (SGT - UTC+08:00)</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Administrator Profile */}
        <Card>
          <CardHeader
            title="Administrator Credentials"
            subtitle="Account holder and primary executive contact"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-xs font-medium text-[#EDEDED] mb-1.5">
                Executive Owner Name
              </label>
              <input
                type="text"
                value={formState.ownerName}
                onChange={(e) => setFormState({ ...formState, ownerName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[#151619] border border-[#2D3037] focus:border-[#E5484D] text-sm text-[#EDEDED] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#EDEDED] mb-1.5">
                Executive Email Address
              </label>
              <input
                type="email"
                value={formState.ownerEmail}
                onChange={(e) => setFormState({ ...formState, ownerEmail: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[#151619] border border-[#2D3037] focus:border-[#E5484D] text-sm text-[#EDEDED] outline-none"
              />
            </div>
          </div>
        </Card>

        {/* Notification Preferences */}
        <Card>
          <CardHeader
            title="Operational Notifications"
            subtitle="Toggle high-priority real-time alerts and summaries"
          />

          <div className="space-y-3">
            {[
              {
                id: 'orderAlerts',
                title: 'High-Value Order Alerts',
                desc: 'Instant notifications when wholesale or retail orders exceed ₹20,000.',
              },
              {
                id: 'lowStockAlerts',
                title: 'Inventory Safety Threshold Warnings',
                desc: 'Alert store managers when warehouse quantities fall below reorder minimums.',
              },
              {
                id: 'attendanceReminders',
                title: 'Morning Shift Punctuality Notices',
                desc: 'Flag team members with delayed arrivals or unclocked shifts after 09:30 AM.',
              },
              {
                id: 'weeklySummary',
                title: 'Weekly Executive Performance Digest',
                desc: 'Receive consolidated Sunday revenue and operating expense summaries.',
              },
            ].map((pref) => {
              const isChecked = formState.notifications[pref.id as keyof typeof formState.notifications];

              return (
                <div
                  key={pref.id}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-[#151619] border border-[#26282D]"
                >
                  <div>
                    <p className="text-xs font-semibold text-white">{pref.title}</p>
                    <p className="text-[11px] text-[#9094A0] mt-0.5">{pref.desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) =>
                        setFormState({
                          ...formState,
                          notifications: {
                            ...formState.notifications,
                            [pref.id]: e.target.checked,
                          },
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-[#222429] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#E5484D]"></div>
                  </label>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Danger Zone / Demo Data Reset */}
        <Card className="border-red-950/40 bg-red-950/10">
          <CardHeader
            title="Demo Data Management"
            subtitle="Reset local state back to initial Nexus Retail presentation data"
          />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#151619] border border-red-900/30">
            <div className="flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-[#E5484D] shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-white">Reset Local Database</p>
                <p className="text-[11px] text-[#9094A0] mt-0.5 leading-relaxed">
                  Clears orders created during testing, restores employee attendance rosters, and repopulates initial stock quantities.
                </p>
              </div>
            </div>

            <Button
              type="button"
              variant="danger"
              size="sm"
              icon={<RotateCcw className="w-3.5 h-3.5" />}
              onClick={() => setIsResetModalOpen(true)}
              className="shrink-0"
            >
              Reset Demo Data
            </Button>
          </div>
        </Card>
      </form>

      {/* Confirmation Modal */}
      <Modal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        title="Confirm Demo Data Reset"
        description="Are you sure you want to revert all changes?"
        size="sm"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsResetModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleConfirmReset}>
              Yes, Reset Everything
            </Button>
          </>
        }
      >
        <p className="text-xs text-[#9094A0] leading-relaxed">
          This action will clear all newly added orders, products, and punch logs from your browser's local storage and restore the default Nexus Retail presentation dataset.
        </p>
      </Modal>
    </div>
  );
};
