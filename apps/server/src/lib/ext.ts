// redis map userid -> socketid key
export const socketKey = (userid: string): string => {
  return `socket:${userid}`;
};