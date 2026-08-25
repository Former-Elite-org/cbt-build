import React, { useState } from 'react';
import { useAuthStore } from '@/features/auth/store/authStore';
import { _post } from '../../Helper';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import toast from 'react-hot-toast';
import { Loader2, User, Eye, EyeOff } from 'lucide-react';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  teacher?: any;
}

const CreateTeacherModal: React.FC<Props> = ({ visible, onClose, onSuccess, teacher }) => {
  const { user, selected_branch } = useAuthStore();
  const isEdit = !!teacher;

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    mobile_no: '',
    sex: '',
    password: '',
  });

  // Re-populate form whenever the teacher prop or modal visibility changes
  React.useEffect(() => {
    if (visible) {
      setForm({
        name: teacher?.name || '',
        email: teacher?.email || '',
        mobile_no: teacher?.mobile_no || '',
        sex: teacher?.sex || '',
        password: '', // always blank — leave blank = keep current
      });
      setShowPassword(false);
    }
  }, [visible, teacher]);

  const set = (field: string, val: string) => setForm(p => ({ ...p, [field]: val }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      toast.error('Name and email are required');
      return;
    }
    if (!user?.school_id) { toast.error('School ID is missing'); return; }
    if (!selected_branch?.branch_id) { toast.error('Branch ID is missing'); return; }

    setLoading(true);
    const payload: any = {
      name: form.name,
      email: form.email,
      mobile_no: form.mobile_no,
      sex: form.sex,
      school_id: user.school_id,
      branch_id: selected_branch.branch_id,
      user_type: 'Teacher',
      staff_type: 'Academic Staff',
      staff_role: 'Teacher',
    };
    if (form.password.trim()) payload.password = form.password;
    if (isEdit) payload.user_id = teacher.id || teacher.user_id;

    _post(
      isEdit ? 'teachers/update' : 'teachers',
      payload,
      (res: any) => {
        setLoading(false);
        if (res.success) {
          toast.success(isEdit ? 'Teacher updated!' : 'Teacher added successfully!');
          onSuccess();
          onClose();
        } else {
          toast.error(res.message || 'Failed to save teacher');
        }
      },
      () => { setLoading(false); toast.error('Network error. Please try again.'); }
    );
  };

  return (
    <Dialog open={visible} onOpenChange={v => !v && onClose()}>
      <DialogContent className="rounded-2xl max-w-md bg-white dark:bg-gray-900 border-none shadow-xl p-0 overflow-hidden">
        <div className="p-5 bg-gray-50/50 dark:bg-gray-800/20 border-b border-gray-100 dark:border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold flex items-center gap-2 text-gray-800 dark:text-gray-100">
              <User className="h-4 w-4 text-[#002a56]" />
              {isEdit ? 'Edit Teacher' : 'Add New Teacher'}
            </DialogTitle>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1 sm:col-span-2">
              <Label className="text-xs font-bold text-gray-500">Full Name *</Label>
              <Input value={form.name} onChange={e => set('name', e.target.value)}
                placeholder="Enter full name" className="h-9 text-xs rounded-xl" required />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <Label className="text-xs font-bold text-gray-500">Email Address *</Label>
              <Input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                disabled={isEdit} placeholder="teacher@school.com"
                className="h-9 text-xs rounded-xl disabled:opacity-60" required />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-bold text-gray-500">Phone Number</Label>
              <Input value={form.mobile_no} onChange={e => set('mobile_no', e.target.value)}
                placeholder="08012345678" className="h-9 text-xs rounded-xl" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-bold text-gray-500">Gender</Label>
              <Select value={form.sex} onValueChange={v => set('sex', v)}>
                <SelectTrigger className="h-9 text-xs rounded-xl"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1 pt-2 border-t border-gray-100 dark:border-gray-800">
            <Label className="text-xs font-bold text-gray-500">
              {isEdit ? 'New Password' : 'Password'}
              {isEdit && <span className="ml-1 font-normal text-gray-400">(leave blank to keep current)</span>}
            </Label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={e => set('password', e.target.value)}
                placeholder={isEdit ? 'Leave blank to keep unchanged' : 'Default: 123456'}
                className="h-9 text-xs rounded-xl pr-9"
              />
              <button type="button" onClick={() => setShowPassword(p => !p)}
                className="absolute right-2.5 top-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {!isEdit && <p className="text-[10px] text-gray-400">Default is 123456 if left blank.</p>}
          </div>

          <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose} disabled={loading}
              className="h-9 text-xs rounded-xl text-gray-500">Cancel</Button>
            <Button type="submit" disabled={loading}
              className="h-9 text-xs rounded-xl bg-[#002a56] text-white hover:bg-[#002a56]/90 dark:bg-sky-600 shadow-sm">
              {loading && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
              {isEdit ? 'Update Teacher' : 'Add Teacher'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTeacherModal;
