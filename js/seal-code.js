// One number opens every seal on the site: the threshold and the sealed letters.
// The riddle on the threshold gives it away (the perfect number, three sevens), so no one is locked out.
export const SEAL_CODE = '777';
export const isSealCode = (v) => String(v || '').replace(/\D/g, '') === SEAL_CODE;
