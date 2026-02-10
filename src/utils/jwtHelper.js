


export const decodeJWT = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch (error) {
    console.error('JWT decode error:', error);
    return null;
  }
};
