
// Mock OCR Service
// In a real app, this would upload the image to a server or use a local OCR library.

export const extractAmountFromImage = async (imageUri) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            // Mock logic: return a random amount to simulate detection
            const mockAmount = (Math.random() * 100 + 10).toFixed(2);
            resolve(mockAmount);
        }, 1500);
    });
};
