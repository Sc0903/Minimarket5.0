export const validateEmail = (email: string): boolean => {
  // Regex que valida: usuario@dominio.extensión
  // usuario: letras, números, puntos, guiones, guiones bajos
  // dominio: letras, números, guiones, puntos
  // extensión: mínimo 2 letras (ej: .com, .es, .org, .co.uk)
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
  // Validaciones adicionales
  if (!emailRegex.test(email)) return false;
  
  // No puede empezar o terminar con punto
  if (email.startsWith('.') || email.endsWith('.')) return false;
  
  // No puede tener dos puntos seguidos
  if (email.includes('..')) return false;
  
  // No puede tener @ múltiples
  if ((email.match(/@/g) || []).length !== 1) return false;
  
  // El usuario (antes del @) debe tener al menos 1 carácter
  const [user] = email.split('@');
  if (!user || user.length < 1) return false;
  
  return true;
};

export const validateUsername = (username: string): boolean => {
  return username.length >= 3;
};

export const validatePassword = (password: string): boolean => {
  return password.length >= 6;
};

export const validatePhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
  return phoneRegex.test(phone) && phone.length >= 10;
};

export const formatPrice = (price: number): string => {
  return `$${price.toFixed(2)}`;
};

export const formatDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};
