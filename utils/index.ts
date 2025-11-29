// Helper function to generate a unique ID
const str = () => ('00000000000000000' + (Math.random() * 0xffffffffffffffff).toString(16)).slice(-16);
export const generateUID = () => {
  const a = str();
  const b = str();
  return a.slice(0, 8) + '-' + a.slice(8, 12) + '-4' + a.slice(13) + '-a' + b.slice(1, 4) + '-' + b.slice(4);
};

// Helper function to clean the response message
export const cleanCactusResponse = (response: string): string => {
    // Remove reasoning tags and im_end tag
    return response
        .replace(/<think>[\s\S]*?<\/think>\n*/g, '')
        .replace(/<\|im_end\|>/g, '')
        .trim();
};