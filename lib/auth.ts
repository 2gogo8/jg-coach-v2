// Client-side auth helpers
export function getAuth(): { role: 'admin' | 'student' | null; studentId?: string } {
  if (typeof document === 'undefined') return { role: null };
  const cookie = document.cookie.split('; ').find(c => c.startsWith('jg_auth='));
  if (!cookie) return { role: null };
  const val = decodeURIComponent(cookie.split('=')[1]);
  if (val === 'admin') return { role: 'admin' };
  if (val.startsWith('student:')) return { role: 'student', studentId: val.split(':')[1] };
  return { role: null };
}

export function logout() {
  document.cookie = 'jg_auth=; path=/; max-age=0';
  document.cookie = 'jg_coach=; path=/; max-age=0';
  window.location.href = '/auth';
}
